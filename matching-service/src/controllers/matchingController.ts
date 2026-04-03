import type { Request, Response } from 'express';
import { createLogger } from '../utils/logger.js';
import type { EarlyTerminationOutcome } from '../services/matchingService.js';

const logger = createLogger('MatchingController');

export const createEarlyTerminationHandler = (
    onEarlyTermination: (userId: string) => Promise<EarlyTerminationOutcome>
) => {
	return async (req: Request, res: Response): Promise<void> => {
		try {
            // Interservice security check to ensure malicious user cannot ban others by calling the endpoint directly
			const expectedKey = process.env.INTERNAL_SERVICE_SECRET;
			const apiKey = req.headers['x-internal-service-secret'];

			if (!expectedKey) {
				logger.error('INTERNAL_SERVICE_SECRET is not set in environment variables');
				res.status(500).json({ error: 'Internal server error' });
				return;
			}

            if (apiKey !== process.env.INTERNAL_SERVICE_SECRET) {
                logger.error('Incorrect API key provided');
                res.status(403).json({ error: 'Incorrect key, request forbidden' });
                return;
            }

            if (!req.body.userId) {
                logger.error('Missing userId in early termination request body');
                res.status(400).json({ error: 'Missing required field: userId' });
                return;
            }

            const { userId } = req.body as { userId: string };
            const outcome = await onEarlyTermination(userId);

            if (outcome === 'ban_triggered') {
                logger.info(`User ${userId} received a second early termination strike within the hour and was banned.`);
                res.status(200).json({ message: `User ${userId} received a second strike and was banned.`, outcome });
                return;
            }

            if (outcome === 'strike_recorded') {
                logger.info(`Recorded early termination strike for user ${userId}.`);
                res.status(200).json({ message: `Recorded early termination strike for user ${userId}.`, outcome });
                return;
            }

            logger.info(`User ${userId} is already banned. Investigation needed to understand why user has access to collaboration session while banned.`);
            res.status(200).json(
                { message: `User ${userId} is already banned. Investigation needed to understand why user has access to collaboration session while banned.`, 
                outcome });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error(`Error occurred while handling early termination: ${message}`);
            res.status(500).json({ error: message });
        }
    };
};
