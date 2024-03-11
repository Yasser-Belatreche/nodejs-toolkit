import { EventsBroker } from './events-broker/events-broker';
import { SyncMessagesBroker } from './sync-messages-broker/sync-messages-broker';

export interface MessagesBroker extends EventsBroker, SyncMessagesBroker {}
