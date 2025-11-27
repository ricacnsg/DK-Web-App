let currentMenuItems = [];
let currentPage = 1;
let itemsPerPage = 6;

function filterMenu(filter) {
    document.querySelectorAll("[data-category]").forEach(item => {
        if (filter === "all" || item.getAttribute("data-category") === filter) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

async function fetchMenuItems(category = '') {
    try {
        const url = category && category !== 'all'
            ? `../controllers/landing_page.php?action=getMenuItems&category=${encodeURIComponent(category)}`
            : '../controllers/landing_page.php?action=getMenuItems';
            
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            console.error('Failed to load menu items:', result.message);
            return [];
        }
    } catch (error) {
        console.error('Error loading menu items:', error);
        return [];
    }
}

function renderMenuItems(menuItems, page = 1) {
    const menuGrid = document.getElementById('menu-items-container');
    const navigation = document.getElementById('menu-navigation');
    const prevArrow = document.getElementById('prev-arrow');
    const nextArrow = document.getElementById('next-arrow');
    const pageIndicator = document.getElementById('page-indicator');
    
    if (!menuGrid) {
        console.error('Menu grid container not found');
        return;
    }

    menuGrid.innerHTML = '';

    if (menuItems.length === 0) {
        menuGrid.innerHTML = `
            <div class="empty-state">
                <p class="text-muted">No items available in this category</p>
            </div>
        `;
        navigation.style.display = 'none';
        return;
    }

    const totalPages = Math.ceil(menuItems.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, menuItems.length);
    const currentItems = menuItems.slice(startIndex, endIndex);

    currentItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.setAttribute('data-category', item.category);

        menuItem.innerHTML = `
            <div class="card card-design border-3 text-center menu-name h-100 rounded-5">
                <div class="card-body mb-3">
                    <img src="${item.image}" alt="${item.name}" class="img-fluid rounded" 
                         onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/%3E%3Ctext fill=%22%23999%22 font-family=%22Arial%22 font-size=%2214%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E';">
                    <p class="menuitem-name">${item.name}</p>
                    <p class="menuitem-description">${item.desc}</p>
                    <p class="menuitem-price">Php ${item.price.toFixed(2)}</p>
                </div>
            </div>
        `;

        menuGrid.appendChild(menuItem);
    });

    if (totalPages > 1) {
        navigation.style.display = 'flex';
        prevArrow.disabled = page === 1;
        nextArrow.disabled = page === totalPages;
        pageIndicator.textContent = `Page ${page} of ${totalPages}`;
    } else {
        navigation.style.display = 'none';
    }
}

async function loadMenuByCategory(category) {
    const menuGrid = document.getElementById('menu-items-container');
    const navigation = document.getElementById('menu-navigation');
    
    menuGrid.innerHTML = `
        <div class="loading-state">
            <div class="spinner-border text-warning" role="status">
                <span class="visually-hidden">Loading menu...</span>
            </div>
            <p class="mt-2">Loading menu items...</p>
        </div>
    `;
    navigation.style.display = 'none';
    
    currentMenuItems = await fetchMenuItems(category);
    currentPage = 1;
    renderMenuItems(currentMenuItems, currentPage);
}

function nextPage() {
    const totalPages = Math.ceil(currentMenuItems.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderMenuItems(currentMenuItems, currentPage);
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderMenuItems(currentMenuItems, currentPage);
    }
}

async function fetchTestimonials() {
    try {
        const response = await fetch('../controllers/landing_page.php?action=getTestimonials');
        
        console.log('Fetching testimonials from:', '../controllers/landing_page.php?action=getTestimonials');
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Testimonials loaded successfully:', result.data.length);
            return result.data;
        } else {
            console.error('Failed to load testimonials:', result.message);
            return [];
        }
    } catch (error) {
        console.error('Error loading testimonials:', error);
        return [];
    }
}

function renderTestimonials(testimonials) {
    const testimonialContainer = document.querySelector('.testimonial-container');
    const dotsContainer = document.querySelector('.dots');
    const sliderControls = document.querySelector('.slider-controls');
    
    if (!testimonialContainer) {
        console.error('Testimonial container not found');
        return;
    }
    
    if (testimonials.length === 0) {
        testimonialContainer.innerHTML = `
            <div class="empty-testimonials text-center py-5">
                <p class="text-muted">No testimonials yet. Be the first to share your experience!</p>
            </div>
        `;
        if (sliderControls) sliderControls.style.display = 'none';
        return;
    }
    
    testimonialContainer.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';
    
    testimonials.forEach((testimonial, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.className = `testimonial-slide ${index === 0 ? 'active' : ''}`;
        
        slide.innerHTML = `
            <div class="testimonial-box">
                <p>${testimonial.feedback}</p>
                <div class="testimonial-profile">
                    <img src="../assets/image/davens_staff.jpg" alt="${testimonial.name || testimonial.username}"
                         onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Ccircle fill=%22%23efc858%22 cx=%2260%22 cy=%2260%22 r=%2260%22/%3E%3Ctext fill=%22%23fff%22 font-family=%22Arial%22 font-size=%2248%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${(testimonial.name || testimonial.username).charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E';">
                    <div class="testimonial-profile-info">
                        <h4>${testimonial.name || testimonial.username}</h4>
                        <small class="text-muted">${testimonial.date}</small>
                        ${testimonial.isUpdated ? 
                            `<small class="text-muted d-block">Updated: ${testimonial.updatedDate}</small>` : 
                            ''}
                    </div>
                </div>
            </div>
        `;
        
        testimonialContainer.appendChild(slide);
        
        if (dotsContainer) {
            const dot = document.createElement('span');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dot.setAttribute('data-slide', index);
            dotsContainer.appendChild(dot);
        }
    });
    
    initializeTestimonialSlider();
}

async function loadTestimonials() {
    const testimonialContainer = document.querySelector('.testimonial-container');
    
    if (!testimonialContainer) {
        console.error('Testimonial container not found on page');
        return;
    }
    
    testimonialContainer.innerHTML = `
        <div class="loading-state text-center py-5">
            <div class="spinner-border text-warning" role="status">
                <span class="visually-hidden">Loading testimonials...</span>
            </div>
            <p class="mt-2">Loading testimonials...</p>
        </div>
    `;
    
    const testimonials = await fetchTestimonials();
    renderTestimonials(testimonials);
}

function initializeMenu() {
    document.querySelectorAll(".menu-button[data-filter]").forEach(button => {
        button.addEventListener("click", async () => {
            const filter = button.getAttribute("data-filter");
            
            document.querySelectorAll(".menu-button").forEach(btn => {
                btn.classList.remove("active");
            });
            
            button.classList.add("active");
            
            await loadMenuByCategory(filter);
        });
    });

    const prevArrow = document.getElementById('prev-arrow');
    const nextArrow = document.getElementById('next-arrow');
    
    if (prevArrow) prevArrow.addEventListener('click', prevPage);
    if (nextArrow) nextArrow.addEventListener('click', nextPage);

    const firstButton = document.querySelector('.menu-button[data-filter]');
    if (firstButton) {
        firstButton.classList.add('active');
        loadMenuByCategory('bento');
    }
}

function initializeTestimonialSlider() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (slides.length === 0) {
        console.log('No testimonial slides found');
        return;
    }
    
    let currentSlide = 0;
    let slideInterval;

    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        if (slides[n]) {
            slides[n].classList.add('active');
        }
        if (dots[n]) {
            dots[n].classList.add('active');
        }
        currentSlide = n;
    }

    function nextSlide() {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    function prevSlide() {
        let prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }

    function startSlideShow() {
        if (slides.length > 1) {
            slideInterval = setInterval(nextSlide, 5000);
        }
    }

    function stopSlideShow() {
        clearInterval(slideInterval);
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => { 
            stopSlideShow(); 
            nextSlide(); 
            startSlideShow(); 
        });
        
        prevBtn.addEventListener('click', () => { 
            stopSlideShow(); 
            prevSlide(); 
            startSlideShow(); 
        });

        dots.forEach(dot => {
            dot.addEventListener('click', function() {
                stopSlideShow();
                showSlide(parseInt(this.getAttribute('data-slide')));
                startSlideShow();
            });
        });

        const testimonialSection = document.querySelector('.testimonial-section');
        if (testimonialSection) {
            testimonialSection.addEventListener('mouseenter', stopSlideShow);
            testimonialSection.addEventListener('mouseleave', startSlideShow);
        }

        startSlideShow();
    }
}

function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing landing page...');
    initializeMenu();
    initializeSmoothScrolling();
    loadTestimonials();

    const menuButtons = document.querySelectorAll('.menu-button');
    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.getAttribute('data-filter') === 'all') {
                window.location.href = '../online_ordering_system/get_order/get_order.php';
            }
        });
    });
});