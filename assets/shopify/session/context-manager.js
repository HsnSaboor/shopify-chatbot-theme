
/**
 * Context Management Module
 * Handles detection of Shopify store context, currency, localization, etc.
 */
(function() {
  'use strict';

  function getCartCurrency() {
    // Try multiple sources for cart currency
    if (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) {
      return window.Shopify.currency.active;
    }
    
    if (window.theme && window.theme.moneyFormat) {
      const match = window.theme.moneyFormat.match(/\{\{\s*amount\s*\|\s*money_with_currency:\s*'([^']+)'/);
      if (match) return match[1];
    }

    if (window.CartJS && window.CartJS.cart && window.CartJS.cart.currency) {
      return window.CartJS.cart.currency;
    }

    // Check meta tags
    const currencyMeta = document.querySelector('meta[name="currency"]') || document.querySelector('meta[property="product:price:currency"]');
    if (currencyMeta) {
      return currencyMeta.getAttribute('content');
    }

    // Try to extract from price elements
    const priceElements = document.querySelectorAll('[class*="price"], [class*="money"], [data-currency]');
    for (const element of priceElements) {
      const currency = element.getAttribute('data-currency');
      if (currency) return currency;
      
      const text = element.textContent || '';
      const currencyMatch = text.match(/([A-Z]{3})/);
      if (currencyMatch) return currencyMatch[1];
    }

    return 'USD'; // Default fallback
  }

  function getLocalization() {
    // Try multiple sources for localization
    if (window.Shopify && window.Shopify.locale) {
      return window.Shopify.locale;
    }
    
    if (document.documentElement.lang) {
      return document.documentElement.lang;
    }

    // Check meta tags
    const langMeta = document.querySelector('meta[name="language"]') || document.querySelector('meta[http-equiv="content-language"]');
    if (langMeta) {
      return langMeta.getAttribute('content');
    }

    // Try to get from URL
    const pathMatch = window.location.pathname.match(/^\/([a-z]{2}(-[A-Z]{2})?)\//);
    if (pathMatch) {
      return pathMatch[1];
    }

    return navigator.language || 'en'; // Browser language as fallback
  }

  function getPageContext() {
    let pageContext = document.title || 'Unknown Page';
    
    // Enhanced page context detection
    if (window.meta && window.meta.page) {
      if (window.meta.page.pageType) {
        pageContext = `${window.meta.page.pageType}: ${pageContext}`;
      }
      if (window.meta.page.resourceType) {
        pageContext += ` (${window.meta.page.resourceType})`;
      }
    }

    // Check for product page
    if (window.location.pathname.includes('/products/')) {
      pageContext = `Product: ${pageContext}`;
    } else if (window.location.pathname.includes('/collections/')) {
      pageContext = `Collection: ${pageContext}`;
    } else if (window.location.pathname.includes('/cart')) {
      pageContext = `Cart: ${pageContext}`;
    } else if (window.location.pathname === '/') {
      pageContext = `Home: ${pageContext}`;
    }

    return pageContext;
  }

  function getShopifyContext() {
    const context = {};
    
    if (window.Shopify) {
      if (window.Shopify.shop) context.shop = window.Shopify.shop;
      if (window.Shopify.theme) context.theme = window.Shopify.theme;
      if (window.Shopify.routes) context.routes = window.Shopify.routes;
      if (window.Shopify.cdnHost) context.cdnHost = window.Shopify.cdnHost;
    }

    // Get cart information
    if (window.CartJS && window.CartJS.cart) {
      context.cart = {
        token: window.CartJS.cart.token,
        item_count: window.CartJS.cart.item_count,
        total_price: window.CartJS.cart.total_price
      };
    }

    // Get customer information if available
    if (window.customer) {
      context.customer = {
        id: window.customer.id,
        email: window.customer.email,
        tags: window.customer.tags
      };
    }

    return context;
  }

  // Expose to global scope
  window.ShopifyContextManager = {
    getCartCurrency: getCartCurrency,
    getLocalization: getLocalization,
    getPageContext: getPageContext,
    getShopifyContext: getShopifyContext
  };

  console.log('[Context Manager] Context manager loaded successfully');
})();
