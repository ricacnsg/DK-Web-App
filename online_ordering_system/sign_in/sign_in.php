<?php
session_start();

if (isset($_SESSION['customer_id'])) {
  header("Location: ../../../testimonial/testimonial.php");
  exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
    <link rel="stylesheet" href="sign_in.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <title>Sign In</title>
</head>
<body>
    <div class="container-fluid mx-0">
        <div class="block">
            <div class="overall-header">
                <span class="davens-header fw-bold" style="line-height:1; display:block; position:relative;">
                    Daven's
                    <img src="/assets/image/davens_logo_white.png"
                        alt="Daven's Logo"
                        width="80"
                        height="70"
                        class="davens-logo"
                        style="position:absolute; left:185px; top:-18px;">
                </span>
                <span class="davens-header fw-bold" style="line-height:1; display:block;">Kitchenette</span>
            </div>
        </div>
        <div class="wave">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#efc858" fill-opacity="1"
                d="M0,256L60,240C120,224,240,192,360,197.3C480,203,600,245,720,224C840,203,960,117,1080,117.3C1200,117,1320,203,1380,245.3L1440,288L1440,0L0,0Z">
            </path>
            </svg>
        </div>
    </div>
    <div class="lower-block">
        <div>
            <div class="lower-header">
                <h2 class="sign-in">Sign In</h2>
                <p class="subhead">Welcome Back!</p>
            </div>
            <form id="customerLogin" method="POST" action="../controllers/sign_in.php">
                <div class="form-group d-flex justify-content-center form-block">
                    <div class="input-container">
                        <i class="fas fas-solid fa-user icon"></i>
                        <input type="text" class="form-control form-control-lg border-3" id="customerUsername" placeholder="Username" name="customer_username">
                    </div>
                </div>
                <div class="form-group d-flex justify-content-center">
                    <div class="input-container">
                        <i class="fas fas-solid fa-lock icon"></i>
                        <input type="password" class="form-control form-control-lg border-3" id="customerPassword" placeholder="Password" name="customer_password">
                        <i class="fas fa-eye toggle-password" id="togglePassword"></i>
                    </div>
                </div>
                <div class="d-flex justify-content-center">
                    <button type="submit" class="btn btn-lg my-button rounded-pill border-2">Sign In</button>
                </div>
            </form>
        </div>
    </div>
    <div class="d-flex justify-content-center">
        <span>
            <p class="redirect">Don't have account yet?</p>
        </span>
        <span>
            <p><a href="/online_ordering_system/sign_up/sign_up.php" class="link-opacity-25-hover">Sign Up</a></p>
        </span>
    </div>
    
    
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="sign_in.js"></script>
</body>
</html>
