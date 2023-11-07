import { config } from 'dotenv';
import { AbiCoder, ethers, keccak256, solidityPackedKeccak256 } from 'ethers';

import { getClientHolding } from './account';
import { BASE_URL, BROKER_ID } from './config';
import { addAccessKey, registerAccount } from './register';

config();

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!);
  const address = await wallet.getAddress();

  const getAccountRes = await fetch(
    `${BASE_URL}/v1/get_account?address=${address}&broker_id=${BROKER_ID}`
  );
  const getAccountJson = await getAccountRes.json();
  console.log('getAccountJson', getAccountJson);

  let accountId: string;
  if (getAccountJson.success) {
    accountId = getAccountJson.data.account_id;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accountId = await registerAccount(wallet);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const keyPair = await addAccessKey(wallet);

  await getClientHolding(accountId, keyPair);
}

export function getAccountId(userAddress, brokerId) {
  const abicoder = AbiCoder.defaultAbiCoder();
  return keccak256(
    abicoder.encode(
      ['address', 'bytes32'],
      [userAddress, solidityPackedKeccak256(['string'], [brokerId])]
    )
  );
}

main();
