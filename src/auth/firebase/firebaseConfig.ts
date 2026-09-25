import type { FirebaseOptions } from "firebase/app";

/**
 * Firebase web-app configuration from VITE_FIREBASE_* variables. These are public client values
 * (not secrets) but are environment-specific, so they come from .env files, never from source.
 * No Google client secret belongs in the frontend.
 */
const REQUIRED_KEYS = {
  apiKey: "VITE_FIREBASE_API_KEY",
  authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "VITE_FIREBASE_PROJECT_ID",
  appId: "VITE_FIREBASE_APP_ID",
  messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
} as const;

export type FirebaseConfigResult =
  | { ok: true; options: FirebaseOptions }
  | { ok: false; missing: string[] };

export function readFirebaseConfig(source: Record<string, string | undefined> = import.meta.env): FirebaseConfigResult {
  const options: Record<string, string> = {};
  const missing: string[] = [];
  for (const [key, envName] of Object.entries(REQUIRED_KEYS)) {
    const value = source[envName]?.trim();
    if (value) options[key] = value;
    else missing.push(envName);
  }
  return missing.length ? { ok: false, missing } : { ok: true, options: options as FirebaseOptions };
}
