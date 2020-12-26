import RabbitMqProvider from "./RabbitMqProvider";
import {eventMap} from "./Event";


interface MessageQueueConsumerSettings {
    queueName?: string;
    durable?: boolean; //False
    exclusive?: boolean; //True
    autoDelete?: boolean; //True
}

class MessageQueueConsumer {

    // noinspection JSUnusedGlobalSymbols
    public async initAsync(settings?: MessageQueueConsumerSettings): Promise<void> {
        settings = settings || {};
        const queue = await RabbitMqProvider.channel.assertQueue(settings.queueName!, {
            durable: settings.durable,
            exclusive: settings.exclusive === undefined ? true : settings.exclusive,
            autoDelete: settings.autoDelete === undefined ? true : settings.autoDelete
        });

        for (const eventName of Object.keys(eventMap)) {
            await RabbitMqProvider.channel.bindQueue(queue.queue, RabbitMqProvider.exchangeName, eventName);
        }

        await RabbitMqProvider.channel.consume(queue.queue, (event) => {
            if (!event) {
                return;
            }

            console.debug(`Received event ${event.fields.routingKey}`);

            const mapping = eventMap[event.fields.routingKey];
            const message = mapping.MessageClass.deserializeBinary(event.content);
            const promises = mapping.handlers.map(h => h(message, event.fields.routingKey));

            Promise.all(promises);

            console.debug(`Handled event ${event.fields.routingKey}`);
        });
    }

}


export default new MessageQueueConsumer();
