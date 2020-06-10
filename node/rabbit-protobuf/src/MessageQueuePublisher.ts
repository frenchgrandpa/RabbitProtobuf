import {Message} from "google-protobuf";

import RabbitMqProvider from "./RabbitMqProvider";


class MessageQueuePublisher {

    // noinspection JSUnusedGlobalSymbols
    public publish<T extends Message>(message: T): void {
        const eventName = (message as any).name;
        RabbitMqProvider.channel.publish(
            RabbitMqProvider.exchangeName,
            eventName,
            Buffer.from(message.serializeBinary()),
            {
                persistent: true,
                deliveryMode: 2
            }
        );

        console.debug(`Emitted ${eventName} event`);
    }

}


export default new MessageQueuePublisher();
