import { Router } from 'express';
import type { MatchingService } from '../services/matchingService.js';
import { createEarlyTerminationHandler } from '../controllers/matchingController.js';

const createMatchingRoutes = (matchingService: MatchingService) => {
	const router = Router();
	router.post('/internal/early-termination', createEarlyTerminationHandler((userId) => matchingService.handleEarlyTermination(userId)));
	return router;
};

export default createMatchingRoutes;