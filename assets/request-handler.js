
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
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Accept': 'application/json',
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
      
      // If CORS error, try to handle gracefully
      if (error.message.includes('CORS') || error.message.includes('NetworkError')) {
        console.warn('[API Client] CORS error detected, returning empty result');
        return { success: false, error: 'CORS_ERROR', data: [] };
      }
      
      throw error;
    }
  }

  // Expose to global scope
  window.ShopifyRequestHandler = {
    makeRequest: makeRequest
  };

  console.log('[Request Handler] HTTP request handler loaded successfully');
})();
