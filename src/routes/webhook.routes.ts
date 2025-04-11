import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/whatsapp', authMiddleware.webhookAuth, webhookController.handleWhatsAppWebhook);

router.post('/telegram', authMiddleware.webhookAuth, webhookController.handleTelegramWebhook);

// Ruta de verificación para WhatsApp (necesaria para la configuración)
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Verificar que el token coincida con el configurado
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

export const webhookRoutes = router;
