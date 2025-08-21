document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('purchaseModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    const closeBtn = document.querySelector('.close');
    const purchaseForm = document.getElementById('purchaseForm');
    
    let currentProduct = '';
    let currentSize = '';
    let currentPrice = '';

    // Handle size selection
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('size-btn')) {
            const productCard = e.target.closest('.product-card');
            const sizeButtons = productCard.querySelectorAll('.size-btn');
            const buyButton = productCard.querySelector('.buy-btn');
            
            // Remove selected class from all size buttons in this product
            sizeButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            e.target.classList.add('selected');
            
            // Update buy button
            const selectedSize = e.target.dataset.size;
            buyButton.textContent = 'Acquista ora';
            buyButton.disabled = false;
            buyButton.dataset.selectedSize = selectedSize;
        }
    });

    // Handle buy button click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('buy-btn') && !e.target.disabled) {
            const selectedSize = e.target.dataset.selectedSize;
            if (!selectedSize) {
                alert('Seleziona una taglia prima di procedere');
                return;
            }
            
            currentProduct = e.target.dataset.product;
            currentSize = selectedSize;
            currentPrice = e.target.dataset.price;
            
            // Update modal
            modalTitle.textContent = `${currentProduct} - EU ${currentSize}`;
            submitBtn.textContent = `Completa l'acquisto - €${currentPrice}`;
            
            // Show modal
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    });

    // Close modal
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Handle form submission
    purchaseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(purchaseForm);
        const orderData = {
            product: currentProduct,
            size: currentSize,
            price: currentPrice,
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

        // Send data to backend
        fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                showSuccessMessage();
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                purchaseForm.reset();
            } else {
                alert('Errore durante l\'elaborazione dell\'ordine. Riprova.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Errore di connessione. Riprova.');
        });
    });

    // Format card number input
    document.getElementById('numeroCarta').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        if (formattedValue !== e.target.value) {
            e.target.value = formattedValue;
        }
    });

    // Format expiry date input
    document.getElementById('scadenza').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });

    // Format CVV input
    document.getElementById('cvv').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
    });
});


    // Show success message function
    function showSuccessMessage() {
        // Create success overlay and message if they don't exist
        let successOverlay = document.getElementById('successOverlay');
        let successMessage = document.getElementById('successMessage');
        
        if (!successOverlay) {
            successOverlay = document.createElement('div');
            successOverlay.id = 'successOverlay';
            successOverlay.className = 'success-overlay';
            document.body.appendChild(successOverlay);
        }
        
        if (!successMessage) {
            successMessage = document.createElement('div');
            successMessage.id = 'successMessage';
            successMessage.className = 'success-message';
            successMessage.innerHTML = `
                <span class="checkmark">✅</span>
                <div>Ordine completato con successo!</div>
                <div style="font-size: 14px; margin-top: 10px; opacity: 0.9;">Grazie per il tuo acquisto</div>
            `;
            document.body.appendChild(successMessage);
        }
        
        // Show the success message
        successOverlay.classList.add('show');
        successMessage.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            successOverlay.classList.remove('show');
            successMessage.classList.remove('show');
        }, 3000);
    }

