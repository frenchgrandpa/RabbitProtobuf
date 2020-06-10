using System;
using System.Threading.Tasks;
using Messages;
using RabbitProtobuf;


namespace Consumer {

    public class EventHandler : IEventHandler {

        [Event]
        public async Task TestAsync(ImageData d) {
            Console.WriteLine(DateTime.Now);
            await Task.Delay(1000);
            Console.WriteLine(DateTime.Now);
        }

    }

}