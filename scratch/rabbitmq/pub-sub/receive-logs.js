#!/usr/bin/env node

import amqp from 'amqplib';

const connection = await amqp.connect('amqp://user:password@localhost');

const channel = await connection.createChannel();

const exchange = 'logs';

await channel.assertExchange(exchange, 'fanout', { durable: false });

const { queue } = await channel.assertQueue('', { exclusive: true });

await channel.bindQueue(queue.queue, exchange, '');

channel.prefetch(1);

channel.consume(
    queue,
    function (msg) {
        if (msg.content) {
            console.log(' [x] Consumer 1 %s', msg.content.toString());
        }

        setTimeout(() => {
            channel.ack(msg);
        }, 7000);
        channel.nack(msg);
    },
    { noAck: false },
);

channel.consume(
    queue,
    function (msg) {
        if (msg.content) {
            console.log(' [x] Consumer 2 %s', msg.content.toString());
        }

        setTimeout(() => {
            channel.ack(msg);
        }, 1000);
    },
    { noAck: false },
);
