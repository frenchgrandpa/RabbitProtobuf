import {messageQueuePublisher, rabbitProtobuf} from "rabbit-protobuf";

import {ImageData} from "../gen/events_pb";


(async () => {
    await rabbitProtobuf.initAsync({
        username: "user",
        password: "pass"
    });

    const imageData = new ImageData();

    messageQueuePublisher.publish(imageData);

    await rabbitProtobuf.disposeAsync();
})()
    .then(() => process.exit(0))
    .catch(e => {
        console.log(e);
        process.exit(1);
    });
