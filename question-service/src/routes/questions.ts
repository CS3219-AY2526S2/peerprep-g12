import { Router } from 'express';
import {
    getAllQuestions,
    getQuestionByNumber,
    createQuestion,
    editQuestion,
    archiveQuestion,
    restoreQuestion,
    deleteQuestion
} from '../controllers/questionController';

const router = Router();

router.get('/', getAllQuestions);
router.get('/:questionNumber', getQuestionByNumber);
router.post('/', createQuestion);
router.patch('/:questionNumber', editQuestion);
router.patch('/:questionNumber/archive', archiveQuestion);
router.patch('/:questionNumber/restore', restoreQuestion);
router.delete('/:questionNumber', deleteQuestion);

export default router;