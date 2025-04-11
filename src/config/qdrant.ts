import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from './config';

export const qdrantClient = new QdrantClient({
  url: config.qdrant.url,
  apiKey: config.qdrant.apiKey,
});
