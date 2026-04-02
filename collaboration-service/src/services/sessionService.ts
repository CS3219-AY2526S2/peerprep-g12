import supabase from '../config/supabase';
import { Session, CreateSessionDTO, UpdateSessionDTO } from '../models/session';
import { randomUUID } from 'crypto';

interface QuestionBlock {
  block_type: string;
  content: string;
}

interface QuestionServiceQuestion {
  id?: string;
  question_id?: string;
  question_number?: number;
  title?: string;
  difficulty?: string;
  topics?: string[];
  blocks?: QuestionBlock[];
  question?: {
    id?: string;
    question_id?: string;
  };
}

const getQuestionIdFromPayload = (payload: QuestionServiceQuestion): string | null => {
  const directId = payload.id ?? payload.question_id ?? payload.question?.id ?? payload.question?.question_id;
  if (typeof directId === 'string' && directId.trim().length > 0) {
    return directId;
  }

  return null;
};

const toBlocksSignature = (blocks: QuestionBlock[] | undefined): string => {
  return JSON.stringify((blocks ?? []).map((block) => ({
    block_type: block.block_type,
    content: block.content
  })));
};

const resolveQuestionIdFromCatalog = async (
  questionServiceUrl: string,
  topic: string,
  difficulty: string,
  fetchedQuestion: QuestionServiceQuestion
): Promise<string | null> => {
  const params = new URLSearchParams({ topic, difficulty, status: 'available' });
  const response = await fetch(`${questionServiceUrl}/questions?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to resolve question ID from catalog: ${response.statusText}`);
  }

  const candidates = await response.json() as QuestionServiceQuestion[];
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }

  if (typeof fetchedQuestion.question_number === 'number') {
    const byQuestionNumber = candidates.find((candidate) =>
      candidate.question_number === fetchedQuestion.question_number
    );
    const idByQuestionNumber = byQuestionNumber ? getQuestionIdFromPayload(byQuestionNumber) : null;
    if (idByQuestionNumber) {
      return idByQuestionNumber;
    }
  }

  const fetchedBlocksSignature = toBlocksSignature(fetchedQuestion.blocks);
  const exactMatch = candidates.find((candidate) => {
    if (!fetchedQuestion.title || !candidate.title) {
      return false;
    }

    return (
      candidate.title === fetchedQuestion.title &&
      candidate.difficulty === fetchedQuestion.difficulty &&
      toBlocksSignature(candidate.blocks) === fetchedBlocksSignature
    );
  });
  const exactMatchId = exactMatch ? getQuestionIdFromPayload(exactMatch) : null;
  if (exactMatchId) {
    return exactMatchId;
  }

  const titleMatch = candidates.find((candidate) =>
    fetchedQuestion.title && candidate.title === fetchedQuestion.title
  );
  return titleMatch ? getQuestionIdFromPayload(titleMatch) : null;
};

const selectRandomQuestionIdFromCatalog = async (
  questionServiceUrl: string,
  topic: string,
  difficulty: string
): Promise<string | null> => {
  const params = new URLSearchParams({ topic, difficulty, status: 'available' });
  const response = await fetch(`${questionServiceUrl}/questions?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch question catalog: ${response.statusText}`);
  }

  const candidates = await response.json() as QuestionServiceQuestion[];
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }

  const candidatesWithId = candidates
    .map((candidate) => getQuestionIdFromPayload(candidate))
    .filter((id): id is string => Boolean(id));

  if (candidatesWithId.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * candidatesWithId.length);
  return candidatesWithId[randomIndex] ?? null;
};

const fetchQuestionFromService = async (topic: string, difficulty: string): Promise<string> => {
  const questionServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:3001';
  
  const response = await fetch(`${questionServiceUrl}/internal/questions/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, difficulty }),
  });

  if (!response.ok) {
    const fallbackId = await selectRandomQuestionIdFromCatalog(questionServiceUrl, topic, difficulty);
    if (fallbackId) {
      return fallbackId;
    }

    throw new Error(`Failed to fetch question from Question Service: ${response.statusText}`);
  }

  const data = await response.json() as QuestionServiceQuestion;
  const directId = getQuestionIdFromPayload(data);
  if (directId) {
    return directId;
  }

  const resolvedId = await resolveQuestionIdFromCatalog(questionServiceUrl, topic, difficulty, data);
  if (!resolvedId) {
    throw new Error('Question Service returned no question ID');
  }

  return resolvedId;
};

export const createSession = async (dto: CreateSessionDTO): Promise<Session> => {
  const question_id = await fetchQuestionFromService(dto.topic, dto.difficulty);

  const newSession = {
    session_id: randomUUID(),
    ...dto,
    question_id,
    start_timestamp: new Date(),
    end_timestamp: null,
    status: 'active',
    code_content: '',
  };

  const { data, error } = await supabase
    .schema('collaborationservice')
    .from('collaboration_rooms')
    .insert(newSession)
    .select()
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return data as Session;
};

export const getSessionById = async (sessionId: string): Promise<Session | null> => {
  const { data, error } = await supabase
    .schema('collaborationservice')
    .from('collaboration_rooms')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) return null;
  return data as Session;
};

export const getActiveSessionByUserId = async (userId: string): Promise<Session | null> => {
  const { data, error } = await supabase
    .schema('collaborationservice')
    .from('collaboration_rooms')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq('status', 'active')
    .single();

  if (error) return null;
  return data as Session;
};

export const updateSession = async (
  sessionId: string,
  dto: UpdateSessionDTO
): Promise<Session> => {
  const { data, error } = await supabase
    .schema('collaborationservice')
    .from('collaboration_rooms')
    .update(dto)
    .eq('session_id', sessionId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update session: ${error.message}`);
  return data as Session;
};

export const endSession = async (sessionId: string): Promise<Session> => {
  return updateSession(sessionId, {
    status: 'inactive',
    end_timestamp: new Date(),
  });
};