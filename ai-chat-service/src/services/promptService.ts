import { createLogger } from "../utils/logger";
import { parseQuestion } from "./questionService";

const logger = createLogger("AiChatPromptService");

type PromptContextInput = {
	language: string;
	difficulty: string;
	topic: string;
	questionId: string;
	codeContent: string;
	userPrompt: string;
	authorization: string;
};

export async function buildPrompt(input: PromptContextInput): Promise<string> {
	const cohesiveQuestion = await parseQuestion(
		input.questionId,
		input.authorization
	);
    logger.info("Successfully parsed question for prompt building", {
        questionId: input.questionId,
    });

	// Placeholder prompt shape until full prompt-crafting logic is implemented.
	return [
		`Language: ${input.language}`,
		`Difficulty: ${input.difficulty}`,
		`Topic: ${input.topic}`,
		`Question: ${cohesiveQuestion}`,
		`Current code: ${input.codeContent}`,
		`User prompt: ${input.userPrompt}`,
	].join("\n\n");
}
