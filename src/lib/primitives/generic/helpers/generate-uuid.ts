import { ulid } from 'ulid';

const GenerateUuid = (): string => {
    return ulid();
};

export { GenerateUuid };
