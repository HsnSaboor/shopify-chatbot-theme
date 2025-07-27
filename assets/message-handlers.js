
/**
 * Message Handlers Module
 * Handles all message types and communication with chatbot iframe
 */
(function() {
  'use strict';

  console.log('[Message Handlers] Initializing message handlers...');

  function handleConversationAction(event, action, conversationId, name) {
    console.log('[Shopify Integration] Handling conversation action:', action);

    if (!window.ShopifyAPIClient) {
      console.error('[Shopify Integration] ShopifyAPIClient not available');
      event.source.postMessage({
        type: 'CONVERSATION_RESULT',
        data: {
          action,
          conversationId,
          error: 'ShopifyAPIClient not available',
          success: false
        }
      }, '*');
      return;
    }

    let apiPromise;
    switch (action) {
      case 'save':
        apiPromise = window.ShopifyAPIClient.saveConversation(conversationId, name);
        break;
      case 'fetch_all':
        apiPromise = window.ShopifyAPIClient.fetchAllConversations();
        break;
      case 'fetch_history':
        apiPromise = window.ShopifyAPIClient.fetchConversationHistory(conversationId);
        break;
      default:
        console.warn('[Shopify Integration] Unknown conversation action:', action);
        event.source.postMessage({
          type: 'CONVERSATION_RESULT',
          data: {
            action,
            conversationId,
            error: `Unknown action: ${action}`,
            success: false
          }
        }, '*');
        return;
    }

    apiPromise
      .then(result => {
        event.source.postMessage({
          type: 'CONVERSATION_RESULT',
          data: {
            action,
            conversationId,
            result,
            success: true
          }
        }, '*');
      })
      .catch(error => {
        console.error('[Shopify Integration] Error handling conversation action:', error);
        event.source.postMessage({
          type: 'CONVERSATION_RESULT',
          data: {
            action,
            conversationId,
            error: error.message,
            success: false
          }
        }, '*');
      });
  }

  function handleChatMessage(event, message) {
    console.log('[Shopify Integration] Handling chat message:', message);

    if (!window.ShopifyAPIClient) {
      console.error('[Shopify Integration] ShopifyAPIClient not available');
      event.source.postMessage({
        type: 'CHAT_RESULT',
        data: {
          message,
          error: 'ShopifyAPIClient not available',
          success: false
        }
      }, '*');
      return;
    }

    window.ShopifyAPIClient.sendMessage(message)
      .then(result => {
        event.source.postMessage({
          type: 'CHAT_RESULT',
          data: {
            message,
            result,
            success: true
          }
        }, '*');
      })
      .catch(error => {
        console.error('[Shopify Integration] Error sending chat message:', error);
        event.source.postMessage({
          type: 'CHAT_RESULT',
          data: {
            message,
            error: error.message,
            success: false
          }
        }, '*');
      });
  }

  function sendMessageToChatbot(message) {
    const chatbotIframe = document.getElementById('chatbot');
    if (chatbotIframe && chatbotIframe.contentWindow) {
      chatbotIframe.contentWindow.postMessage(message, '*');
    } else {
      console.error('[Shopify Integration] Chatbot iframe not found or not ready to receive messages.');
    }
  }

  // Expose to global scope
  window.ShopifyMessageHandlers = {
    handleConversationAction: handleConversationAction,
    handleChatMessage: handleChatMessage,
    sendMessageToChatbot: sendMessageToChatbot
  };

  console.log('[Message Handlers] Message handlers loaded successfully');
})();
