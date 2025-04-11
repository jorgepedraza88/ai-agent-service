import { Router } from 'express';
import { agentController } from '../controllers/agent.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';

const router = Router();

router.post(
  '/message',
  authMiddleware.apiKeyAuth,
  validationMiddleware.validateAgentRequest,
  agentController.processMessage,
);

// Esta ruta se implementará cuando agregues la lógica completa de Ollama
// router.post(
//   '/message/ollama',
//   authMiddleware.apiKeyAuth,
//   validationMiddleware.validateAgentRequest,
//   agentController.processMessageWithOllama
// );

export const agentRoutes = router;
