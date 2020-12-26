import RabbitMqProvider from "./RabbitMqProvider";
import {eventMap} from "./Event";


class MessageQueueConsumer {

    // noinspection JSUnusedGlobalSymbols
    public async initAsync(): Promise<void> {
        const queue = await RabbitMqProvider.channel.assertQueue(undefined as unknown as string, {
            durable: true,
            autoDelete: false,
            exclusive: true
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
