<?php
session_start();

if (isset($_SESSION['staff_username'])) {
  header("Location: admin_management.php");
  exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="/assets/image/davens_logo.png">
    <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
    <link rel="stylesheet" href="login.css">
    <link href='https://fonts.googleapis.com/css?family=Montserrat' rel='stylesheet'>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/css/all.min.css" crossorigin="anonymous">
    <title>Log In</title>
</head>
<body>
    <div class="container-fluid g-0">
        <div class="row wrapper g-0 min-vh-100">

            <!-- LEFT -->
            <div class="col-12 col-md-7 left-panel d-flex align-items-center">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-12 col-sm-10 col-md-8 py-5">
                            <h1 class="fw-bolder title text-center">Run the Business</h1>
                            <h6 class="subtitle text-center mb-4">Sign in to your account</h6>

                            <form id="staffLogin" class="mx-auto" method="POST" action="../controllers/check_credentials.php">
                                <div class="mb-3">
                                    <label for="accountUsername" class="form-label fw-bolder">Username</label>
                                    <input id="accountUsername" type="text"
                                        class="rounded-pill border-0 form-control form-control-lg"
                                        placeholder="Enter your email"
                                        name="staff_username" required>
                                </div>

                                <div class="mb-4 position-relative">
                                    <label for="password" class="form-label fw-bolder">Password</label>
                                    <input id="password" type="password"
                                        class="rounded-pill border-0 form-control form-control-lg"
                                        placeholder="Enter your password"
                                        name="staff_password" required>
                                    <button type="button" class="toggle-password position-absolute" id="togglePassword">
                                        <i class="fa-solid fa-eye-slash" id='hide'></i>
                                    </button>
                                </div>

                                <div class="text-center">
                                    <button type="submit" class="btn btn-lg rounded-pill sign-in-btn px-5">Sign In</button>
                                </div>
                            </form>

                            <p class="text-center mt-4 d-md-none text-muted">No account yet? <a href="#" class="text-decoration-none">Learn More.</a></p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- RIGHT -->
            <div class="col-12 col-md-5 right-panel d-flex align-items-center justify-content-center position-relative py-5">
                <div class="text-center content-on-image px-3">
                    <img src="/assets/image/davens_logo.png" alt="logo" class="logo mb-3">
                    <h1 class="greetings">Welcome<br>to<br>Daven's<br>Kitchenette</h1>
                    <br>
                    <br>
                    <p class="d-none d-md-block mt-3 text-white">No account yet? <a href="#" class="text-decoration-none learnmore">Learn More.</a></p>
                </div>
            </div>

        </div>
    </div>
    <img src="/assets/image/davens_ambiance_4.jpg" alt="background image" class="bg-image">
</body>
<script src="/bootstrap5/js/bootstrap.min.js"></script>
<script src="login.js"></script>
</html>