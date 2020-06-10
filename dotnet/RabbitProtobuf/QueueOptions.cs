using JetBrains.Annotations;


namespace RabbitProtobuf {

    [UsedImplicitly(ImplicitUseKindFlags.Assign, ImplicitUseTargetFlags.WithMembers)]
    public class QueueOptions {

        public string QueueName { get; set; } = "";
        public bool Durable { get; set; }
        public bool Exclusive { get; set; } = true;
        public bool AutoDelete { get; set; } = true;

    }

}