#!/usr/bin/env node

import amqp from 'amqplib';

const connection = await amqp.connect('amqp://user:password@localhost');
const channel = await connection.createChannel();

const queue = 'rpc_queue';

await channel.assertQueue(queue, { durable: false });

channel.prefetch(1);

function fibonacci(n) {
    if (n === 0 || n === 1) return n;
    else return fibonacci(n - 1) + fibonacci(n - 2);
}

await channel.consume(
    queue,
    function (msg) {
        const n = parseInt(msg.content.toString());

        console.log(' [.] fib(%d)', n);

        const r = fibonacci(n);

        channel.sendToQueue(msg.properties.replyTo, Buffer.from(r.toString()), {
            correlationId: msg.properties.correlationId,
        });

        channel.ack(msg);
    },
    { noAck: false },
);

console.log(' [x] Awaiting RPC requests');
