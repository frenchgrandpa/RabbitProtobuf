using System;
using RabbitMQ.Client;


namespace RabbitProtobuf {

    internal class RabbitMqProvider : IDisposable {

        private readonly IConnection connection;



        public RabbitMqProvider(string host, string username, string password) {
            var factory = new ConnectionFactory {
                HostName = host,
                DispatchConsumersAsync = true,
                UserName = username,
                Password = password,
            };
            connection = factory.CreateConnection();

            Channel = connection.CreateModel();
            Channel.ExchangeDeclare(ExchangeName, "direct", autoDelete: false, durable: true);
        }



        public IModel Channel { get; }
        public string ExchangeName { get; } = "exchange";



        public void Dispose() {
            Channel?.Dispose();
            connection?.Dispose();
        }

    }

}