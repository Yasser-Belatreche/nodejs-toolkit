import { JobsScheduler } from '@lib/jobs-scheduler/main/jobs-scheduler';

import { MessagesBroker } from './messages-broker';
import { InMemoryMessagesBroker } from './in-memory-messages-broker';
import { MessagesBrokerInitializer } from './messages-broker-initializer';
import { InMemoryFailedEventsRepository } from './data-access/in-memory-failed-events-repository';

const MessagesBrokerFactory = {
    async Setup(scheduler: JobsScheduler) {
        MessagesBrokerInitializer.Init(scheduler, this.anInstance());
    },

    anInstance(): MessagesBroker {
        return InMemoryMessagesBroker.Instance(new InMemoryFailedEventsRepository());
    },
};

export { MessagesBrokerFactory };
