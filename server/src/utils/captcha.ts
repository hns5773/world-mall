import svgCaptcha from 'svg-captcha';
import crypto from 'crypto';

// In-memory CAPTCHA store with expiry
const captchaStore = new Map<string, { text: string; expiresAt: number }>();

// Clean up expired CAPTCHAs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of captchaStore.entries()) {
    if (value.expiresAt < now) {
      captchaStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function generateCaptcha(): { captchaId: string; svg: string } {
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 3,
    color: true,
    background: '#f0f0f0',
    width: 150,
    height: 50,
    fontSize: 45,
    charPreset: 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789',
  });

  const captchaId = crypto.randomBytes(16).toString('hex');
  
  // Store with 5-minute expiry
  captchaStore.set(captchaId, {
    text: captcha.text.toLowerCase(),
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return {
    captchaId,
    svg: captcha.data,
  };
}

export function verifyCaptcha(captchaId: string, userInput: string): boolean {
  const stored = captchaStore.get(captchaId);
  
  if (!stored) {
    return false;
  }

  // Delete after use (one-time verification)
  captchaStore.delete(captchaId);

  // Check expiry
  if (stored.expiresAt < Date.now()) {
    return false;
  }

  // Case-insensitive comparison
  return stored.text === userInput.toLowerCase();
}
