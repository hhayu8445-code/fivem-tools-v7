// Input validation and sanitization utilities

export function sanitizeHTML(input) {
  if (!input) return '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validateURL(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeInput(input, maxLength = 1000) {
  if (!input) return '';
  return String(input)
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '');
}

export function validateThreadTitle(title) {
  if (!title || title.trim().length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters' };
  }
  if (title.length > 200) {
    return { valid: false, error: 'Title must be less than 200 characters' };
  }
  return { valid: true };
}

export function validateThreadContent(content) {
  if (!content || content.trim().length < 10) {
    return { valid: false, error: 'Content must be at least 10 characters' };
  }
  if (content.length > 10000) {
    return { valid: false, error: 'Content must be less than 10,000 characters' };
  }
  return { valid: true };
}

export function preventXSS(input) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return String(input).replace(/[&<>"'/]/g, (char) => map[char]);
}

export function rateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rl_${key}`) || '[]');
  const recentAttempts = attempts.filter(time => now - time < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return { allowed: false, retryAfter: windowMs - (now - recentAttempts[0]) };
  }
  
  recentAttempts.push(now);
  localStorage.setItem(`rl_${key}`, JSON.stringify(recentAttempts));
  return { allowed: true };
}

export function validateFileUpload(file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSize = 5 * 1024 * 1024) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` };
  }
  return { valid: true };
}

export const CSRFToken = {
  generate() {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('csrf_token', token);
    return token;
  },
  validate(token) {
    return token === sessionStorage.getItem('csrf_token');
  }
};
