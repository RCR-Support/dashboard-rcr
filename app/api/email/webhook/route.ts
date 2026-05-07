import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '../../../../lib/db';

const LOG_DIR = path.resolve(process.cwd(), 'tmp');
const LOG_FILE = path.join(LOG_DIR, 'postmark-webhooks.log');

const webhookPayloadSchema = z.object({
  RecordType: z.string().optional(),
  Type: z.string().optional(),
  MessageID: z.string().optional(),
  MessageId: z.string().optional(),
  MessageIDReceived: z.string().optional(),
  Recipient: z.string().email().optional(),
  EmailAddress: z.string().email().optional(),
  RecipientAddress: z.string().email().optional(),
}).passthrough();

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

async function verifySignature(rawBody: string, signatureHeader?: string) {
  const token = process.env.POSTMARK_WEBHOOK_TOKEN;
  if (!token) return false;
  if (!signatureHeader) return false;

  const hmac = crypto.createHmac('sha256', token).update(rawBody).digest();
  const signature = Buffer.from(signatureHeader, 'base64');
  return crypto.timingSafeEqual(hmac, signature);
}

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get('X-Postmark-Signature') || req.headers.get('postmark-signature');

  const ok = await verifySignature(raw, sig || undefined);
  if (!ok) return NextResponse.json({ error: 'invalid signature' }, { status: 401 });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const result = webhookPayloadSchema.safeParse(parsed);
  if (!result.success) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }

  const payload = result.data;

  ensureLogDir();
  const entry = { receivedAt: new Date().toISOString(), payload };
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
  } catch (_) {
    // log write failure — non-critical
  }

  // Handle bounces — solo loggear, los campos emailBounced no existen en DB
  const recordType = String(payload.RecordType || payload.Type || '');

  if (/bounce/i.test(recordType) || recordType === 'PermanentFailure') {
    // Log ya guardado arriba — bounce registrado en el archivo de log
  }

  return NextResponse.json({ ok: true });
}
