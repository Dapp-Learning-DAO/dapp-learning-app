import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  return new NextResponse(JSON.stringify({ answer: "John Doe" }), {
    status: 200,
  });
}
