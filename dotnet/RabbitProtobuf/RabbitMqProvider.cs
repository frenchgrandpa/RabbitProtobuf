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

            Properties = Channel.CreateBasicProperties();
            Properties.Persistent = true;
        }



        public IModel Channel { get; }
        public IBasicProperties Properties { get; }
        public string ExchangeName { get; } = "exchange";



        public void Dispose() {
            Channel?.Dispose();
            connection?.Dispose();
        }

    }

}