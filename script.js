// ---------- Constants & state ----------
const STORAGE_KEY = "todo-tasks";

// Each task: { id: number, title: string, completed: boolean }
let tasks = loadTasks();
let editingId = null; // id of the task currently being edited (if any)

// ---------- DOM references ----------
const form = document.getElementById("add-form");
const input = document.getElementById("task-input");
const errorMsg = document.getElementById("error");
const list = document.getElementById("task-list");
const emptyMsg = document.getElementById("empty");
const stats = document.getElementById("stats");

// ---------- localStorage helpers ----------
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (e) {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn("Could not save tasks:", e);
  }
}

// ---------- Task actions ----------
function addTask(title) {
  tasks.push({ id: Date.now(), title: title, completed: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) task.completed = !task.completed;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  if (editingId === id) editingId = null;
  saveTasks();
  render();
}

function saveEdit(id, newTitle) {
  const title = newTitle.trim();
  if (!title) return; // keep editing if empty
  const task = tasks.find((t) => t.id === id);
  if (task) task.title = title;
  editingId = null;
  saveTasks();
  render();
}

// ---------- Validation message ----------
function showError(show) {
  errorMsg.hidden = !show;
  input.classList.toggle("invalid", show);
}

// ---------- Rendering ----------
function createButton(label, className, ariaLabel, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn " + className;
  btn.textContent = label;
  btn.setAttribute("aria-label", ariaLabel);
  btn.addEventListener("click", onClick);
  return btn;
}

function createTaskItem(task) {
  const li = document.createElement("li");
  li.className = "task" + (task.completed ? " completed" : "");

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", "Mark \"" + task.title + "\" as completed");
  checkbox.addEventListener("change", () => toggleTask(task.id));
  li.appendChild(checkbox);

  const actions = document.createElement("div");
  actions.className = "task__actions";

  if (editingId === task.id) {
    // Edit mode: show text input + Save button
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "task__edit";
    editInput.value = task.title;
    editInput.maxLength = 120;
    editInput.setAttribute("aria-label", "Edit task title");
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveEdit(task.id, editInput.value);
      if (e.key === "Escape") { editingId = null; render(); }
    });
    li.appendChild(editInput);

    actions.appendChild(
      createButton("Save", "btn--save", "Save changes", () => saveEdit(task.id, editInput.value))
    );
    setTimeout(() => { editInput.focus(); editInput.select(); }, 0);
  } else {
    // Normal mode: show title + Edit button
    const title = document.createElement("span");
    title.className = "task__title";
    title.textContent = task.title; // textContent avoids HTML injection
    li.appendChild(title);

    actions.appendChild(
      createButton("✏️ Edit", "btn--edit", "Edit \"" + task.title + "\"", () => {
        editingId = task.id;
        render();
      })
    );
  }

  actions.appendChild(
    createButton("🗑️ Delete", "btn--delete", "Delete \"" + task.title + "\"", () => deleteTask(task.id))
  );
  li.appendChild(actions);

  return li;
}

function render() {
  list.innerHTML = "";
  tasks.forEach((task) => list.appendChild(createTaskItem(task)));

  // Empty state
  emptyMsg.hidden = tasks.length > 0;

  // Stats
  const done = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  stats.textContent = total + (total === 1 ? " task" : " tasks") + " · " + done + " completed";
}

// ---------- Events ----------
// Submitting the form handles both the Add button and the Enter key
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = input.value.trim();

  if (!title) {
    showError(true);
    input.focus();
    return;
  }

  showError(false);
  addTask(title);
  input.value = "";
  input.focus();
});

// Hide validation message as soon as the user starts typing
input.addEventListener("input", () => showError(false));

// ---------- Initial load ----------
render();
