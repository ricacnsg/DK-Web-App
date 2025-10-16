console.log("✅ JavaScript connected!");

document.getElementById("staffLogin").addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("Form submitted!");

  const formData = new FormData(this);

  fetch("connect.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.text())
    .then((data) => {
      console.log("Response from PHP:", data);

      if (data.trim() === "success") {
        alert("Login successful!");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        Swal.fire({
            title: "Login Failed",
            text: "Invalid username or password.",
            icon: "warning"
        });;
      }
    })
    .catch((err) => console.error(err));
});

