function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}

function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem('currentUser');
}

function setCurrentUser(email) {
  localStorage.setItem('currentUser', email);
}

function logout() {
  localStorage.removeItem('currentUser');
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function renderHistory() {
  const users = getUsers();
  const email = getCurrentUser();
  const reflections = users[email].reflections || [];
  const tbody = document.getElementById('history-body');
  tbody.innerHTML = '';
  reflections.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.date}</td><td>${r.score}</td><td>${r.text}</td>`;
    tbody.appendChild(tr);
  });
  const ctx = document.getElementById('history-chart').getContext('2d');
  const labels = reflections.map(r => r.date);
  const data = reflections.map(r => r.score);
  if (window.historyChart) {
    window.historyChart.destroy();
  }
  window.historyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Collins Score',
        data,
        fill: false,
        borderColor: 'blue'
      }]
    },
    options: {
      scales: {
        y: {
          suggestedMin: -2,
          suggestedMax: 2
        }
      }
    }
  });
}

function showApp() {
  const email = getCurrentUser();
  if (!email) return;
  document.getElementById('welcome').textContent = `Welcome, ${email}`;
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('date').valueAsDate = new Date();
  renderHistory();
}

document.getElementById('register-btn').addEventListener('click', () => {
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const users = getUsers();
  if (users[email]) {
    alert('User already exists');
    return;
  }
  users[email] = { password, reflections: [] };
  setUsers(users);
  alert('Registered! Please login.');
});

document.getElementById('login-btn').addEventListener('click', () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const users = getUsers();
  if (!users[email] || users[email].password !== password) {
    alert('Invalid credentials');
    return;
  }
  setCurrentUser(email);
  showApp();
});

document.getElementById('save-btn').addEventListener('click', () => {
  const email = getCurrentUser();
  if (!email) return;
  const date = document.getElementById('date').value;
  const score = parseInt(document.getElementById('score').value, 10);
  const text = document.getElementById('reflection').value;
  const users = getUsers();
  const user = users[email];
  user.reflections = user.reflections || [];
  const existing = user.reflections.find(r => r.date === date);
  if (existing) {
    existing.score = score;
    existing.text = text;
  } else {
    user.reflections.push({ date, score, text });
  }
  setUsers(users);
  renderHistory();
  document.getElementById('reflection').value = '';
});

document.getElementById('view-table').addEventListener('click', () => {
  document.getElementById('table-view').classList.remove('hidden');
  document.getElementById('chart-view').classList.add('hidden');
});

document.getElementById('view-chart').addEventListener('click', () => {
  document.getElementById('chart-view').classList.remove('hidden');
  document.getElementById('table-view').classList.add('hidden');
});

document.getElementById('logout-btn').addEventListener('click', logout);

if (getCurrentUser()) {
  showApp();
}
