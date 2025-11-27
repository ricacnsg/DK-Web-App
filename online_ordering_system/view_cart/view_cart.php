<?php
session_start();

if (!isset($_SESSION['visited_get_order'])) {
    header("Location: ../get_order/get_order.php");
    exit();
}
$_SESSION['visited_view_cart'] = true;

$isLoggedIn = isset($_SESSION['customer_id']);
$customerID = $_SESSION['customer_id'] ?? null;
$username = $_SESSION['username'] ?? 'Guest';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
    <link rel="stylesheet" href="view_cart.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">    
    <title>View Cart</title>
</head>
<body>
    <div class="container-fluid">
        <div class="block align-self-center p-3">
            <div class="overall-header d-flex justify-content-between align-items-center w-100">
                <!-- LEFT SIDE -->
                <div class="d-flex flex-column">
                    <span class="davens-header fw-bold" style="line-height:1;">
                        Daven's
                        <img src="/assets/image/davens_logo.png"
                            alt="Daven's Logo"
                            class="davens-logo">
                    </span>
                    <span class="davens-header fw-bold" style="line-height:1;">Kitchenette</span>
                </div>

                <!-- RIGHT SIDE -->
                <?php if ($isLoggedIn): ?>
                <div>
                    <button type="button" class="user-btn" id="myProfile">
                        <i class="fa-regular fa-user user-icon"></i>
                    </button>
                    <button type="button" class="user-btn" id="logoutBtn">
                        <i class="fa-solid fa-right-from-bracket user-icon"></i>
                    </button>
                </div>
                <?php endif; ?>

                <?php if (!($isLoggedIn)): ?>
                <div>
                    <button type="button" class="user-btn" id="logIn">
                        Log In
                    </button>
                </div>
                <?php endif; ?>
            </div>
        </div>
        
        <!-- PROGRESS BAR SECTION -->
        <div>
            <div class="row d-flex justify-content-center mt-4">
                <div class="col col-md-4 d-flex justify-content-center">
                    <button class="rounded-pill upper-buttons p-2" style="opacity: 0.6;" id="backToMenuBtn">
                        Get Order
                    </button>
                </div>
                <div class="col col-md-4 d-flex justify-content-center">
                    <button class="rounded-pill upper-buttons p-2">
                        View Cart
                    </button>
                </div>
                <div class="col col-md-4 d-flex justify-content-center">
                    <button class="rounded-pill upper-buttons p-2" style="opacity: 0.6;" id="secondCheckoutBtn">
                        Checkout
                    </button>
                </div>
            </div>
            
            <!-- UPDATED PROGRESS DOTS AND LINES -->
            <div class="divider d-flex justify-content-center me-5 ms-5">
                <div class="dot progress-dot" data-step="1"></div>
                <div class="line progress-line"></div>
                <div class="dot progress-dot" data-step="2"></div>
                <div class="line progress-line"></div>
                <div class="dot progress-dot" data-step="3"></div>
            </div>
        </div>
        
        <div class="d-flex justify-content-center">
            <p class="view-cart-header"></p>
        </div>
        
        <!-- CART CONTENT -->
        <div class="row">
            <div class="col-12 col-md-7">
                <div class="d-flex justify-content-center align-items-center">
                    <div id="cartContainer" class="row g-3"></div>
                </div>
            </div>
            <div class="col-12 col-md-4 justify-content-start">
                <div class="card p-2 card-summary">
                    <h3>Order Summary</h3>
                    <div id="summaryContainer">
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between">
                        <p><span>Subtotal: </span></p>
                        <h5><span id="cartSubtotal" class="bolded">0.00</span></h5>
                    </div>
                    <div class="d-flex justify-content-between">
                        <p><span>Delivery Fee: </span></p>
                        <h5><span id="deliveryFee" class="bolded">₱0.00</span></h5>
                    </div>
                    
                    <hr class="above">
                    <div class="d-flex justify-content-between">
                        <h5><span>Total: </span></h5>
                        <h5><span id="cartTotal">₱0.00</span></h5>
                    </div>
                    <div class="d-flex justify-content-center">
                        <button type="submit" class="w-50 rounded-pill buttons" id="checkoutBtn">Checkout</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- LOGIN/SIGNUP OVERLAY -->
        <div class="continueOverlay p-5" id="continue_overlay">
            <div class="continueCard p-4" id="continue_card">
                <div class="card-header d-flex justify-content-center">
                    <h2 class="bolder">Checkout</h2>
                </div>
                <div class="d-flex justify-content-center">
                    <p>Do you have an account?</p>
                </div>
                <div class="d-flex justify-content-center mt-2">
                    <button type="button" class="rounded-pill buttons w-75" id="logInBtn">Log In</button><br>
                </div>
                <div class="d-flex justify-content-center mt-4">
                    <button type="button" class="rounded-pill buttons w-75" id="signUpBtn">Sign Up</button><br>
                </div>
                <div class="hr-with-text mt-4">Or</div>
                <div class="d-flex justify-content-center mt-4">
                    <button type="button" class="rounded-pill buttons w-75" id="guestBtn">Continue as Guest</button>
                </div>
            </div>
        </div>
    </div>
    
    <script>
    window.userData = {
        isLoggedIn: <?= $isLoggedIn ? 'true' : 'false' ?>,
        customerID: <?= $customerID ?? 'null' ?>,
        username: "<?= htmlspecialchars($username) ?>"
    };
    </script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="view_cart.js"></script>
    <?php if (isset($_GET['fromLogin']) && $isLoggedIn): ?>
    <script>
        // Only trigger if logged in after clicking checkout
        if (sessionStorage.getItem("returnTo") === "checkout") {
            sessionStorage.removeItem("returnTo");
            window.location.href = "../checkout/checkout.php";
        }
    </script>
    <?php endif; ?>

</body>
</html>