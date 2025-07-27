/**
 * Shopify API Client - Enhanced Version
 * Upload this to your Shopify theme assets folder
 */
(function() {
  'use strict';

  console.log('[Shopify API Client] Initializing enhanced API client...');

  async function sendMessage(message) {
    console.log('[API Client] Sending message to webhook:', message);

    if (!window.ShopifySessionManager) {
      throw new Error('ShopifySessionManager not available');
    }

    const sessionData = window.ShopifySessionManager.getSessionData();
    if (!sessionData) {
      throw new Error('No valid session data available');
    }

    const conversationId = window.ShopifySessionManager.getConversationId();

    const payload = {
      session_id: sessionData.session_id,
      message: message,
      timestamp: new Date().toISOString(),
      conversation_id: conversationId,
      source_url: sessionData.source_url,
      page_context: sessionData.page_context,
      cart_currency: sessionData.cart_currency,
      localization: sessionData.localization,
      type: 'text'
    };

    console.log('[API Client] Sending payload:', payload);

    const result = await window.ShopifyRequestHandler.makeRequest(window.ShopifyAPIEndpoints.webhook, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    console.log('[API Client] Message sent successfully:', result);
    return result;
  }

  async function saveConversation(conversationId, name) {
    console.log('[API Client] Saving conversation:', conversationId);

    if (!window.ShopifySessionManager) {
      throw new Error('ShopifySessionManager not available');
    }

    const sessionData = window.ShopifySessionManager.getSessionData();
    if (!sessionData) {
      throw new Error('No valid session data available');
    }

    const payload = {
      session_id: sessionData.session_id,
      conversation_id: conversationId,
      name: name || `Conversation ${new Date().toLocaleString()}`
    };

    const result = await window.ShopifyRequestHandler.makeRequest(window.ShopifyAPIEndpoints.saveConversation, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    console.log('[API Client] Successfully saved conversation:', result);
    return result;
  }

  async function fetchAllConversations() {
    console.log('[API Client] Fetching all conversations...');

    if (!window.ShopifySessionManager) {
      throw new Error('ShopifySessionManager not available');
    }

    const sessionData = window.ShopifySessionManager.getSessionData();
    if (!sessionData) {
      throw new Error('No valid session data available');
    }

    const url = `${window.ShopifyAPIEndpoints.conversations}?session_id=${encodeURIComponent(sessionData.session_id)}&t=${Date.now()}`;
    console.log('[API Client] Request URL:', url);

    const result = await window.ShopifyRequestHandler.makeRequest(url);
    console.log('[API Client] Conversations fetched successfully:', result);

    // Handle CORS error case
    if (result.error === 'CORS_ERROR') {
      console.warn('[API Client] CORS error when fetching conversations, returning empty array');
      return [];
    }

    return result.conversations || [];
  }

  async function fetchConversationHistory(conversationId) {
    console.log('[API Client] Fetching conversation history:', conversationId);

    if (!window.ShopifySessionManager) {
      throw new Error('ShopifySessionManager not available');
    }

    const sessionData = window.ShopifySessionManager.getSessionData();
    if (!sessionData) {
      throw new Error('No valid session data available');
    }

    const url = `${window.ShopifyAPIEndpoints.conversationHistory(conversationId)}?session_id=${encodeURIComponent(sessionData.session_id)}&t=${Date.now()}`;
    console.log('[API Client] Request URL:', url);

    const history = await window.ShopifyRequestHandler.makeRequest(url, { method: 'GET' });
    console.log('[API Client] Successfully fetched conversation history:', history);
    return history;
  }

  function waitForDependencies() {
    if (typeof window.ShopifyRequestHandler === 'undefined' || 
        typeof window.ShopifyAPIEndpoints === 'undefined') {
      console.log('[API Client] Waiting for dependencies...');
      setTimeout(waitForDependencies, 100);
      return;
    }

    console.log('[API Client] Dependencies loaded, exposing API client...');

    // Expose to global scope
    window.ShopifyAPIClient = {
      sendMessage: sendMessage,
      saveConversation: saveConversation,
      fetchAllConversations: fetchAllConversations,
      fetchConversationHistory: fetchConversationHistory
    };

    console.log('[API Client] Enhanced API client loaded successfully');
  }

  // Start dependency check
  waitForDependencies();
})();