
import { useEffect, useCallback } from 'react';
import { contentProtection } from '@/utils/contentProtection';
import { useAuth } from '@/contexts/AuthContext';

export const useContentProtection = (options: {
  enableGlobalProtection?: boolean;
  protectedElements?: string[];
  showWatermark?: boolean;
} = {}) => {
  // DISABLED: All content protection that blurs, warns, or redirects
  // This is now a no-op to prevent user lockout and session loss
  return {
    protectElement: () => {},
    obfuscateText: (text: string) => text,
    deobfuscateText: (text: string) => text
  };
};
