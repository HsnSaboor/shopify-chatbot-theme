/**
 * Shopify Chatbot Integration - Enhanced Version
 * Upload this to your Shopify theme assets folder
 */
(function() {
  'use strict';

  console.log('[Shopify Integration] Initializing enhanced chatbot integration...');

  // Global message handler for parent window communications
  window.addEventListener('message', function(event) {
    if (window.ShopifyMainIntegration && window.ShopifyMainIntegration.handleMessage) {
      window.ShopifyMainIntegration.handleMessage(event);
    }
  });

  // Wait for all dependencies to load before initializing
  function waitForMainDependencies() {
    if (typeof window.ShopifyMainIntegration === 'undefined' || 
        typeof window.ShopifyDependencyChecker === 'undefined') {
      console.log('[Shopify Integration] Waiting for main dependencies...');
      setTimeout(waitForMainDependencies, 100);
      return;
    }

    console.log('[Shopify Integration] Main dependencies loaded, starting dependency check...');
    window.ShopifyDependencyChecker.start();
  }

  // Start the process
  console.log('[Shopify Integration] Starting main dependency check...');
  waitForMainDependencies();
})();