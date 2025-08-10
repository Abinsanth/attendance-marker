// js/attendance.js
import { auth, db } from "./firebase.js";
import { checkAuthRedirect, logoutUser } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

checkAuthRedirect();

const rollButtonGroup = document.getElementById("roll-button-group");
const btnDone = document.getElementById("btn-done");
const resultSection = document.getElementById("resultSection");
const presentListEl = document.getElementById("presentList");
const absentListEl = document.getElementById("absentList");
const copyAllBtn = document.getElementById("copyAll");
const currentDateEl = document.getElementById("currentDate");
const listNameTitle = document.getElementById("listNameTitle");
const btnLogout = document.getElementById("btn-logout");
const attendanceActions = document.getElementById("attendance-actions");

if (btnDone) btnDone.addEventListener("click", finish);
if (copyAllBtn) copyAllBtn.addEventListener("click", copyAllText);
if (btnLogout) btnLogout.addEventListener("click", logoutUser);

let rolls = [];
let markedStatus = {}; // Object to store the status of each roll: 'present', 'absent', or null
let listName = localStorage.getItem("attendance_selected_list");

async function loadListFromFirestore(uid) {
  if (!listName) {
    alert("No list selected. Returning to dashboard.");
    location.href = "dashboard.html";
    return;
  }
  
  const docRef = doc(db, "teachers", uid);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      alert("No lists found for this user. Go to Add List to create one.");
      location.href = "add-list.html";
      return;
    }
    const lists = snap.data().lists || {};
    rolls = lists[listName] || [];
    if (listNameTitle) listNameTitle.textContent = listName;
    if (!rolls.length) {
      alert("Selected list is empty. Add roll numbers or choose another list.");
      location.href = "dashboard.html";
      return;
    }
    
    rolls.forEach(roll => {
      markedStatus[roll] = null;
    });
    
    createRollButtons();
  } catch (error) {
    console.error("Error loading list: ", error);
    alert(`Error loading list: ${error.message}. Returning to dashboard.`);
    location.href = "dashboard.html";
  }
}

onAuthStateChanged(auth, user => {
  if (!user) return;
  loadListFromFirestore(user.uid);
});

function createRollButtons() {
  if (!rollButtonGroup) return;
  rollButtonGroup.innerHTML = '';
  rolls.forEach(roll => {
    const button = document.createElement("button");
    button.className = "roll-btn";
    button.textContent = roll;
    button.dataset.roll = roll;
    
    // Set initial class if already marked
    if (markedStatus[roll] === 'present') {
      button.classList.add('present-marked');
    } else if (markedStatus[roll] === 'absent') {
      button.classList.add('absent-marked');
    }

    button.addEventListener("click", toggleRollStatus);
    rollButtonGroup.appendChild(button);
  });
  
  // Show the button group after all buttons are added
  rollButtonGroup.classList.remove('hidden');
}

function toggleRollStatus(event) {
  const button = event.target;
  const roll = button.dataset.roll;

  if (button.classList.contains('present-marked')) {
    // If already present, change to absent
    markedStatus[roll] = 'absent';
    button.classList.remove('present-marked');
    button.classList.add('absent-marked');
  } else if (button.classList.contains('absent-marked')) {
    // If already absent, clear the status
    markedStatus[roll] = null;
    button.classList.remove('absent-marked');
  } else {
    // If unmarked, set to present
    markedStatus[roll] = 'present';
    button.classList.add('present-marked');
  }
}

function finish() {
  if (rollButtonGroup) rollButtonGroup.classList.add('hidden');
  if (attendanceActions) attendanceActions.classList.add("hidden");
  if (resultSection) resultSection.classList.remove("hidden");

  let present = [];
  let absent = [];
  rolls.forEach(roll => {
    if (markedStatus[roll] === 'present') {
      present.push(roll);
    } else {
      absent.push(roll);
    }
  });
  
  if (presentListEl) presentListEl.textContent = present.join(", ");
  if (absentListEl) absentListEl.textContent = absent.join(", ");
  if (currentDateEl) currentDateEl.textContent = new Date().toLocaleDateString();
}

function copyAllText() {
  const date = currentDateEl.textContent;
  const presentText = presentListEl.textContent;
  const absentText = absentListEl.textContent;
  const listNameText = listNameTitle.textContent;

  const textToCopy = `Batch: ${listNameText}\nDate: ${date}\n\nPresent:\n${presentText}\n\nAbsent:\n${absentText}`;

  navigator.clipboard.writeText(textToCopy).then(() => {
    alert("Copied all attendance data to clipboard!");
  }).catch(err => {
    console.error("Failed to copy text: ", err);
    alert("Failed to copy attendance data.");
  });
}