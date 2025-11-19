function updateProgressBar(currentStep) {
    console.log('Updating progress bar to step:', currentStep);
    
    // Get all dots and lines
    const dots = document.querySelectorAll('.progress-dot');
    const lines = document.querySelectorAll('.progress-line');
    
    // Reset all to inactive state
    dots.forEach((dot, index) => {
        dot.classList.remove('active', 'current');
        
        // Activate dots up to and including current step
        if (index + 1 <= currentStep) {
            dot.classList.add('active');
            
            // Add 'current' class to the current step for pulse animation
            if (index + 1 === currentStep) {
                dot.classList.add('current');
            }
        }
    });
    
    // Activate lines before current step
    lines.forEach((line, index) => {
        line.classList.remove('active');
        
        // Line index 0 is between step 1 and 2
        // Line index 1 is between step 2 and 3
        if (index + 1 < currentStep) {
            line.classList.add('active');
        }
    });
}

// Detect current page and set appropriate step
function initializeProgressBar() {
    const path = window.location.pathname.toLowerCase();
    let currentStep = 1; // Default to step 1
    
    // Determine step based on URL
    if (path.includes('get_order')) {
        currentStep = 1;
    } else if (path.includes('view_cart')) {
        currentStep = 2;
    } else if (path.includes('checkout')) {
        currentStep = 3;
    }
    
    // Update the progress bar
    updateProgressBar(currentStep);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProgressBar);
} else {
    // DOM is already loaded
    initializeProgressBar();
}

// Export for manual control (optional)
window.progressBar = {
    setStep: updateProgressBar
};