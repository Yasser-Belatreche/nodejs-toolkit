#!/usr/bin/env node

import amqp from 'amqplib';

const connection = await amqp.connect('amqp://user:password@localhost');
const channel = await connection.createChannel();

const queue = 'task_queue';

// This makes sure the queue is declared before attempting to consume from it
await channel.assertQueue(queue, { durable: true });

channel.consume(
    queue,
    function (msg) {
        const secs = msg.content.toString().split('.').length - 1;

        console.log(' [x] Received %s', msg.content.toString());

        setTimeout(function () {
            console.log(' [x] Done');
        }, secs * 1000);
    },
    {
        // automatic acknowledgment mode,
        // see /docs/confirms for details
        noAck: true,
    },
);
