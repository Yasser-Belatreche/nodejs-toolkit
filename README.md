# NodeJS Building Blocks

This repository contains some building blocks that you may use in your NodeJS business-oriented projects.

Every building block is a standalone module that you can use in your project, even though you may find me using some of the functionality from the shared `lib`, you can drop it and change it easily if you want to.

Every module/component is tested using the built-in `node:test` & `node:assert` modules, you can run them using the `npm test` command.

## Modules Included

### Lib

#### Cache

A simple in-memory cache that you can use to cache your data, it uses the `Map` object to store the data.

> **Note**: The cache is not persistent, if the server goes down, the cache will be lost.


#### Jobs Scheduler

A simple cron job scheduler that you can use to schedule your cron jobs, it does not use any external module to run the cron jobs, it uses the `setTimeout` function to schedule the jobs. You can change the implementation if you want to.

#### Logger

A simple file system logger that logs to a log file, you can change the path of that file from the component factory.

There is also a cron job that runs every day at 01:00 to save the old logs and clear the main log file I am using the `JobsScheduler` to implement that cron job, but can use something else if you want to.

#### Messages Broker

A simple messages broker that you can use to publish events and register event handlers, it uses the `Map` object to store the events and their handlers.

If the handler fails, the broker will retry to run the handler after a certain amount of time, you can change the retry time from the `RetryFailedEventsScheduledJob`.

You can also use an external message broker like RabbitMQ or Kafka, and change the implementation of the `MessagesBroker` to use that external broker.

#### Persistence

A simple persistence layer that you can use to initialize your different data sources, it uses the `mongoose` ODM as an example here, but you can change the implementation to use any other ORM or database.

It also includes a cron job to generate persistence backups every Friday at 01:00 PM, you can change the rhythm in the `BackupScheduledJob`.

#### Primitive

A set of primitive types & objects that you can use in your project, it includes 2 directories:

- application-specific: which contains you shared application-specific objects like `Session`, `Pagination`, `Email`, `Exceptions`...

- generic: which contains generic objects & some helper methods.

### Components

#### Auth Management

Coming soon...

#### Media Management (Files & Images)

Coming soon...

#### Chat Management

Coming soon...

#### Blogs Management

Coming soon...

#### Notifications Management

Coming soon...

#### Webhooks Management

Coming soon...