# AI Agent Microservice

Microservicio para desplegar agentes de IA con integraciones para WhatsApp, Telegram y Google Calendar, además de vectorización con Qdrant.

## Requisitos

- Node.js 22 o superior
- Docker y Docker Compose (para despliegue con Qdrant)
- API Key de OpenAI (opcional si usas Ollama)
- Ollama instalado localmente (opcional)

## Configuración

1. Clona el repositorio
2. Crea un archivo `.env` en la raíz con las siguientes variables:

```
PORT=3000
OPENAI_API_KEY=tu_api_key_de_openai
OPENAI_MODEL=gpt-4-turbo
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=customer_data
WHATSAPP_API_KEY=tu_api_key_de_whatsapp
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_VERIFY_TOKEN=token_de_verificacion
TELEGRAM_BOT_TOKEN=tu_token_de_telegram
GOOGLE_CLIENT_ID=tu_client_id_de_google
GOOGLE_CLIENT_SECRET=tu_client_secret_de_google
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
SERVICE_API_KEY=tu_api_key_de_servicio
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

## Instalación

```bash
# Instalar dependencias
npm install

# Compilar el proyecto
npm run build
```

## Ejecución

### Modo desarrollo

Iniciar base de datos Vectorial

```
docker run -p 6333:6333 -v qdrant-data:/qdrant/storage qdrant/qdrant
```` 

```bash
npm run dev
```

### Modo producción

```bash
npm run build
npm start
```

### Con Docker Compose

```bash
make docker-start
```

## Uso del servicio

### Endpoint principal

```
POST /api/agent/message
```

Cuerpo de la petición:
```json
{
  "userId": "identificador-del-usuario",
  "message": "Mensaje del usuario"
}
```

Headers:
```
x-api-key: tu_api_key_de_servicio
```

### Endpoint con Ollama

```
POST /api/agent/message/ollama
```

Mismo formato de petición que el endpoint principal.

### Webhooks

#### WhatsApp
```
GET /api/webhook/whatsapp  (para verificación)
POST /api/webhook/whatsapp (para recibir mensajes)
```

#### Telegram
```
POST /api/webhook/telegram
```

## Arquitectura

El servicio está diseñado para:

1. Procesar mensajes de usuarios a través de API REST o webhooks
2. Utilizar Qdrant para vectorizar y almacenar información relevante
3. Integrar herramientas externas mediante el sistema de Tools
4. Conectar con múltiples proveedores de LLMs (OpenAI y Ollama)
5. Responder a través de diferentes canales (WhatsApp, Telegram)

## Escalabilidad

El servicio puede:

- Manejar múltiples clientes en una sola instancia usando `userId`
- Desplegarse en instancias separadas para aislar recursos
- Configurarse para diferentes tipos de agentes

## Personalización

### Añadir nuevas herramientas

Extiende el array `defaultTools` en `agent.controller.ts`:

```typescript
const newTool = {
  name: 'tool_name',
  description: 'Tool description',
  parameters: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Parameter description'
      }
    },
    required: ['param1']
  },
  handler: async (args: {param1: string}) => {
    // Implementación
    return { result: 'Resultado' };
  }
};
```

### Añadir nuevas integraciones

1. Crea un nuevo archivo en `/src/integrations/`
2. Implementa los métodos necesarios para enviar/recibir mensajes
3. Actualiza la configuración en `config.ts`
4. Añade los controladores y rutas correspondientes

## Seguridad

- Todas las peticiones requieren una API Key válida
- Los webhooks utilizan tokens de verificación
- Las claves sensibles se configuran mediante variables de entorno
