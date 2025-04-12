import axios from 'axios';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export interface WhatsAppMessage {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  text?: {
    preview_url?: boolean;
    body: string;
  };
  image?: {
    link: string;
  };
  audio?: {
    link: string;
  };
  document?: {
    link: string;
    caption?: string;
  };
}

export class WhatsAppIntegration {
  private apiUrl: string;
  private apiVersion: string;
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.apiUrl = 'https://graph.facebook.com';
    this.apiVersion = config.whatsapp?.apiVersion || 'v18.0';
    this.accessToken = config.whatsapp?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId =
      config.whatsapp?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';

    if (!this.accessToken || !this.phoneNumberId) {
      logger.error('WhatsApp integration: Missing access token or phone number ID');
    }
  }

  /**
   * Envía un mensaje de texto a través de WhatsApp
   * @param to Número de teléfono del destinatario con código de país (ej: 34612345678)
   * @param text Texto del mensaje
   * @returns Respuesta de la API de WhatsApp
   */
  async sendTextMessage(to: string, text: string): Promise<any> {
    try {
      const message: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          preview_url: false,
          body: text,
        },
      };

      return await this.sendMessage(message);
    } catch (error) {
      logger.error(`Error sending WhatsApp text message: ${error}`);
      throw error;
    }
  }

  /**
   * Envía una imagen a través de WhatsApp
   * @param to Número de teléfono del destinatario con código de país (ej: 34612345678)
   * @param imageUrl URL de la imagen
   * @returns Respuesta de la API de WhatsApp
   */
  async sendImageMessage(to: string, imageUrl: string): Promise<any> {
    try {
      const message: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'image',
        image: {
          link: imageUrl,
        },
      };

      return await this.sendMessage(message);
    } catch (error) {
      logger.error(`Error sending WhatsApp image message: ${error}`);
      throw error;
    }
  }

  /**
   * Envía un documento a través de WhatsApp
   * @param to Número de teléfono del destinatario con código de país (ej: 34612345678)
   * @param documentUrl URL del documento
   * @param caption Texto descriptivo opcional
   * @returns Respuesta de la API de WhatsApp
   */
  async sendDocumentMessage(to: string, documentUrl: string, caption?: string): Promise<any> {
    try {
      const message: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'document',
        document: {
          link: documentUrl,
          caption,
        },
      };

      return await this.sendMessage(message);
    } catch (error) {
      logger.error(`Error sending WhatsApp document message: ${error}`);
      throw error;
    }
  }

  /**
   * Envía un audio a través de WhatsApp
   * @param to Número de teléfono del destinatario con código de país (ej: 34612345678)
   * @param audioUrl URL del audio
   * @returns Respuesta de la API de WhatsApp
   */
  async sendAudioMessage(to: string, audioUrl: string): Promise<any> {
    try {
      const message: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'audio',
        audio: {
          link: audioUrl,
        },
      };

      return await this.sendMessage(message);
    } catch (error) {
      logger.error(`Error sending WhatsApp audio message: ${error}`);
      throw error;
    }
  }

  /**
   * Método genérico para enviar mensajes a la API de WhatsApp
   * @param message Mensaje a enviar siguiendo la estructura de la API
   * @returns Respuesta de la API de WhatsApp
   */
  private async sendMessage(message: WhatsAppMessage): Promise<any> {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        throw new Error('Missing WhatsApp credentials');
      }

      const url = `${this.apiUrl}/${this.apiVersion}/${this.phoneNumberId}/messages`;

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      };

      const response = await axios.post(url, message, { headers });
      logger.info(`WhatsApp message sent successfully to ${message.to}`);
      return response.data;
    } catch (error) {
      logger.error(`Error in WhatsApp API call: ${error}`);
      throw error;
    }
  }

  /**
   * Procesa los mensajes entrantes de WhatsApp
   * @param webhookBody Cuerpo del webhook recibido
   * @returns Objeto con información del mensaje recibido
   */
  processIncomingMessage(webhookBody: any): any {
    try {
      if (!webhookBody?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        return null;
      }

      const entry = webhookBody.entry[0];
      const change = entry.changes[0];
      const value = change.value;
      const message = value.messages[0];
      const contact = value.contacts?.[0];

      // Verificar el tipo de mensaje y extraer la información relevante
      let messageContent = null;
      const messageType = message.type;

      switch (messageType) {
        case 'text':
          messageContent = message.text.body;
          break;
        case 'image':
          messageContent = {
            id: message.image.id,
            caption: message.image.caption,
          };
          break;
        case 'document':
          messageContent = {
            id: message.document.id,
            filename: message.document.filename,
            caption: message.document.caption,
          };
          break;
        case 'audio':
          messageContent = {
            id: message.audio.id,
          };
          break;
        // Agregar más tipos según necesidades
      }

      return {
        messageId: message.id,
        from: message.from,
        timestamp: message.timestamp,
        type: messageType,
        content: messageContent,
        contact: contact
          ? {
              name: contact.profile.name,
              phoneNumber: contact.wa_id,
            }
          : null,
      };
    } catch (error) {
      logger.error(`Error processing incoming WhatsApp message: ${error}`);
      return null;
    }
  }

  /**
   * Obtiene la URL del archivo multimedia enviado a través de WhatsApp
   * @param mediaId ID del archivo multimedia
   * @returns URL del archivo
   */
  async getMediaUrl(mediaId: string): Promise<string> {
    try {
      if (!this.accessToken) {
        throw new Error('Missing WhatsApp access token');
      }

      const url = `${this.apiUrl}/${this.apiVersion}/${mediaId}`;

      const headers = {
        Authorization: `Bearer ${this.accessToken}`,
      };

      const response = await axios.get(url, { headers });
      return response.data.url;
    } catch (error) {
      logger.error(`Error getting WhatsApp media URL: ${error}`);
      throw error;
    }
  }

  /**
   * Descarga un archivo multimedia usando su URL
   * @param mediaUrl URL del archivo multimedia
   * @returns Buffer con el contenido del archivo
   */
  async downloadMedia(mediaUrl: string): Promise<Buffer> {
    try {
      if (!this.accessToken) {
        throw new Error('Missing WhatsApp access token');
      }

      const headers = {
        Authorization: `Bearer ${this.accessToken}`,
      };

      const response = await axios.get(mediaUrl, {
        headers,
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data);
    } catch (error) {
      logger.error(`Error downloading WhatsApp media: ${error}`);
      throw error;
    }
  }
}

// Exportamos una instancia ya creada para usar como singleton
export const whatsAppIntegration = new WhatsAppIntegration();
