// get the date from the URL
const params = new URLSearchParams(window.location.search);
const selectedDate = params.get("date");

// if theres no date redirect back to calendar
if (!selectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
  document.body.innerHTML = "<p>No date selected, redirecting...</p>";
  setTimeout(function() {
    window.location.href = "calendar.html";
  }, 1500);
  throw new Error("no date");
}

// show the date nicely
const parts = selectedDate.split("-");
const year = parseInt(parts[0]);
const month = parseInt(parts[1]) - 1;
const day = parseInt(parts[2]);
const dateObj = new Date(year, month, day);
document.getElementById("date-title").textContent = dateObj.toLocaleDateString("default", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

// read from localStorage safely
function getJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch (e) {
    return {};
  }
}

function getArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("cant save:", e);
  }
}

const lessons = getArray("lessons");
const schedule = getJSON("schedule");

let todaysLessons = (schedule[selectedDate] || []).map(String);

// SHOW LESSONS FOR THIS DAY
function showDayLessons() {
  const container = document.getElementById("day-lessons");
  container.innerHTML = "";

  if (todaysLessons.length === 0) {
    container.innerHTML = '<p class="empty-msg">Nothing scheduled yet — add a lesson below!</p>';
    return;
  }

  for (let i = 0; i < todaysLessons.length; i++) {
    const lessonId = todaysLessons[i];
    const lesson = lessons.find(function(l) {
      return String(l.id) === lessonId;
    });

    if (!lesson) continue;

    const item = document.createElement("div");
    item.className = "lesson-item";

    const title = document.createElement("span");
    title.textContent = lesson.title;

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove";
    removeBtn.textContent = "×";
    removeBtn.title = "Remove from this day";
    removeBtn.onclick = function() {
      removeLesson(lessonId);
    };

    item.appendChild(title);
    item.appendChild(removeBtn);
    container.appendChild(item);
  }
}

// ADD / REMOVE LESSONS
function addLesson(id) {
  if (todaysLessons.indexOf(id) !== -1) return;
  todaysLessons.push(id);
  save();
  showDayLessons();
  showLessonPicker();
}

function removeLesson(id) {
  todaysLessons = todaysLessons.filter(function(x) {
    return x !== id;
  });
  save();
  showDayLessons();
  showLessonPicker();
}

function save() {
  schedule[selectedDate] = todaysLessons;
  saveJSON("schedule", schedule);
}

// LESSON PICKER
function showLessonPicker() {
  const picker = document.getElementById("lesson-picker");
  picker.innerHTML = "";

  if (lessons.length === 0) {
    picker.innerHTML = '<p class="empty-msg">No lessons in your library yet. <a href="lesson-library.html">Create some first!</a></p>';
    return;
  }

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const alreadyAdded = todaysLessons.indexOf(String(lesson.id)) !== -1;

    const btn = document.createElement("button");
    btn.className = "picker-btn";
    if (alreadyAdded) btn.classList.add("added");
    btn.disabled = alreadyAdded;

    const titleSpan = document.createElement("span");
    titleSpan.textContent = lesson.title;

    const tag = document.createElement("span");
    tag.className = "picker-tag";
    tag.textContent = alreadyAdded ? "Added ✓" : "Add";

    btn.appendChild(titleSpan);
    btn.appendChild(tag);

    if (!alreadyAdded) {
      btn.onclick = function() {
        addLesson(String(lesson.id));
      };
    }

    picker.appendChild(btn);
  }
}

// load everything
showDayLessons();
showLessonPicker();