// read from localStorage safely
function getArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}

function saveArray(key, arr) {
  try {
    localStorage.setItem(key, JSON.stringify(arr));
  } catch (e) {
    console.error("cant save:", e);
  }
}

// check if we're editing an existing lesson
const params = new URLSearchParams(window.location.search);
const editId = params.get("id");
let editingLesson = null;

if (editId) {
  const lessons = getArray("lessons");
  for (let i = 0; i < lessons.length; i++) {
    if (String(lessons[i].id) === String(editId)) {
      editingLesson = lessons[i];
      break;
    }
  }

  if (editingLesson) {
    document.getElementById("page-title").textContent = "Edit lesson";
    document.getElementById("page-subtitle").textContent = "Make your changes and hit save.";
    document.getElementById("toast").textContent = "Lesson updated!";

    document.getElementById("title").value = editingLesson.title || "";
    document.getElementById("subject").value = editingLesson.subject || "";
    document.getElementById("year").value = editingLesson.year || "";
    document.getElementById("duration").value = editingLesson.duration || "";
    document.getElementById("type").value = editingLesson.type || "";
    document.getElementById("description").value = editingLesson.description || "";
    document.getElementById("notes").value = editingLesson.notes || "";
  }
}

// OBJECTIVES
function addObjective(text) {
  if (!text) text = "";

  const list = document.getElementById("objectives-list");

  const row = document.createElement("div");
  row.className = "objective-row";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "e.g. Students can identify the numerator and denominator";
  input.value = text;

  const removeBtn = document.createElement("button");
  removeBtn.className = "btn-remove";
  removeBtn.textContent = "×";
  removeBtn.title = "Remove this objective";
  removeBtn.onclick = function() {
    row.remove();
  };

  row.appendChild(input);
  row.appendChild(removeBtn);
  list.appendChild(row);
}

// RESOURCES
function addResource(name, url) {
  if (!name) name = "";
  if (!url) url = "";

  const list = document.getElementById("resources-list");

  const row = document.createElement("div");
  row.className = "resource-row";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Name (e.g. Worksheet 1)";
  nameInput.value = name;

  const urlInput = document.createElement("input");
  urlInput.type = "text";
  urlInput.placeholder = "Link or location (optional)";
  urlInput.value = url;

  const removeBtn = document.createElement("button");
  removeBtn.className = "btn-remove";
  removeBtn.textContent = "×";
  removeBtn.title = "Remove this resource";
  removeBtn.onclick = function() {
    row.remove();
  };

  row.appendChild(nameInput);
  row.appendChild(urlInput);
  row.appendChild(removeBtn);
  list.appendChild(row);
}

// if editing, load in the saved stuff
if (editingLesson) {
  if (editingLesson.objectives) {
    for (let i = 0; i < editingLesson.objectives.length; i++) {
      addObjective(editingLesson.objectives[i]);
    }
  }
  if (editingLesson.resources) {
    for (let i = 0; i < editingLesson.resources.length; i++) {
      addResource(editingLesson.resources[i].name, editingLesson.resources[i].url);
    }
  }
} else {
  // start with one blank row each
  addObjective();
  addResource();
}

// VALIDATION
function validate() {
  const title = document.getElementById("title").value.trim();
  const titleError = document.getElementById("title-error");

  if (!title) {
    document.getElementById("title").classList.add("error");
    titleError.style.display = "block";
    document.getElementById("title").focus();
    return false;
  }

  document.getElementById("title").classList.remove("error");
  titleError.style.display = "none";
  return true;
}

// SAVE
function saveLesson() {
  if (!validate()) return;

  // collect objectives
  const objectiveInputs = document.querySelectorAll("#objectives-list input");
  const objectives = [];
  for (let i = 0; i < objectiveInputs.length; i++) {
    const val = objectiveInputs[i].value.trim();
    if (val) objectives.push(val);
  }

  // collect resources
  const resourceRows = document.querySelectorAll("#resources-list .resource-row");
  const resources = [];
  for (let i = 0; i < resourceRows.length; i++) {
    const inputs = resourceRows[i].querySelectorAll("input");
    const name = inputs[0].value.trim();
    const url = inputs[1].value.trim();
    if (name) {
      resources.push({ name: name, url: url });
    }
  }

  const lessonData = {
    id: editingLesson ? editingLesson.id : Date.now(),
    title: document.getElementById("title").value.trim(),
    subject: document.getElementById("subject").value.trim(),
    year: document.getElementById("year").value,
    duration: document.getElementById("duration").value,
    type: document.getElementById("type").value,
    description: document.getElementById("description").value.trim(),
    objectives: objectives,
    resources: resources,
    notes: document.getElementById("notes").value.trim(),
    createdAt: editingLesson ? editingLesson.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  let lessons = getArray("lessons");

  if (editingLesson) {
    // replace the existing lesson
    for (let i = 0; i < lessons.length; i++) {
      if (String(lessons[i].id) === String(editingLesson.id)) {
        lessons[i] = lessonData;
        break;
      }
    }
  } else {
    lessons.push(lessonData);
  }

  saveArray("lessons", lessons);
  showToast();
}

// TOAST
function showToast() {
  const toast = document.getElementById("toast");
  toast.style.display = "block";

  setTimeout(function() {
    window.location.href = "lesson-library.html";
  }, 1800);
}