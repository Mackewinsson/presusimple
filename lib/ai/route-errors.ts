import { NextResponse } from "next/server";
import { AIServiceError } from "@/lib/ai/errors";

export function aiServiceErrorResponse(error: AIServiceError): NextResponse {
  switch (error.code) {
    case "auth":
      return NextResponse.json(
        {
          error: "AI service authentication failed. Please contact support.",
        },
        { status: 500 }
      );
    case "rate_limit":
      return NextResponse.json(
        { error: "AI service is busy. Please try again in a moment." },
        { status: 429 }
      );
    case "timeout":
      return NextResponse.json(
        {
          error: "AI service is taking too long to respond. Please try again.",
        },
        { status: 408 }
      );
    case "parse":
      return NextResponse.json(
        {
          error:
            "Unable to understand your request. Please try being more specific.",
        },
        { status: 500 }
      );
    default:
      return NextResponse.json(
        {
          error: "AI service is temporarily unavailable. Please try again later.",
        },
        { status: 500 }
      );
  }
}
