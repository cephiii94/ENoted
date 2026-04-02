       // Add this to your existing script.js file or create a new one

// Function to show category popup with custom message
function showPopup(category) {
    // You can customize the message based on the category
    let message;
    
    switch(category) {
        case 'Islam':
            message = 'Kategori Islam berisi artikel tentang ajaran, nilai, dan praktik Islam dalam kehidupan sehari-hari.';
            break;
        case 'Teknologi':
            message = 'Kategori Teknologi berisi artikel tentang perkembangan teknologi terbaru dan pengaruhnya.';
            break;
        case 'Kesehatan':
            message = 'Kategori Kesehatan berisi tips dan informasi untuk menjaga kesehatan fisik dan mental.';
            break;
        default:
            message = 'Anda telah mengklik kategori: ' + category;
    }
    
    document.getElementById('popupMessage').textContent = message;
    document.getElementById('popupOverlay').style.display = 'block';
    document.getElementById('popupNotification').style.display = 'block';
    
    // Add accessibility focus
    document.getElementById('popupNotification').setAttribute('tabindex', '-1');
    document.getElementById('popupNotification').focus();
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
}

// Function to close the popup
function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
    document.getElementById('popupNotification').style.display = 'none';
    
    // Re-enable scrolling
    document.body.style.overflow = '';
}

// Close popup when Escape key is pressed
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && document.getElementById('popupNotification').style.display === 'block') {
        closePopup();
    }
});

// Initialize popup handlers when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Close popup when overlay is clicked
    document.getElementById('popupOverlay').addEventListener('click', closePopup);
    
    // Make all category links trigger the popup
    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const category = this.textContent;
            showPopup(category);
        });
        
        // For accessibility, make it work with keyboard too
        link.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const category = this.textContent;
                showPopup(category);
            }
        });
        
        // Add tabindex to make it focusable
        link.setAttribute('tabindex', '0');
    });
});
        