import { Request, Response } from "express";
import { createLogger } from "../utils/logger";
import { generateAiResponse } from "../services/aiService";

const logger = createLogger("AiChatController");

type SendPromptBody = {
	userId?: string;
	prompt?: string;
};

export async function sendPrompt(req: Request, res: Response): Promise<void> {
	const { sessionId } = req.params;
	const { userId, prompt } = req.body as SendPromptBody;

  // tbd add a check for valid active sessionId
  // authenticate user id and check if user is part of the session

	if (!sessionId) {
    logger.error("Missing sessionId in URL params");
		res.status(400).json({ error: "sessionId is required in URL params" });
		return;
	}

	if (!userId || !prompt) {
    logger.error("Missing userId or prompt in request body");
		res.status(400).json({ error: "userId and prompt are required in payload" });
		return;
	}

	try {
		const aiResponse = await generateAiResponse({
			sessionId,
			userId,
			prompt,
		});

		res.status(200).json({ response: aiResponse });
	} catch (error) {
		logger.error("Failed to generate AI response", {
			sessionId,
			userId,
			error: error instanceof Error ? error.message : "Unknown error",
		});
		res.status(502).json({ error: "Failed to get response from AI service" });
	}
}

