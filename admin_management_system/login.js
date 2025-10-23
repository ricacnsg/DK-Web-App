console.log("✅ JavaScript connected!");

document.getElementById("staffLogin").addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("Form submitted!");

  const formData = new FormData(this);

  fetch("../controllers/login.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.text())
    .then((data) => {
      console.log("Response from PHP:", data);

      if (data.trim() === "success") {
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        Swal.fire({
            title: "Login Failed",
            text: "Invalid username or password.",
            icon: "warning"
        });;
        document.getElementById("staffLogin").reset();
      }
    })
    .catch((err) => console.error(err));
});

const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('hide');

  togglePassword.addEventListener('click', function () {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    
    eyeIcon.classList.toggle('fa-eye');
    eyeIcon.classList.toggle('fa-eye-slash');
  });

