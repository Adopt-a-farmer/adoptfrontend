import { useEffect } from 'react';

interface TawkToWidgetProps {
  propertyId?: string;
  onLoad?: () => void;
  onChatMaximized?: () => void;
  onChatMinimized?: () => void;
}

const TawkToWidget: React.FC<TawkToWidgetProps> = ({
  propertyId = '68c161bd5ec5391930b3355b/1j4pmbji9',
  onLoad,
  onChatMaximized,
  onChatMinimized,
}) => {
  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src*="embed.tawk.to"]');
    if (existingScript) {
      return;
    }

    // Initialize Tawk globals
    const w = window as unknown as Record<string, unknown>;
    if (!w.Tawk_API) {
      w.Tawk_API = {};
      w.Tawk_LoadStart = new Date();
    }

    // Set up event handlers
    if (onLoad && w.Tawk_API) {
      (w.Tawk_API as Record<string, unknown>).onLoad = onLoad;
    }
    
    if (onChatMaximized && w.Tawk_API) {
      (w.Tawk_API as Record<string, unknown>).onChatMaximized = onChatMaximized;
    }
    
    if (onChatMinimized && w.Tawk_API) {
      (w.Tawk_API as Record<string, unknown>).onChatMinimized = onChatMinimized;
    }

    // Load the Tawk.to script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }

    return () => {
      // Cleanup event handlers
      if (w.Tawk_API) {
        const tawkAPI = w.Tawk_API as Record<string, unknown>;
        tawkAPI.onLoad = undefined;
        tawkAPI.onChatMaximized = undefined;
        tawkAPI.onChatMinimized = undefined;
      }
    };
  }, [propertyId, onLoad, onChatMaximized, onChatMinimized]);

  return null;
};

export default TawkToWidget;
