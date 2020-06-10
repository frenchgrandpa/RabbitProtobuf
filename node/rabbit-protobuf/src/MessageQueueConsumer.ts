import RabbitMqProvider from "./RabbitMqProvider";
import EventHandlerBase from "./EventHandlerBase";


class MessageQueueConsumer {

    // noinspection JSUnusedGlobalSymbols
    public async initAsync(eventHandler: EventHandlerBase, eventMap: {[eventName: string]: string}): Promise<void> {
        const queue = await RabbitMqProvider.channel.assertQueue(undefined as unknown as string, {
            durable: true,
            autoDelete: false,
            exclusive: true
        });

        for (const eventName of Object.keys(eventMap)) {
            await RabbitMqProvider.channel.bindQueue(queue.queue, RabbitMqProvider.exchangeName, eventName);
        }

        await RabbitMqProvider.channel.consume(queue.queue, (message) => {
            if (!message) {
                return;
            }
            const methodName = eventMap[message.fields.routingKey];
            if (!methodName) {
                return;
            }
            const handler = (eventHandler as any)[methodName];
            if (!handler) {
                return;
            }

            console.debug(`Received event ${message.fields.routingKey}`);

            handler(message.content);

            console.debug(`Handled event ${message.fields.routingKey}`);
        });
    }

}


export default new MessageQueueConsumer();
