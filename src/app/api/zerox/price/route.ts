"use server";

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import qs from "qs";
import { getAPIDomain } from "../utils";
import { ZeroXPriceResponse } from "../types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  // res: NextResponse<ZeroXPriceResponse | { error: string }>,
) {
  const apiDomain = getAPIDomain(req);

  if (!apiDomain) {
    return NextResponse.json(
      {
        error: "chainId is required but was not provided.",
      },
      { status: 400 },
    );
  }

  let query: string[] = [];
  for (let [key, value] of req.nextUrl.searchParams.entries()) {
    if (key === "chainId") continue;
    if (!value) continue;
    console.log(key, value);
    query.push(`${key}=${value}`);
  }

  const response = await fetch(
    `${apiDomain}/swap/v1/price?${query.join("&")}`,
    {
      headers: {
        "0x-api-key": `${process.env.ZEROX_PROTOCOL_API}`, // process.env.NEXT_PUBLIC_0X_API_KEY,
      },
    },
  );

  const data = await response.json();

  return NextResponse.json(data, { status: 200 });
}
