import * as line from '@line/bot-sdk';
import dotenv from 'dotenv';

dotenv.config();

// LINE SDK CONFIG
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

// Export LINE client
export const client = new line.Client(config);

// Export config if needed
export { config };
