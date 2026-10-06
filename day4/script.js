const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

function updateCounts() {
  const text = noteText.value;
  const length = text.length;

  // Word count logic: split by whitespace and filter out empty strings
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  // Update text values
  charCount.textContent = `${length} / 200 characters`;
  wordCount.textContent = `${words} word${words === 1 ? "" : "s"}`;

  // Reset classes
  charCount.classList.remove("warning", "over");

  // Apply limit states
  if (length > 200) {
    charCount.classList.add("over");
  } else if (length > 180) {
    charCount.classList.add("warning");
  }
}

function handleInput() {
  updateCounts();
  localStorage.setItem("quicknotes_draft", noteText.value);
}

function clearNote() {
  noteText.value = "";
  localStorage.removeItem("quicknotes_draft");
  updateCounts();
  noteText.focus();
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  localStorage.setItem("quicknotes_theme", isDark ? "dark" : "light");
}

// Event Listeners
noteText.addEventListener("input", handleInput);

clearBtn.addEventListener("click", clearNote);

noteText.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    clearNote();
  }
});

themeToggle.addEventListener("click", toggleTheme);

// Initialization / Restoration on Load
function init() {
  // Restore draft
  const savedDraft = localStorage.getItem("quicknotes_draft");
  if (savedDraft !== null) {
    noteText.value = savedDraft;
  }

  // Restore theme
  const savedTheme = localStorage.getItem("quicknotes_theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light mode";
  } else {
    themeToggle.textContent = "Dark mode";
  }

  updateCounts();
}

init();