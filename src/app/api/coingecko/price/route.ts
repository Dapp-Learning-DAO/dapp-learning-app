"use server";

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // @todo return error cause Connect Timeout Error
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?${req.nextUrl.searchParams}`,
  ).catch((err) => {
    return NextResponse.json(err, { status: 400 });
  });
  console.log(response);

  const data = await response.json();

  return NextResponse.json(data, { status: 200 });
}
