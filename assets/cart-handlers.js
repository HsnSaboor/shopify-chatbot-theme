
/**
 * Cart Handlers Module
 * Handles add to cart functionality and cart popup
 */
(function() {
  'use strict';

  console.log('[Cart Handlers] Initializing cart handlers...');

  function handleAddToCart(event, payload) {
    console.log('[Shopify Integration] Processing add to cart:', payload);

    const { variantId, quantity = 1, redirect = false, productName, productPrice } = payload;

    if (!variantId) {
      console.error('[Shopify Integration] No variantId provided for add to cart');
      event.source.postMessage({
        type: 'add-to-cart-error',
        error: 'No variant ID provided'
      }, '*');
      return;
    }

    // Use Shopify's AJAX Cart API
    const formData = new FormData();
    formData.append('id', variantId);
    formData.append('quantity', quantity);

    console.log('[Shopify Integration] Adding to cart - variantId:', variantId, 'quantity:', quantity);

    fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('[Shopify Integration] Successfully added to cart:', data);

      // Notify the chatbot of success
      event.source.postMessage({
        type: 'add-to-cart-success',
        variantId: variantId,
        data: data
      }, '*');

      // Show cart popup instead of redirecting
      if (!redirect) {
        showCartPopup(data, productName, productPrice);
      } else {
        console.log('[Shopify Integration] Redirecting to cart page...');
        window.location.href = '/cart';
      }
    })
    .catch(error => {
      console.error('[Shopify Integration] Error adding to cart:', error);

      // Notify the chatbot of error
      event.source.postMessage({
        type: 'add-to-cart-error',
        variantId: variantId,
        error: error.message
      }, '*');
    });
  }

  function showCartPopup(cartData, productName, productPrice) {
    console.log('[Shopify Integration] Showing cart popup for:', productName);

    // Remove existing popup if any
    const existingPopup = document.getElementById('chatbot-cart-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // Create popup HTML
    const popup = document.createElement('div');
    popup.id = 'chatbot-cart-popup';
    popup.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      ">
        <div style="
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.3s ease-out;
        ">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="
              width: 48px;
              height: 48px;
              background: #10b981;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 12px auto;
            ">
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #111827;">
              Added to Cart!
            </h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              ${productName || 'Product'} has been added to your cart
            </p>
          </div>
          
          <div style="
            background: #f9fafb;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
          ">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 14px; color: #374151;">Cart Total:</span>
              <span style="font-weight: 600; color: #111827;" id="cart-total">
                Loading...
              </span>
            </div>
          </div>

          <div style="display: flex; gap: 12px;">
            <button onclick="closeChatbotCartPopup()" style="
              flex: 1;
              padding: 12px 16px;
              border: 1px solid #d1d5db;
              background: white;
              color: #374151;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            " onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
              Continue Shopping
            </button>
            <button onclick="goToCart()" style="
              flex: 1;
              padding: 12px 16px;
              border: none;
              background: #111827;
              color: white;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            " onmouseover="this.style.background='#374151'" onmouseout="this.style.background='#111827'">
              View Cart
            </button>
          </div>
        </div>
      </div>
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(popup);

    // Update cart total
    updateCartTotal();

    // Auto close after 5 seconds
    setTimeout(() => {
      closeChatbotCartPopup();
    }, 5000);
  }

  function updateCartTotal() {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        const totalElement = document.getElementById('cart-total');
        if (totalElement) {
          const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: cart.currency || 'USD'
          });
          totalElement.textContent = formatter.format(cart.total_price / 100);
        }
      })
      .catch(error => {
        console.error('[Shopify Integration] Error fetching cart total:', error);
        const totalElement = document.getElementById('cart-total');
        if (totalElement) {
          totalElement.textContent = 'Error loading total';
        }
      });
  }

  function handleProductNavigation(event, payload) {
    console.log('[Shopify Integration] Processing product navigation:', payload);

    const { productUrl, productHandle } = payload;

    if (!productUrl && !productHandle) {
      console.error('[Shopify Integration] No product URL or handle provided');
      return;
    }

    // Navigate to product page
    try {
      const targetUrl = productUrl || `/products/${productHandle}`;
      console.log('[Shopify Integration] Navigating to product page:', targetUrl);
      window.location.href = targetUrl;
    } catch (error) {
      console.error('[Shopify Integration] Error navigating to product:', error);
    }
  }

  // Global functions for popup
  window.closeChatbotCartPopup = function() {
    const popup = document.getElementById('chatbot-cart-popup');
    if (popup) {
      popup.style.opacity = '0';
      setTimeout(() => popup.remove(), 200);
    }
  };

  window.goToCart = function() {
    window.location.href = '/cart';
  };

  // Expose to global scope
  window.ShopifyCartHandlers = {
    handleAddToCart: handleAddToCart,
    handleProductNavigation: handleProductNavigation,
    showCartPopup: showCartPopup,
    updateCartTotal: updateCartTotal
  };

  console.log('[Cart Handlers] Cart handlers loaded successfully');
})();
