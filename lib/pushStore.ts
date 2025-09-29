export type PushSub = { endpoint: string; keys: { p256dh: string; auth: string } };
const store = new Map<string, PushSub>();
export const addSub = (s: PushSub) => store.set(s.endpoint, s);
export const removeSub = (endpoint: string) => store.delete(endpoint);
export const listSubs = () => Array.from(store.values());
