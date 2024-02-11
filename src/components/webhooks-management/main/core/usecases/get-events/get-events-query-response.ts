import { EventDocumentation } from '../../domain/supported-events';

export interface GetEventsQueryResponse {
    names: string[];
    docs: EventDocumentation[];
}
