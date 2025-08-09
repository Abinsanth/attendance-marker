// js/firebase.js
// This file initializes and exports the Firebase Auth and Firestore services.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD2I1aoEhRrm54qcMU77-fRle7xdNQC6-Q",
  authDomain: "attendance-app-c08a0.firebaseapp.com",
  projectId: "attendance-app-c08a0",
  storageBucket: "attendance-app-c08a0.appspot.com",
  messagingSenderId: "183057794798",
  appId: "1:183057794798:web:72e838590acd127d0015ff"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);