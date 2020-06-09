import * as rabbitMq from "amqplib";


class RabbitMqProvider {

    public readonly exchangeName = "exchange";

    public channel!: rabbitMq.Channel;
    private connection!: rabbitMq.Connection;



    public async initAsync(settings?: { host?: string; username?: string; password?: string }): Promise<void> {
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

    }



    public async disposeAsync(): Promise<void> {
        await this.channel.close();
        await this.connection.close();
    }

}


export default new RabbitMqProvider();
