// grab stuff from the page
const calendarGrid = document.getElementById("calendar-grid");
const yearGrid = document.getElementById("year-grid");
const weekdayRow = document.getElementById("weekday-row");
const navTitle = document.getElementById("nav-title");

// start on todays month
const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();
let activeView = "month";

// helper to make numbers like 3 -> "03"
function pad(num) {
  return num.toString().padStart(2, "0");
}

// make a date string like "2026-04-07"
function makeDateString(year, month, day) {
  return year + "-" + pad(month + 1) + "-" + pad(day);
}

// check if a date is today
function isToday(year, month, day) {
  return year === today.getFullYear() &&
         month === today.getMonth() &&
         day === today.getDate();
}

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

// MONTH VIEW
function renderMonth(year, month) {
  calendarGrid.innerHTML = "";
  weekdayRow.style.display = "grid";

  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });
  navTitle.textContent = monthName + " " + year;

  const schedule = getJSON("schedule");
  const lessons = getArray("lessons");

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // blank squares before day 1
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement("div");
    blank.className = "day-cell empty";
    calendarGrid.appendChild(blank);
  }

  // actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = makeDateString(year, month, day);
    const cell = document.createElement("div");
    cell.className = "day-cell";

    if (isToday(year, month, day)) {
      cell.classList.add("today");
    }

    cell.onclick = function() {
      window.location.href = "day-view.html?date=" + dateStr;
    };

    // day number
    const numEl = document.createElement("div");
    numEl.className = "day-num";
    numEl.textContent = day;
    cell.appendChild(numEl);

    // lesson dots
    const lessonIds = (schedule[dateStr] || []).map(String);
    const showMax = 3;

    for (let i = 0; i < Math.min(lessonIds.length, showMax); i++) {
      const lesson = lessons.find(function(l) {
        return String(l.id) === lessonIds[i];
      });
      if (lesson) {
        const dot = document.createElement("div");
        dot.className = "lesson-dot";
        dot.textContent = lesson.title;
        cell.appendChild(dot);
      }
    }

    if (lessonIds.length > showMax) {
      const more = document.createElement("div");
      more.className = "lesson-dot";
      more.textContent = "+" + (lessonIds.length - showMax) + " more";
      cell.appendChild(more);
    }

    calendarGrid.appendChild(cell);
  }
}

// YEAR VIEW
function renderYear(year) {
  yearGrid.innerHTML = "";
  weekdayRow.style.display = "none";
  navTitle.textContent = year;

  const schedule = getJSON("schedule");

  for (let month = 0; month < 12; month++) {
    const box = document.createElement("div");
    box.className = "month-box";

    const monthName = new Date(year, month).toLocaleString("default", { month: "long" });
    const h3 = document.createElement("h3");
    h3.textContent = monthName;
    h3.onclick = function(e) {
      e.stopPropagation();
      currentMonth = month;
      setView("month");
    };
    box.appendChild(h3);

    const mini = document.createElement("div");
    mini.className = "mini-grid";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // blank squares
    for (let i = 0; i < firstDay; i++) {
      mini.appendChild(document.createElement("div"));
    }

    // days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = makeDateString(year, month, d);
      const dayCell = document.createElement("div");
      dayCell.textContent = d;

      if (isToday(year, month, d)) {
        dayCell.classList.add("mini-today");
      }

      if ((schedule[dateStr] || []).length > 0) {
        dayCell.classList.add("has-lessons");
      }

      dayCell.onclick = function() {
        window.location.href = "day-view.html?date=" + dateStr;
      };

      mini.appendChild(dayCell);
    }

    box.appendChild(mini);
    yearGrid.appendChild(box);
  }
}

// SWITCH BETWEEN VIEWS
function setView(view) {
  activeView = view;

  if (view === "month") {
    calendarGrid.style.display = "grid";
    yearGrid.style.display = "none";
    document.getElementById("view-month").classList.add("active");
    document.getElementById("view-year").classList.remove("active");
    renderMonth(currentYear, currentMonth);
  } else {
    calendarGrid.style.display = "none";
    yearGrid.style.display = "grid";
    document.getElementById("view-month").classList.remove("active");
    document.getElementById("view-year").classList.add("active");
    renderYear(currentYear);
  }
}

// BUTTONS
document.getElementById("view-month").onclick = function() {
  setView("month");
};

document.getElementById("view-year").onclick = function() {
  setView("year");
};

document.getElementById("prev").onclick = function() {
  if (activeView === "month") {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderMonth(currentYear, currentMonth);
  } else {
    currentYear--;
    renderYear(currentYear);
  }
};

document.getElementById("next").onclick = function() {
  if (activeView === "month") {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderMonth(currentYear, currentMonth);
  } else {
    currentYear++;
    renderYear(currentYear);
  }
};

document.getElementById("go-today").onclick = function() {
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  setView("month");
};

// load the first month
setView("month");