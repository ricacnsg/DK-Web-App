const togglePassword = document.querySelector("#togglePassword");
const passwordField = document.querySelector("#customerPassword");

togglePassword.addEventListener("click", () => {
const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
passwordField.setAttribute("type", type);

// Toggle icon between eye and eye-slash
togglePassword.classList.toggle("fa-eye");
togglePassword.classList.toggle("fa-eye-slash");
});

document.getElementById('signupform').addEventListener('submit', async(e) => {
    e.preventDefault();

    formData = {
        username: document.getElementById('customerUsername').value,
        email: document.getElementById('customerEmail').value,
        contactno: document.getElementById('customerPhone').value,
        password: document.getElementById('customerPassword').value
    }

    try {
        const response = await fetch('../../controllers/customer_controllers/sign_up.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })

        const result = await response.json();

        if(result.success){
            Swal.fire({
                title: "Account created Successfully!",
                text: result.message,
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#efc858" 
            }).then((response) => {
                if (response.isConfirmed) {
                    window.location.href = '../../landing_page/landing.php';
                }
            });
            document.getElementById('signupform').reset();
        }
        else{
            Swal.fire({
                position: "center",
                icon: "warning",
                title: result.message,
                showConfirmButton: false,
                timer: 1500
            });
        }
    } 
    catch (error) {
        Swal.fire({
                position: "center",
                icon: "warning",
                title: 'Error:', error,
                showConfirmButton: false,
                timer: 1500
        });
    }

});