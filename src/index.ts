import { config } from 'dotenv';
import { AbiCoder, ethers, keccak256, solidityPackedKeccak256 } from 'ethers';

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
  const orderlyKey = await addAccessKey(wallet);
  console.log('orderlyKey', orderlyKey);
}

// TODO doesn't return same value as `/v1/get_account`
// export async function calculateOrderlyAccountId(wallet: ethers.Wallet) {
//   const address = await wallet.getAddress();
//   const addressBytes = Buffer.from(address.substring(2), 'hex');

//   const encoder = new TextEncoder();
//   const brokerIdHash = keccak256(encoder.encode(BROKER_ID));
//   const brokerIdBytes = Buffer.from(brokerIdHash.substring(2), 'hex');

//   return keccak256(Buffer.concat([addressBytes, brokerIdBytes]));
// }

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
