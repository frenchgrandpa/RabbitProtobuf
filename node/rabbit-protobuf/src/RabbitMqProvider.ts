import * as rabbitMq from "amqplib";


interface Settings {
    host?: string;
    username?: string;
    password?: string;
}


class RabbitMqProvider {

    public readonly exchangeName = "exchange";

    public channel!: rabbitMq.Channel;
    private connection!: rabbitMq.Connection;
    private handlingError = false;



    public async initAsync(settings?: Settings): Promise<void> {
        settings = settings || {};
        const host = settings.host || "localhost";
        const username = settings.username || "guest";
        const password = settings.password || "guest";

        this.connection = await rabbitMq.connect(`amqp://${username}:${password}@${host}`);
        this.channel = await this.connection.createChannel();
        await this.channel.assertExchange(this.exchangeName, "direct", {
            autoDelete: false,
            durable: true
        });

        this.connection.on("error", (e) => this.onError(e, settings));
        this.channel.on("error", (e) => this.onError(e, settings));

    }



    private onError(err: Error, settings: Settings | undefined): void {
        console.log("An error occured to the RabbitMQ connection:");
        console.log(err)

        if (this.handlingError) {
            console.log("Cant handle error because another error is currently being handled");
            return;
        }

        setTimeout(async () => {
            try {
                await this.disposeAsync();
            } catch (e) {
                console.log("An error occurred while disposing the RabbitMQ connection while reconnecting due to an error:");
                console.log(e);
            } finally {
                setTimeout(async () => {
                    console.log("Reconnecting to RabbitMQ...");
                    await this.initAsync(settings);
                    this.handlingError = false;
                }, 3000);
            }
        }, 3000);
    }



    public async disposeAsync(): Promise<void> {
        await this.channel.close();
        await this.connection.close();
        console.log("Disposed RabbitMQ connection")
    }

}


export default new RabbitMqProvider();
