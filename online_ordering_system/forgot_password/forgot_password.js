document.getElementById("forgotForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const email = document.getElementById("email").value;

    // Show loading alert
    Swal.fire({
        title: 'Sending...',
        text: 'Please wait while we send the reset link to your email.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try{
        const res = await fetch("../../controllers/customer_controllers/customer_forgot_password.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        
        // Close loading and show result
        Swal.fire({
            icon: data.success ? "success" : "error",
            title: data.success ? "Email Sent!" : "Failed",
            text: data.message,
            confirmButtonText: 'OK'
        }).then((result) => {
            // Redirect only on success and when OK is clicked
            if (data.success && result.isConfirmed) {
                window.location.href = "../sign_in/sign_in.php";
            }
        });
    }catch(err){
        Swal.fire({ 
            icon:"error", 
            title:"Error", 
            text: err.message,
            confirmButtonText: 'OK'
        });
    }
});