import { Client } from '@google-cloud/assistant-dialogflow';

const client = new Client({
  keyFilename: 'path/to/dialogflow/key.json',
});

export default client;