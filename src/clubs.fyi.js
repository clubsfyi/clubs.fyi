export const loadJSON = async () => {
  let res = undefined;

  try { res = await fetch('https://cache.moralestapia.com/clubs.fyi/data.json'); } catch {}

  if(!res || !res.ok)
    try { res = await fetch('https://clubs.fyi/data.json'); } catch {}

  if(!res || !res.ok)
    throw new Error(new Date().toISOString() + ':clubs.fyi.js:loadJSON:bad status:' + (res ? res.status : 'network'));

  let json = [];

  try { json = await res.json(); } catch {}

  return json;
};
