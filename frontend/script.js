const usernameInput = document.querySelector("#username-box");
const errorMessage = document.querySelector("#username-error");

usernameInput.addEventListener("input", () => {
  if (usernameInput.value.trim().length < 3 && usernameInput.value.trim().length > 0) {
    errorMessage.textContent = "Minimum 3 characters required";
  } else {
    errorMessage.textContent = "";
  }
});

console.log(usernameInput);
console.log(errorMessage);

