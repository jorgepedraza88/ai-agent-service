import { createApp } from './app';
import { config } from './config/config';
import { logger } from './utils/logger';

const app = createApp();
const port = config.port;

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
