import webpush from "web-push";

webpush.setVapidDetails(
  process.env.WEBPUSH_CONTACT_EMAIL!,
  process.env.WEBPUSH_PUBLIC_KEY!,
  process.env.WEBPUSH_PRIVATE_KEY!,
);

export { webpush };
