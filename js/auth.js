// js/auth.js
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const msgEl = document.getElementById("auth-msg");

// UI elements & tabs
const paneLogin = document.getElementById("pane-login");
const paneSignup = document.getElementById("pane-signup");
const paneForgot = document.getElementById("pane-forgot");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const tabForgot = document.getElementById("tab-forgot");

// Forms
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const forgotForm = document.getElementById("forgot-form");

async function isEmailRegistered(email) {
  try {
    await signInWithEmailAndPassword(auth, email, "fake_password_123");
    return true; 
  } catch (error) {
    if (error.code === "auth/wrong-password") {
      return true;
    } else if (error.code === "auth/user-not-found") {
      return false;
    } else {
      throw error;
    }
  }
}

function showPane(name){
  if (!paneLogin || !paneSignup || !paneForgot) return;
  
  paneLogin.classList.add("hidden");
  paneSignup.classList.add("hidden");
  paneForgot.classList.add("hidden");
  tabLogin.classList.remove("active");
  tabSignup.classList.remove("active");
  tabForgot.classList.remove("active");

  if(name==="login"){ paneLogin.classList.remove("hidden"); tabLogin.classList.add("active"); }
  if(name==="signup"){ paneSignup.classList.remove("hidden"); tabSignup.classList.add("active"); }
  if(name==="forgot"){ paneForgot.classList.remove("hidden"); tabForgot.classList.add("active"); }
  msgEl.textContent = "";
  msgEl.style.color = "initial";
}

if (tabLogin) tabLogin.addEventListener("click",()=>showPane("login"));
if (tabSignup) tabSignup.addEventListener("click",()=>showPane("signup"));
if (tabForgot) tabForgot.addEventListener("click",()=>showPane("forgot"));

// Login
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    msgEl.textContent = "Logging in...";
    msgEl.style.color = "initial";
    try {
      await signInWithEmailAndPassword(auth, email, password);
      msgEl.style.color = "green";
      msgEl.textContent = "Logged in — redirecting...";
      setTimeout(() => location.href = "dashboard.html", 1000);
    } catch (err) {
      msgEl.style.color = "crimson";
      msgEl.textContent = err.message;
    }
  });
}

// Sign up
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;

    if (password !== confirmPassword) {
      msgEl.style.color = "crimson";
      msgEl.textContent = "Passwords do not match.";
      return;
    }

    msgEl.textContent = "Creating account...";
    msgEl.style.color = "initial";
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user's name to Firestore
      await setDoc(doc(db, "teachers", user.uid), {
        name: name,
        email: user.email,
        lists: {} // Initialize an empty lists object
      });

      msgEl.style.color = "green";
      msgEl.textContent = "Account created — redirecting...";
      setTimeout(() => location.href = "dashboard.html", 1000);
    } catch (err) {
      msgEl.style.color = "crimson";
      if(err.code === "auth/email-already-in-use") msgEl.textContent = "User already exists — please login.";
      else msgEl.textContent = err.message;
    }
  });
}

// Forgot password
if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgot-email").value.trim();
    if (!email) {
      msgEl.textContent = "Enter your email to reset password";
      return;
    }
    
    try {
      const emailExists = await isEmailRegistered(email);
      if (!emailExists) {
        msgEl.style.color = "crimson";
        msgEl.textContent = "This email is not registered. Please sign up.";
        return;
      }
    } catch (error) {
      msgEl.style.color = "crimson";
      msgEl.textContent = `An error occurred: ${error.message}`;
      return;
    }
    
    msgEl.textContent = "Sending reset link...";
    msgEl.style.color = "initial";
    try {
      await sendPasswordResetEmail(auth, email);
      msgEl.style.color = "green";
      msgEl.textContent = "Reset link sent to your email.";
    } catch (err) {
      msgEl.style.color = "crimson";
      msgEl.textContent = err.message;
    }
  });
}

// Exported helper functions for other pages
export async function logoutUser(){
  await signOut(auth);
  location.href = "index.html";
}

export function checkAuthRedirect(){
  onAuthStateChanged(auth, user => {
    if(!user) {
      if (!location.pathname.endsWith("index.html") && !location.pathname.endsWith("/")) {
        location.href = "index.html";
      }
    }
  });
}

onAuthStateChanged(auth, user => {
  if(user && (location.pathname.endsWith("index.html") || location.pathname.endsWith("/"))){
    location.href = "dashboard.html";
  }
});

if (document.body.classList.contains("auth-container")) {
  showPane("login");
}