<?php
session_start();

// Redirect to login if not logged in
if (!isset($_SESSION['customer_id'])) {
    // Save return destination
    header("Location: ../landing_page/landing.html");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="testimonial.css">
    <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    <title>Testimonials</title>
    
</head>
<body>
    <div class="container-fluid px-0">
        <div id="mainContent">
            <div class="block align-self-center p-3">
                <div class="overall-header align-self-center mr-3 mb-2">
                    <span class="davens-header fw-bold" style="line-height:1; display:block; position:relative;">
                        Daven's
                        <img src="/assets/image/davens_logo.png"
                            alt="Daven's Logo"
                            class="davens-logo">
                    </span>
                    <span class="davens-header fw-bold" style="line-height:1; display:block;">Kitchenette</span>
                </div>
            </div>
            <div class="lower-header">
                <div class="row">
                    <!-- Back Button -->
                    <div class="col col-md-2">
                        <button class="back-btn rounded-circle" id="backButton">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                    </div>
                    <!-- Right Side -->
                    <div class="col-10 d-flex align-items-center justify-content-end pe-4 less-bot">
                        <hr class="hori-line me-3">
                        <p class="m-0 testimonial">Testimonials</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col col-md-2"></div>
                    <!-- Right Side -->
                        <div class="col col-md-10 d-flex align-items-center pe-4 d-flex justify-content-end less-bot">
                            <p class="m-0 phrase">What they're saying about us</p>
                        </div>
                    </div>
            </div>
        </div>

        <!-- Testimonials Container -->
        <div class="container my-5">
            <div class="row" id="testimonialsContainer">
                <!-- Dito papasok ang mga cards from database -->
            </div>
        </div>

        <!-- Share Experience Button -->
        <div>
            <button class="overlay-button rounded-pill" id="popupBtn">
                <b>Share your <br> experience!</b>
            </button>
        </div>

        <!-- Feedback Popup -->
        <div id="insertFeedback" class="insert-feedback-popup">
            <div class="insert-feedback-popup-content">
                <div class="popup-header d-flex justify-content-between align-items-center px-2">
                    <p class="feedback-header m-0">
                        <b>Send us some <br> feedback</b>
                    </p>
                    <button class="close-btn rounded-pill" id="closeFeedbackBtn">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="form-group p-2">
                    <textarea class="form-control feedback-area" id="customerFeedback" rows="5" placeholder="Say something..."></textarea>
                    <div class="d-flex justify-content-center">
                        <button class="rounded-pill submit-btn d-flex justify-content-center" id="submitFeedbackBtn"><b>Send Feedback</b></button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Feedback Popup -->
    <div id="editFeedbackPopup" class="insert-feedback-popup">
        <div class="insert-feedback-popup-content">
            <div class="popup-header d-flex justify-content-between align-items-center px-2">
                <p class="feedback-header m-0">
                    <b>Edit your feedback</b>
                </p>
                <button class="close-btn rounded-pill" id="closeEditPopupBtn">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="form-group p-2">
                <textarea class="form-control feedback-area" id="editFeedbackArea" rows="5"></textarea>
                <div class="d-flex justify-content-center mt-3">
                    <button class="rounded-pill submit-btn d-flex justify-content-center" id="saveEditFeedbackBtn"><b>Save Changes</b></button>
                </div>
            </div>
        </div>
    </div>


    <div id="deletePopUp" class="delete-popup">
        <div class="delete-popup-content">
            <div class="popup-header d-flex justify-content-center">
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="testimonial.js"></script>
</body>
</html>

<!-- limit feedback of user to 1 for a day
    add edit and delete button when filtered for user's own feedbacks
    guests can view the testimonials but can't add unless signed in -->

<!-- Assignment next day(10-30-25):
 Asikasuhin and delete at edit buttons
  -->