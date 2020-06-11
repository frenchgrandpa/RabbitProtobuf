using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;


namespace RabbitProtobuf {

    public static class MessageQueueExtensions {

        public static void AddMessageQueueProducer(
            this IServiceCollection services,
            string host = "localhost",
            string username = "guest",
            string password = "guest"
        ) {
            services.TryAddSingleton(sp => new RabbitMqProvider(host, username, password));
            services.AddSingleton<IMessageQueuePublisher, MessageQueuePublisher>();
        }



        public static void AddMessageQueueConsumer(
            this IServiceCollection services,
            string host = "localhost",
            string username = "guest",
            string password = "guest",
            Action<QueueOptions> configureQueueOptions = null
        ) {
            services.AddOptions<QueueOptions>().Configure(configureQueueOptions ?? (o => { }));

            services.TryAddSingleton(sp => new RabbitMqProvider(host, username, password));
            services.AddSingleton<IMessageQueueConsumer, MessageQueueConsumer>();

            foreach (var type in typeof(IEventHandler).GetAllInheritors()) {
                services.AddScoped(type);
            }
        }



        public static void UseMessageQueueConsumer(this IApplicationBuilder app) {
            app.ApplicationServices.GetRequiredService<IMessageQueueConsumer>();
        }



        internal static IEnumerable<Type> GetAllInheritors(this Type type) {
            return AppDomain.CurrentDomain.GetAssemblies()
                .SelectMany(t => t.GetTypes())
                .Where(p => type.IsAssignableFrom(p) && p.IsClass);
        }

    }

}