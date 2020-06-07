using Google.Protobuf;
using JetBrains.Annotations;


namespace RabbitProtobuf {

    public interface IMessageQueuePublisher {

        void Publish([NotNull] IMessage message);

    }

}