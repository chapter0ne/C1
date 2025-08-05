
// All content protection that blurs, warns, or redirects is now disabled.
// This file is now a no-op to prevent user lockout and session loss.

class ContentProtection {
  static getInstance() {
    return new ContentProtection();
  }
  enableProtection() {}
  disableProtection() {}
  obfuscateText(text) { return text; }
  deobfuscateText(text) { return text; }
  addWatermark(element, userInfo) {}
}

export const contentProtection = ContentProtection.getInstance();
