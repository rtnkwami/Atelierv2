import app from "./app.ts";
import config from "./env.ts";

app.listen(config.api.port, () => {
    console.log(`Server listening on http://localhost:${config.api.port}...`);
});