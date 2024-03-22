#!/usr/bin/env node

import amqp from 'amqplib';

const connection = await amqp.connect('amqp://user:password@localhost');

const channel = await connection.createChannel();

const exchange = 'direct_logs';
const msg = process.argv.slice(3).join(' ') || 'Hello World!';
const severity = process.argv[2] || 'info';

await channel.assertExchange(exchange, 'direct', { durable: false });

channel.publish(exchange, severity, Buffer.from(msg));

console.log(' [x] Sent %s', msg);

setTimeout(() => {
    process.exit(0);
}, 100);
