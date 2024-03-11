import { EventsBroker } from './events-broker';

interface Configs {
    uri: string;
}

class RabbitmqEventsBroker implements EventsBroker {
    private static _instance: RabbitmqEventsBroker;

    static Instance(configs: Configs): RabbitmqEventsBroker {
        if (!this._instance) {
            this._instance = new RabbitmqEventsBroker(configs);
        }

        return this._instance;
    }

    private constructor(private readonly configs: Configs) {}
}

export { RabbitmqEventsBroker };
