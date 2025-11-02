// =============================
// INTERACTIVE HOVER EFFECTS
// =============================
document.addEventListener("DOMContentLoaded", () => {
  // Add hover effects for all order cards
  const cards = document.querySelectorAll(".order-card");

  cards.forEach(card => {
    // When mouse enters the card
    card.addEventListener("mouseenter", () => {
      card.style.transform = "scale(1.03)";
      card.style.transition = "all 0.2s ease";
      card.style.boxShadow = "0 4px 12px rgba(255, 255, 255, 0.2)";
    });

    // When mouse leaves the card
    card.addEventListener("mouseleave", () => {
      card.style.transform = "scale(1)";
      card.style.boxShadow = "none";
    });
  });

  // Add hover effect for buttons
  const buttons = document.querySelectorAll(".action-btn");

  buttons.forEach(btn => {
    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "scale(1.1)";
      btn.style.opacity = "0.9";
      btn.style.transition = "all 0.2s ease";
      btn.style.cursor = "pointer";
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "scale(1)";
      btn.style.opacity = "1";
    });

    // Click bounce animation
    btn.addEventListener("mousedown", () => {
      btn.style.transform = "scale(0.95)";
    });

    btn.addEventListener("mouseup", () => {
      btn.style.transform = "scale(1.1)";
      setTimeout(() => {
        btn.style.transform = "scale(1)";
      }, 100);
    });
  });
});
