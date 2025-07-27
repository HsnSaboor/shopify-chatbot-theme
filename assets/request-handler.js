
/**
 * HTTP Request Handler Module
 * Handles all HTTP requests for Shopify API client
 */
(function() {
  'use strict';

  console.log('[Request Handler] Initializing HTTP request handler...');

  async function makeRequest(url, options = {}) {
    try {
      console.log('[API Client] Making request to:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('[API Client] Request successful:', result);
      return result;
    } catch (error) {
      console.error('[API Client] Request failed:', error);
      throw error;
    }
  }

  // Expose to global scope
  window.ShopifyRequestHandler = {
    makeRequest: makeRequest
  };

  console.log('[Request Handler] HTTP request handler loaded successfully');
})();
