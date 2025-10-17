declare module 'epubjs' {
  interface EpubCFI {
    cfi: string;
    start: {
      cfi: string;
      percentage: number;
    };
    end: {
      cfi: string;
      percentage: number;
    };
  }

  interface EpubLocation {
    cfi: string;
    start: {
      cfi: string;
      percentage: number;
    };
    end: {
      cfi: string;
      percentage: number;
    };
  }

  interface EpubMetadata {
    title?: string;
    creator?: string;
    language?: string;
    publisher?: string;
    date?: string;
    identifier?: string;
    rights?: string;
    description?: string;
  }

  interface EpubTocItem {
    label: string;
    href: string;
    level: number;
  }

  interface EpubNavigation {
    toc: EpubTocItem[];
  }

  interface EpubRendition {
    display(cfi?: string): Promise<void>;
    next(): void;
    prev(): void;
    themes: {
      default(theme: Record<string, any>): void;
      fontSize(size: string): void;
    };
    on(event: string, callback: (location: EpubLocation) => void): void;
    destroy(): void;
  }

  interface EpubBook {
    ready: Promise<void>;
    renderTo(element: HTMLElement, options?: any): EpubRendition;
    navigation: EpubNavigation;
    cover: string;
    metadata: EpubMetadata;
  }

  function ePub(url: string): EpubBook;
  export = ePub;
}

