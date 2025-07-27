/**
 * Shopify Session Manager - Enhanced Version
 * Upload this to your Shopify theme assets folder
 */
(function() {
  'use strict';

  console.log('[Shopify Session Manager] Initializing enhanced session manager...');

  let sessionData = null;
  let conversationId = null;

  function generateConversationId(sessionId) {
    if (conversationId) {
      return conversationId;
    }
    const timestamp = Date.now();
    conversationId = `conv_${sessionId}_${timestamp}`;
    return conversationId;
  }

  function initializeSession() {
    console.log('[Session Manager] Initializing session...');

    const sessionId = window.ShopifyCookieManager.getShopifySessionId();
    const cartCurrency = window.ShopifyContextManager.getCartCurrency();
    const localization = window.ShopifyContextManager.getLocalization();
    const pageContext = window.ShopifyContextManager.getPageContext();
    const shopifyContext = window.ShopifyContextManager.getShopifyContext();

    sessionData = {
      session_id: sessionId,
      source_url: window.location.href,
      page_context: pageContext,
      cart_currency: cartCurrency,
      localization: localization,
      shopify_context: shopifyContext,
      timestamp: new Date().toISOString()
    };

    console.log('[Session Manager] Session initialized:', sessionData);
    return sessionData;
  }

  function getSessionData() {
    return sessionData;
  }

  function isSessionValid() {
    return sessionData && sessionData.session_id && !sessionData.session_id.startsWith('fallback-');
  }

  function getConversationId() {
    if (!sessionData) return null;
    return generateConversationId(sessionData.session_id);
  }

  function waitForDependencies() {
    if (typeof window.ShopifyCookieManager === 'undefined' || 
        typeof window.ShopifyContextManager === 'undefined') {
      console.log('[Session Manager] Waiting for dependencies...');
      setTimeout(waitForDependencies, 100);
      return;
    }

    console.log('[Session Manager] Dependencies loaded, exposing session manager...');

    // Expose to global scope
    window.ShopifySessionManager = {
      initialize: initializeSession,
      getSessionData: getSessionData,
      getConversationId: getConversationId,
      isValid: isSessionValid
    };

    console.log('[Session Manager] Enhanced session manager loaded successfully');
  }

  // Start dependency check
  waitForDependencies();
})();