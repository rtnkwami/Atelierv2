import app from "./app";
import config from "./env";
import logger from "./config/logger.config";

app.listen(config.api.port, () => {
    logger.info(`Server listening on http://localhost:${config.api.port}...`);
});