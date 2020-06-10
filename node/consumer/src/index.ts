/* eslint-disable */

import {messageQueueConsumer, rabbitProtobuf} from "rabbit-protobuf";

import {EventHandler, Binary} from "../gen/EventHandler";
import {ImageData, ImageData3} from "../gen/events_pb";

(async () => {
    await rabbitProtobuf.initAsync({
        username: "user",
        password: "pass"
    });
    await messageQueueConsumer.initAsync(new EventH(), require("../gen/EventMap.json"));

    await sleep(100000);

    await rabbitProtobuf.disposeAsync();
})()
    .then(() => process.exit(0))
    .catch(e => {
        console.log(e);
        process.exit(1);
    });


class EventH implements EventHandler {

    async onImageDataAsync(message: Binary<ImageData>): Promise<void> {
        console.log(ImageData.deserializeBinary(message).toObject())
    }



    onImageDataImageData2Async(message: Binary<ImageData.ImageData2>): Promise<void> {
        throw new Error("Method not implemented.");
    }



    onImageData3Async(message: Binary<ImageData3>): Promise<void> {
        throw new Error("Method not implemented.");
    }

}



function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
