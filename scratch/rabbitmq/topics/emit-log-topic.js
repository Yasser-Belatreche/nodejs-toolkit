#!/usr/bin/env node

import amqp from 'amqplib';

const connection = await amqp.connect('amqp://user:password@localhost');

const channel = await connection.createChannel();

const exchange = 'topic_logs';
const msg = process.argv.slice(3).join(' ') || 'Hello World!';
const key = process.argv[2] || 'anonymous.info';

await channel.assertExchange(exchange, 'topic', { durable: false });

channel.publish(exchange, key, Buffer.from(msg));

console.log(' [x] Sent %s', msg);

setTimeout(() => {
    process.exit(0);
}, 100);
