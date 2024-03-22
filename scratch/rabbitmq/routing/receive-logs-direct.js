#!/usr/bin/env node

import amqp from 'amqplib';

const connection = await amqp.connect('amqp://user:password@localhost');

const channel = await connection.createChannel();

const exchange = 'direct_logs';
const severities = process.argv.slice(2);

if (severities.length === 0) {
    console.log('Usage: receive-logs-direct.js [info] [warning] [error]');
    process.exit(1);
}

await channel.assertExchange(exchange, 'direct', { durable: false });

const { queue } = await channel.assertQueue('', { exclusive: true });

await Promise.all(
    severities.map(async severity => {
        await channel.bindQueue(queue, exchange, severity);
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
