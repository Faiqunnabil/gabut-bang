// Retrieve stored names and scores from localStorage
let names = JSON.parse(window.localStorage.getItem("userNames"));
let scores = JSON.parse(window.localStorage.getItem("scores"));

// Select DOM elements
const userList = document.querySelector(".user-list ul");
const backButton = document.querySelector(".back-button");

// Array to hold names and scores
const namesAndScores = [];

// Populate namesAndScores array with name and score pairs
for (let i = 0; i < names.length; i++) {
  namesAndScores.push([names[i], scores[i]]);
}

// Sort namesAndScores by score in descending order, and by name alphabetically if scores are equal
namesAndScores.sort((a, b) => {
  if (a[1] !== b[1]) {
    return b[1] - a[1];
  } else {
    return a[0].localeCompare(b[0]);
  }
});

// Clear existing list items
userList.innerHTML = "";

// Function to display sorted user names and scores in the user list
function showUserAndScore() {
  for (let index = 0; index < namesAndScores.length; index++) {
    userList.innerHTML += `<li>${namesAndScores[index].join(": ")}</li>`;
  }
}

// Call function to display user names and scores
showUserAndScore();

// Event listener for back button to close the window
backButton.addEventListener("click", () => window.close());
