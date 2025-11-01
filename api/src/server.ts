import config from "./env.ts";
import createDiContainer from "di.ts";

const container = createDiContainer();
const api = container.resolve('app');
const logger = container.resolve('baseLogger');

api.listen(config.api.port, () => {
    logger.info(`Server listening on http://localhost:${config.api.port}...`);
});