import { PrismaClient } from "@db-client/client.ts";
import { TransactionClient } from "@db-client/internal/prismaNamespace.ts";
import { AsyncLocalStorage } from "node:async_hooks";
import { Task } from 'true-myth' 
import { tryOrElse } from "true-myth/task";

interface AsyncContext {
    tx?: TransactionClient;
}

export const asyncLocalStorage = new AsyncLocalStorage<AsyncContext>();


/**
 * Gets the database client to use - either from a transaction or the main db.
 * 
 * @Problem AsyncLocalStorage's "store" only works if you keep the async chain connected.
 * If you break the chain, the store gets lost.
 * 
 * @Explanation
 * This breaks the chain (async store is lost):
 * ```typescript
 * const task = await userRepo.getUser(id);
 * task.match({
 *   Ok: async (user) => await userRepo.updateUser(user) // New async chain = no store
 * });
 * ```
 * 
 * This keeps the chain (preserves the async store):
 * ```typescript
 * await userRepo.getUser(id)
 *   .andThen(user => userRepo.updateUser(user)); // Chain connected = store travels with it
 * ```
 * 
 * If this breaks with "Response from the Engine was empty", you probably broke 
 * the async chain somewhere. Use `.andThen()` to chain Tasks together.
 */
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