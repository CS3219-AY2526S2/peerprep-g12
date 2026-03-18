import { supabase } from "../supabaseClient";
import { Request, Response } from 'express';

/**
 * Retrieves all questions from the database with optional filters.
 * Superseded questions are never returned.
 * 
 * @route GET /questions
 * @access Admin only 
 * @queryparam {string} [topic] - Filter by topic name 
 * @queryparam {string} [difficulty] - Filter by difficulty (easy/medium/hard)
 * @queryparam {string} [status] - Filter by status (available/archived only)
 * @returns {Array} List of matching question objects with their topics 
 */
export async function getAllQuestions(req: Request, res: Response) {
    const { topic, difficulty, status } = req.query;

    // Build the query -- never show superseded questions 
    let query = supabase
        .schema('questionservice')
        .from('questions')
        .select(`*, question_topics(topic)`) //join
        .in('availability_status', ['available', 'archived']);

    if (difficulty) query = query.eq('difficulty', difficulty);
    if (status && ['available', 'archived'].includes(status as string)) {
        query = query.eq('availability_status', status);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({error: error.message});

    //if filtered by topic
    const result = topic
        ? data.filter((q: any) => 
            q.question_topics.some((qt: any) => qt.topic === topic)
        )
        : data;
    
        return res.status(200).json(result); 
}

/**
 * Retrieves a single question by its question number.
 * Only returns available or archived versions, never superseded.
 * 
 * @route GET /questions/:questionNumber
 * @access Admin only 
 * @param {strung} questionNumber - The question number to retrieve
 * @returns {Object} The matching question object with its topics
 */
export async function getQuestionByNumber(req: Request, res: Response) {
    const { questionNumber } = req.params;

    const { data, error } = await supabase
        .schema('questionservice')
        .from('questions')
        .select(`*, question_topics(topic)`)
        .eq('question_number', questionNumber)
        .in('availability_status', ['available', 'archived'])
        .single();
    
    if (error || !data) {
        return res.status(404).json({error: 'Question not found'});
    }

    return res.status(200).json(data)
}