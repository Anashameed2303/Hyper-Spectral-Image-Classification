/* =============================================
   HyperSpec Classifier — Authentication Logic
   js/auth.js

   Handles:
   - Tab switching (Log In / Sign Up)
   - Creating a new account (Firebase Authentication
     + saving profile info to Cloud Firestore)
   - Logging in an existing account
   - Showing the post-login dashboard
   - Logging out
   - Persisting login state across page reloads
   ============================================= */

import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ---------- Tab Switching (Log In <-> Sign Up) ---------- */
function switchTab(tab) {
  const loginTab    = document.getElementById('tab-login');
  const signupTab   = document.getElementById('tab-signup');
  const loginForm   = document.getElementById('login-form');
  const signupForm  = document.getElementById('signup-form');

  if (tab === 'login') {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
  } else {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
  }
}
// Expose to inline onclick handlers in login.html
window.switchTab = switchTab;

/* ---------- Helper: show a message under a form ---------- */
function showMessage(elementId, text, type) {
  const el = document.getElementById(elementId);
  el.textContent = text;
  el.className = 'auth-message ' + type; // 'error' | 'success' | 'loading'
}

/* ---------- SIGN UP ----------
   1. Creates the account in Firebase Authentication
      (Firebase hashes and stores the password securely —
       the raw password is never saved anywhere)
   2. Creates a matching document in the Firestore
      "users" collection containing the profile info
      (name, email, signup date)
   ---------------------------------- */
async function handleSignup(event) {
  event.preventDefault();

  const name     = document.getElementById('signup-name').value.trim();
  const email    = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const btn      = document.getElementById('signup-btn');

  btn.disabled = true;
  showMessage('signup-message', 'Creating your account...', 'loading');

  try {
    // Step 1: create the account (Firebase handles password hashing)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: store additional profile info in Firestore
    // Collection: "users", Document ID: the user's unique UID
    await setDoc(doc(db, "users", user.uid), {
      fullName:  name,
      email:     email,
      createdAt: serverTimestamp()
    });

    showMessage('signup-message', 'Account created successfully!', 'success');

    // Show the dashboard immediately
    setTimeout(() => showDashboard(user), 600);

  } catch (error) {
    btn.disabled = false;
    showMessage('signup-message', friendlyError(error), 'error');
  }
}
window.handleSignup = handleSignup;

/* ---------- LOG IN ----------
   Verifies email + password against Firebase Authentication.
   ---------------------------------- */
async function handleLogin(event) {
  event.preventDefault();

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn      = document.getElementById('login-btn');

  btn.disabled = true;
  showMessage('login-message', 'Logging in...', 'loading');

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    showMessage('login-message', 'Login successful!', 'success');
    setTimeout(() => showDashboard(userCredential.user), 400);

  } catch (error) {
    btn.disabled = false;
    showMessage('login-message', friendlyError(error), 'error');
  }
}
window.handleLogin = handleLogin;

/* ---------- LOG OUT ---------- */
async function handleLogout() {
  await signOut(auth);
  document.getElementById('dashboard').classList.remove('active');
  document.getElementById('login-form').classList.add('active');
  document.getElementById('tab-login').classList.add('active');
  document.getElementById('tab-signup').classList.remove('active');
  document.getElementById('signup-form').classList.remove('active');

  // Reset forms
  document.getElementById('login-form').reset();
  document.getElementById('signup-form').reset();
  document.getElementById('login-message').textContent = '';
  document.getElementById('signup-message').textContent = '';
}
window.handleLogout = handleLogout;

/* ---------- SHOW DASHBOARD ----------
   Reads the user's profile from Firestore and displays it.
   This is the part you can show your supervisor as proof
   that account data is being stored and retrieved.
   ---------------------------------- */
async function showDashboard(user) {
  // Hide forms, hide tabs
  document.getElementById('login-form').classList.remove('active');
  document.getElementById('signup-form').classList.remove('active');
  document.querySelector('.auth-tabs').style.display = 'none';

  // Show dashboard
  const dashboard = document.getElementById('dashboard');
  dashboard.classList.add('active');

  // Fill in basic info immediately available from Auth
  document.getElementById('dashboard-email').textContent = user.email;
  document.getElementById('dashboard-uid').textContent   = user.uid;

  // Fetch the extra profile info from Firestore
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const data = snap.data();
      document.getElementById('dashboard-welcome').textContent =
        `Welcome back, ${data.fullName || user.email}.`;

      if (data.createdAt) {
        const date = data.createdAt.toDate();
        document.getElementById('dashboard-created').textContent =
          date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    }
  } catch (err) {
    console.error("Could not fetch profile:", err);
  }
}

/* ---------- AUTO LOGIN ----------
   Firebase remembers the logged-in user across page reloads.
   If a session already exists when the page loads, skip the
   login form and go straight to the dashboard.
   ---------------------------------- */
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.querySelector('.auth-tabs').style.display = 'none';
    showDashboard(user);
  }
});

/* ---------- FRIENDLY ERROR MESSAGES ----------
   Firebase returns technical error codes like
   "auth/email-already-in-use" — translate these
   into messages a user can understand.
   ---------------------------------- */
function friendlyError(error) {
  const code = error.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return 'Something went wrong. Please try again. (' + code + ')';
  }
}
