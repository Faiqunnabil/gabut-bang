// Select DOM elements
const container = document.querySelector(".container");
const nameField = document.querySelector(".name-field");
const loginButton = document.querySelector(".login-button");

// Event listener for login button click
loginButton.addEventListener("click", () => {
  const userName = nameField.value.trim();
  if (userName !== "") {
    getName(userName);
  }
});

// Event listener for Enter key press in name field
nameField.addEventListener("keydown", (event) => {
  const userName = nameField.value.trim();
  if (event.key === "Enter" && userName !== "") getName(userName);
});

// Function to handle user name input
function getName(username) {
  updateUI(username);
}

// Function to update the UI with the quiz interface
function updateUI(name) {
  let names = JSON.parse(localStorage.getItem("userNames")) || [];
  let scores = JSON.parse(localStorage.getItem("scores")) || [];

  // Check if user name already exists
  const nameIndex = names.indexOf(name);
  if (nameIndex === -1) {
    names.push(name);
    scores.push(0);
    localStorage.setItem("userNames", JSON.stringify(names));
    localStorage.setItem("scores", JSON.stringify(scores));
  }

  container.innerHTML = showQuizUI(name);
  showQuizApp();
}

// Function to return the HTML for the quiz interface
function showQuizUI(name) {
  return `<header>
            <p class="name">${name}</p>
            <p class="timer-container hidden">
            Time left: <span class="timer"></span>
            </p>
        </header>

        <div class="main">
            <h1 class="header-text">Quiz Challenge</h1>
            <p class="par">
                Answer the following questions within the time limit.
                <br />Correct +10, Wrong -5, Empty +0
            </p>
            <a href="leaderboard/leaderboard.html" target="_blank"><button class="leaderboard-button">View Leaderboard</button></a
            >
            <button class="start-button">Start Quiz</button>
        </div>`;
}

// Function to handle quiz logic
function showQuizApp() {
  const timerContainer = document.querySelector(".timer-container");
  const timer = document.querySelector(".timer");
  const main = document.querySelector(".main");
  const startButton = document.querySelector(".start-button");

  let number = 0;
  let score = 0;
  let countdownInterval;

  // Fetch total number of questions
  async function getTotalQuestions() {
    const response = await fetch("data/question.json");
    const data = await response.json();
    return data.length;
  }

  startButton.addEventListener("click", startQuiz);

  // Function to start the quiz
  async function startQuiz() {
    timerContainer.classList.remove("hidden");
    number = 0;
    score = 0;
    const question = await getQuestion(number);
    updateMainUI(question);
    startTimer(10);
    number++;
  }

  // Fetch question by number
  async function getQuestion(number) {
    const response = await fetch("data/question.json");
    const data = await response.json();
    return data[number];
  }

  // Update the main UI with the current question
  async function updateMainUI(question) {
    main.innerHTML = showQuestion(question);

    const options = document.querySelectorAll("input[name = option]");

    // Function to check if any option is selected
    function isOptionChecked() {
      return [...options].some((option) => option.checked);
    }

    // Update button states based on option selection
    function updateButtonStates() {
      nextButton.disabled = !isOptionChecked();
      submitButton.disabled = !isOptionChecked();
    }

    options.forEach((option) =>
      option.addEventListener("change", updateButtonStates)
    );

    const nextButton = document.querySelector(".next-button");
    nextButton.disabled = true;

    nextButton.addEventListener("click", async () => {
      getScore(await getQuestion(number - 1));
      const question = await getQuestion(number);
      updateMainUI(question);
      startTimer(10);
      number++;
    });

    const submitButton = document.createElement("button");
    submitButton.classList.add("submit-button");
    submitButton.textContent = "Submit";
    submitButton.disabled = true;

    submitButton.addEventListener("click", async () => {
      getScore(await getQuestion(number - 1));
      showSubmitButton();
    });

    const totalQuestions = await getTotalQuestions();
    if (number === totalQuestions) {
      nextButton.replaceWith(submitButton);
    }
  }

  // Function to show the submit button and handle the end of the quiz
  async function showSubmitButton() {
    const response = await fetch("data/question.json");
    const data = await response.json();
    updateResultUI(data);

    let names = JSON.parse(localStorage.getItem("userNames")) || [];
    let scores = JSON.parse(localStorage.getItem("scores")) || [];
    const name = names[names.length - 1];

    const nameIndex = names.indexOf(name);

    if (nameIndex !== -1) {
      scores[nameIndex] = score;
      localStorage.setItem("scores", JSON.stringify(scores));
    }
  }

  // Calculate the score based on selected option
  function getScore(question) {
    const option = document.querySelector("input[name = option]:checked");
    if (option) {
      option.value === question.key ? (score += 10) : (score -= 5);
    }
  }

  // Update the result UI after quiz ends
  function updateResultUI(data) {
    main.innerHTML = showResult(data);
    timerContainer.classList.add("hidden");
    clearInterval(countdownInterval);

    const restartButton = document.querySelector(".restart-button");
    const logoutButton = document.querySelector(".logout-button");
    restartButton.addEventListener("click", resetUI);
    logoutButton.addEventListener("click", logout);
  }

  // Start the timer for each question
  function startTimer(seconds) {
    timer.textContent = seconds;
    clearInterval(countdownInterval);
    countdownInterval = setInterval(async () => {
      seconds--;
      timer.textContent = seconds;
      if (seconds === 0) {
        clearInterval(countdownInterval);
        getScore(await getQuestion(number - 1));

        const totalQuestions = await getTotalQuestions();
        if (number < totalQuestions) {
          const question = await getQuestion(number);
          updateMainUI(question);
          startTimer(10);
          number++;
        } else {
          showSubmitButton();
        }
      }
    }, 1000);
  }

  // Return the HTML for a question
  function showQuestion(question) {
    return `<div class="question-container">
            <div class="question">${question.question}</div>
            <div class="answers">
              <ul>
                <li>
                  <label class="option">
                    <input type="radio" name="option" value="${question.answer[0]}" />
                    ${question.answer[0]}
                  </label>
                </li>
                <li>
                  <label class="option">
                    <input type="radio" name="option" value="${question.answer[1]}" />
                    ${question.answer[1]}
                  </label>
                </li>
                <li>
                  <label class="option">
                    <input type="radio" name="option" value="${question.answer[2]}" />
                    ${question.answer[2]}
                  </label>
                </li>
                <li>
                  <label class="option">
                    <input type="radio" name="option" value="${question.answer[3]}" />
                    ${question.answer[3]}
                  </label>
                </li>
              </ul>
            </div>
            <button class="next-button">Next</button>
          </div>`;
  }

  // Return the HTML for the result screen
  function showResult(data) {
    return `<div class="result-container">
            <h3>All Done!!!</h3>
            <p>Your score is ${score}.</p>
            <h5>Key answers:</h5>
            <ul>
              <li>No. 1: ${data[0].key}</li>
              <li>No. 2: ${data[1].key}</li>
              <li>No. 3: ${data[2].key}</li>
            </ul>
            <button class="restart-button">Restart</button>
            <a href="leaderboard/leaderboard.html" target="_blank"><button class="leaderboard-button">View Leaderboard</button></a>
            <button class="logout-button">Logout</button>
          </div>`;
  }

  // Reset the UI to the initial state
  function resetUI() {
    main.innerHTML = `<h1 class="header-text">Quiz Challenge</h1>
                    <p class="par">
                      Answer the following questions within the time limit.
                      <br />Correct +10, Wrong -5, Empty +0
                    </p>
                    <a href="leaderboard/leaderboard.html" target="_blank"
                      ><button class="leaderboard-button">View Leaderboard</button></a
                    >
                    <button class="start-button">Start Quiz</button>`;

    const oldStartButton = document.querySelector(".start-button");
    const newStartButton = oldStartButton.cloneNode(true);
    oldStartButton.replaceWith(newStartButton);

    newStartButton.addEventListener("click", startQuiz);

    timerContainer.classList.add("hidden");
  }

  // Logout and reset the UI to the login screen
  function logout() {
    container.innerHTML = `<div class="login-container">
                            <h2>Enter your name:</h2>
                            <input
                              type="text"
                              name="name-field"
                              class="name-field"
                              placeholder="e.g Arthur Pendragon"
                            />
                            <button class="login-button">Login</button>
                          </div>`;

    const oldLoginButton = document.querySelector(".login-button");
    const newLoginButton = oldLoginButton.cloneNode(true);
    oldLoginButton.replaceWith(newLoginButton);

    const oldNameField = document.querySelector(".name-field");
    const newNameField = oldNameField.cloneNode(true);
    oldNameField.replaceWith(newNameField);

    newLoginButton.addEventListener("click", () => {
      const userName = newNameField.value.trim();
      if (userName.trim() !== "") {
        getName(userName);
      }
    });

    newNameField.addEventListener("keydown", (event) => {
      const userName = newNameField.value.trim();
      if (event.key === "Enter" && userName.trim() !== "") getName(userName);
    });
  }
}
