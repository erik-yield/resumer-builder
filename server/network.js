import { Agent, ProxyAgent, fetch as undiciFetch } from 'undici';

const LOCAL_HOSTS = '127.0.0.1,localhost,*.local,<local>';

function appendNoProxy() {
  const extra = LOCAL_HOSTS;
  process.env.NO_PROXY = process.env.NO_PROXY ? `${process.env.NO_PROXY},${extra}` : extra;
  process.env.no_proxy = process.env.NO_PROXY;
}

appendNoProxy();

export const HOST = process.env.HOST || '127.0.0.1';
export const PORT = Number(process.env.PORT) || 3001;

export async function externalFetch(url, options = {}) {
  const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

  if (!proxy) {
    return undiciFetch(url, options);
  }

  try {
    return await undiciFetch(url, {
      ...options,
      dispatcher: new ProxyAgent(proxy),
    });
  } catch (err) {
    console.warn('Proxy fetch failed, retrying direct:', err.message);
    return undiciFetch(url, {
      ...options,
      dispatcher: new Agent(),
    });
  }
}
