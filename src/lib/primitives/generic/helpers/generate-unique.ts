import * as crypto from 'crypto';

const GenerateUnique = async (
    len: number = 16,
    isUsed?: (str: string) => Promise<boolean>,
): Promise<string> => {
    if (!isUsed) return crypto.randomBytes(len / 2).toString('hex');

    let result: string;
    do {
        result = crypto.randomBytes(len / 2).toString('hex');
    } while (await isUsed(result));

    return result;
};

export { GenerateUnique };
