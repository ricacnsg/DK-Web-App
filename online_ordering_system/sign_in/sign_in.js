const togglePassword = document.querySelector("#togglePassword");
const passwordField = document.querySelector("#customerPassword");

togglePassword.addEventListener("click", () => {
const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
passwordField.setAttribute("type", type);

// Toggle icon between eye and eye-slash
togglePassword.classList.toggle("fa-eye");
togglePassword.classList.toggle("fa-eye-slash");
});
