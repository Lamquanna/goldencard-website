/**
 * Gemini API Key Manager
 * Multi-key rotation with silent retry mechanism
 */

interface KeyStatus {
  key: string;
  lastUsed: number;
  errorCount: number;
  isBlocked: boolean;
  blockUntil?: number;
}

class GeminiKeyManager {
  private keys: KeyStatus[] = [];
  private readonly BLOCK_DURATION = 60 * 60 * 1000; // 1 hour
  private readonly MAX_ERRORS = 3;

  constructor() {
    this.initializeKeys();
  }

  private initializeKeys() {
    const keysString = process.env.GOOGLE_API_KEYS || process.env.GOOGLE_API_KEY || '';
    const keyArray = keysString.split(',').map(k => k.trim()).filter(Boolean);

    if (keyArray.length === 0) {
      console.error('⚠️ No Gemini API keys configured!');
      return;
    }

    this.keys = keyArray.map(key => ({
      key,
      lastUsed: 0,
      errorCount: 0,
      isBlocked: false,
    }));

    console.log(`✅ Initialized ${this.keys.length} Gemini API keys`);
  }

  /**
   * Get a random available key
   */
  getRandomKey(): string | null {
    const now = Date.now();

    // Unblock keys if block period expired
    this.keys.forEach(keyStatus => {
      if (keyStatus.isBlocked && keyStatus.blockUntil && now > keyStatus.blockUntil) {
        keyStatus.isBlocked = false;
        keyStatus.errorCount = 0;
        keyStatus.blockUntil = undefined;
        console.log(`🔓 Key unblocked: ${keyStatus.key.slice(0, 10)}...`);
      }
    });

    // Get available keys
    const availableKeys = this.keys.filter(k => !k.isBlocked);

    if (availableKeys.length === 0) {
      console.error('❌ All API keys are blocked!');
      return null;
    }

    // Random selection
    const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
    randomKey.lastUsed = now;

    console.log(`🔑 Selected key: ${randomKey.key.slice(0, 10)}... (${availableKeys.length} available)`);
    return randomKey.key;
  }

  /**
   * Mark key as failed
   */
  markKeyFailed(key: string, error: any) {
    const keyStatus = this.keys.find(k => k.key === key);
    if (!keyStatus) return;

    keyStatus.errorCount++;
    console.error(`⚠️ Key error (${keyStatus.errorCount}/${this.MAX_ERRORS}): ${key.slice(0, 10)}...`, error.message);

    // Block key if too many errors
    if (keyStatus.errorCount >= this.MAX_ERRORS) {
      keyStatus.isBlocked = true;
      keyStatus.blockUntil = Date.now() + this.BLOCK_DURATION;
      console.error(`🚫 Key blocked for 1 hour: ${key.slice(0, 10)}...`);
    }
  }

  /**
   * Mark key as successful
   */
  markKeySuccess(key: string) {
    const keyStatus = this.keys.find(k => k.key === key);
    if (!keyStatus) return;

    keyStatus.errorCount = 0; // Reset error count on success
  }

  /**
   * Get total key count
   */
  getTotalKeys(): number {
    return this.keys.length;
  }

  /**
   * Get available key count
   */
  getAvailableKeys(): number {
    const now = Date.now();
    return this.keys.filter(k => {
      if (!k.isBlocked) return true;
      if (k.blockUntil && now > k.blockUntil) return true;
      return false;
    }).length;
  }
}

// Singleton instance
export const geminiKeyManager = new GeminiKeyManager();
