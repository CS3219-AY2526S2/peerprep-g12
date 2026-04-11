import { createLogger } from "../utils/logger";

const logger = createLogger("AiChatQuestionService");

type QuestionBlock = {
  content: string;
};

type QuestionResponse = {
  title: string;
  blocks: QuestionBlock[];
};

const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || "http://localhost:3001";

export async function parseQuestion(
  questionId: string,
  authorization: string
): Promise<string> {
  const response = await fetch(
    `${QUESTION_SERVICE_URL}/questions/id/${questionId}`,
    {
      method: "GET",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    logger.error("Failed to fetch question from question service", {
      questionId,
      status: response.status,
    });
    
    throw new Error(
      `Failed to fetch question ${questionId} from question service (${response.status})`
    );
  }

  const body = (await response.json()) as unknown;
  if (!isQuestionResponse(body)) {
    logger.error("Invalid question payload from question service", {
      questionId,
    });

    throw new Error("Invalid question payload from question service");
  }

  return combineQuestion(body.title, body.blocks);
}

// Combines question title and block content
function combineQuestion(title: string, blocks: QuestionBlock[]): string {
  const blockContent = blocks
    .map((block) => block.content.trim())
    .filter((content) => content.length > 0)
    .join("\n\n");

  if (!blockContent) {
    return title.trim();
  }

  return `${title.trim()}\n\n${blockContent}`;
}

// Checks if value has expected shape of question service response
function isQuestionResponse(value: unknown): value is QuestionResponse {
  if (!isRecord(value)) return false;
  if (typeof value.title !== "string") return false;
  if (!Array.isArray(value.blocks)) return false;

  return value.blocks.every(
    (block) => isRecord(block) && typeof block.content === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}
