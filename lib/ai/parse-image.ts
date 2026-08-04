const DATA_URL_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

export function parseImageBase64(imageBase64: string): {
  mimeType: string;
  data: string;
} {
  const match = imageBase64.match(DATA_URL_PATTERN);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }

  return {
    mimeType: "image/jpeg",
    data: imageBase64.replace(/^data:[^;]+;base64,/, ""),
  };
}
