import {Message} from "google-protobuf";

export const eventMap: {
    [eventName: string]: {
        MessageClass: Deserializable<Message>;
        handlers: Handler<Message>[];
    };
} = {};


interface Deserializable<T extends Message> {
    new(): T;
    deserializeBinary(bytes: Uint8Array): T;
}


type Handler<T extends Message> = (message: T, routingKey: string) => Promise<void>;

export default function Event<T extends Message, O>(MessageClass: Deserializable<T>): (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Handler<T>>) => void {
    return function (
        target: any,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<Handler<T>>
    ) {
        if (!descriptor.value) {
            return;
        }

        const eventName = MessageClass.prototype.name;
        const mapping = eventMap[eventName];
        const handler = descriptor.value as Handler<Message>;

        if (mapping) {
            mapping.handlers.push(handler);
        } else {
            eventMap[eventName] = {
                MessageClass: MessageClass,
                handlers: [handler]
            };
        }
    };
}
