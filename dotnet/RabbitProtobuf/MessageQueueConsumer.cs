using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Google.Protobuf;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;


namespace RabbitProtobuf {

    internal class MessageQueueConsumer : IMessageQueueConsumer {

        private readonly string queueName;

        private readonly RabbitMqProvider rabbitMqProvider;



        public MessageQueueConsumer(
            RabbitMqProvider rabbitMqProvider,
            // ReSharper disable once SuggestBaseTypeForParameter
            ILogger<MessageQueueConsumer> logger,
            IServiceProvider sp
        ) {
            this.rabbitMqProvider = rabbitMqProvider;

            queueName = rabbitMqProvider.Channel.QueueDeclare(durable: true, autoDelete: false, exclusive: true).QueueName;
            rabbitMqProvider.Channel.CreateBasicProperties().Persistent = true;

            var handlers = bindHandlers();
            var consumer = new AsyncEventingBasicConsumer(rabbitMqProvider.Channel);

            consumer.Received += async (sender, @event) => {
                try {
                    logger.LogDebug("Received event {eventName}", @event.RoutingKey);

                    using var scope = sp.CreateScope();

                    var tasks = new List<Task>();

                    foreach (var (handlerType, handlerMethod, parser) in handlers[@event.RoutingKey]) {
                        var handlerClass = scope.ServiceProvider.GetRequiredService(handlerType);

                        tasks.Add(
                            (Task) handlerMethod.Invoke(handlerClass,
                                // ReSharper disable once CoVariantArrayConversion
                                new[] { parser.ParseFrom(@event.Body.ToArray()) })
                        );
                    }

                    await Task.WhenAll(tasks);

                    rabbitMqProvider.Channel.BasicAck(@event.DeliveryTag, false);

                    logger.LogDebug("Handled event {eventName}", @event.RoutingKey);
                }
                catch (Exception e) {
                    logger.LogError(
                        "An unhandled exception occurred while processing {eventName}:\n{e}",
                        @event.RoutingKey,
                        e
                    );
                }
            };

            rabbitMqProvider.Channel.BasicConsume(queueName, false, consumer);
        }



        private ILookup<string, (Type handlerType, MethodInfo handlerMethod, MessageParser parser)> bindHandlers() {
            var handlers = typeof(IEventHandler)
                .GetAllInheritors()
                .SelectMany(t =>
                    t.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                        .Where(m => m.GetCustomAttributes().OfType<EventAttribute>().Any())
                        .Select(m => new {
                            handlerType = t,
                            handlerMethod = m,
                            eventType = m.GetParameters().Single().ParameterType
                        })
                )
                .ToLookup(
                    x => x.eventType.FullName,
                    x => (x.handlerType, x.handlerMethod, _getParser(x.eventType))
                );


            static MessageParser _getParser(Type eventType) {
                var property = eventType.GetProperty("Parser", BindingFlags.Public | BindingFlags.Static);

                if (property == null) {
                    throw new NullReferenceException("Parser not found on " + eventType.FullName);
                }

                return (MessageParser) property.GetValue(null, null);
            }


            foreach (var eventName in handlers.Select(x => x.Key)) {
                rabbitMqProvider.Channel.QueueBind(
                    queueName,
                    rabbitMqProvider.ExchangeName,
                    eventName
                );
            }

            return handlers;
        }

    }

}