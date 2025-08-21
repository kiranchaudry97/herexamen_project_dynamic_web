/**
 * Enhance image loading with proper animation and display
 */
document.addEventListener('DOMContentLoaded', function() {
  // Initialize image loading
  function enhanceImages() {
    const images = document.querySelectorAll('.muur-kaart img, .leaflet-popup-content img');
    console.log('🖼️ Enhancing', images.length, 'images');
    
    images.forEach(img => {
      // Set initial state
      img.style.opacity = '0';
      
      // Check for image object URLs
      const src = img.getAttribute('src');
      if (src && src.includes('placeholder') && img.dataset.originalSrc) {
        img.src = img.dataset.originalSrc;
      }
      
      // Add loaded handler
      img.onload = function() {
        console.log('✅ Image loaded successfully:', img.src);
        img.classList.add('loaded');
        img.style.opacity = '1';
      };
      
      // Add error handler
      img.onerror = function() {
        console.log('❌ Image failed to load:', img.src);
        img.src = 'img/placeholder.jpg';
        img.onerror = null;
        setTimeout(() => { 
          img.style.opacity = '1';
        }, 100);
      };
      
      // Force reload if already loaded
      if (img.complete) {
        img.onload();
      }
    });
  }
  
  // Initial call
  enhanceImages();
  
  // Hook into mutations to catch new images
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        setTimeout(enhanceImages, 100);
      }
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});
