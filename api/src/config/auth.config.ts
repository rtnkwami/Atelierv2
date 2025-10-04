import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import config from 'env.ts';

const app = initializeApp({ projectId: config.auth.projectId });

export const auth = getAuth(app);