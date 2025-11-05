import { PrismaClient } from "@db-client/client.ts";
import { TransactionClient } from "@db-client/internal/prismaNamespace.ts";
import { AsyncLocalStorage } from "node:async_hooks";
import { Task } from 'true-myth' 
import { tryOrElse } from "true-myth/task";

interface AsyncContext {
    tx?: TransactionClient;
}

export const asyncLocalStorage = new AsyncLocalStorage<AsyncContext>();

export function getTxOrDbClient(db: PrismaClient): PrismaClient | TransactionClient {
    const store = asyncLocalStorage.getStore();
    return store?.tx ?? db;
};


export function runWithTransaction<T, E>(
    db: PrismaClient,
    taskFn: () => Task<T, E>
): Task<T, E> {
    return tryOrElse(
        (reason) => reason as E,
        () => db.$transaction(async (tx) => {
            return await asyncLocalStorage.run({ tx }, async () => {
                const result = await taskFn();

                if (result.isErr){
                    throw result.error;
                }
                return result.value;
            })
        })
    )
}