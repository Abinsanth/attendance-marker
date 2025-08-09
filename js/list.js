// js/list.js
import { auth, db } from "./firebase.js";
import { checkAuthRedirect, logoutUser } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

checkAuthRedirect();

const listNameInput = document.getElementById("listName");
const rollNumbersInput = document.getElementById("rollNumbers");
const savedListsDiv = document.getElementById("savedLists");
const btnClear = document.getElementById("btn-clear");
const btnLogout = document.getElementById("btn-logout");
const listForm = document.getElementById("list-form");

if (btnClear) btnClear.addEventListener("click", () => { listNameInput.value=""; rollNumbersInput.value=""; });
if (btnLogout) btnLogout.addEventListener("click", logoutUser);

let currentUid = null;

onAuthStateChanged(auth, async user => {
  if(!user) return;
  currentUid = user.uid;
  await refreshLists();
});

if (listForm) {
  listForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = listNameInput.value.trim();
    const rollsRaw = rollNumbersInput.value.trim();
    if(!name || !rollsRaw){ alert("Enter list name and roll numbers"); return; }
    const rolls = rollsRaw.split(",").map(s=>s.trim()).filter(Boolean);

    const docRef = doc(db, "teachers", currentUid);
    const snapshot = await getDoc(docRef);
    let lists = {};
    if(snapshot.exists()) lists = snapshot.data().lists || {};
    lists[name] = rolls;

    await setDoc(docRef, { lists }, { merge: true });
    alert("List saved successfully.");
    await refreshLists();
    listForm.reset(); // clear form after saving
  });
}

async function refreshLists(){
  if (!savedListsDiv) return;
  savedListsDiv.innerHTML = "";
  const docRef = doc(db, "teachers", currentUid);
  try {
    const snapshot = await getDoc(docRef);
    if(!snapshot.exists() || !snapshot.data().lists || Object.keys(snapshot.data().lists).length === 0){
      savedListsDiv.innerHTML = "<p class='muted'>No lists yet</p>";
      return;
    }
    const lists = snapshot.data().lists || {};
    for(const name in lists){
      const container = document.createElement("div");
      container.className = "mini";
      const rollsText = lists[name].join(", ");
      container.innerHTML = `<b>${name}</b>: ${rollsText}
        <div class="row" style="margin-top:8px">
          <button class="btn small" data-load="${name}">Load</button>
          <button class="btn outline small" data-delete="${name}">Delete</button>
        </div>`;
      savedListsDiv.appendChild(container);
    }

    // attach handlers
    savedListsDiv.querySelectorAll("[data-load]").forEach(b=>{
      b.addEventListener("click", async (e)=>{
        const nm = e.target.getAttribute("data-load");
        const docRef = doc(db, "teachers", currentUid);
        const snapshot = await getDoc(docRef);
        const lists = snapshot.data().lists || {};
        listNameInput.value = nm;
        rollNumbersInput.value = lists[nm].join(", ");
      });
    });

    savedListsDiv.querySelectorAll("[data-delete]").forEach(b=>{
      b.addEventListener("click", async (e)=>{
        const nm = e.target.getAttribute("data-delete");
        if(!confirm(`Are you sure you want to delete list "${nm}"?`)) return;
        const docRef = doc(db, "teachers", currentUid);
        const snapshot = await getDoc(docRef);
        const lists = snapshot.exists()? snapshot.data().lists || {} : {};
        delete lists[nm];
        await setDoc(docRef, { lists }, { merge: true });
        alert(`List "${nm}" deleted successfully.`);
        await refreshLists();
      });
    });
  } catch (error) {
    console.error("Error refreshing lists: ", error);
    savedListsDiv.innerHTML = `<p class='muted'>Error loading lists: ${error.message}</p>`;
  }
}