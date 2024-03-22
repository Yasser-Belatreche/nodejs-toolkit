#!/usr/bin/env node

import amqp from 'amqplib';

const connection = await amqp.connect('amqp://user:password@localhost');

const channel = await connection.createChannel();

const exchange = 'logs';
const msg = process.argv.slice(2).join(' ') || 'Hello World!';

await channel.assertExchange(exchange, 'fanout', { durable: false });

channel.publish(exchange, '', Buffer.from(msg));

console.log(' [x] Sent %s', msg);

setTimeout(() => {
    process.exit(0);
}, 100);
