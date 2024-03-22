#!/usr/bin/env node

import amqp from 'amqplib';
import { randomUUID } from 'node:crypto';

const connection = await amqp.connect('amqp://user:password@localhost');

const channel = await connection.createChannel();

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Usage: rpc_client.js num');
    process.exit(1);
}

const correlationId = randomUUID();
const num = parseInt(args[0]);

const queue = 'rpc_queue';

const { queue: replyQueue } = await channel.assertQueue('', { exclusive: true });

await channel.consume(
    replyQueue,
    msg => {
        if (msg.properties.correlationId === correlationId) {
            console.log(' [.] Got %s', msg.content.toString());

            setTimeout(function () {
                connection.close();
                process.exit(0);
            }, 500);
        }
    },
    { noAck: true },
);

channel.sendToQueue(queue, Buffer.from(num.toString()), {
    replyTo: replyQueue,
    correlationId,
});

console.log(' [x] Requesting fib(%d)', num);
