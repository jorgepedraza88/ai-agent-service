import { qdrantClient } from '../config/qdrant';
import { config } from '../config/config';
import { openaiClient } from '../config/openai';
import { logger } from '../utils/logger';

class VectorService {
  private readonly collectionName: string;

  constructor() {
    this.collectionName = config.qdrant.collectionName;
    this.initializeCollection();
  }

  private async initializeCollection(): Promise<void> {
    try {
      // Verificar si la colección existe
      const collections = await qdrantClient.getCollections();

      if (!collections.collections.some(c => c.name === this.collectionName)) {
        // Crear colección si no existe
        await qdrantClient.createCollection(this.collectionName, {
          vectors: {
            size: 1536, // Dimensión para embeddings de OpenAI
            distance: 'Cosine',
          },
        });
        logger.info(`Collection ${this.collectionName} created successfully`);
      }
    } catch (error) {
      logger.error('Error initializing vector collection:', error);
    }
  }

  async addDocument(
    userId: string,
    text: string,
    metadata: Record<string, any> = {},
  ): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(text);

      await qdrantClient.upsert(this.collectionName, {
        points: [
          {
            id: `${userId}-${Date.now()}`,
            vector: embedding,
            payload: {
              text,
              userId,
              timestamp: new Date().toISOString(),
              ...metadata,
            },
          },
        ],
      });

      logger.info(`Document added to vector database for user ${userId}`);
    } catch (error) {
      logger.error('Error adding document to vector database:', error);
      throw new Error('Error al añadir documento a la base de datos vectorial');
    }
  }

  async searchSimilarDocuments(query: string, userId: string, limit: number = 3): Promise<string> {
    try {
      const embedding = await this.generateEmbedding(query);

      const searchResults = await qdrantClient.search(this.collectionName, {
        vector: embedding,
        filter: {
          must: [
            {
              key: 'userId',
              match: {
                value: userId,
              },
            },
          ],
        },
        limit,
      });

      if (searchResults.length === 0) {
        return '';
      }

      // Combinar los textos encontrados
      return searchResults.map(result => result.payload?.text).join('\n\n');
    } catch (error) {
      logger.error('Error searching similar documents:', error);
      return '';
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openaiClient.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error('Error generating embedding:', error);
      throw new Error('Error al generar embedding');
    }
  }
}

export const vectorService = new VectorService();
