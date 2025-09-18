export interface TawkAPI {
  maximize: () => void;
  minimize: () => void;
  toggle: () => void;
  showWidget: () => void;
  hideWidget: () => void;
  setAttributes: (attributes: Record<string, unknown>) => void;
  addEvent: (event: string, metadata?: Record<string, unknown>) => void;
  addTags: (tags: string[]) => void;
  removeTags: (tags: string[]) => void;
  onLoad?: () => void;
  onChatMaximized?: () => void;
  onChatMinimized?: () => void;
}

declare global {
  interface Window {
    Tawk_API?: Partial<TawkAPI>;
    Tawk_LoadStart?: Date;
  }
}
