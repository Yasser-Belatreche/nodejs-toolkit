import { Capitalize } from '../../generic/helpers/capitalize';

const GetEventHandlerLogMessage = (component: string, event: string, action: string): string => {
    return Capitalize(`${component}: handling event [${event}] - ${action}`);
};

const GetScheduledJobLogMessage = (component: string, job: string, action: string): string => {
    return Capitalize(`${component}: Running Scheduled Job [${job}] - ${action}`);
};

const GetQuestionAnsweringLogMessage = (
    component: string,
    question: string,
    action: string,
): string => {
    return Capitalize(`${component}: Answering Question [${question}] - ${action}`);
};

const GetComponentActionLogMessage = (component: string, action: string): string => {
    return Capitalize(`${component}: ${action}`);
};

export {
    GetEventHandlerLogMessage,
    GetScheduledJobLogMessage,
    GetQuestionAnsweringLogMessage,
    GetComponentActionLogMessage,
};
