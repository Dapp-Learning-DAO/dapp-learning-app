import { SupportedChainId } from "config/chains";
import { GetContractReturnType, getContract } from "viem";

export const loadContract = (
  contractName: string,
  client: any,
  chainId: SupportedChainId,
): GetContractReturnType => {
  return getContract({
    address: require(`../contracts/${contractName}.address.js`)[chainId],
    abi: require(`../contracts/${contractName}.abi.js`),
    client,
  });
};
