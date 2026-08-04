import { parseImageBase64 } from "@/lib/ai/parse-image";

describe("parseImageBase64", () => {
  it("parses data URLs with mime type", () => {
    const result = parseImageBase64("data:image/png;base64,abc123");

    expect(result).toEqual({
      mimeType: "image/png",
      data: "abc123",
    });
  });

  it("defaults to jpeg for raw base64", () => {
    const result = parseImageBase64("rawbase64data");

    expect(result).toEqual({
      mimeType: "image/jpeg",
      data: "rawbase64data",
    });
  });
});
