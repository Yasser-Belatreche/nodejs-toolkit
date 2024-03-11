#!/usr/bin/env node

import amqp from 'amqplib';

const connection = await amqp.connect('amqp://user:password@localhost');
const channel = await connection.createChannel();

const queue = 'hello';

await channel.assertQueue(queue, { durable: false });

console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);

channel.consume(
    queue,
    function (msg) {
        console.log(' [x] Received %s', msg.content.toString());
    },
    { noAck: true },
);
