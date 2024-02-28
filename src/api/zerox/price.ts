"use server";

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import qs from "qs";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAPIDomain } from "./utils";
import { ZeroXPriceResponse } from "./types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ZeroXPriceResponse | { error: string }>,
) {
  const apiDomain = getAPIDomain(req);

  if (!apiDomain) {
    return res
      .status(400)
      .json({ error: "chainId is required but was not provided." });
  }

  const query = qs.stringify(req.query);
  const response = await fetch(`${apiDomain}/swap/v1/price?${query}`, {
    headers: {
      "0x-api-key": `${process.env.ZEROX_PROTOCOL_API}`, // process.env.NEXT_PUBLIC_0X_API_KEY,
    },
  });

  const data = await response.json();

  res.status(200).json(data);
}
