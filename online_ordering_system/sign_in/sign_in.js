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

document.getElementById("customerLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    customer_username: document.getElementById('customerUsername').value,
    customer_password: document.getElementById('customerPassword').value
  };

  try {
    const response = await fetch("../../controllers/customer_sign_in.php", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      // Successful login
      Swal.fire({
        title: "Login Successful!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        let redirectURL = "../get_order/get_order.php"; // default
        if (returnPage === "checkout") redirectURL = "../checkout/checkout.php";
        else if (returnPage === "testimonial") redirectURL = "../../testimonial/testimonial.html";
        else if (returnPage === "get_order") redirectURL = "../get_order/get_order.php";
        else if (returnPage === "view_cart") redirectURL = "../view_cart/view_cart.php";

        window.location.href = redirectURL;
      });

    } else if (result.notVerified) {
      // Email not verified
      Swal.fire({
        title: "Email Not Verified",
        text: result.message,
        icon: "warning",
        confirmButtonText: "Resend Verification Email"
      }).then(() => {
        // Optional: call your resend verification API here
        // fetch('/resend_verification.php', ...)
        Swal.fire({
          title: "Check your email!",
          text: "A verification link has been sent.",
          icon: "info",
          timer: 2000,
          showConfirmButton: false
        });
      });

    } else {
      // Invalid login
      Swal.fire({
        title: "Login Failed",
        text: result.message || "Invalid username or password.",
        icon: "error",
      });
      document.getElementById("customerLogin").reset();
    }

  } catch (error) {
    Swal.fire({
      position: "center",
      icon: "warning",
      title: 'Error',
      text: error,
      showConfirmButton: false,
      timer: 1500
    });
  }
});
