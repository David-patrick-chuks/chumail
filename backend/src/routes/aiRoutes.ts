import { Router } from 'express';
import { generate } from '../controllers/aiController.js';

const router = Router();

router.post('/generate', generate);

export default router;
