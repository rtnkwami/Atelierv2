/**Purpose: The code in this file exists to catch errors in environment variables at runtime
 * and to reduce issues where errors take a long time to resolve due to missing or incorrect
 * variables.
 */

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
    port: z.number()
})

const env = {
    port: Number(process.env.PORT)
};

const config = configSchema.parse(env);

export default config;