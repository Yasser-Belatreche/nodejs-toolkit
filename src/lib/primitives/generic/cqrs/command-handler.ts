export interface CommandHandler<C, R> {
    execute(command: C): Promise<R>;
}
