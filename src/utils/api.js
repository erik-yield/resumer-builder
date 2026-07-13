const API_BASES = ['', 'http://127.0.0.1:3001'];

async function tryFetch(path, options) {
  let lastError;

  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${path}`, options);
      return res;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Cannot reach server. Run npm run dev and open http://127.0.0.1:5173');
}

export async function apiGet(path) {
  return tryFetch(path);
}

export async function apiPost(path, body) {
  return tryFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
