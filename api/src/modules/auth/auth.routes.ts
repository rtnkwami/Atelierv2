import { Router } from "express";
import { verifyJwt } from "middleware/verifyJwt.ts";

const router = Router()

router.use(verifyJwt);

router.get('/', async (req, res) => {
    res.json({ message: "This is the protected auth route" });
})

export default router;