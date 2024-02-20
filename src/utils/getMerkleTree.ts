import { MerkleTree } from "merkletreejs";
import { encodePacked, keccak256 } from "viem";

export function hashToken(account: `0x${string}`) {
  return Buffer.from(
    keccak256(encodePacked(["address"], [account])).slice(2),
    "hex"
  );
}

export function getMerkleTree(addressList: `0x${string}`[]) {
  return new MerkleTree(
    addressList.map((address) => hashToken(address)),
    keccak256,
    { sortPairs: true }
  );
}
