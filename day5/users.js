const loadBtn = document.getElementById("load-users");
const filterInput = document.getElementById("filter-input");
const statusPara = document.getElementById("status");
const usersList = document.getElementById("users-list");

let storedUsers = [];

function renderUsers(list) {
  usersList.textContent = "";

  if (list.length === 0) {
    const emptyLi = document.createElement("li");
    emptyLi.textContent = "No users match your filter.";
    usersList.appendChild(emptyLi);
    return;
  }

  list.forEach(user => {
    const li = document.createElement("li");
    li.className = "user-card";

    const nameHeader = document.createElement("h3");
    nameHeader.className = "user-name";
    nameHeader.textContent = user.name;

    const emailPara = document.createElement("p");
    emailPara.className = "user-info";
    emailPara.textContent = `Email: ${user.email}`;

    const cityPara = document.createElement("p");
    cityPara.className = "user-info";
    cityPara.textContent = `City: ${user.address?.city || user.city || "N/A"}`;

    const companyPara = document.createElement("p");
    companyPara.className = "user-info";
    companyPara.textContent = `Company: ${user.company?.name || user.company || "N/A"}`;

    li.appendChild(nameHeader);
    li.appendChild(emailPara);
    li.appendChild(cityPara);
    li.appendChild(companyPara);

    usersList.appendChild(li);
  });
}

async function loadUsers() {
  statusPara.textContent = "Loading users...";
  loadBtn.disabled = true;
  filterInput.disabled = true;
  usersList.textContent = "";

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    const data = await response.json();
    storedUsers = data;

    statusPara.textContent = "Users loaded successfully!";
    filterInput.disabled = false;
    filterInput.value = "";
    renderUsers(storedUsers);
  } catch (error) {
    statusPara.textContent = `Failed to load users: ${error.message}`;
    console.error("Fetch Error:", error);
  } finally {
    loadBtn.disabled = false;
  }
}

// Filter Event Listener
filterInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filtered = storedUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm)
  );
  renderUsers(filtered);
});

// Load Button Listener
loadBtn.addEventListener("click", loadUsers);
