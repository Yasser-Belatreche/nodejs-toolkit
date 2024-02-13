import { faker } from '@faker-js/faker';
import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';
import { RandomBool } from '../../../../../lib/primitives/generic/helpers/random-bool';
import { Event } from './event';

type EventName = string;

type BaseFieldType = 'STRING' | 'NUMBER' | 'ISO_STRING_DATE' | 'BOOLEAN';
type ArrayFieldType = `${BaseFieldType} (ARRAY)`;
type NullableFieldType = `${BaseFieldType} (NULLABLE)` | `${ArrayFieldType} (NULLABLE)`;
type OptionalFieldType = `${BaseFieldType} (OPTIONAL)` | `${ArrayFieldType} (OPTIONAL)`;

type FieldType = BaseFieldType | ArrayFieldType | NullableFieldType | OptionalFieldType;

type BaseFieldDescription = `[${FieldType}] ${string}`;
type FieldDescription =
    | BaseFieldDescription
    | { [Key: string]: FieldDescription }
    | Array<{ [Key: string]: FieldDescription }>;

export interface EventDocumentation {
    eventId: FieldDescription;
    occurredAt: FieldDescription;
    name: FieldDescription;
    payload: Record<string, FieldDescription>;
}

const baseBody: Omit<EventDocumentation, 'payload'> = {
    eventId: '[STRING] represent the event id',
    occurredAt: '[ISO_STRING_DATE] represent the event occurred at',
    name: '[STRING] represent the event name',
};

const SupportedEvents: Record<EventName, EventDocumentation> = {
    test: {
        ...baseBody,
        payload: {
            testAttribute: '[STRING] represent the some arbitrary data',
        },
    },
};

const GenerateTestEvent = (documentation: EventDocumentation): Event => {
    const result: any = {};

    for (const [key, value] of Object.entries(documentation)) {
        if (Array.isArray(value)) {
            result[key] = value.map(desc => GenerateTestEvent(desc));
            continue;
        }

        if (typeof value === 'object') {
            result[key] = GenerateTestEvent(value);
            continue;
        }

        const { type, isArray, isNullable, isOptional } = parseFieldType(value);

        if (isArray) {
            result[key] = Array.from({ length: faker.number.int({ min: 1, max: 10 }) }).map(() => {
                return getRandomValue(type);
            });
        } else {
            result[key] = getRandomValue(type);
        }

        if (isNullable && RandomBool()) {
            result[key] = null;
            continue;
        }

        if (isOptional && RandomBool()) {
            result[key] = undefined;
            continue;
        }
    }

    return result;
};

const parseFieldType = (
    desc: BaseFieldDescription,
): { type: BaseFieldType; isArray: boolean; isNullable: boolean; isOptional: boolean } => {
    const fieldTypeMatch = desc.match(/\[(.*?)\]/);

    if (!fieldTypeMatch)
        throw new DeveloperException(
            'INVALID_METHOD_CALL',
            "Field description doesn't match the expected format",
        );

    const fieldType = fieldTypeMatch[1].split(' ')[0].trim();
    const isNullable = desc.includes('(NULLABLE)');
    const isOptional = desc.includes('(OPTIONAL)');
    const isArray = desc.includes('(ARRAY)');

    return { type: fieldType as BaseFieldType, isArray, isNullable, isOptional };
};

const getRandomValue = (type: BaseFieldType): any => {
    switch (type) {
        case 'STRING':
            return faker.lorem.words();
        case 'NUMBER':
            return faker.number.int({ max: 3000 });
        case 'ISO_STRING_DATE':
            return faker.date.anytime();
        case 'BOOLEAN':
            return faker.datatype.boolean();
    }
};

export { SupportedEvents, GenerateTestEvent };
