export const loadJson = async () => {
  const res = await fetch('https://workers.clubs.fyi/data.json');
  
  if(!res.ok)
    throw new Error(new Date().toISOString() + ':clubs.fyi.js:loadJson:bad status:' + res.status);
  
  const json = await res.json();

  return json;
};
