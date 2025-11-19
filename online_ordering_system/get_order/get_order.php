<?php
session_start();
$isLoggedIn = isset($_SESSION['customer_id']);
$customerID = $_SESSION['customer_id'] ?? null;
$username = $_SESSION['username'] ?? 'Guest';
$_SESSION['visited_get_order'] = true;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/bootstrap5/css/bootstrap.min.css">
    <link rel="stylesheet" href="get_order.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    <title>Get Order</title>
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
            </div>
        </div>
        
        <!-- PROGRESS BAR SECTION -->
        <div>
            <div class="row d-flex justify-content-center mt-4">
                <div class="col col-md-4 d-flex justify-content-center">
                    <button class="rounded-pill upper-buttons p-2">
                        Get Order
                    </button>
                </div>
                <div class="col col-md-4 d-flex justify-content-center">
                    <button class="rounded-pill upper-buttons p-2" style="opacity: 0.6;">
                        View Cart
                    </button>
                </div>
                <div class="col col-md-4 d-flex justify-content-center">
                    <button class="rounded-pill upper-buttons p-2" style="opacity: 0.6;">
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
            <p class="our-menu-header"></p>
        </div>
        
        <!-- SEARCH AND FILTER -->
        <div class="row d-flex justify-content-between">
            <div class="col-12 col-md-4 d-flex justify-content-center">
                <div class="input-container w-100">
                    <i class="fas fa-search icon"></i>
                    <input type="text" id="searchInput" class="form-control form-control-lg border-3 search-input" placeholder="Search menu item name or description...">
                </div>
            </div>
            <div class="col-12 col-md-4">
                <div class="filter-dropdown">
                    <label for="menuSorter">Sort By:</label>
                    <select id="menuSorter" class="filter-select">
                        <option value="name_asc">Name (Z-A)</option>
                        <option value="name_desc">Name (A-Z)</option>
                        <option value="price_asc">Price (High to Low)</option>
                        <option value="price_desc">Price (Low to High)</option>
                    </select>
                </div>
            </div>
        </div>
        
        <!-- MENU CATEGORY BUTTONS -->
        <div class="">
            <div class="d-flex flex-wrap gap-0 justify-content-center mt-3">
                <button type="button" class="btn rounded-pill menu-button fw-bold border-3" data-filter="bento">
                    Bento Silog
                </button>
                <button type="button" class="btn rounded-pill menu-button fw-bold border-3" data-filter="burgers">
                    Burger & Sandwiches 
                </button>
                <button type="button" class="btn rounded-pill menu-button fw-bold border-3" data-filter="wings">
                    Flavored Wings & Rice
                </button>
                <button type="button" class="btn rounded-pill menu-button fw-bold border-3" data-filter="rice">
                    Rice Meal
                </button>
                <button type="button" class="btn rounded-pill menu-button fw-bold border-3" data-filter="pulutan">
                    Pulutan Express
                </button>
                <button type="button" class="btn rounded-pill menu-button fw-bold border-3" data-filter="beverages">
                    Drinks
                </button>
                <button type="button" class="btn rounded-pill menu-button fw-bold border-3" data-filter="all">
                    All
                </button>
            </div>
            <div>
                <div class="row m-4 ms-5 me-5" id="menuItemContainer">
                </div>
            </div>
        </div>
        
        <!-- VIEW CART BUTTON -->
        <div>
            <button class="overlay-button rounded-pill" id="viewCartBtn">
                <b>View Cart</b>
            </button>
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
    <script src="progress_bar.js"></script>
    <script src="get_order.js"></script>
</body>
</html>