import { Router } from "express";
import { getPromptCount, sendPrompt } from "../controllers/aiChatController";

const router = Router();

// POST /sessions/:sessionId/chat - send a prompt in ai chat and receive response from ai agent
router.post('/sessions/:sessionId/chat', sendPrompt);

// GET /sessions/:sessionId/promptCount - get remaining prompts for the user for that session
router.get('/sessions/:sessionId/promptCount', getPromptCount);

export default router;
