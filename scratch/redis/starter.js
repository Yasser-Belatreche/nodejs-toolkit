import { createClient } from 'redis';

const client = createClient({ url: 'redis://localhost:6379' });

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.hSet('user-session:1234', {
    name: 'John',
    surname: 'Smith',
    company: 'Redis',
    age: 29,
    // date: new Date(),
});

const userSession = await client.get('user-session:1234');
console.log(userSession);
