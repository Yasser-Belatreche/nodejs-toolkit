#!/usr/bin/env node

import amqp from 'amqplib';

const connection = await amqp.connect('amqp://user:password@localhost');

const channel = await connection.createChannel();
const queue = 'hello';
const msg = 'Hello World!';

await channel.assertQueue(queue, {
    durable: false,
});

setInterval(() => {
    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(' [x] Sent %s', msg);
}, 1000);
