import config from "../env.ts";
import { Sequelize } from "sequelize";

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