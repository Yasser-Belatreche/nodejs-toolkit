class TimeCalculator {
    static Instance(): TimeCalculator {
        return new TimeCalculator();
    }

    private _years = 0;
    private _months = 0;
    private _weeks = 0;
    private _days = 0;
    private _hours = 0;
    private _minutes = 0;
    private _seconds = 0;
    private _milliseconds = 0;

    private constructor() {}

    years(val: number): this {
        this._years += val;

        return this;
    }

    months(val: number): this {
        this._months += val;

        return this;
    }

    weeks(val: number): this {
        this._weeks += val;

        return this;
    }

    days(val: number): this {
        this._days += val;

        return this;
    }

    hours(val: number): this {
        this._hours += val;

        return this;
    }

    minutes(val: number): this {
        this._minutes += val;

        return this;
    }

    seconds(val: number): this {
        this._seconds += val;

        return this;
    }

    milliseconds(val: number): this {
        this._milliseconds += val;

        return this;
    }

    inHours(precision?: number): number {
        const result =
            this._milliseconds / (60 * 60 * 1000) +
            this._seconds / (60 * 60) +
            this._minutes / 60 +
            this._hours +
            this._days * 24 +
            this._weeks * 7 * 24 +
            this._months * 30 * 24 +
            this._years * 12 * 30 * 24 * 60;

        if (precision) return roundToDecimalPlaces(result, precision);
        return result;
    }

    inMinutes(precision?: number): number {
        const result =
            this._milliseconds / (60 * 1000) +
            this._seconds / 60 +
            this._minutes +
            this._hours * 60 +
            this._days * 24 * 60 +
            this._weeks * 7 * 24 * 60 +
            this._months * 30 * 24 * 60 +
            this._years * 12 * 30 * 24 * 60;

        if (precision) return roundToDecimalPlaces(result, precision);
        return result;
    }

    inSeconds(precision?: number): number {
        const result =
            this._milliseconds / 1000 +
            this._seconds +
            this._minutes * 60 +
            this._hours * 60 * 60 +
            this._days * 24 * 60 * 60 +
            this._weeks * 7 * 24 * 60 * 60 +
            this._months * 30 * 24 * 60 * 60 +
            this._years * 12 * 30 * 24 * 60 * 60;

        if (precision) return roundToDecimalPlaces(result, precision);
        return result;
    }

    inMilliseconds(precision?: number): number {
        const result =
            this._milliseconds +
            this._seconds * 1000 +
            this._minutes * 60 * 1000 +
            this._hours * 60 * 60 * 1000 +
            this._days * 24 * 60 * 60 * 1000 +
            this._weeks * 7 * 24 * 60 * 60 * 1000 +
            this._months * 30 * 24 * 60 * 60 * 1000 +
            this._years * 12 * 30 * 24 * 60 * 60 * 1000;

        if (precision) return roundToDecimalPlaces(result, precision);
        return result;
    }
}

function roundToDecimalPlaces(num: number, decimalPlaces: number): number {
    const factor = Math.pow(10, decimalPlaces);

    return Math.round(num * factor) / factor;
}

export { TimeCalculator };
