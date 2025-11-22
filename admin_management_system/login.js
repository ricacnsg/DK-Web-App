document.getElementById("staffLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = document.getElementById("staffLogin");
  const formData = new FormData(form);

  try {
    const response = await fetch('../controllers/check_credentials.php', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      if (data.role === 'admin') {
        window.location.href = 'admin_management.php';
      }
      else if (data.role === 'cashier') {
        window.location.href = 'cashier_pos.php';
      }
      else if (data.role === 'kitchen staff') {
        window.location.href = 'kitchen_staff.php';
      } 
      else if (data.role === 'delivery rider') {
        window.location.href = 'kitchen_staff.php';
      }
      else {
        alert('Login successful but unknown role: ' + data.role);
      }
    } else {
      Swal.fire({
            position: "center",
            icon: "warning",
            title: data.message,
            showConfirmButton: false,
            timer: 1500
        });
    }
  } catch (error) {
    Swal.fire({
        position: "center",
        icon: "warning",
        title: 'Something went wrong. Please try again.',
        showConfirmButton: false,
        timer: 1500
    });
  }
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

