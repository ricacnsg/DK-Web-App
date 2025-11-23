<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="../assets/image/davens_logo.png">
    <!-- Link for Montserrat font from Google -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

    <!-- Bootstrap 5 CSS and JS -->
    <link href="../bootstrap5/css/bootstrap.min.css" rel="stylesheet">
    <script src="../bootstrap5/js/bootstrap.min.js"></script>

    <!-- Link to CSS file -->
     <link rel="stylesheet" href="landing.css">

    <title>Daven's Kitchenette</title>
</head>

<body>
    <!-- Header -->
    <div class="container-fluid d-flex align-items-center justify-content-between flex-wrap">
        <div class="position-relative d-inline-block" style="min-width:320px;">
            <div>
                <span class="davens-header fw-bold" style="line-height:1; display:block; position:relative;">
                    Daven's
                    <img src="../assets/image/davens_logo.png"
                        alt="Daven's Logo"
                        width="80"
                        height="70"
                        class="davens-logo"
                        style="position:absolute; left:185px; top:-18px;">
                </span>
                <span class="davens-header fw-bold" style="line-height:1; display:block;">Kitchenette</span>
            </div>
        </div>
        <nav class="navbar navbar-expand-lg navbar-dark">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto gap-3">
                    <li class="nav-item"><a class="nav-link fw-bold" style="font-size: 20px;" href="#home">Home</a></li>
                    <li class="nav-item"><a class="nav-link fw-bold" style="font-size: 20px;" href="#about">About</a></li>
                    <li class="nav-item"><a class="nav-link fw-bold" style="font-size: 20px;" href="#gallery">Gallery</a></li>
                    <li class="nav-item"><a class="nav-link fw-bold" style="font-size: 20px;" href="#feedback">Feedback</a></li>
                    <li class="nav-item"><a class="nav-link fw-bold" style="font-size: 20px;" href="#contact">Contact Us</a></li>
                </ul>
            </div>
        </nav>
    </div>

    <!-- Home Section -->
    <div id="home">
        <div class="container-fluid home-stick"></div>
        <span class="d-block text-center catchy-intro responsive-text">SERVING PULUTAN, SILOG, <br> COFFEE AND MORE...<br>
        <span class="responsive-text"> ————— Since 2020 ————— </span>
        </span>
        <div class="container-fluid home-stick"></div>
    </div>

    <!-- Hero Section -->
    <div id="hero" class="hero-section">
        <div class="container">
            <div class="row align-items-center">
                <!-- Text Column -->
                <div class="col-12 col-md-6 text-center text-md-start">
                    <h2 class="hero-heading">
                    Savor the delicious <br>
                    meals without<br>
                    breaking the bank!
                    </h2>
                    <div class="hero-divider mx-auto mx-md-0"></div>
                    <a href="#menu" class="btn hero-btn">SEE MENU</a>
                </div>

                <!-- Image Column -->
                <div class="col-12 col-md-6 d-flex justify-content-center position-relative">
                    <div class="fries-wrapper">
                    <div class="hero-oval"></div>
                    <img src="../assets/image/friesimg.png" alt="Fries" class="fries-img">
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="container-fluid home-stick"></div>


      
<!-- Menu Section -->
<div class="container-fluid menu-part" id="menu">
    <div class="row">
        <!-- LEFT MENU BUTTONS -->
        <div class="col-12 col-md-4">
            <h1 class="fw-bold text-shadow-angled menu-text">Our Menu</h1>
            <p class="fw-bold what-popular">What's Popular?</p>

            <button type="button" class="btn rounded-pill menu-button fw-bold border-3 mb-2 active" data-filter="bento">
                Bento Silog
            </button>
            <br class="d-none d-md-block">
            <button type="button" class="btn rounded-pill menu-button fw-bold border-3 mb-2" data-filter="burger">
                Burger & Sandwiches
            </button>
            <br class="d-none d-md-block">
            <button type="button" class="btn rounded-pill menu-button fw-bold border-3 mb-2" data-filter="wings">
                Flavored Wings & Rice
            </button>
            <br class="d-none d-md-block">
            <button type="button" class="btn rounded-pill menu-button fw-bold border-3 mb-2" data-filter="rice">
                Rice Meal
            </button>
            <br class="d-none d-md-block">
            <button type="button" class="btn rounded-pill menu-button fw-bold border-3 mb-2" data-filter="pulutan">
                Pulutan Express
            </button>
            <br class="d-none d-md-block">
            <button type="button" class="btn rounded-pill menu-button fw-bold border-3 mb-2" data-filter="beverages">
                Drinks
            </button>
            <br class="d-none d-md-block">
            <button type="button" class="btn rounded-pill menu-button fw-bold border-3 mb-2" data-filter="all">
                View All Menu
            </button>

            <p class="menu-description">Our menu is carefully crafted to satisfy every craving. From hearty classics and savory specialties to refreshing sides and delightful beverages, there's something here for everyone. Each dish is prepared fresh, made with quality ingredients, and served with care. Whether you're in the mood for a light snack, a full meal, or a sweet treat to end the day, you'll always find something to love at Daven's Kitchenette.</p>
        </div>

        <!-- RIGHT CARDS - This will be populated by JavaScript -->
        <div class="col-12 col-md-8">
            <div class="menu-items-container">
                <div class="menu-items-grid" id="menu-items-container">
                    <!-- Menu items will be loaded here dynamically -->
                    <div class="loading-state">
                        <div class="spinner-border text-warning" role="status">
                            <span class="visually-hidden">Loading menu...</span>
                        </div>
                        <p class="mt-2">Loading menu items...</p>
                    </div>
                </div>
                
                <!-- Navigation Arrows -->
                <div class="menu-navigation" id="menu-navigation" style="display: none;">
                    <button class="nav-arrow prev-arrow" id="prev-arrow" disabled>‹</button>
                    <div class="page-indicator" id="page-indicator">Page 1 of 1</div>
                    <button class="nav-arrow next-arrow" id="next-arrow" disabled>›</button>
                </div>
            </div>
        </div>
    </div>
</div>

    <!-- About Section -->
    <!-- Wave Divider -->
    <div class="about-section" id="about">
        <div class="wave-divider">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#efc858" fill-opacity="1" d="M0,160L17.1,160C34.3,160,69,160,103,149.3C137.1,139,171,117,206,106.7C240,96,274,96,309,117.3C342.9,139,377,181,411,208C445.7,235,480,245,514,224C548.6,203,583,149,617,160C651.4,171,686,245,720,234.7C754.3,224,789,128,823,106.7C857.1,85,891,139,926,176C960,213,994,235,1029,234.7C1062.9,235,1097,213,1131,192C1165.7,171,1200,149,1234,154.7C1268.6,160,1303,192,1337,192C1371.4,192,1406,160,1423,144L1440,128L1440,0L1422.9,0C1405.7,0,1371,0,1337,0C1302.9,0,1269,0,1234,0C1200,0,1166,0,1131,0C1097.1,0,1063,0,1029,0C994.3,0,960,0,926,0C891.4,0,857,0,823,0C788.6,0,754,0,720,0C685.7,0,651,0,617,0C582.9,0,549,0,514,0C480,0,446,0,411,0C377.1,0,343,0,309,0C274.3,0,240,0,206,0C171.4,0,137,0,103,0C68.6,0,34,0,17,0L0,0Z"></path></svg>
        </div>
        <div class="container-fluid position-relative py-5"> 
            <img src="../assets/image/davens_logo.png" alt="Daven's Logo" width="500" height="500" class="bg-logo1 img-responsive">
            <img src="../assets/image/davens_logo.png" alt="Daven's Logo" width="500" height="500" class="bg-logo2 img-responsive">
            <img src="../assets/image/davens_logo.png" alt="Daven's Logo" width="500" height="500" class="bg-logo3 img-responsive">
            

            <!-- About Header -->
            <div class="row d-flex align-items-center justify-content-center">
                <div class="col-md-6 text-center">
                    <!-- Bootstrap Carousel for About Section -->
                    <div id="aboutCarousel" class="carousel slide about-carousel" data-bs-ride="carousel">
                        <div class="carousel-inner">
                            <div class="carousel-item active">
                                <img src="../assets/image/davens_staff.jpg" class="d-block w-100 img-fluid rounded about-img" alt="Staff">
                            </div>
                            <div class="carousel-item">
                                <img src="../assets/image/bev1.jpg" class="d-block w-100 img-fluid rounded about-img" alt="Beverages">
                            </div>
                            <div class="carousel-item">
                                <img src="../assets/image/davens_ambiance_1.jpg" class="d-block w-100 img-fluid rounded about-img" alt="Ambiance">
                            </div>
                            <!-- Add more carousel-item blocks here if you want more images -->
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#aboutCarousel" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#aboutCarousel" data-bs-slide="next">
                            <span class="carousel-control-next-icon"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>

                <div class ="col-md-6 text-center">
                    <h1 class="fw-bold text-shadow-angled text-center mx-auto about-text responsive-text">STORY BEHIND THE KITCHENETTE</h1>
                    <p class="text-center about-text1"> Daven's Kitchenette was named after 'Daven,' the beloved son of the couple who is the founder of Daven's.</p>
                    <p class="text-center about-text2 m-4">We started small during the pandemic, cooking right from our home kitchen. Back then, it was all deliveries—no dine-in, just simple meals served straight from our garage with no fancy setup. Today, we're proud to welcome you to a cozy, homey, and chill space where you can enjoy your favorite comfort meals—made with the same love, just in a bigger and warmer place.</p>
                </div>

        </div>        
    </div>

    <!-- Gallery Section -->
    <div id="gallery" class="gallery-section">
        <div class="container">
            <div class="row">
                <div class="col-12 text-center">
                    <h2 class="gallery-title">Gallery</h2>
                    <p class="gallery-subtitle" style="color: #efc858;">Some photos from Our Restaurant</p>
                </div>
            </div>
            

            <div class="gallery-container">
                <div class="gallery-row top-row">
                    <div class="gallery-slide">
                        <img src="../assets/image/davens_ambiance_1.jpg" class="gallery-img">
                        <img src="../assets/image/davens_ambiance_2.jpg" class="gallery-img">
                        <img src="../assets/image/davens_ambiance_3.jpg" class="gallery-img">
                        <img src="../assets/image/davens_ambiance_4.jpg" class="gallery-img">
                        <img src="../assets/image/davens_staff.jpg" class="gallery-img">
                        <img src="../assets/image/meal1.jpg" class="gallery-img">
                        <img src="../assets/image/davens_ambiance_1.jpg" class="gallery-img">
                        <img src="../assets/image/davens_ambiance_2.jpg" class="gallery-img">
                        <img src="../assets/image/davens_ambiance_3.jpg" class="gallery-img">
                        <img src="../assets/image/davens_ambiance_4.jpg" class="gallery-img">
                        <img src="../assets/image/davens_staff.jpg" class="gallery-img">
                        <img src="../assets/image/meal1.jpg" class="gallery-img">
                    </div>
                </div>
                
                <div class="gallery-row bottom-row">
                    <div class="gallery-slide">
                        <img src="../assets/image/meal2.jpg" class="gallery-img">
                        <img src="../assets/image/meal3.jpg" class="gallery-img">
                        <img src="../assets/image/meal4.jpg" class="gallery-img">
                        <img src="../assets/image/bev1.jpg" class="gallery-img">
                        <img src="../assets/image/bev2.jpg" class="gallery-img">
                        <img src="../assets/image/bev3.jpg" class="gallery-img">
                        <img src="../assets/image/meal2.jpg" class="gallery-img">
                        <img src="../assets/image/meal3.jpg" class="gallery-img">
                        <img src="../assets/image/meal4.jpg" class="gallery-img">
                        <img src="../assets/image/bev1.jpg" class="gallery-img">
                        <img src="../assets/image/bev2.jpg" class="gallery-img">
                        <img src="../assets/image/bev3.jpg" class="gallery-img">
                    </div>
                </div>
            </div>
        </div>
    </div>

<!-- Feedback Section -->
<div id="feedback" class="testimonial-background">
    <section class="testimonial-section container">
        <h2 class="testimonial-title">Testimonials</h2>
        <div class="testimonial-divider"></div>
        <h3 class="testimonial-subtitle">What they're saying about us</h3>
        
        <div class="testimonial-container">
            <!-- Testimonials will be loaded dynamically here -->
            <div class="loading-state text-center py-5">
                <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">Loading testimonials...</span>
                </div>
                <p class="mt-2">Loading testimonials...</p>
            </div>
        </div>

        <!-- Slider Controls -->
        <div class="slider-controls">
            <button class="prev-btn">‹</button>
            <div class="dots">
            </div>
            <button class="next-btn">›</button>
        </div>
    </section>
</div>
    <script src="landing.js"></script>

<footer class="footer">
    <div class="footer-overlay">
        <div class="footer-container">

            <!-- Left Side Logo -->
            <div class="footer-logo">
                <img src="../assets/image/davens_logo.png" class="logo-img" >
                <h2>Daven's <span>Kitchenette</span></h2>
                <p>© 2025 Daven's Kitchenette. All rights reserved.</p>
            </div>

            <!-- Middle Links -->
            <div class="footer-links">
                <h3>Explore</h3>
                <div class="link-columns">
                    <ul>
                        <li><a href="#">Our Menu</a></li>
                        <li><a href="#">Story Behind the Kitchenette</a></li>
                    </ul>
                    <ul>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">FAQ</a></li>
                    </ul>
                </div>
                <p class="address">
                    146 Consuelo St, Brgy 8, Nasugbu, 4231 Batangas <br>
                    Hours: 10:00 AM - 2:00 AM
                </p>
            </div>

            <!-- Right Side: Social -->
            <div class="footer-social">
                <h3>Follow Us</h3>
                <div class="social-icons">
                    <a href="#"><img src="../assets/image/facebook.png"></a>
                    <a href="#"><img src="../assets/image/instagram.png" ></a>
                </div>
            </div>
        </div>
    </div>
</footer>

   
</body>
</html>