import app from "./app";
import config from "./env";
import logger from "./config/logger.config";
import { sequelize } from "@config/db.config";
import 'database/schema.ts'

async function startDb() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        logger.info("Database connection established");
    } catch (error) {
        logger.error(error, "Database error");
    }
}


app.listen(config.api.port, () => {
    logger.info(`Server listening on http://localhost:${config.api.port}...`);
    startDb();
});