// Simple in-memory cache
const codeCache = new Map();

// Cache expiration time (30 minutes)
const CACHE_EXPIRY = 30 * 60 * 1000;

// Debounce timeout (500ms)
const DEBOUNCE_TIMEOUT = 500;

let debounceTimer;

export const generateCodeWithCache = async (prompt, generateFunction) => {
  const cacheKey = JSON.stringify(prompt);
  
  // Check cache
  if (codeCache.has(cacheKey)) {
    const { data, timestamp } = codeCache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_EXPIRY) {
      return data;
    }
    codeCache.delete(cacheKey);
  }

  // Generate new response
  const response = await generateFunction(prompt);
  
  // Cache the result
  codeCache.set(cacheKey, {
    data: response,
    timestamp: Date.now()
  });

  return response;
};

export const debounceCodeGeneration = (callback) => {
  return (...args) => {
    return new Promise((resolve) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      debounceTimer = setTimeout(async () => {
        const result = await callback(...args);
        resolve(result);
      }, DEBOUNCE_TIMEOUT);
    });
  };
};

// Cache cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, { timestamp }] of codeCache.entries()) {
    if (now - timestamp > CACHE_EXPIRY) {
      codeCache.delete(key);
    }
  }
}, CACHE_EXPIRY);
