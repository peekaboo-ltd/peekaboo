import crypto from 'crypto';
import { ValidationError } from './errors.helper';

export interface FlowEncryptedRequest {
  encrypted_aes_key: string;
  encrypted_flow_data: string;
  initial_vector: string;
}

export interface FlowDecryptedRequest<TData = Record<string, any>> {
  version?: string;
  action?: string;
  screen?: string;
  flow_token?: string;
  data?: TData;
}

export interface DecryptedFlowRequest<TData = Record<string, any>> {
  aesKeyBuffer: Buffer;
  initialVectorBuffer: Buffer;
  decryptedBody: FlowDecryptedRequest<TData>;
}

const getPrivateKey = (): string => {
  const privateKey = process.env.WHATSAPP_FLOW_PRIVATE_KEY;

  if (!privateKey) {
    throw new ValidationError('WhatsApp Flow private key is not configured');
  }

  return privateKey.replace(/\\n/g, '\n');
};

export const decryptFlowRequest = <TData = Record<string, any>>(
  body: FlowEncryptedRequest,
): DecryptedFlowRequest<TData> => {
  if (!body?.encrypted_aes_key || !body?.encrypted_flow_data || !body?.initial_vector) {
    throw new ValidationError('Invalid encrypted WhatsApp Flow payload');
  }

  const encryptedAesKey = Buffer.from(body.encrypted_aes_key, 'base64');
  const encryptedFlowData = Buffer.from(body.encrypted_flow_data, 'base64');
  const initialVectorBuffer = Buffer.from(body.initial_vector, 'base64');

  const aesKeyBuffer = crypto.privateDecrypt(
    {
      key: getPrivateKey(),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    encryptedAesKey,
  );

  const encryptedBody = encryptedFlowData.subarray(0, -16);
  const authTag = encryptedFlowData.subarray(-16);

  const decipher = crypto.createDecipheriv(
    'aes-128-gcm',
    aesKeyBuffer,
    initialVectorBuffer,
  );
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedBody),
    decipher.final(),
  ]).toString('utf8');

  return {
    aesKeyBuffer,
    initialVectorBuffer,
    decryptedBody: JSON.parse(decrypted),
  };
};

export const encryptFlowResponse = (
  response: Record<string, any>,
  aesKeyBuffer: Buffer,
  initialVectorBuffer: Buffer,
): string => {
  const flippedInitialVector = Buffer.from(
    initialVectorBuffer.map((byte) => byte ^ 0xff),
  );

  const cipher = crypto.createCipheriv(
    'aes-128-gcm',
    aesKeyBuffer,
    flippedInitialVector,
  );

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(response), 'utf8'),
    cipher.final(),
    cipher.getAuthTag(),
  ]);

  return encrypted.toString('base64');
};
