import {Message} from "google-protobuf";

import RabbitMqProvider from "./RabbitMqProvider";



class MessageQueuePublisher {

    // noinspection JSUnusedGlobalSymbols
    public publish<T extends Message>(message: T): void {
        console.log((message as any).name)
        RabbitMqProvider.channel.publish(
            RabbitMqProvider.exchangeName,
            (message as any).name,
            Buffer.from(message.serializeBinary())
        );
    }

}


export default new MessageQueuePublisher();
