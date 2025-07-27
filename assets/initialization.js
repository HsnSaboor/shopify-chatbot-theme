/**
 * Initialization Module - Main setup and dependency management
 */
(function() {
  'use strict';

  window.ShopifyInitialization = {
    MAX_RETRIES: 5,
    retryCount: 0,

    main: function() {
      // Initialize session
      const sessionData = window.ShopifySessionManager.initialize();
      if (!sessionData) {
        console.error('[Shopify Integration] Failed to initialize session. Chatbot will not function properly.');
        return;
      }

      // Setup message listener
      this.setupMessageListener();

      // Restore chatbot state from localStorage
      window.ShopifySessionHandlers.restoreChatbotState();

      // Pre-load conversations for better UX
      this.preloadConversations(sessionData.session_id);

      // Setup iframe detection and initialization
      window.ShopifyIframeManager.setupIframeDetection();

      // Setup session validation timeout
      setTimeout(() => {
        if (!window.ShopifySessionManager.isValid()) {
          console.warn('[Shopify Integration] Session may not be properly authenticated from Shopify cookies, but using generated session.');
        } else {
          console.log('[Shopify Integration] Valid Shopify session detected!');
        }
      }, 3000);

      console.log('[Shopify Integration] Main initialization complete');
    },

    preloadConversations: function(sessionId) {
      console.log('[Shopify Integration] Pre-loading conversations for session:', sessionId);
      if (window.ShopifyAPIClient) {
        window.ShopifyAPIClient.fetchAllConversations()
          .then(conversations => {
            console.log('[Shopify Integration] Pre-loaded conversations:', conversations.length);
            // Store in a global variable for quick access
            window.preloadedConversations = conversations;
          })
          .catch(error => {
            console.warn('[Shopify Integration] Failed to pre-load conversations:', error);
          });
      }
    },

    setupMessageListener: function() {
      const self = this;
      window.addEventListener('message', function(event) {
        console.log('[Shopify Integration] Received message from iframe:', event.data);

        if (!event.data || !event.data.type) {
          return;
        }

        switch (event.data.type) {
          case 'CONVERSATION_ACTION':
            const { action, conversationId, name } = event.data.data;
            window.ShopifyMessageHandlers.handleConversationAction(event, action, conversationId, name);
            break;

          case 'CHAT_MESSAGE':
            const { message } = event.data.data;
            window.ShopifyMessageHandlers.handleChatMessage(event, message);
            break;

          case 'REQUEST_SESSION_DATA':
            // Re-send session data when requested
            window.ShopifySessionHandlers.sendSessionDataToChatbot();
            break;

          case 'send-chat-message':
            // Handle chat message through webhook
            console.log('[Shopify Integration] Handling send-chat-message:', event.data.payload);
            if (window.ShopifyWebhookHandler) {
              window.ShopifyWebhookHandler.sendChatMessageToWebhook(event.data);
            }
            break;

          case 'get-all-conversations':
            // Only handle from iframe, not duplicated from parent
            if (event.source !== window.parent) {
              self.handleConversationsRequest(event);
            }
            break;

          case 'add-to-cart':
            // Handle add to cart request
            console.log('[Shopify Integration] Handling add-to-cart request:', event.data.payload);
            window.ShopifyCartHandlers.handleAddToCart(event, event.data.payload);
            break;

          case 'navigate-to-product':
            // Handle product navigation request
            console.log('[Shopify Integration] Handling navigate-to-product request:', event.data.payload);
            window.ShopifyCartHandlers.handleProductNavigation(event, event.data.payload);
            break;

          default:
            console.log('[Shopify Integration] Unknown message type:', event.data.type);
        }
      });
    },

    handleConversationsRequest: function(event) {
      console.log('[Shopify Integration] Handling get-all-conversations request');

      // Prevent duplicate requests
      if (this.conversationRequestInProgress) {
        console.log('[Shopify Integration] Conversation request already in progress, skipping');
        return;
      }

      this.conversationRequestInProgress = true;

      // First try to use preloaded conversations if available
      if (window.preloadedConversations && window.preloadedConversations.length > 0) {
        console.log('[Shopify Integration] Using preloaded conversations:', window.preloadedConversations.length);
        event.source.postMessage({
          type: 'conversations-response',
          conversations: window.preloadedConversations
        }, '*');
          this.conversationRequestInProgress = false;

      } else if (window.ShopifyAPIClient) {
        // Fallback to API call
        window.ShopifyAPIClient.fetchAllConversations()
          .then(conversations => {
            console.log('[Shopify Integration] Sending conversations response:', conversations);
            // Update preloaded cache
            window.preloadedConversations = conversations;
            event.source.postMessage({
              type: 'conversations-response',
              conversations: conversations
            }, '*');
          })
          .catch(error => {
            console.error('[Shopify Integration] Error fetching conversations:', error);
            event.source.postMessage({
              type: 'conversations-response',
              conversations: []
            }, '*');
          })
          .finally(() => {
            // Reset flag after 1 second to allow new requests
            setTimeout(() => {
              this.conversationRequestInProgress = false;
            }, 1000);
          });
      } else {
        console.error('[Shopify Integration] ShopifyAPIClient not available for conversations request');
        event.source.postMessage({
          type: 'conversations-response',
          conversations: []
        }, '*');
              this.conversationRequestInProgress = false;

      }
    },

    waitForDependencies: function() {
      if (typeof window.ShopifySessionManager === 'undefined' || 
          typeof window.ShopifyAPIClient === 'undefined' ||
          typeof window.ShopifyMessageHandlers === 'undefined' ||
          typeof window.ShopifyCartHandlers === 'undefined' ||
          typeof window.ShopifySessionHandlers === 'undefined' ||
          typeof window.ShopifyWebhookHandler === 'undefined' ||
          typeof window.ShopifyIframeManager === 'undefined') {
        console.log('[Shopify Integration] Waiting for dependencies...');
        setTimeout(() => this.waitForDependencies(), 100);
        return;
      }

      console.log('[Shopify Integration] Dependencies loaded, proceeding with initialization...');
      this.main();
    }
  };
})();