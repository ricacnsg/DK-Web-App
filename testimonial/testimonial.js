// Load testimonials when page loads
document.addEventListener('DOMContentLoaded', function () {
    loadTestimonials();

    const openPopupBtn = document.getElementById('popupBtn');
    const closePopupBtn = document.getElementById('closeFeedbackBtn');
    const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
    const myPopup = document.getElementById('insertFeedback');
    const mainContent = document.getElementById('mainContent');

    // === Insert Feedback Popup ===
    openPopupBtn.onclick = function () {
        myPopup.style.display = 'block';
    };

    closePopupBtn.onclick = function () {
        myPopup.style.display = 'none';
    };

    // === Submit Feedback ===
    submitFeedbackBtn.onclick = function () {
        const feedback = document.getElementById('customerFeedback').value.trim();

        if (!feedback) {
            Swal.fire("Empty Feedback", "Please enter your feedback before sending.", "warning");
            return;
        }

        const formData = new FormData();
        formData.append('input', feedback);

        fetch('../../controllers/submit_feedback.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            if (data === 'success') {
                Swal.fire("Thank you!", "Your feedback has been submitted.", "success");
                myPopup.style.display = 'none';
                document.getElementById('customerFeedback').value = '';
                loadTestimonials();
            } else if (data === 'Please log in first') {
                Swal.fire({
                    title: "Login Required",
                    text: "You need to log in to submit feedback. Would you like to log in now?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, log in",
                    cancelButtonText: "Cancel"
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = "../online_ordering_system/sign_in/sign_in.php?return=testimonial";
                    }
                });
            } else {
                Swal.fire("Error", data, "error");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire("Error", "An error occurred while submitting feedback.", "error");
        });
    };

    // === Edit Feedback Popup ===
    const editPopup = document.getElementById('editFeedbackPopup');
    const closeEditPopupBtn = document.getElementById('closeEditPopupBtn');
    const saveEditFeedbackBtn = document.getElementById('saveEditFeedbackBtn');
    const editFeedbackArea = document.getElementById('editFeedbackArea');
    let currentEditID = null;

    // Handle edit button clicks (delegation)
    document.addEventListener('click', function (event) {
        if (event.target.closest('.edit-feedback')) {
            const btn = event.target.closest('.edit-feedback');
            currentEditID = btn.getAttribute('data-id');
            const text = btn.getAttribute('data-text');
            editFeedbackArea.value = text;
            editPopup.style.display = 'block';
        }
    });

    // Close edit popup
    closeEditPopupBtn.onclick = function () {
        editPopup.style.display = 'none';
    };

    // Save edited feedback
    saveEditFeedbackBtn.onclick = function () {
        const newText = editFeedbackArea.value.trim();
        if (!newText) {
            Swal.fire("Empty Feedback", "Please enter some feedback before saving.", "warning");
            return;
        }

        const formData = new FormData();
        formData.append('feedbackID', currentEditID);
        formData.append('input', newText);

        fetch('../../controllers/edit_feedback.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            if (data === 'success') {
                Swal.fire("Updated!", "Your feedback has been updated.", "success");
                editPopup.style.display = 'none';
                loadTestimonials();
            } else {
                Swal.fire("Error", data, "error");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire("Error", "An error occurred while updating feedback.", "error");
        });
    };

    // === Close popup if clicked outside (both popups) ===
    window.onclick = function (event) {
        if (event.target === myPopup) myPopup.style.display = 'none';
        if (event.target === editPopup) editPopup.style.display = 'none';
    };
});

// === Load Testimonials ===
function loadTestimonials(filter = 'all') {
    fetch(`../../controllers/get_feedback.php?filter=${filter}`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('testimonialsContainer').innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading testimonials:', error);
            document.getElementById('testimonialsContainer').innerHTML =
                '<div class="col-12 text-center"><p class="text-danger">Error loading testimonials</p></div>';
        });
}

document.addEventListener('click', function(event) {
    if (event.target.id === 'myFeedbackFilter') {
        loadTestimonials('my');
    } else if (event.target.id === 'allFeedbackFilter') {
        loadTestimonials('all');
    }
});

// === Logout Confirmation [normal na back button if ang user ay guest]===
document.getElementById("backButton").addEventListener("click", function() {
  if (window.isLoggedIn) {
    // If logged in → confirm logout
    Swal.fire({
      title: "Log Out?",
      text: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "/controllers/sign_out.php";
      }
    });
  } else {
    // If NOT logged in → normal back button (go to landing page)
    window.location.href = "../../landing_page/landing.html";
  }
});

// === Delete Confirmation ===
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-feedback")) {
    const feedbackID = e.target.getAttribute("data-id");

    Swal.fire({
      title: "Delete Feedback?",
      text: "Are you sure you want to delete your feedback?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        // Send delete request
        fetch("../controllers/delete_feedback.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `feedbackID=${feedbackID}`
        })
        .then(response => response.text())
        .then(data => {
          if (data.trim() === "success") {
            Swal.fire("Deleted!", "Your feedback has been deleted.", "success");
            loadTestimonials(); // Refresh testimonials
          } else {
            Swal.fire("Error", data, "error");
          }
        })
        .catch(error => {
          console.error("Error:", error);
          Swal.fire("Error", "An error occurred while deleting feedback.", "error");
        });
      }
    });
  }
});

// === Checks if User is Signed In [ginagamit ito to convert the logout confirmation to normal back button]
document.addEventListener("DOMContentLoaded", () => {
  fetch("../../controllers/check_sign_in.php")
    .then(response => response.json())
    .then(data => {
      window.isLoggedIn = data.isLoggedIn; // store globally
      console.log("User logged in:", data.isLoggedIn);
    })
    .catch(error => console.error("Error checking login:", error));
});
