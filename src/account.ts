import { encodeBase58 } from 'ethers';
import nacl from 'tweetnacl';

import { BASE_URL } from './config';

export async function getClientHolding(orderlyAccountId: string, keyPair: nacl.SignKeyPair) {
  const timestamp = Date.now();
  const encoder = new TextEncoder();

  const message = `${String(timestamp)}GET/v1/client/holding`;
  const orderlySignature = nacl.sign(encoder.encode(message), keyPair.secretKey);

  const res = await fetch(`${BASE_URL}/v1/client/holding`, {
    headers: {
      'orderly-timestamp': String(timestamp),
      'orderly-account-id': orderlyAccountId,
      'orderly-key': `ed25519:${encodeBase58(keyPair.publicKey)}`,
      'orderly-signature': Buffer.from(orderlySignature).toString('base64url')
    }
  });
  const json = await res.json();
  console.log('getClientHolding:', json);
}
