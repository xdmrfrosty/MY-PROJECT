// Switch between tabs
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    tabContents.forEach(c => c.classList.remove("active"));
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// Add new task
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
let trash = [];

taskForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text) {
    addTask(text);
    taskInput.value = "";
    saveTasks();
  }
});

function addTask(text, isCompleted = false) {
  const li = document.createElement("li");
  li.innerHTML = `
    <label>
      <input type="checkbox" ${isCompleted ? "checked" : ""}>
      <span>${text}</span>
    </label>
    <button class="delete">❌</button>
  `;

  const checkbox = li.querySelector("input[type='checkbox']");
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      completeTask(li);
      launchConfetti();
    } else {
      undoTask(li);
    }
    saveTasks();
  });

  li.querySelector(".delete").addEventListener("click", () => {
    const taskText = li.querySelector("span").textContent;

    // Add to trash (max 10)
    trash.unshift(taskText);
    if (trash.length > 10) trash.pop();
    renderTrash();

    showUndoPopup("Task deleted", () =>
      addTask(taskText, false)
    );
    li.remove();
    saveTasks();
    toggleClearButton();
  });

  if (isCompleted) {
    li.classList.add("completed");
    document.getElementById("completed-list").appendChild(li);
  } else {
    document.getElementById("task-list").appendChild(li);
  }
  toggleClearButton();
}

function completeTask(taskElement) {
  const completedList = document.getElementById("completed-list");
  taskElement.classList.add("fade-out");

  setTimeout(() => {
    taskElement.classList.remove("fade-out");
    taskElement.classList.add("completed");
    taskElement.remove();
    completedList.appendChild(taskElement);
    saveTasks();
    toggleClearButton();
  }, 500);
}

function undoTask(taskElement) {
  const taskList = document.getElementById("task-list");
  taskElement.classList.add("fade-out");

  setTimeout(() => {
    taskElement.classList.remove("fade-out");
    taskElement.classList.remove("completed");
    taskElement.remove();
    taskList.appendChild(taskElement);
    saveTasks();
    toggleClearButton();
  }, 500);
}

// ✅ Clear Completed button
const clearCompletedBtn = document.getElementById("clear-completed");
clearCompletedBtn.addEventListener("click", () => {
  const completed = [...document.querySelectorAll("#completed-list li")];
  if (completed.length > 0) {
    showUndoPopup("Cleared completed tasks", () => {
      completed.forEach(li =>
        addTask(li.querySelector("span").textContent, true)
      );
    });
    completed.forEach(li => li.remove());
    saveTasks();
    toggleClearButton();
  }
});

// ✅ Hide Clear Completed when empty
function toggleClearButton() {
  const completed = document.querySelectorAll("#completed-list li").length;
  clearCompletedBtn.style.display = completed > 0 ? "block" : "none";
}

// ✅ Save tasks
function saveTasks() {
  const tasks = [];

  document.querySelectorAll("#task-list li").forEach(li => {
    const text = li.querySelector("span").textContent;
    tasks.push({ text, completed: false });
  });

  document.querySelectorAll("#completed-list li").forEach(li => {
    const text = li.querySelector("span").textContent;
    tasks.push({ text, completed: true });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("trash", JSON.stringify(trash));
}

// ✅ Load tasks
function loadTasks() {
  const saved = localStorage.getItem("tasks");
  if (saved) {
    const tasks = JSON.parse(saved);
    tasks.forEach(t => addTask(t.text, t.completed));
  }

  const savedTrash = localStorage.getItem("trash");
  if (savedTrash) {
    trash = JSON.parse(savedTrash);
    renderTrash();
  }

  toggleClearButton();
}
loadTasks();

// 🗑️ Render Trash
function renderTrash() {
  const trashList = document.getElementById("trash-list");
  trashList.innerHTML = "";

  trash.forEach(text => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${text}</span>
      <button class="restore">🔄</button>
    `;

    li.querySelector(".restore").addEventListener("click", () => {
      addTask(text, false);
      trash = trash.filter(t => t !== text);
      renderTrash();
      saveTasks();
    });

    trashList.appendChild(li);
  });
}

// ✅ Undo popup (toast)
const undoPopup = document.getElementById("undo-popup");
const undoMessage = document.getElementById("undo-message");
const undoBtn = document.getElementById("undo-btn");
let undoAction = null;

function showUndoPopup(message, action) {
  undoMessage.textContent = message;
  undoPopup.classList.add("show");
  undoAction = action;

  setTimeout(() => {
    undoPopup.classList.remove("show");
    undoAction = null;
  }, 5000);
}

undoBtn.addEventListener("click", () => {
  if (undoAction) undoAction();
  undoPopup.classList.remove("show");
  undoAction = null;
  saveTasks();
  toggleClearButton();
});

// ✅ Theme toggle with memory
const themeToggle = document.getElementById("theme-toggle");
const themes = ["light", "dark", "sunset", "blue", "purple"];
const icons = ["☀️", "🌙", "🌅", "🌊", "💜"];
let currentTheme = 0;

const savedTheme = localStorage.getItem("theme");
if (savedTheme && themes.includes(savedTheme)) {
  currentTheme = themes.indexOf(savedTheme);
}
applyTheme();

themeToggle.addEventListener("click", () => {
  currentTheme = (currentTheme + 1) % themes.length;
  applyTheme();
});

function applyTheme() {
  document.body.classList.remove(...themes);
  document.body.classList.add(themes[currentTheme]);
  themeToggle.textContent = icons[currentTheme];
  localStorage.setItem("theme", themes[currentTheme]);
}

// Confetti
function launchConfetti() {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.6 }
  });
}
