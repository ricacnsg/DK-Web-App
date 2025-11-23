<?php
session_start();
require_once '../../database/connect.php';

$isLoggedIn = isset($_SESSION['customer_id']);
$customerID = $_SESSION['customer_id'] ?? null;
$username = $_SESSION['username'] ?? 'Guest';

$recipientName = '';
$contactNumber = '';
$email = '';

if ($isLoggedIn && $customerID) {
    $stmt = $conn->prepare("SELECT recipientName, phoneNumber, email FROM customer WHERE customerID = ?");
    $stmt->bind_param("i", $customerID);
    $stmt->execute();
    $stmt->bind_result($recipientName, $contactNumber, $email);
    $stmt->fetch();
    $stmt->close();
}

// redirect if user didn't visit get_order first
if (!isset($_SESSION['visited_get_order']) && !isset($_SESSION['visited_view_cart'])) {
    header("Location: ../get_order/get_order.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout</title>
    <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
    <link rel="stylesheet" href="checkout.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
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
        <div class="row d-flex justify-content-center mt-4">
            <div class="col col-md-4 d-flex justify-content-center" id="backToMenuBtn">
                <button class="rounded-pill upper-buttons p-2" style="opacity: 0.6;">
                    Get Order
                </button>
            </div>
            <div class="col col-md-4 d-flex justify-content-center" id="backToCartBtn">
                <button class="rounded-pill upper-buttons p-2" style="opacity: 0.6;">
                    View Cart
                </button>
            </div>
            <div class="col col-md-4 d-flex justify-content-center">
                <button class="rounded-pill upper-buttons p-2">
                    Checkout
                </button>
            </div>
        </div>
            
            <!-- PROGRESS DOTS AND LINES - ALL START SAME SIZE -->
            <div class="divider d-flex justify-content-center me-5 ms-5">
                <div class="dot progress-dot" data-step="1"></div>
                <div class="line progress-line" data-line="1"></div>
                <div class="dot progress-dot" data-step="2"></div>
                <div class="line progress-line" data-line="2"></div>
                <div class="dot progress-dot" data-step="3"></div>
            </div>
        </div>
        
        <div class="d-flex justify-content-center">
            <p class="our-menu-header"></p>
        </div>
        
        <div class="card p-2 main-card border-2 mb-3 m-5">
            <div class="row">
                <div class="col-12 col-md-4 p-2">
                    <div class="ms-4">
                        <p class="section-header">Personal Information</p>
                    </div>
                    <form class="ms-4 me-4">
                        <div class="form-group">
                            <label for="recipient" class="labels">Recipient's Name</label>
                            <input type="text" class="form-control rounded border-2" id="recipient" name="recipientName">
                        </div>
                        <div class="form-group">
                            <label for="contact" class="labels">Contact Number</label>
                            <input type="text" class="form-control rounded border-2" id="contact" name="ContactNumber">
                        </div>
                        <div class="form-group">
                            <label for="email" class="labels">Email</label>
                            <input type="email" class="form-control rounded border-2" id="email" name="emailAddress">
                        </div>
                    </form>
                    <?php if ($isLoggedIn): ?>
                        <div class="ms-4 me-4 mt-2 d-flex justify-content-end">
                            <button type="button" class="edit-btn" id="redirectToMyProfile">
                                <i class="fa-solid fa-pencil"></i>
                            </button>
                        </div>
                    <?php endif; ?>
                </div>
                <div class="col-12 col-md-4 p-2">
                    <div class="ms-4">
                        <p class="section-header">Delivery Location</p>
                    </div>
                    <form class="ms-4 me-4">
                        <div class="form-group">
                            <label for="street" class="labels">Street</label>
                            <input type="text" class="form-control rounded border-2" id="street" name="streetAddress">
                        </div>
                        <div class="form-group">
                            <label for="barangay" class="labels">Barangay</label>
                            <input type="text" class="form-control rounded border-2" id="barangay" name="barangayAddress">
                        </div>
                        <div class="form-group">
                            <label for="municipality" class="labels">Municipality</label>
                            <input type="text" class="form-control rounded border-2" id="municipality" name="municipalityAddress">
                        </div>
                        <div class="form-group">
                            <label for="remark" class="labels">Remarks</label>
                            <textarea class="form-control rounded border-2 textarea-style" id="remark" name="remarkAddress"></textarea>
                        </div>
                    </form>
                </div>
                <div class="col-12 col-md-4 p-2">
                    <div class="ms-4">
                        <p class="section-header">Payment Details</p>
                    </div>
                    <div class="ms-4 me-4">
                        <form class="ms-4 me-4">
                            <input type="radio" id="gcash" value="GCash" name="paymentOption">
                            <label for="gcash">GCash</label>
                            <input type="radio" id="cod" value="Cash On Delivery" name="paymentOption" class="ms-5">
                            <label for="cod">Cash On Delivery</label>
                        </form>
                        
                        <hr>
                    </div>
                    <div class="ms-4 me-4" id="checkoutItems">
                        <hr>
                        <div class="d-flex justify-content-between mt-3">
                            <p><span>Subtotal: </span></p>
                            <p><span id="checkoutSubtotal">0.00</span></p>
                        </div>
                        <div class="d-flex justify-content-between">
                            <p><span>Delivery Fee: </span></p>
                            <p><span id="checkoutDeliveryFee">₱0.00</span></p>
                        </div>
                        <div class="d-flex justify-content-between">
                            <p><span>Total: </span></p>
                            <p><span id="checkoutTotal">₱0.00</span></p>
                        </div>
                        <div class="d-flex justify-content-center">
                            <button type="button" class="rounded-pill" id="checkoutBtn">Checkout</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Receipt Pop Up -->
        <div id="receiptSection" style="display: none;" class="receiptOverlay">
            <div class="d-flex justify-content-center">
                <div class="card receipt-card m-5" id="receiptCard">
                    <div class="align-self-center p-3">
                        <div class="overall-header mr-3 mb-2">
                            <span class="davens-receipt-header fw-bold" style="line-height:1; display:block; position:relative;">
                                Daven's
                                <img src="/assets/image/davens_logo.png"
                                    alt="Daven's Logo"
                                    class="davens-receipt-logo">
                            </span>
                            <span class="davens-receipt-header fw-bold" style="line-height:1; display:block;">Kitchenette</span>
                        </div>
                        <div class="d-flex justify-content-center">
                            <p class="contact-header">146 Consuelo St. Brgy 8, <br>
                                Nasugbu, 4231, Batangas <br>
                                0967 622 1293
                            </p>
                        </div>
                    </div>
                    <div class="dashed-line opacity-50"></div>
                    <div class="d-flex justify-content-between ms-3 me-3">
                        <span id="orderNumber" class="details">Order No:</span>
                        <span id="orderDate" class="details">Date | Time</span>
                    </div>
                    <div class="dashed-line opacity-50"></div>
                    <div class="ms-3 me-3">
                        <p id="recipient" class="details">Customer Name: </p>
                        <p id="contactNumber" class="details">Contact Number: </p>
                        <p id="emailAddress" class="details">Email Address: </p>
                        <p id="deliveryAddress" class="details">Delivery Address: </p>
                    </div>
                    <div class="dashed-line opacity-50"></div>
                    <div class="ms-3 me-3">
                        <p><b>Order Summary</b></p>
                        <div id="itemsContainer"></div>
                    </div>
                    <div class="solid-line opacity-50"></div>
                    <div class="ms-3 me-3 d-flex justify-content-between">
                        <span class="details">Subtotal: </span><span id="subtotal" class="details"><b></b></span>
                    </div>
                    <div class="ms-3 me-3 d-flex justify-content-between">
                        <span class="details">Delivery Fee: </span><span id="deliveryFee" class="details"><b></b></span>
                    </div>
                    <div class="solid-line opacity-50"></div>
                    <div class="ms-3 me-3 d-flex justify-content-between">
                        <span id="total" class="details">TOTAL: </span><span id="total" class="details"><b></b></span>
                    </div>
                    <div class="dashed-line opacity-50"></div>
                    <div class="ms-3 me-3">
                        <span id="paymentMethod" class="details">Payment Method: </span>
                    </div>
                    <div class="dashed-line opacity-50"></div>
                    <div class="ms-3 me-3 justify-content-center footer details">
                        <p><b>Thank You For Ordering!</b></p>
                        <p>You can screenshot this receipt.</p>
                        <p>Use your Order Number to track</p>
                        <p>your order anytime.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Make session data available to JavaScript
        window.userData = {
            isLoggedIn: <?php echo $isLoggedIn ? 'true' : 'false'; ?>,
            customerID: <?php echo $customerID ?? 'null'; ?>,
            username: "<?php echo htmlspecialchars($username); ?>"
        };
    </script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="checkout.js"></script>
</body>
</html>