#!/usr/bin/env node

import amqp from 'amqplib';

const connection = await amqp.connect('amqp://user:password@localhost');

const channel = await connection.createChannel();

const queue = 'task_queue';
const msg = process.argv.slice(2).join(' ') || 'Hello World!';

await channel.assertQueue(queue, { durable: true });

channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });

console.log(' [x] Sent %s', msg);

setTimeout(() => {
    process.exit(0);
}, 100);
