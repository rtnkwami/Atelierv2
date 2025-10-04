import pino from "pino";
import { pinoHttp } from "pino-http";
import type { Request, Response } from "express";

const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    },
    base: null
});

export const httpLogger = pinoHttp({
    transport: {
        target: 'pino-pretty',
        options: { colorize: true }
    },
    serializers: {
        req: (req: Request) => {
            return {
                id: req.id,
                method: req.method,
                url: req.url,
                query: req.query,
                params: req.params,
                headers: {
                    host: req.headers.host,
                    userAgent: req.headers["user-agent"],
                    origin: req.headers.origin
                },
            }
        },
        res: (res: Response) => {
            return {
                statusCode: res.statusCode
            }
        },
    }
})

export default logger;