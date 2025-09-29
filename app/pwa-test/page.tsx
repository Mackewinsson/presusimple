"use client";
import { useState } from "react";
import { subscribeUser } from "@/lib/pushClient";

export default function Page() {
  const [sub, setSub] = useState<PushSubscription | null>(null);

  return (
    <main style={{ padding: 24 }}>
      <h1>PWA Push Test</h1>
      <button onClick={async () => setSub(await subscribeUser())}>
        {sub ? "Subscribed ✅" : "Enable Notifications"}
      </button>
      <button
        style={{ marginLeft: 12 }}
        onClick={async () => {
          await fetch("/api/pwa/push", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ title: "Simple Budget", body: "Test push", url: "/" }),
          });
          alert("Sent!");
        }}
      >
        Send test push
      </button>
    </main>
  );
}