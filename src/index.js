import { loadJson } from './clubs.fyi.js';
import { appendClub, createCity, createFilter } from './clubs.fyi.ui.js';

window.addEventListener('load', async () => {
  console.log(new Date().toISOString(), 'index.js', 'clubs.fyi');

  const json = await loadJson();

  const modal = document.getElementById('about-modal');
  const closeModal = () => modal.classList.add('off');

  document.getElementById('about').addEventListener('click', () => modal.classList.remove('off'));
  document.getElementById('about-close').addEventListener('click', closeModal);

  modal.addEventListener('click', e => {
    if(e.target === modal)
      closeModal();
  });

  window.addEventListener('keydown', e => {
    if(e.key === 'Escape')
      closeModal();
  });

  const cities = document.getElementById('cities');
  const filters = document.getElementById('filters');
  const search = document.getElementById('search');

  const groups = {};
  const normTags = tags => (tags || '').split(',').map(t => t.trim()).filter(t => t).sort((a, b) => a.localeCompare(b));
  const tagSet = new Set();
  const status = document.getElementById('status');

  json.forEach(item => {
    if(!item.City || !item.Name)
      return;

    if(!groups[item.City])
      groups[item.City] = [];

    groups[item.City].push(item);

    normTags(item.Tags).forEach(t => tagSet.add(t));
  });

  const names = Object.keys(groups).sort();
  const sel = new Set();
  const selTags = new Set();

  let query = '';

  const apply = () => {
    let total = 0;

    cities.querySelectorAll('.city').forEach(el => {
      const hideCity = sel.size && !sel.has(el.dataset.city);

      let shown = 0;

      el.querySelectorAll('.club').forEach(row => {
        const tags = (row.dataset.tags || '').split(',').map(t => t.trim());
        const hideTag = selTags.size && !tags.some(t => selTags.has(t));
        const hideRow = hideCity || hideTag || (query && !row.textContent.toLowerCase().includes(query));

        row.classList.toggle('off', hideRow);

        if(!hideRow)
          shown++;
      });

      el.classList.toggle('off', hideCity || !shown);

      total += shown;
    });

    if(total === 0)
      status.textContent = 'No clubs match those filters. Clear them to see all clubs.';

    if(total > 0)
      status.textContent = '';
  };

  names.forEach((name, i) => {
    const el = createCity(name);

    if(i === 0)
      el.querySelector('hr').remove();

    const clubs = [...groups[name]].sort((a, b) => a.Name.localeCompare(b.Name));

    clubs.forEach(item => appendClub(el, {
      name:item.Name,
      tags:normTags(item.Tags).join(', '),
      url:item['Website URL']
    }));

    cities.append(el);

    const button = createFilter(name);

    button.addEventListener('click', () => {
      if(sel.has(name)) {
        sel.delete(name);

        button.classList.remove('on');
      } else {
        sel.add(name);

        button.classList.add('on');
      }

      apply();
    });

    filters.append(button);
  });

  const tagFilters = document.getElementById('tag-filters');

  [...tagSet]
    .sort((a, b) => a.localeCompare(b))
    .forEach(tag => {
      const button = createFilter(tag);

      button.addEventListener('click', () => {
        if(selTags.has(tag)) {
          selTags.delete(tag);

          button.classList.remove('on');
        } else {
          selTags.add(tag);

          button.classList.add('on');
        }

        apply();
      });

      tagFilters.append(button);
    });

  document.getElementById('clear').addEventListener('click', () => {
    sel.clear();

    selTags.clear();

    query = '';

    search.value = '';

    document.querySelectorAll('#filters button, #tag-filters button').forEach(button => button.classList.remove('on'));

    apply();
  });

  apply();

  search.addEventListener('input', () => {
    query = search.value.trim().toLowerCase();

    apply();
  });

  const cityRow = document.getElementById('city-row');

  const narrow = window.matchMedia('(max-width:640px)');

  const placeSearch = () => {
    if(narrow.matches)
      cityRow.before(search);
    else
      filters.after(search);
  };

  narrow.addEventListener('change', placeSearch);

  placeSearch();
});
