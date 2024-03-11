import { JobsScheduler } from '@lib/jobs-scheduler/main/jobs-scheduler';

import { MessagesBroker } from './messages-broker';
import { MessagesBrokerFacade } from './messages-broker-facade';
import { MessagesBrokerInitializer } from './messages-broker-initializer';
import { InMemorySyncMessagesBroker } from './sync-messages-broker/in-memory-sync-messages-broker';
import { InMemoryEventsBroker } from './events-broker/in-memory-events-broker/in-memory-events-broker';
import { InMemoryFailedEventsRepository } from './events-broker/in-memory-events-broker/data-access/in-memory-failed-events-repository';

const facade = new MessagesBrokerFacade(
    InMemoryEventsBroker.Instance(new InMemoryFailedEventsRepository()),
    InMemorySyncMessagesBroker.Instance(),
);

const MessagesBrokerFactory = {
    async Setup(scheduler: JobsScheduler) {
        MessagesBrokerInitializer.Init(scheduler, this.anInstance());
    },

    anInstance(): MessagesBroker {
        return facade;
    },
};

export { MessagesBrokerFactory };
