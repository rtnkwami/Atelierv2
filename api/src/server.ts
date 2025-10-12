import app from "./app";
import config from "./env";
import logger from "./config/logger.config";
import { initializeDatabase } from "database/init";
import { dbClient } from "@config/db.config";

async function startDb() {
    try {
        await dbClient.authenticate();
        initializeDatabase(dbClient);
        logger.info("Database connection established");
    } catch (error) {
        logger.error(error, "Database error");
    }
}


app.listen(config.api.port, () => {
    logger.info(`Server listening on http://localhost:${config.api.port}...`);
    startDb();
});