/**
 * Webhook Handler - Handles n8n webhook communication
 */
(function() {
  'use strict';

  window.ShopifyWebhookHandler = {
    sendChatMessageToWebhook: function(messageData) {
      try {
        const webhookUrl = 'https://similarly-secure-mayfly.ngrok-free.app/webhook/chat';

        const payload = {
          session_id: messageData.payload.session_id,
          message: messageData.payload.type === 'voice' ? '' : (messageData.payload.user_message || messageData.payload.message),
          timestamp: messageData.payload.timestamp,
          conversation_id: messageData.payload.conversation_id,
          source_url: messageData.payload.source_url,
          page_context: messageData.payload.page_context,
          cart_currency: messageData.payload.cart_currency,
          localization: messageData.payload.localization,
          type: messageData.payload.type || 'text'
        };

        // Add audio data if it's a voice message
        if (messageData.payload.type === 'voice' && messageData.payload.audioData) {
          payload.audioData = messageData.payload.audioData;
          payload.mimeType = messageData.payload.mimeType;
          payload.duration = messageData.payload.duration;
        }

        console.log('[Shopify Integration] Sending to n8n webhook:', payload);

        return fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify(payload)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Webhook request failed: ${response.status}`);
          }
          return response.text();
        })
        .then(responseText => {
          console.log('[Shopify Integration] Webhook response:', responseText);

          let data;
          try {
            // Handle empty response
            if (!responseText || responseText.trim() === '') {
              console.log('[Shopify Integration] Empty webhook response received - this is expected for some webhooks');
              data = { message: "Thank you for your message! I'm processing your request and will respond shortly." };
            } else {
              const parsedResponse = JSON.parse(responseText);
              data = Array.isArray(parsedResponse) ? parsedResponse[0] : parsedResponse;
              console.log('[Shopify Integration] Parsed webhook response:', data);
            }
          } catch (e) {
            console.error('[Shopify Integration] Failed to parse webhook response:', e);
            data = { message: "I received your message. Let me help you with that!" };
          }

          // Send the response back to the chatbot
          window.ShopifyMessageHandlers.sendMessageToChatbot({
            type: 'chat-response',
            response: data
          });
        })
        .catch(error => {
          console.error('[Shopify Integration] Webhook error:', error);
          window.ShopifyMessageHandlers.sendMessageToChatbot({
            type: 'chat-error',
            error: error.message
          });
        });

      } catch (error) {
        console.error('[Shopify Integration] Error processing chat message:', error);
        window.ShopifyMessageHandlers.sendMessageToChatbot({
          type: 'chat-error',
          error: error.message
        });
      }
    }
  };
})();