import { initContract } from '@ts-rest/core';
import { authContract } from './auth/auth.contract.js';

const c = initContract();

export const contract = c.router({
    auth: authContract
});