import { NextResponse } from "next/server";

/**
 * Handle /current-url requests (likely from browser extensions or external services)
 * This prevents 404 errors in the logs for requests that aren't part of our app
 */
export async function POST() {
  return NextResponse.json(
    { 
      message: "Current URL endpoint not available",
      error: "This endpoint is not implemented"
    },
    { status: 404 }
  );
}

export async function GET() {
  return NextResponse.json(
    { 
      message: "Current URL endpoint not available",
      error: "This endpoint is not implemented"
    },
    { status: 404 }
  );
}
