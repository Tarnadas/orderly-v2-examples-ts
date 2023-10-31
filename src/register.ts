import { encodeBase58, ethers } from 'ethers';
import { sign } from 'tweetnacl';

import { BASE_URL, BROKER_ID, CHAIN_ID } from './config';
import { eip712Types } from './eip712';

const offchainDomain = {
  name: 'Orderly',
  version: '1',
  chainId: CHAIN_ID,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
};

export async function registerAccount(wallet: ethers.Wallet): Promise<string> {
  const nonceRes = await fetch(`${BASE_URL}/v1/registration_nonce`);
  const nonceJson = await nonceRes.json();
  const registrationNonce = nonceJson.data.registration_nonce as string;

  const registerMessage = {
    brokerId: BROKER_ID,
    chainId: CHAIN_ID,
    timestamp: Date.now(),
    registrationNonce
  };

  const signature = await wallet.signTypedData(
    offchainDomain,
    {
      Registration: eip712Types.Registration
    },
    registerMessage
  );

  const registerRes = await fetch(`${BASE_URL}/v1/register_account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: registerMessage,
      signature,
      userAddress: await wallet.getAddress()
    })
  });
  const registerJson = await registerRes.json();
  if (!registerJson.success) {
    throw new Error(registerJson.message);
  }
  return registerJson.data.account_id;
}

export async function addAccessKey(wallet: ethers.Wallet): Promise<string> {
  const keyPair = sign.keyPair();
  const orderlyKey = `ed25519:${encodeBase58(keyPair.publicKey)}`;
  const timestamp = Date.now();
  const addKeyMessage = {
    brokerId: BROKER_ID,
    chainId: CHAIN_ID,
    orderlyKey,
    scope: 'trading',
    timestamp,
    expiration: timestamp + 1_000 * 60 * 60 * 24 * 365 // 1 year
  };
  const signature = await wallet.signTypedData(
    offchainDomain,
    {
      AddOrderlyKey: eip712Types.AddOrderlyKey
    },
    addKeyMessage
  );

  const keyRes = await fetch(`${BASE_URL}/v1/orderly_key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: addKeyMessage,
      signature,
      userAddress: await wallet.getAddress()
    })
  });
  const keyJson = await keyRes.json();
  if (!keyJson.success) {
    throw new Error(keyJson.message);
  }
  return keyJson.data.orderly_key;
}
