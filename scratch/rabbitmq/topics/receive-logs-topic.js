#!/usr/bin/env node

import amqp from 'amqplib';

const connection = await amqp.connect('amqp://user:password@localhost');

const channel = await connection.createChannel();

const exchange = 'topic_logs';
const keys = process.argv.slice(2);

if (args.length === 0) {
    console.log('Usage: receive-logs-topic.js <facility>.<severity>');

    process.exit(1);
}

await channel.assertExchange(exchange, 'topic', { durable: false });

const { queue } = await channel.assertQueue('', { exclusive: true });

await Promise.all(
    keys.map(async key => {
        await channel.bindQueue(queue, exchange, key);
    }),
);

channel.consume(
    queue,
    function (msg) {
        if (msg.content) {
            console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
        }
    },
    { noAck: true },
);

console.log(' [*] Waiting for logs. To exit press CTRL+C');
