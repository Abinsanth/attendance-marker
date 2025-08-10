import { auth, db } from "./firebase.js";
import { logoutUser, checkAuthRedirect } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

checkAuthRedirect();

const userEmailEl = document.getElementById("userEmail");
const listDropdown = document.getElementById("listDropdown");
const listsPreview = document.getElementById("listsPreview");
const btnAdd = document.getElementById("btn-add");
const btnLogout = document.getElementById("btn-logout");
const takeAttendanceForm = document.getElementById("select-list-form");
const dashboardHeader = document.querySelector(".topbar h1");

if (btnAdd) btnAdd.addEventListener("click", () => { location.href = "add-list.html"; });
if (btnLogout) btnLogout.addEventListener("click", logoutUser);

if (takeAttendanceForm) {
  takeAttendanceForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const sel = listDropdown.value;
    if(!sel){ alert("Please select a list"); return; }
    localStorage.setItem("attendance_selected_list", sel);
    location.href = "attendance.html";
  });
}

onAuthStateChanged(auth, async user => {
  if(!user) return;

  const docRef = doc(db, "teachers", user.uid);
  try {
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      console.log("Firestore user data:", data);

      // Display user's name from Firestore, fallback to Auth displayName, then email prefix
      const displayName = data.name || user.displayName || user.email.split('@')[0];
      if (dashboardHeader) dashboardHeader.textContent = `Welcome, ${displayName}`;
      if (userEmailEl) userEmailEl.textContent = user.email;

      const lists = data.lists || {};
      const listNames = Object.keys(lists);
      if (listDropdown) listDropdown.innerHTML = `<option value="" disabled selected>-- Select a list --</option>`;
      if (listsPreview) listsPreview.innerHTML = "";

      if (listNames.length > 0) {
        for(const name in lists){
          if (listDropdown) {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            listDropdown.appendChild(option);
          }
          if (listsPreview) {
            const d = document.createElement("div");
            d.className = "mini";
            d.innerHTML = `<b>${name}</b>: ${lists[name].join(", ")}`;
            listsPreview.appendChild(d);
          }
        }
      } else {
        if (listsPreview) listsPreview.innerHTML = "<p class='muted'>No lists yet. Create one.</p>";
      }
    } else {
      const displayName = user.displayName || user.email.split('@')[0];
      if (dashboardHeader) dashboardHeader.textContent = `Welcome, ${displayName}`;
      if (userEmailEl) userEmailEl.textContent = user.email;
      if (listsPreview) listsPreview.innerHTML = "<p class='muted'>No lists yet. Create one.</p>";
    }
  } catch (error) {
    console.error("Error fetching user data or lists: ", error);
    if (listsPreview) listsPreview.innerHTML = `<p class='muted'>Error loading data: ${error.message}</p>`;
  }
});
