
/**
 * Iframe Manager - Handles chatbot iframe creation and lifecycle
 */
(function() {
  'use strict';

  window.ShopifyIframeManager = {
    createChatbotIframe: function() {
      console.log('[Shopify Integration] Creating chatbot iframe...');

      const iframe = document.createElement('iframe');
      iframe.id = 'chatbot';
      iframe.src = 'https://v0-custom-chat-interface-kappa.vercel.app/';
      iframe.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        height: 600px;
        border: none;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        background: white;
      `;
      iframe.title = 'Chatbot';
      iframe.allow = 'microphone';

      iframe.addEventListener('load', window.ShopifySessionHandlers.initializeChatbot);

      document.body.appendChild(iframe);
      console.log('[Shopify Integration] Chatbot iframe created and added to page');

      // Setup state tracking
      window.ShopifySessionHandlers.setupChatbotStateTracking();

      return iframe;
    },

    setupIframeDetection: function() {
      let chatbotIframe = document.getElementById('chatbot');

      if (chatbotIframe) {
        console.log('[Shopify Integration] Found existing chatbot iframe');
        chatbotIframe.addEventListener('load', window.ShopifySessionHandlers.initializeChatbot);

        // If already loaded, initialize immediately
        if (chatbotIframe.contentDocument && chatbotIframe.contentDocument.readyState === 'complete') {
          window.ShopifySessionHandlers.initializeChatbot();
        }
      } else {
        // Create the iframe if it doesn't exist
        chatbotIframe = this.createChatbotIframe();

        // Also watch for iframe being added by other scripts
        const observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === 1 && node.id === 'chatbot' && node !== chatbotIframe) {
                console.log('[Shopify Integration] Another chatbot iframe detected');
                node.addEventListener('load', window.ShopifySessionHandlers.initializeChatbot);
                observer.disconnect();
              }
            });
          });
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    }
  };
})();
