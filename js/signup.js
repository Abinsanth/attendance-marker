import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Create empty lists object for this teacher
    await setDoc(doc(db, "teachers", cred.user.uid), {
      lists: {}
    });

    alert("Account created successfully!");
    window.location.href = "dashboard.html";
  } catch (err) {
    alert(err.message);
  }
});
