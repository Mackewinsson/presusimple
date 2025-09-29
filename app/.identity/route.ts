import { NextResponse } from "next/server";

/**
 * Handle .identity requests (likely from browser extensions or external services)
 * This prevents 404 errors in the logs for requests that aren't part of our app
 */
export async function GET() {
  return NextResponse.json(
    { 
      message: "Identity endpoint not available",
      error: "This endpoint is not implemented"
    },
    { status: 404 }
  );
}

export async function POST() {
  return NextResponse.json(
    { 
      message: "Identity endpoint not available", 
      error: "This endpoint is not implemented"
    },
    { status: 404 }
  );
}
