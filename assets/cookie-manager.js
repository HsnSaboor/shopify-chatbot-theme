
/**
 * Cookie Management Module
 * Handles all cookie-related operations for Shopify session
 */
(function() {
  'use strict';

  function getAllCookies() {
    const cookies = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  }

  function getShopifySessionId() {
    console.log('[Session Manager] Looking for Shopify session cookies...');
    
    const cookies = getAllCookies();
    console.log('[Session Manager] Available cookies:', Object.keys(cookies));
    
    // Suppress cookie domain warnings for Shopify cookies as these are expected in iframe context
    const originalConsoleWarn = console.warn;
    console.warn = function(...args) {
      const message = args.join(' ');
      if (message.includes('Cookie') && message.includes('has been rejected for invalid domain')) {
        // Silently ignore these expected warnings
        return;
      }
      originalConsoleWarn.apply(console, args);
    };

    // Try multiple possible Shopify session cookies in order of preference
    const possibleSessionCookies = [
      '_shopify_y',
      '_shopify_s', 
      '_shopify_sa_p',
      '_shopify_sa_t',
      'cart',
      '_secure_session_id',
      'secure_customer_sig',
      '_shopify_tw',
      '_shopify_m'
    ];

    for (const cookieName of possibleSessionCookies) {
      if (cookies[cookieName]) {
        console.log('[Session Manager] Found session cookie:', cookieName, '=', cookies[cookieName].substring(0, 20) + '...');
        return cookies[cookieName];
      }
    }

    // Try to get from Shopify global variables
    if (window.Shopify && window.Shopify.shop) {
      const shopifySessionId = `shopify_${window.Shopify.shop}_${Date.now()}`;
      console.log('[Session Manager] Generated session from Shopify.shop:', shopifySessionId);
      return shopifySessionId;
    }

    // Try to extract from cart token
    if (window.CartJS && window.CartJS.cart && window.CartJS.cart.token) {
      const cartSessionId = `cart_${window.CartJS.cart.token}`;
      console.log('[Session Manager] Generated session from cart token:', cartSessionId);
      return cartSessionId;
    }

    // Check localStorage for any Shopify data
    try {
      const localStorageKeys = Object.keys(localStorage);
      for (const key of localStorageKeys) {
        if (key.includes('shopify') || key.includes('cart')) {
          const value = localStorage.getItem(key);
          if (value && value.length > 10) {
            console.log('[Session Manager] Found localStorage session:', key);
            return `ls_${btoa(value).slice(0, 16)}_${Date.now()}`;
          }
        }
      }
    } catch (e) {
      console.warn('[Session Manager] Could not access localStorage:', e);
    }

    // As last resort, create a stable session based on shop domain and browser fingerprint
    const shopDomain = window.location.hostname;
    const browserFingerprint = navigator.userAgent + navigator.language + screen.width + screen.height + window.location.pathname;
    const sessionId = `session_${btoa(shopDomain + browserFingerprint).slice(0, 16)}_${Date.now()}`;
    console.log('[Session Manager] Generated fallback session ID:', sessionId);
    return sessionId;
  }

  // Expose to global scope
  window.ShopifyCookieManager = {
    getAllCookies: getAllCookies,
    getShopifySessionId: getShopifySessionId
  };

  console.log('[Cookie Manager] Cookie manager loaded successfully');
})();
