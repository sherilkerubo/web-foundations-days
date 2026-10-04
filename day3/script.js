// Starting notes array
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// 1. searchNotes(word)
function searchNotes(word) {
  const searchTerm = word.toLowerCase();
  return notes.filter(note => note.text.toLowerCase().includes(searchTerm));
}

// 2. longestNote()
function longestNote() {
  if (notes.length === 0) return null;
  return notes.reduce((longest, current) => 
    current.text.length > longest.text.length ? current : longest
  , notes[0]);
}

// 3. countByCategory()
function countByCategory() {
  const counts = {};
  for (let note of notes) {
    counts[note.category] = (counts[note.category] || 0) + 1;
  }
  return counts;
}

// 4. getSummary()
function getSummary() {
  const counts = countByCategory();
  const totalNotes = notes.length;
  const noteWord = totalNotes === 1 ? "note" : "notes";
  
  const categoryEntries = Object.entries(counts)
    .map(([category, count]) => `${count} ${category}`)
    .join(", ");

  return `${totalNotes} ${noteWord}: ${categoryEntries}.`;
}

// 5. isDuplicate(text)
function isDuplicate(text) {
  const normalizedText = text.trim().toLowerCase();
  return notes.some(note => note.text.trim().toLowerCase() === normalizedText);
}

// 6. addNote(text, category)
function addNote(text, category) {
  const trimmedText = text.trim();
  const validCategories = ["personal", "work", "study"];

  if (trimmedText.length < 1 || trimmedText.length > 200) {
    console.log(`Failed to add note: Text length must be between 1 and 200 characters.`);
    return false;
  }

  if (!validCategories.includes(category)) {
    console.log(`Failed to add note: Invalid category "${category}". Must be personal, work, or study.`);
    return false;
  }

  if (isDuplicate(trimmedText)) {
    console.log(`Failed to add note: Duplicate note found.`);
    return false;
  }

  const newId = notes.length > 0 ? notes[notes.length - 1].id + 1 : 1;
  notes.push({ id: newId, text: trimmedText, category: category });
  console.log(`Successfully added note: "${trimmedText}"`);
  return true;
}

// --- Tests & Console Logs ---

// Test searchNotes
console.log(searchNotes("study")); 
// Expected: [ { id: 2, text: 'Finish the Day 3 assignment', category: 'study' }, { id: 4, text: 'Revise JavaScript arrays', category: 'study' } ]

console.log(searchNotes("xyz")); 
// Expected: []

// Test longestNote
console.log(longestNote()); 
// Expected: { id: 3, text: 'Email the project report to Grace', category: 'work' }

// Test countByCategory
console.log(countByCategory()); 
// Expected: { personal: 2, study: 2, work: 1 }

// Test getSummary
console.log(getSummary()); 
// Expected: "5 notes: personal 2, study 2, work 1." (order may vary based on keys)

// Test isDuplicate
console.log(isDuplicate("buy milk and bread")); 
// Expected: true

console.log(isDuplicate("Brand new unique note")); 
// Expected: false

// Test addNote
console.log(addNote("Workout at the gym", "personal")); 
// Expected: Successfully added note... followed by true

console.log(addNote("   ", "personal")); 
// Expected: Failed to add note: Text length must be between... followed by false