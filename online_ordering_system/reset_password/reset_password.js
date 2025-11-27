document.getElementById("resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const token = document.getElementById("token").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    
    // Client-side validation
    if (!token || token.length !== 64) {
        Swal.fire({
            icon: "error",
            title: "Invalid Token",
            text: "The reset link is invalid. Please request a new password reset."
        });
        return;
    }
    
    // Check password match
    if (newPassword !== confirmPassword) {
        Swal.fire({
            icon: "error",
            title: "Passwords Don't Match",
            text: "Please make sure both passwords match."
        });
        return;
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
        Swal.fire({
            icon: "error",
            title: "Weak Password",
            text: "Password must be at least 8 characters long."
        });
        return;
    }
    
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(newPassword)) {
        Swal.fire({
            icon: "error",
            title: "Weak Password",
            text: "Password must contain at least one uppercase letter, one lowercase letter, and one number."
        });
        return;
    }
    
    // Show loading
    Swal.fire({
        title: 'Resetting Password...',
        text: 'Please wait',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        const res = await fetch("../../controllers/customer_controllers/customer_reset_password.php", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                emailOrToken: token, 
                newPassword: newPassword 
            })
        });
        
        // Check if response is JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server returned invalid response");
        }
        
        const data = await res.json();
        
        Swal.fire({
            icon: data.success ? "success" : "error",
            title: data.success ? "Password Reset!" : "Failed",
            text: data.message,
            confirmButtonText: 'OK'
        }).then((result) => {
            if (data.success && result.isConfirmed) {
                // Clear form
                document.getElementById("resetForm").reset();
                // Redirect to sign in
                window.location.href = "../sign_in/sign_in.php";
            }
        });
        
    } catch (err) {
        Swal.fire({ 
            icon: "error", 
            title: "Error", 
            text: "An error occurred. Please try again later.",
            confirmButtonText: 'OK'
        });
        console.error("Reset password error:", err);
    }
});

// Toggle new password visibility
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('newPassword');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
    }
});

// Toggle confirm password visibility
document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('confirmPassword');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
    }
});

// Real-time password strength indicator (optional)
document.getElementById("newPassword").addEventListener("input", function() {
    const password = this.value;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
});