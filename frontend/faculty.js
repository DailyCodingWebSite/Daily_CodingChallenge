// Manual in-browser "database"
const studentData = [
  {
    name: "Alice Johnson",
    class: "CSE-A",
    attendance: {
      "2025-W38": [1, 1, 0, 1, 1],
    },
    marks: {
      "2025-W38": 85,
    }
  },
  {
    name: "Bob Smith",
    class: "CSE-A",
    attendance: {
      "2025-W38": [1, 0, 1, 1, 1],
    },
    marks: {
      "2025-W38": 72,
    }
  },
  {
    name: "Clara Brown",
    class: "IT-B",
    attendance: {
      "2025-W38": [1, 1, 1, 1, 0],
    },
    marks: {
      "2025-W38": 91,
    }
  }
];

// Utility
function getCurrentWeek() {
  const d = new Date();
  const year = d.getFullYear();
  const week = getWeekNumber(d);
  return `${year}-W${String(week).padStart(2, '0')}`;
}
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Core Rendering
function renderDashboard() {
  const classFilter = document.getElementById("classFilter").value;
  const week = document.getElementById("weekPicker").value || getCurrentWeek();
  const today = new Date().getDay() - 1; // Monday = 0

  const tbody = document.getElementById("performanceTableBody");
  tbody.innerHTML = "";

  const filtered = studentData.filter(s =>
    (!classFilter || s.class === classFilter) && s.attendance[week]
  );

  let total = filtered.length;
  let completed = 0;
  let missed = 0;
  let totalMarks = 0;

  filtered.forEach(s => {
    const att = s.attendance[week];
    const marks = s.marks[week] || 0;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.name}</td>
      <td>${s.class}</td>
      ${att.map(d => `<td>${d ? "✔️" : "❌"}</td>`).join("")}
      <td>${marks}</td>
    `;
    tbody.appendChild(row);

    if (att[today] === 1) completed++;
    else missed++;

    totalMarks += marks;
  });

  document.getElementById("totalStudents").textContent = total;
  document.getElementById("completedToday").textContent = completed;
  document.getElementById("missedToday").textContent = missed;
  document.getElementById("averageScore").textContent =
    total ? `${Math.round(totalMarks / total)}%` : "0%";
}

function filterData() {
  renderDashboard();
}

function logout() {
  window.location.href = "index.html";
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("weekPicker").value = getCurrentWeek();
  renderDashboard();
});
