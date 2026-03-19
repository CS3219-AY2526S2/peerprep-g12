import { Router } from 'express';
import { fetchQuestionForSession } from '../controllers/internalController';

const router = Router();

router.post('/questions/fetch', fetchQuestionForSession);

export default router;