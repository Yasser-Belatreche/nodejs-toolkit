export interface Logger {
    info(log: InfoLogRequest): Promise<void>;

    error(log: ErrorLogRequest): Promise<void>;

    warn(log: WarningLogRequest): Promise<void>;

    clear(config?: { saveOld: true }): Promise<void>;
}

export interface InfoLogRequest {
    correlationId: string;
    context: string;
    payload?: Record<string, any>;
}

export interface ErrorLogRequest {
    correlationId: string;
    context: string;
    error: Error;
    payload?: Record<string, any>;
}

export interface WarningLogRequest {
    correlationId: string;
    context: string;
    error?: Error;
    payload?: Record<string, any>;
}
