/* =============================================
   HyperSpec Classifier — Firebase Configuration
   js/firebase-config.js

   ============================================================
   READ THIS BEFORE RUNNING THE LOGIN PAGE
   ============================================================

   This file connects the website to YOUR Firebase project.
   Right now it contains PLACEHOLDER values that will not work.

   To make login work, follow these steps:

   1. Go to https://console.firebase.google.com
   2. Click "Add Project" → name it (e.g. "hyperspec-classifier") → Create
   3. In the left sidebar, click "Build" → "Authentication"
      → Click "Get Started" → Enable "Email/Password" sign-in method
   4. In the left sidebar, click "Build" → "Firestore Database"
      → Click "Create Database" → Start in "test mode" → choose a location
   5. Go to Project Settings (gear icon, top left) → scroll to "Your apps"
      → Click the </> (Web) icon → register an app (any nickname)
      → Firebase will show you a "firebaseConfig" object with your keys
   6. Copy those values and paste them below, replacing the placeholders.

   That's it — no server, no installation needed. The website talks
   directly to Firebase's servers using the SDK imported below.
   ============================================================ */

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
