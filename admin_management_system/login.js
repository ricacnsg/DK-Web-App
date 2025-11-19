document.getElementById("staffLogin").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);

  fetch("../controllers/check_credentials.php", {
    method: "POST",
    body: formData,
    credentials: "include"
  })
    .then((res) => res.text())
    .then((data) => {
      if (data.trim() === "success") {
        setTimeout(() => {
          window.location.href = "admin_management.php";
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

