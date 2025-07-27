
/**
 * Session Handlers Module
 * Handles session data, state management, and chatbot initialization
 */
(function() {
  'use strict';

  console.log('[Session Handlers] Initializing session handlers...');

  let initializationTimeout = null;
  let retryCount = 0;
  const MAX_RETRIES = 5;

  function sendSessionDataToChatbot() {
    console.log('[Shopify Integration] Attempting to send session data to chatbot iframe...');

    const chatbotIframe = document.getElementById('chatbot');
    if (!chatbotIframe || !chatbotIframe.contentWindow) {
      console.error('[Shopify Integration] Chatbot iframe not found or not loaded');

      // Retry logic
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`[Shopify Integration] Retrying in 2 seconds... (attempt ${retryCount}/${MAX_RETRIES})`);
        setTimeout(sendSessionDataToChatbot, 2000);
      }
      return;
    }

    if (!window.ShopifySessionManager) {
      console.error('[Shopify Integration] ShopifySessionManager not available');
      return;
    }

    const sessionData = window.ShopifySessionManager.getSessionData();
    if (!sessionData) {
      console.error('[Shopify Integration] No session data available to send');
      return;
    }

    console.log('[Shopify Integration] Sending session data to chatbot iframe');

    const messageData = {
      type: 'init',
      ...sessionData,
      conversation_id: window.ShopifySessionManager.getConversationId()
    };

    try {
      chatbotIframe.contentWindow.postMessage(messageData, '*');
      console.log('[Shopify Integration] Session data sent successfully:', messageData);
      retryCount = 0; // Reset retry count on success
    } catch (error) {
      console.error('[Shopify Integration] Error sending session data:', error);

      // Retry on error
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(sendSessionDataToChatbot, 2000);
      }
    }
  }

  function saveChatbotState(isOpen) {
    try {
      localStorage.setItem('chatbotOpen', isOpen ? 'true' : 'false');
      localStorage.setItem('chatbotStateTimestamp', Date.now().toString());
      console.log('[Shopify Integration] Chatbot state saved:', isOpen);
    } catch (error) {
      console.warn('[Shopify Integration] Failed to save chatbot state:', error);
    }
  }

  function restoreChatbotState() {
    try {
      const isOpen = localStorage.getItem('chatbotOpen') === 'true';
      const timestamp = localStorage.getItem('chatbotStateTimestamp');
      
      // Only restore state if it's recent (within 1 hour)
      const oneHour = 60 * 60 * 1000;
      const isRecent = timestamp && (Date.now() - parseInt(timestamp)) < oneHour;
      
      if (isOpen && isRecent) {
        console.log('[Shopify Integration] Restoring chatbot open state');
        // Let the iframe be created and then show it
        setTimeout(() => {
          const iframe = document.getElementById('chatbot');
          if (iframe) {
            iframe.style.display = 'block';
          }
        }, 1000);
      }
    } catch (error) {
      console.warn('[Shopify Integration] Failed to restore chatbot state:', error);
    }
  }

  function setupChatbotStateTracking() {
    // Track when chatbot is opened/closed
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const iframe = mutation.target;
          if (iframe.id === 'chatbot') {
            const isVisible = iframe.style.display !== 'none' && 
                             iframe.offsetWidth > 0 && 
                             iframe.offsetHeight > 0;
            saveChatbotState(isVisible);
          }
        }
      });
    });

    // Start observing
    const iframe = document.getElementById('chatbot');
    if (iframe) {
      observer.observe(iframe, { 
        attributes: true, 
        attributeFilter: ['style'] 
      });
    }
  }

  function initializeChatbot() {
    console.log('[Shopify Integration] Initializing chatbot...');

    // Clear any existing timeout
    if (initializationTimeout) {
      clearTimeout(initializationTimeout);
    }

    // Wait a bit for iframe to fully load
    initializationTimeout = setTimeout(() => {
      sendSessionDataToChatbot();
    }, 1000);

    console.log('[Shopify Integration] Chatbot system initialized.');
  }

  // Expose to global scope
  window.ShopifySessionHandlers = {
    sendSessionDataToChatbot: sendSessionDataToChatbot,
    saveChatbotState: saveChatbotState,
    restoreChatbotState: restoreChatbotState,
    setupChatbotStateTracking: setupChatbotStateTracking,
    initializeChatbot: initializeChatbot
  };

  console.log('[Session Handlers] Session handlers loaded successfully');
})();
