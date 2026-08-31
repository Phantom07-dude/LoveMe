"use client";

import { Analytics, type BeforeSend } from "@vercel/analytics/next";

const privatePaths = ["/invite/", "/round", "/after-dark", "/lore", "/duel"];

const sanitizeAnalyticsEvent: BeforeSend = (event) => {
  try {
    const url = new URL(event.url, "https://loveme.local");
    if (privatePaths.some((path) => url.pathname.startsWith(path))) return null;
    return { ...event, url: url.pathname || "/" };
  } catch {
    return null;
  }
};

export function PrivacyAnalytics() {
  return <Analytics mode="production" beforeSend={sanitizeAnalyticsEvent} />;
}
