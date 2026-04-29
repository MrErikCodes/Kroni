import { Expo, type ExpoPushMessage } from 'expo-server-sdk';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { kidDevices, parentDevices } from '../db/schema/pairing.js';
import { getConfig } from '../config.js';
import { logger } from '../lib/logger.js';

let expoClient: Expo | undefined;

function getExpo(): Expo {
  if (expoClient) return expoClient;
  const cfg = getConfig();
  expoClient = new Expo({
    accessToken: cfg.EXPO_ACCESS_TOKEN || undefined,
    useFcmV1: true,
  });
  return expoClient;
}

export async function sendPushToKid(
  kidId: string,
  title: string,
  body: string,
  data: Record<string, unknown> = {},
): Promise<void> {
  const db = getDb();
  const devices = await db
    .select({ pushToken: kidDevices.pushToken })
    .from(kidDevices)
    .where(eq(kidDevices.kidId, kidId));
  const tokens = devices.map((d) => d.pushToken).filter((t): t is string => !!t);
  await sendPushToTokens(tokens, title, body, data);
}

export async function sendPushToParent(
  parentId: string,
  title: string,
  body: string,
  data: Record<string, unknown> = {},
): Promise<void> {
  const db = getDb();
  const devices = await db
    .select({ pushToken: parentDevices.pushToken })
    .from(parentDevices)
    .where(eq(parentDevices.parentId, parentId));
  const tokens = devices.map((d) => d.pushToken).filter((t): t is string => !!t);
  await sendPushToTokens(tokens, title, body, data);
}

export async function sendPushToTokens(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, unknown> = {},
): Promise<void> {
  if (tokens.length === 0) return;
  const expo = getExpo();
  const messages: ExpoPushMessage[] = tokens
    .filter((t) => Expo.isExpoPushToken(t))
    .map((to) => ({
      to,
      title,
      body,
      data,
      sound: 'default',
      priority: 'default',
    }));
  if (messages.length === 0) return;

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      logger.error({ err }, 'expo push chunk failed');
    }
  }
}
