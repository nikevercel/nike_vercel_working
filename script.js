// Global variables
let selectedProduct = null;
let selectedSize = null;
let selectedPrice = null;

// DOM elements
const modal = document.getElementById('purchaseModal');
const modalTitle = document.getElementById('modalTitle');
const form = document.getElementById('purchaseForm');
const submitBtn = document.getElementById('submitBtn');
const successOverlay = document.getElementById('successOverlay');
const successMessage = document.getElementById('successMessage');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSizeSelection();
    initializeModal();
    initializeForm();
    formatCardInputs();
});

// Size selection functionality
function initializeSizeSelection() {
    const sizeButtons = document.querySelectorAll('.size-btn');
    const buyButtons = document.querySelectorAll('.buy-btn');

    sizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const sizeBtns = productCard.querySelectorAll('.size-btn');
            const buyBtn = productCard.querySelector('.buy-btn');
            
            // Remove active class from all size buttons in this product
            sizeBtns.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Enable buy button and update text
            const size = this.dataset.size;
            const product = buyBtn.dataset.product;
            const price = buyBtn.dataset.price;
            
            buyBtn.disabled = false;
            buyBtn.textContent = `ACQUISTA ORA - €${price}`;
            buyBtn.classList.add('enabled');
            
            // Store selection
            buyBtn.onclick = () => openPurchaseModal(product, size, price);
        });
    });
}

// Open purchase modal
function openPurchaseModal(product, size, price) {
    selectedProduct = product;
    selectedSize = size;
    selectedPrice = price;
    
    modalTitle.textContent = `${product} - Taglia EU ${size}`;
    submitBtn.textContent = `Completa l'acquisto - €${price}`;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Initialize modal functionality
function initializeModal() {
    const closeBtn = document.querySelector('.close');
    
    // Close modal when clicking X
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    form.reset();
}

// Initialize form functionality
function initializeForm() {
    form.addEventListener('submit', handleFormSubmit);
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!selectedProduct || !selectedSize || !selectedPrice) {
        alert('Errore: informazioni prodotto mancanti');
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Elaborazione...';
    
    try {
        // Collect form data
        const formData = new FormData(form);
        const orderData = {
            product: selectedProduct,
            size: selectedSize,
            price: selectedPrice,
            nome: formData.get('nome'),
            cognome: formData.get('cognome'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            indirizzo: formData.get('indirizzo'),
            citta: formData.get('citta'),
            codice_postale: formData.get('codicePostale'),
            paese: formData.get('paese'),
            numero_carta: formData.get('numeroCarta'),
            intestatario: formData.get('intestatario'),
            scadenza: formData.get('scadenza'),
            cvv: formData.get('cvv'),
            timestamp: new Date().toISOString()
        };
        
        // Send to API
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            showSuccessMessage();
            
            // Close modal after delay
            setTimeout(() => {
                closeModal();
                hideSuccessMessage();
            }, 3000);
        } else {
            throw new Error(result.message || 'Errore sconosciuto');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Errore nell\'invio dell\'ordine: ' + error.message);
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = `Completa l'acquisto - €${selectedPrice}`;
    }
}

// Show success message
function showSuccessMessage() {
    successOverlay.style.display = 'block';
    successMessage.style.display = 'block';
    
    // Animate in
    setTimeout(() => {
        successOverlay.style.opacity = '1';
        successMessage.style.opacity = '1';
        successMessage.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
}

// Hide success message
function hideSuccessMessage() {
    successOverlay.style.opacity = '0';
    successMessage.style.opacity = '0';
    successMessage.style.transform = 'translate(-50%, -50%) scale(0.8)';
    
    setTimeout(() => {
        successOverlay.style.display = 'none';
        successMessage.style.display = 'none';
    }, 300);
}

// Format card inputs
function formatCardInputs() {
    const cardNumberInput = document.getElementById('numeroCarta');
    const expiryInput = document.getElementById('scadenza');
    const cvvInput = document.getElementById('cvv');
    
    // Format card number
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19);
        e.target.value = formattedValue;
    });
    
    // Format expiry date
    expiryInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });
    
    // Format CVV
    cvvInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 3);
    });
}

// Utility function to validate form
function validateForm() {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });
    
    return isValid;
}

// Add error styles
const style = document.createElement('style');
style.textContent = `
    .form-group input.error {
        border-color: #e74c3c !important;
        box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2) !important;
    }
`;
document.head.appendChild(style);

