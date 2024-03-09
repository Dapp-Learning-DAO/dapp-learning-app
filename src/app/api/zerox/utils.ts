import { NextRequest } from "next/server";

const API_DOMAIN_BY_CHAINID: { [chainId: number]: string } = {
  1: "https://api.0x.org", // Ethereum (Mainnet)
  10: "https://optimism.api.0x.org", // Optimism
  42161: "https://arbitrum.api.0x.org", // Arbitrum One
  11155111: "https://sepolia.api.0x.org", // Ethereum (Sepolia)
};

export function getAPIDomain(req: NextRequest): string {
  const searchParams = req.nextUrl.searchParams;
  let chainId = searchParams.get("chainId");
  if (!chainId) return "";
  if (!API_DOMAIN_BY_CHAINID[Number(chainId)]) return "";
  return API_DOMAIN_BY_CHAINID[Number(chainId)];
}
