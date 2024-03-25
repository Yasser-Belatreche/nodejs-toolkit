import amqp from 'amqplib';

import { SessionCorrelationId } from '@lib/primitives/application-specific/session';

import {
    Event,
    EventHandler,
    EventsBroker,
    EventsBrokerHealth,
    UniversalEventHandler,
} from './events-broker';

interface Configs {
    uri: string;
    durable?: boolean;
}

class RabbitmqEventsBroker implements EventsBroker {
    private static _instance: RabbitmqEventsBroker;

    static Instance(configs: Configs): RabbitmqEventsBroker {
        if (!this._instance) {
            this._instance = new RabbitmqEventsBroker(configs);
        }

        return this._instance;
    }

    private connection: amqp.Connection | undefined;
    private channel: amqp.Channel | undefined;

    private readonly UNIVERSAL_EXCHANGE = 'Universal';

    private haveAtLeastOneUniversalConsumer = false;
    private readonly consumers: string[] = [];
    private readonly eventsThatHaveConsumers = new Set<string>();

    private constructor(private readonly configs: Configs) {}

    async publish<T extends Event<any>>(event: T, session: SessionCorrelationId): Promise<void> {
        await this.assertConnected();

        if (this.haveAtLeastOneUniversalConsumer) {
            await this.channel!.assertExchange(this.UNIVERSAL_EXCHANGE, 'fanout', {
                durable: this.configs.durable,
            });

            this.channel!.publish(
                this.UNIVERSAL_EXCHANGE,
                '',
                Buffer.from(JSON.stringify(event.state)),
                { correlationId: session.correlationId, persistent: this.configs.durable },
            );
        }

        if (this.eventsThatHaveConsumers.has(event.name)) {
            await this.channel!.assertExchange(event.name, 'direct', {
                durable: this.configs.durable,
            });

            this.channel!.publish(
                event.name,
                event.name,
                Buffer.from(JSON.stringify(event.state)),
                {
                    correlationId: session.correlationId,
                    persistent: this.configs.durable,
                },
            );
        }
    }

    async registerEventHandler<T extends Event<any>>(handler: EventHandler<T>): Promise<void> {
        await this.assertConnected();

        await this.channel!.assertExchange(handler.eventName(), 'direct', {
            durable: this.configs.durable,
        });

        const { queue } = await this.channel!.assertQueue(handler.id(), {
            durable: this.configs.durable,
        });

        await this.channel!.bindQueue(queue, handler.eventName(), handler.eventName());

        const { consumerTag } = await this.channel!.consume(
            queue,
            msg => {
                if (!msg) return;

                const event: T = Event.From(JSON.parse(msg.content.toString())) as T;

                handler
                    .handle(event, { correlationId: msg.properties.correlationId! })
                    .then(() => {
                        this.channel!.ack(msg);
                    })
                    .catch(() => {
                        this.channel!.nack(msg, false, false);
                    });
            },
            { noAck: false },
        );

        this.consumers.push(consumerTag);
        this.eventsThatHaveConsumers.add(handler.eventName());
    }

    async registerUniversalEventHandler(handler: UniversalEventHandler): Promise<void> {
        await this.assertConnected();

        await this.channel!.assertExchange(this.UNIVERSAL_EXCHANGE, 'fanout', {
            durable: this.configs.durable,
        });

        const { queue } = await this.channel!.assertQueue(handler.id(), {
            durable: this.configs.durable,
        });

        await this.channel!.bindQueue(queue, this.UNIVERSAL_EXCHANGE, '');

        const { consumerTag } = await this.channel!.consume(
            queue,
            msg => {
                if (!msg) return;

                const event = Event.From(JSON.parse(msg.content.toString()));

                handler
                    .handle(event, { correlationId: msg.properties.correlationId! })
                    .then(() => {
                        this.channel!.ack(msg);
                    })
                    .catch(() => {
                        this.channel!.nack(msg, false, false);
                    });
            },
            { noAck: false },
        );

        this.consumers.push(consumerTag);
        this.haveAtLeastOneUniversalConsumer = true;
    }

    shouldExplicitlyRetryFailedEvents(): boolean {
        return false;
    }

    async retryFailedEvents(): Promise<void> {}

    async clear(): Promise<void> {
        await this.connection?.close();

        await Promise.all(
            this.consumers.map(async consumer => await this.channel?.cancel(consumer)),
        );
    }

    async health(): Promise<EventsBrokerHealth> {
        if (!this.connection) {
            return { provider: 'rabbitmq', status: 'down', message: 'the connection is not open' };
        }

        return { provider: 'rabbitmq', status: 'up' };
    }

    private async assertConnected(): Promise<void> {
        if (!this.connection) {
            this.connection = await amqp.connect(this.configs.uri);

            this.connection.on('close', () => {
                this.connection = undefined;
                this.channel = undefined;
            });
        }

        if (!this.channel?.connection) {
            this.channel = await this.connection.createChannel();

            await this.channel.prefetch(1);
        }
    }
}

export { RabbitmqEventsBroker };
