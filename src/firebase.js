import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  enableIndexedDbPersistence,
  enableMultiTabIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with long-polling for better connectivity in production
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true, // Fixes offline issues in some environments
  useFetchStreams: false,
});

// Enable offline persistence (multi-tab support)
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    // Multiple tabs open — fall back to single-tab persistence
    enableIndexedDbPersistence(db).catch((e) => {
      console.warn("⚠️ Firestore offline persistence unavailable:", e.code);
    });
  } else if (err.code === "unimplemented") {
    // Browser doesn't support persistence (e.g. Safari private mode)
    console.warn("⚠️ Firestore persistence not supported in this browser.");
  }
});

/**
 * Retry a Firestore async operation up to `maxRetries` times
 * with exponential back-off. Useful when the client briefly goes offline.
 *
 * @param {() => Promise<T>} fn  - async function to retry
 * @param {number} maxRetries    - default 3
 * @param {number} delayMs       - initial delay (doubles each attempt), default 800ms
 * @returns {Promise<T>}
 */
export async function withRetry(fn, maxRetries = 3, delayMs = 800) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isOffline =
        err.code === "unavailable" ||
        err.message?.toLowerCase().includes("offline") ||
        err.message?.toLowerCase().includes("client is offline");

      if (!isOffline || attempt === maxRetries) throw err;

      const wait = delayMs * Math.pow(2, attempt - 1); // 800 → 1600 → 3200 ms
      console.warn(
        `🔄 Firestore offline — retrying in ${wait}ms (attempt ${attempt}/${maxRetries})...`
      );
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastError;
}

/**
 * Safely fetch a Firestore document with retry and graceful null fallback.
 * Returns `null` instead of throwing when the document doesn't exist or
 * after all retries fail.
 */
export async function safeGetDoc(docRef) {
  try {
    const snap = await withRetry(() =>
      import("firebase/firestore").then(({ getDoc }) => getDoc(docRef))
    );
    return snap.exists() ? snap : null;
  } catch (err) {
    console.error("❌ safeGetDoc failed:", err.message);
    return null;
  }
}

if (import.meta.env.DEV && app && auth && db) {
  console.log("🔥 Firebase initialized successfully (with offline persistence)!");
}
