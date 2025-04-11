# AI Agent Microservice

## Estructura del proyecto
```
/ai-agent-service
  /src
    /config
      config.ts                # Configuración global
      openai.ts               # Configuración de OpenAI
      qdrant.ts               # Configuración de Qdrant
    /controllers
      agent.controller.ts     # Controlador del agente
      webhook.controller.ts   # Controlador de webhooks
    /services
      agent.service.ts        # Servicio del agente
      openai.service.ts       # Servicio de OpenAI
      vector.service.ts       # Servicio de vectorización
    /integrations
      whatsapp.ts             # Integración con WhatsApp
      telegram.ts             # Integración con Telegram
      calendar.ts             # Integración con Google Calendar
    /middleware
      auth.middleware.ts      # Middleware de autenticación
      validation.middleware.ts # Validación de peticiones
    /models
      agent.model.ts          # Modelo de datos del agente
      message.model.ts        # Modelo de mensajes
    /utils
      logger.ts               # Utilidad de logging
      error-handler.ts        # Manejador de errores
    /routes
      agent.routes.ts         # Rutas del agente
      webhook.routes.ts       # Rutas de webhooks
    app.ts                    # Aplicación Express
    index.ts                  # Punto de entrada
  package.json
  tsconfig.json
  .env
  README.md
  docker-compose.yml
```

## Pasos para implementar

1. Iniciar proyecto con TypeScript y Express
2. Configurar OpenAI, Qdrant y demás dependencias
3. Implementar endpoints básicos del agente
4. Añadir integración con WhatsApp, Telegram y Google Calendar
5. Implementar vectorización con Qdrant
6. Añadir autenticación y protección de endpoints
7. Dockerizar para fácil despliegue