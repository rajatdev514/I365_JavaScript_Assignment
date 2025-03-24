class Task {
  constructor(yourName, reportingManager, name, description, dueDate) {
    this.id = Date.now();
    this.yourName = yourName;
    this.reportingManager = reportingManager;
    this.name = name;
    this.description = description;
    this.dueDate = dueDate;
    this.status = "pending";
    this.createdAt = new Date().toISOString();
  }
}

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let isEditing = false;
let currentEditId = null;

// DOM Elements
const taskFormBtn = document.getElementById("add-task-btn");
const yourNameInput = document.getElementById("your-name");
const reportingManagerInput = document.getElementById("reporting-manager");
const taskNameInput = document.getElementById("task-name");
const taskDescriptionInput = document.getElementById("task-description");
const taskDueDateInput = document.getElementById("task-due-date");
const taskList = document.getElementById("task-list");
const searchInput = document.getElementById("search-task");
const filterStatus = document.getElementById("filter-status");
const totalCountEl = document.getElementById("total-count");
const pendingCountEl = document.getElementById("pending-count");
const completedCountEl = document.getElementById("completed-count");

// Initialize the app
function init() {
  renderTasks();
  updateStats();
  setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
  taskFormBtn.addEventListener("click", handleTaskSubmit);
  searchInput.addEventListener("input", filterTasks);
  filterStatus.addEventListener("change", filterTasks);
}

// Handle task submission (add/edit)
function handleTaskSubmit() {
  const yourName = yourNameInput.value.trim();
  const reportingManager = reportingManagerInput.value.trim();
  const name = taskNameInput.value.trim();
  const description = taskDescriptionInput.value.trim();
  const dueDate = taskDueDateInput.value;

  if (!yourName || !reportingManager || !name) {
    showAlert("Please fill in all required fields!", "error");
    return;
  }

  if (isEditing) {
    updateTask(currentEditId, {
      yourName,
      reportingManager,
      name,
      description,
      dueDate,
    });
  } else {
    addTask(new Task(yourName, reportingManager, name, description, dueDate));
  }
}

// Add a new task
function addTask(task) {
  tasks.push(task);
  saveTasks();
  renderTasks();
  resetForm();
  showAlert("Task added successfully!", "success");
}

// Edit an existing task
function editTask(id) {
  const task = tasks.find((task) => task.id === id);
  if (task) {
    isEditing = true;
    currentEditId = id;
    yourNameInput.value = task.yourName;
    reportingManagerInput.value = task.reportingManager;
    taskNameInput.value = task.name;
    taskDescriptionInput.value = task.description;
    taskDueDateInput.value = task.dueDate;
    taskFormBtn.innerHTML = '<i class="fas fa-save"></i> Update Task';
    taskFormBtn.scrollIntoView({ behavior: "smooth" });
  }
}

// Update a task
function updateTask(id, updatedData) {
  const task = tasks.find((task) => task.id === id);
  if (task) {
    Object.assign(task, updatedData);
    saveTasks();
    renderTasks();
    resetForm();
    showAlert("Task updated successfully!", "success");
  }
}

// Delete a task
function deleteTask(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
    showAlert("Task deleted successfully!", "success");
  }
}

// Toggle task status
function toggleStatus(id) {
  const task = tasks.find((task) => task.id === id);
  if (task) {
    task.status = task.status === "pending" ? "completed" : "pending";
    saveTasks();
    renderTasks();
    updateStats();
    showAlert(`Task marked as ${task.status}!`, "info");
  }
}

// Filter tasks based on search and status
function filterTasks() {
  const searchTerm = searchInput.value.toLowerCase();
  const status = filterStatus.value;

  let filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm) ||
      task.yourName.toLowerCase().includes(searchTerm) ||
      task.reportingManager.toLowerCase().includes(searchTerm);
    const matchesStatus = status === "all" || task.status === status;
    return matchesSearch && matchesStatus;
  });

  renderTasks(filteredTasks);
}

// Render tasks to the DOM
function renderTasks(tasksToRender = tasks) {
  if (tasksToRender.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <i class="far fa-clipboard"></i>
        <h3>No tasks found</h3>
        <p>${
          tasks.length === 0
            ? "Add your first task using the form!"
            : "Try changing your search or filter"
        }</p>
      </div>
    `;
    return;
  }

  taskList.innerHTML = tasksToRender
    .map(
      (task) => `
    <li class="${task.status}">
      <div class="task-header">
        <h3>${task.name}</h3>
        <span class="task-status ${task.status}">
          ${task.status === "pending" ? "⏳ Pending" : "✅ Completed"}
        </span>
      </div>
      <p>${task.description || "No description provided"}</p>
      <div class="task-meta">
        <span><i class="fas fa-user"></i> ${task.yourName}</span>
        <span><i class="fas fa-user-tie"></i> ${task.reportingManager}</span>
        <span><i class="far fa-calendar-alt"></i> ${
          task.dueDate || "No due date"
        }</span>
        <span><i class="far fa-clock"></i> ${new Date(
          task.createdAt
        ).toLocaleDateString()}</span>
      </div>
      <div class="task-actions">
        <button class="edit" onclick="editTask(${task.id})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="delete" onclick="deleteTask(${task.id})">
          <i class="fas fa-trash-alt"></i> Delete
        </button>
        <button class="toggle-status" onclick="toggleStatus(${task.id})">
          ${
            task.status === "pending"
              ? '<i class="fas fa-check"></i> Complete'
              : '<i class="fas fa-undo"></i> Reopen'
          }
        </button>
      </div>
    </li>
  `
    )
    .join("");
}

// Update statistics
function updateStats() {
  totalCountEl.textContent = tasks.length;
  pendingCountEl.textContent = tasks.filter(
    (task) => task.status === "pending"
  ).length;
  completedCountEl.textContent = tasks.filter(
    (task) => task.status === "completed"
  ).length;
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateStats();
}

// Reset the form
function resetForm() {
  yourNameInput.value = "";
  reportingManagerInput.value = "";
  taskNameInput.value = "";
  taskDescriptionInput.value = "";
  taskDueDateInput.value = "";
  isEditing = false;
  currentEditId = null;
  taskFormBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add Task';
}

// Show alert message
function showAlert(message, type) {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">&times;</button>
  `;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

// Initialize the application
init();
