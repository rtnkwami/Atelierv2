import config from "../env.ts";
import { Sequelize } from "sequelize";
import logger from "./logger.config.ts";

/** Use database url in case db is switched to a third party database provider */
export const sequelize = config.db.url
    ? new Sequelize(config.db.url, { logging: false })
    : new Sequelize(
        config.db.name,
        config.db.user,
        config.db.password,
        {
            host: config.db.host,
            dialect: config.db.dialect,
            logging: false
        }
    );

export const testDbConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info("Database connection established successfully")
    } catch (error) {
        logger.error(error, "Database connection error")
    }
}