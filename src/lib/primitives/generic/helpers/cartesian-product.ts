const CartesianOfRecord = <T extends Record<string, any[] | any | undefined>>(
    record: T,
): Array<Record<keyof T, any>> => {
    record = cleanupRecord(record) as T;

    const keys = Object.keys(record);
    const values = Object.values(record);

    const cartesianProduct = CartesianOf(...values.map(v => (Array.isArray(v) ? v : [v])));

    const result: Array<Record<keyof T, any>> = [];

    for (let i = 0; i < cartesianProduct.length; i++) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const temp: Record<keyof T, any> = {};

        for (let j = 0; j < keys.length; j++) {
            temp[keys[j] as keyof T] = cartesianProduct[i][j];
        }

        result.push(temp);
    }

    return result;
};

const cleanupRecord = <T extends Record<string, any>>(record: T): Record<string, any> => {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(record)) {
        if (value !== null && value !== undefined) result[key] = value;
    }

    return result;
};

const CartesianOf = (...arrays: any[][]): any[][] => {
    if (arrays.length === 0) return [[]];

    if (arrays.length === 1) return arrays[0].map(x => [x]);

    let result: any[][] = arrays[0];

    for (let i = 1; i < arrays.length; i++) {
        result = CartesianProduct(result, arrays[i]);
    }

    return result;
};

const CartesianProduct = (first: any[], second: any[]): any[][] => {
    const result: any[][] = [];

    for (let i = 0; i < first.length; i++) {
        for (let j = 0; j < second.length; j++) {
            let temp: any[] = first[i];

            if (!Array.isArray(first[i])) temp = [first[i]];

            result.push([...temp, second[j]]);
        }
    }

    return result;
};

export { CartesianOf, CartesianProduct, CartesianOfRecord };
