export const cacheHTTPKey = async url => {
  const data = new TextEncoder().encode(url);
  const hash = await crypto.subtle.digest('SHA-256', data);

  return 'http/'
    + [...new Uint8Array(hash)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    + (new URL(url).pathname.match(/\.[A-Za-z0-9]+$/)?.[0] ?? '');
};

export const loadCachedImage = async (image, url, onError = () => {}) => {
  let triedOrigin = false;

  const fallback = () => {
    if(!triedOrigin) {
      triedOrigin = true;
      image.src = url;
    } else {
      image.removeEventListener('error', fallback);
      onError();
    }
  };

  image.addEventListener('error', fallback);

  try {
    image.src = 'https://cache.moralestapia.com/' + await cacheHTTPKey(url);
  } catch {
    triedOrigin = true;
    image.src = url;
  }
};

export const loadJSON = async () => {
  let res = undefined;

  try { res = await fetch('https://cache.moralestapia.com/clubs.fyi/data.json'); } catch {}

  if(!res || !res.ok)
    try { res = await fetch(url); } catch {}

  if(!res || !res.ok)
    throw new Error(new Date().toISOString() + ':clubs.fyi.js:loadJSON:bad status:' + (res ? res.status : 'network'));

  let json = [];

  try { json = await res.json(); } catch {}

  return json;
};
