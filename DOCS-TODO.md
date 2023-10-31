# Things I found in docs that need to be improved

Link to docs: https://orderly.mintlify.app/

### no chainId

Add frequently used `chainId` to https://orderly.mintlify.app/build-on-evm/smart-contract-addresses

See https://chainlist.org/

### missing domain for EIP-712 signing

I couldn't find anywhere in the docs what I need to use for the domain for EIP-712. See:
https://gitlab.com/orderlynetwork/orderly-v2/front-end-poc/-/blob/5965c471a463ef4dbbb16292ab5d3213e6e2c9f8/src/eip712.js#L12-24

### account_id calculation missing ABI encode

The calculation for account_id is just saying the two byte arrays need to be concatenated. I tried to do this via raw `Buffer` in Nodejs, but it didn't work.
Then in the reference implementation I've seen that it's in fact ABI encoded, which is why it didn't work:
https://orderly.mintlify.app/build-on-evm/building-on-evm#account-id

```ts
export function getAccountId(userAddress, brokerId) {
  const abicoder = AbiCoder.defaultAbiCoder();
  return keccak256(
    abicoder.encode(
      ['address', 'bytes32'],
      [userAddress, solidityPackedKeccak256(['string'], [brokerId])]
    )
  );
}
```

If I remove `abicoder.encode` in this function then it returns the same result as with raw `Buffer`, so it's clearly missing in the docs.

### minor issues

- wrong description for field `message.expiration`:
  https://orderly.mintlify.app/build-on-evm/evm-api/restful-api/public/add-orderly-key

- query parameter `brokerId` written in camelCase, but sent as snake_case:
  https://orderly.mintlify.app/build-on-evm/evm-api/restful-api/public/get-account

- add access key missing field `chainId` in example:
  https://orderly.mintlify.app/build-on-evm/building-on-evm#add-access-key
