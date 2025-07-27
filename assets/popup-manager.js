
/**
 * Popup Manager - Handles cart success popup UI
 */
(function() {
  'use strict';

  window.ShopifyPopupManager = {
    showCartPopup: function(cartData, productName, productPrice) {
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
      this.updateCartTotal();

      // Auto close after 5 seconds
      setTimeout(() => {
        this.closeCartPopup();
      }, 5000);
    },

    updateCartTotal: function() {
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
    },

    closeCartPopup: function() {
      const popup = document.getElementById('chatbot-cart-popup');
      if (popup) {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 200);
      }
    }
  };

  // Global functions for popup
  window.closeChatbotCartPopup = function() {
    window.ShopifyPopupManager.closeCartPopup();
  };

  window.goToCart = function() {
    window.location.href = '/cart';
  };
})();
