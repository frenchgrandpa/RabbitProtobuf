using Google.Protobuf;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;


namespace RabbitProtobuf {

    internal class MessageQueuePublisher : IMessageQueuePublisher {

        private readonly ILogger<RabbitMqProvider> logger;

        private readonly RabbitMqProvider rabbitMqProvider;



        public MessageQueuePublisher(RabbitMqProvider rabbitMqProvider, ILogger<RabbitMqProvider> logger) {
            this.rabbitMqProvider = rabbitMqProvider;
            this.logger = logger;
        }



        public void Publish(IMessage message) {
            var eventNameStr = message.GetType().FullName;
            rabbitMqProvider.Channel.BasicPublish(
                rabbitMqProvider.ExchangeName,
                eventNameStr,
                rabbitMqProvider.Properties,
                message.ToByteArray()
            );

            logger.LogInformation("Emitted {eventName} event", eventNameStr);
        }

    }

}