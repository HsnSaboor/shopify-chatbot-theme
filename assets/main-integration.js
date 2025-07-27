
/**
 * Main Shopify Integration Handler
 * Handles parent window message communications
 */
(function() {
  'use strict';

  console.log('[Shopify Integration] Initializing main integration handler...');

  function handleParentWindowMessage(event) {
    console.log('[Shopify Integration] Received message from parent window:', event.data);

    if (!event.data) {
      return;
    }

    const messageData = event.data;

    if (messageData.type === 'chat-response') {
      console.log('[Shopify Integration] Received chat response from webhook:', messageData.response);
      window.ShopifyMessageHandlers.sendMessageToChatbot({
        type: 'chat-response',
        response: messageData.response
      });
    } else if (messageData.type === 'conversations-response') {
      try {
        const conversations = JSON.parse(messageData.conversations);
        console.log('[Shopify Integration] Sending conversations response:', conversations);
        window.ShopifyMessageHandlers.sendMessageToChatbot({
          type: 'conversations-response',
          conversations: conversations
        });
      } catch (error) {
        console.error('[Shopify Integration] Error fetching conversations:', error);
        window.ShopifyMessageHandlers.sendMessageToChatbot({
          type: 'conversations-response',
          conversations: []
        });
      }
    } else if (messageData.type === 'send-chat-message') {
      console.log('[Shopify Integration] Handling chat message:', messageData.payload);
      window.ShopifyWebhookHandler.sendChatMessageToWebhook(messageData);
    } else if (messageData.type !== 'send-chat-message') {
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
