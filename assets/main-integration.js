
/**
 * Main Shopify Integration Handler
 * Handles parent window message communications
 */
(function() {
  'use strict';

  console.log('[Shopify Integration] Initializing main integration handler...');

  function handleParentWindowMessage(event) {
    console.log('[Shopify Integration] Received message from parent window:', event.data);

    if (!event.data || !event.data.type) {
      console.log('[Shopify Integration] Invalid message data received:', event.data);
      return;
    }

    const messageData = event.data;

    // Only handle messages from parent window, not iframe
    if (event.source === window.parent) {
      return; // Skip parent window messages to avoid duplicates
    }

    if (messageData.type === 'chat-response') {
      console.log('[Shopify Integration] Received chat response from webhook:', messageData.response);
      window.ShopifyMessageHandlers.sendMessageToChatbot({
        type: 'chat-response',
        response: messageData.response
      });
    } else if (messageData.type === 'conversations-response') {
      try {
        const conversations = typeof messageData.conversations === 'string' 
          ? JSON.parse(messageData.conversations)
          : messageData.conversations;
        console.log('[Shopify Integration] Sending conversations response:', conversations);
        window.ShopifyMessageHandlers.sendMessageToChatbot({
          type: 'conversations-response',
          conversations: conversations
        });
      } catch (error) {
        console.error('[Shopify Integration] Error processing conversations:', error);
        window.ShopifyMessageHandlers.sendMessageToChatbot({
          type: 'conversations-response',
          conversations: []
        });
      }
    } else {
      console.log('[Shopify Integration] Unknown message type:', messageData.type);
    }
  }

  function initializeParentWindowListener() {
    console.log('[Shopify Integration] Setting up parent window message listener...');
    window.addEventListener('message', handleParentWindowMessage);
  }

  // Expose to global scope
  window.ShopifyMainIntegration = {
    initialize: initializeParentWindowListener,
    handleMessage: handleParentWindowMessage
  };

  console.log('[Shopify Integration] Main integration handler loaded successfully');
})();
