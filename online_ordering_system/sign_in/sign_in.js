function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const returnPage = getQueryParam("return"); 

const togglePassword = document.querySelector("#togglePassword");
const passwordField = document.querySelector("#customerPassword");

togglePassword.addEventListener("click", () => {
  const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
  passwordField.setAttribute("type", type);
  togglePassword.classList.toggle("fa-eye");
  togglePassword.classList.toggle("fa-eye-slash");
});

document.getElementById("customerLogin").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);

  fetch("../../controllers/sign_in.php", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.text())
    .then((data) => {
      if (data.trim() === "success") {
        Swal.fire({
          title: "Login Successful!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          let redirectURL = "/home/home.php"; // default

          if (returnPage === "checkout") {
            redirectURL = "../checkout/checkout.php";
          } 
          else if (returnPage === "testimonial") {
            redirectURL = "../../testimonial/testimonial.html";
          }

          window.location.href = redirectURL;
        });
      } else {
        Swal.fire({
          title: "Login Failed",
          text: "Invalid username or password.",
          icon: "warning",
        });
        document.getElementById("customerLogin").reset();
      }
    })
    .catch((err) => console.error(err));
});
