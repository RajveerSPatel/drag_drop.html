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

let activeFilter = "All";

// FILTER PILLS
function renderFilterPills() {
  const lessons = getArray("lessons");
  const row = document.getElementById("filter-row");
  row.innerHTML = "";

  // get unique subjects
  const subjects = ["All"];
  for (let i = 0; i < lessons.length; i++) {
    if (lessons[i].subject && subjects.indexOf(lessons[i].subject) === -1) {
      subjects.push(lessons[i].subject);
    }
  }

  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    const pill = document.createElement("button");
    pill.className = "filter-pill";
    if (subject === activeFilter) pill.classList.add("active");
    pill.textContent = subject;
    pill.onclick = function() {
      activeFilter = subject;
      renderFilterPills();
      renderLibrary();
    };
    row.appendChild(pill);
  }
}

// LESSON LIST
function renderLibrary() {
  const lessons = getArray("lessons");
  const list = document.getElementById("lesson-list");
  const countEl = document.getElementById("lesson-count");
  list.innerHTML = "";

  const searchTerm = document.getElementById("search").value.toLowerCase().trim();

  // filter
  const filtered = [];
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];

    const matchesSubject = activeFilter === "All" || lesson.subject === activeFilter;

    const matchesSearch = !searchTerm ||
      lesson.title.toLowerCase().indexOf(searchTerm) !== -1 ||
      (lesson.description || "").toLowerCase().indexOf(searchTerm) !== -1 ||
      (lesson.subject || "").toLowerCase().indexOf(searchTerm) !== -1;

    if (matchesSubject && matchesSearch) {
      filtered.push(lesson);
    }
  }

  countEl.textContent = filtered.length + " lesson" + (filtered.length !== 1 ? "s" : "");

  if (filtered.length === 0) {
    list.innerHTML = '<p class="empty-msg">No lessons found. Try a different search or <a href="lesson-creator.html">create a new one</a>.</p>';
    return;
  }

  for (let i = 0; i < filtered.length; i++) {
    const lesson = filtered[i];

    const card = document.createElement("div");
    card.className = "lesson-card";

    const left = document.createElement("div");
    left.className = "card-left";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = lesson.title;

    const meta = document.createElement("div");
    meta.className = "card-meta";

    if (lesson.subject) {
      const tag = document.createElement("span");
      tag.className = "subject-tag";
      tag.textContent = lesson.subject;
      meta.appendChild(tag);
    }

    if (lesson.duration) {
      const dur = document.createElement("span");
      dur.textContent = "⏱ " + lesson.duration + " min";
      meta.appendChild(dur);
    }

    if (lesson.year) {
      const yr = document.createElement("span");
      yr.textContent = "Year " + lesson.year;
      meta.appendChild(yr);
    }

    left.appendChild(title);
    left.appendChild(meta);

    if (lesson.description) {
      const desc = document.createElement("div");
      desc.className = "card-description";
      desc.textContent = lesson.description;
      left.appendChild(desc);
    }

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-edit";
    editBtn.textContent = "Edit";
    editBtn.onclick = function() {
      window.location.href = "lesson-creator.html?id=" + lesson.id;
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = function() {
      deleteLesson(lesson.id);
    };

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(left);
    card.appendChild(actions);
    list.appendChild(card);
  }
}

// DELETE
function deleteLesson(id) {
  if (!confirm("Delete this lesson? This cant be undone.")) return;

  let lessons = getArray("lessons");
  lessons = lessons.filter(function(l) {
    return String(l.id) !== String(id);
  });
  saveArray("lessons", lessons);

  renderFilterPills();
  renderLibrary();
}

// load everything
renderFilterPills();
renderLibrary();