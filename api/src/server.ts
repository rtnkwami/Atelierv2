import app from "./app.ts";
import config from "./env.ts";
import logger from "./config/logger.config.ts";
import { testDbConnection } from "./config/db.config.ts";

app.listen(config.api.port, () => {
    logger.info(`Server listening on http://localhost:${config.api.port}...`);
    
    testDbConnection();
});