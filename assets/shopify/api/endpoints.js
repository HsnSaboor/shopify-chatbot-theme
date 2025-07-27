
/**
 * API Endpoints Configuration Module
 * Defines all API endpoints for Shopify integration
 */
(function() {
  'use strict';

  console.log('[API Endpoints] Initializing API endpoints configuration...');

  // Configuration
  const API_BASE_URL = 'https://v0-custom-chat-interface-kappa.vercel.app';
  const WEBHOOK_URL = 'https://similarly-secure-mayfly.ngrok-free.app/webhook/chat';
  
  const API_ENDPOINTS = {
    conversations: `${API_BASE_URL}/api/conversations`,
    conversationHistory: (id) => `${API_BASE_URL}/api/conversations/${id}`,
    saveConversation: `${API_BASE_URL}/api/conversations/save`,
    saveMessage: `${API_BASE_URL}/api/messages/save`,
    webhook: WEBHOOK_URL
  };

  // Expose to global scope
  window.ShopifyAPIEndpoints = API_ENDPOINTS;

  console.log('[API Endpoints] API endpoints configuration loaded successfully');
})();
