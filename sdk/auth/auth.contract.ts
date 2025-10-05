import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

const authMessage = z.object({
    message: z.string().nonempty()
});

export const authContract = c.router({
    testAuth: {
        method: 'GET',
        path: '/auth',
        responses: {
            200: authMessage
        },
        summary: 'Test an auth route'
    }
});