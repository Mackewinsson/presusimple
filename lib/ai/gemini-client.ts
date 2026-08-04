import {
  FunctionCallingMode,
  FunctionDeclaration,
  GoogleGenerativeAI,
  Part,
} from "@google/generative-ai";
import { getGeminiApiKey, getGeminiModel } from "@/lib/ai/config";
import { AIServiceError, mapGeminiError } from "@/lib/ai/errors";

function getClient(): GoogleGenerativeAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new AIServiceError("Gemini API key is not configured", "auth");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function callGeminiTool<T>({
  systemInstruction,
  userParts,
  toolDeclaration,
}: {
  systemInstruction: string;
  userParts: Part[];
  toolDeclaration: FunctionDeclaration;
}): Promise<T> {
  try {
    const model = getClient().getGenerativeModel({
      model: getGeminiModel(),
      systemInstruction,
      tools: [{ functionDeclarations: [toolDeclaration] }],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingMode.ANY,
          allowedFunctionNames: [toolDeclaration.name],
        },
      },
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: userParts }],
    });

    const parts = result.response.candidates?.[0]?.content?.parts ?? [];
    const functionCall = parts.find((part) => part.functionCall)?.functionCall;

    if (!functionCall?.name || functionCall.args === undefined) {
      throw new AIServiceError(
        "No structured response from AI service",
        "parse"
      );
    }

    if (functionCall.name !== toolDeclaration.name) {
      throw new AIServiceError(
        `Unexpected function call: ${functionCall.name}`,
        "parse"
      );
    }

    return functionCall.args as T;
  } catch (error) {
    throw mapGeminiError(error);
  }
}
