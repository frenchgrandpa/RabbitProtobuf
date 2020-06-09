import {Message} from "google-protobuf";

import RabbitMqProvider from "./RabbitMqProvider";



class MessageQueuePublisher {

    // noinspection JSUnusedGlobalSymbols
    public publish<T extends Message>(message: T): void {
        RabbitMqProvider.channel.publish(
            RabbitMqProvider.exchangeName,
            "Messages.ImageData",
            Buffer.from(message.serializeBinary())
        );
    }

}


export default new MessageQueuePublisher();
