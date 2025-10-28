import config from "./env";
import logger from "./config/logger.config";
import createDiContainer from "di";

const container = createDiContainer();
const api = container.resolve('app');

api.listen(config.api.port, () => {
    logger.info(`Server listening on http://localhost:${config.api.port}...`);
});