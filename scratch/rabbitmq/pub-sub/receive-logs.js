#!/usr/bin/env node

import amqp from 'amqplib';

const connection = await amqp.connect('amqp://user:password@localhost');

const channel = await connection.createChannel();

const exchange = 'logs';

await channel.assertExchange(exchange, 'fanout', { durable: false });

const { queue } = await channel.assertQueue('', { exclusive: true });

await channel.bindQueue(queue.queue, exchange, '');

channel.consume(
    queue,
    function (msg) {
        if (msg.content) {
            console.log(' [x] %s', msg.content.toString());
        }
    },
    { noAck: true },
);
