import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ──────────────────────────────────────────────────────────
// REPLACE THESE VALUES with the ones from YOUR Firebase project
// (Project Settings → Your apps → Web app → Config)
// ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyDb2xJjyJDQxeR0SdRx4aF8gIc8cgLhvzQ",
  authDomain:        "hyperspec-classifier.firebaseapp.com",
  projectId:         "hyperspec-classifier",
  storageBucket:     "hyperspec-classifier.firebasestorage.app",
  messagingSenderId: "843777905326",
  appId:             "1:843777905326:web:74b8f240df3a920293d33f"
};

// Initialise Firebase — these objects are imported by auth.js
export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
