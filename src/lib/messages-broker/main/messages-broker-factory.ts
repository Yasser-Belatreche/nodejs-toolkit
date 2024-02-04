import { MessagesBroker } from './messages-broker';

import { InMemoryMessagesBroker } from './in-memory-messages-broker';

let instance: MessagesBroker | undefined;

const MessagesBrokerFactory = {
    anInstance(): MessagesBroker {
        if (!instance) instance = new InMemoryMessagesBroker();

        return instance;
    },
};

export { MessagesBrokerFactory };
