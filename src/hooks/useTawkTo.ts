import type { TawkAPI } from '@/types/tawkto';

// Hook for using Tawk.to in components
export const useTawkTo = () => {
  const maximize = () => {
    if (window.Tawk_API?.maximize) {
      window.Tawk_API.maximize();
    }
  };

  const minimize = () => {
    if (window.Tawk_API?.minimize) {
      window.Tawk_API.minimize();
    }
  };

  const toggle = () => {
    if (window.Tawk_API?.toggle) {
      window.Tawk_API.toggle();
    }
  };

  const showWidget = () => {
    if (window.Tawk_API?.showWidget) {
      window.Tawk_API.showWidget();
    }
  };

  const hideWidget = () => {
    if (window.Tawk_API?.hideWidget) {
      window.Tawk_API.hideWidget();
    }
  };

  const setAttributes = (attributes: Record<string, unknown>) => {
    if (window.Tawk_API?.setAttributes) {
      window.Tawk_API.setAttributes(attributes);
    }
  };

  const addEvent = (event: string, metadata?: Record<string, unknown>) => {
    if (window.Tawk_API?.addEvent) {
      window.Tawk_API.addEvent(event, metadata);
    }
  };

  const addTags = (tags: string[]) => {
    if (window.Tawk_API?.addTags) {
      window.Tawk_API.addTags(tags);
    }
  };

  const removeTags = (tags: string[]) => {
    if (window.Tawk_API?.removeTags) {
      window.Tawk_API.removeTags(tags);
    }
  };

  return {
    maximize,
    minimize,
    toggle,
    showWidget,
    hideWidget,
    setAttributes,
    addEvent,
    addTags,
    removeTags,
  };
};
