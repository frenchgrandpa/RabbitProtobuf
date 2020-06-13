/* eslint-disable */

import {messageQueueConsumer, rabbitProtobuf, Event} from "rabbit-protobuf";

import {ImageData} from "../gen/events_pb";

(async () => {
    await rabbitProtobuf.initAsync({
        username: "user",
        password: "pass"
    });
    await messageQueueConsumer.initAsync();

    await sleep(100000);

    await rabbitProtobuf.disposeAsync();
})()
    .then(() => process.exit(0))
    .catch(e => {
        console.log(e);
        process.exit(1);
    });


class EventH {

    @Event(ImageData)
    async onImageDataAsync(message: ImageData): Promise<void> {
        console.log("onImageDataAsync")
        console.log(message.toObject())
    }
    @Event(ImageData)
    async onImageDataAsync2(message: ImageData): Promise<void> {
        console.log("onImageDataAsync2")
        console.log(message)
    }

}



function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
