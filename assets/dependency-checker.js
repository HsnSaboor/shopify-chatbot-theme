
/**
 * Shopify Dependency Checker
 * Ensures all required dependencies are loaded before initialization
 */
(function() {
  'use strict';

  console.log('[Shopify Integration] Initializing dependency checker...');

  function checkDependencies() {
    const requiredDependencies = [
      'ShopifySessionManager',
      'ShopifyAPIClient',
      'ShopifyMessageHandlers',
      'ShopifyCartHandlers',
      'ShopifySessionHandlers',
      'ShopifyIframeManager',
      'ShopifyWebhookHandler',
      'ShopifyPopupManager',
      'ShopifyInitialization'
    ];

    for (const dependency of requiredDependencies) {
      if (typeof window[dependency] === 'undefined') {
        return false;
      }
    }

    return true;
  }

  function waitForDependencies() {
    if (!checkDependencies()) {
      console.log('[Shopify Integration] Waiting for dependencies...');
      setTimeout(waitForDependencies, 100);
      return;
    }

    console.log('[Shopify Integration] All dependencies loaded, proceeding with initialization...');
    window.ShopifyInitialization.waitForDependencies();
  }

  function startDependencyCheck() {
    console.log('[Shopify Integration] Starting dependency check...');
    waitForDependencies();
  }

  // Expose to global scope
  window.ShopifyDependencyChecker = {
    check: checkDependencies,
    wait: waitForDependencies,
    start: startDependencyCheck
  };

  console.log('[Shopify Integration] Dependency checker loaded successfully');
})();
