import config from "../env";
import { Dialect, Sequelize } from "sequelize";

/**
 * Purpose: This functions exists to provide a sequelize connection for use in syncing models to
 * a database. It's a factory function for reuse in integration tests between repositories and
 * a test database created using a test container.
 * 
 * @param dbConnectionDetails 
 * @param dbUrl 
 * @returns database client
 */

export const getSequelizeClient = (
    dbConnectionDetails: {
        name: string,
        user: string,
        password: string,
        host: string,
        dialect: Dialect,
        port: number,
},
    dbUrl?: string
) => {

    let client: Sequelize;

    if (dbUrl){
        /** Use database url in case db is switched to a third party database provider */
        client = new Sequelize(dbUrl, { logging: false })
    } else {
        client = new Sequelize(
           dbConnectionDetails.name,
           dbConnectionDetails.user,
           dbConnectionDetails.password,
           {
               host: dbConnectionDetails.host,
               port: dbConnectionDetails.port,
               dialect: dbConnectionDetails.dialect,
               logging: false
           }
       );

    }

    return client;
};


const dbConnectionDetailsFromEnv = {
    name: config.db.name,
    user: config.db.user,
    password: config.db.password,
    host: config.db.host,
    dialect: config.db.dialect,
    port: config.db.port
}


export const dbClient = getSequelizeClient(dbConnectionDetailsFromEnv);