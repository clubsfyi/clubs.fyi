import { loadJson } from './clubs.fyi.js';
import { appendClub, createCity } from './clubs.fyi.ui.js';

window.addEventListener('load', async () => {
  console.log(new Date().toISOString(), 'index.js', 'clubs.fyi');

  const json = await loadJson();

  console.log(new Date().toISOString(), 'index.js', 'loadJson', json);

  const root = document.getElementById('cities');

  const groups = {};

  json.forEach(item => {
    if (!item.City || !item.Name) return;

    if (!groups[item.City]) groups[item.City] = [];

    groups[item.City].push(item);
  });

  Object.keys(groups).sort().forEach(name => {
    const el = createCity(name);

    const clubs = [...groups[name]];

    for (let i = clubs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [clubs[i], clubs[j]] = [clubs[j], clubs[i]];
    }

    clubs.forEach(item => appendClub(el, {
      name:item.Name,
      tags:item.Tags,
      url:item['Website URL']
    }));

    root.append(el);
  });
});
