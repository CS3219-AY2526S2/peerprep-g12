import { supabase } from '../supabaseClient';
import { Request, Response } from 'express'; 

/**
 * Retrieves all topics from the database.
 * 
 * @route GET /topics
 * @access Public
 * @param req : Request received
 * @param res : Response given 
 * @returns {Array} List of all topic objects 
 */
export async function getAllTopics(req: Request, res: Response) {
    const { data, error } = await supabase
        .from('topics')
        .select('*');
    
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data); 
}

/**
 * Creates a new topic in the repository.
 * New topics are empty by default until questions are linked to them.
 * 
 * @route POST /topics
 * @access Admin only
 * @body {string} name - The unique topic name 
 * @returns {Object} The newly created topic object
 */
export async function createTopic(req: Request, res: Response) {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Topic name is required.'});
    }

    const { data, error } = await supabase
        .schema('questionservice')
        .from('topics')
        .insert({ name, is_empty: true })
        .select()
        .single();
    
    if (error) {
        //This error code from postgresql means there is a unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({ error: `Topic "${name}" already exists.`});
        }
        return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data);
}