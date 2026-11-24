import { loadCachedImage, loadJSON } from './clubs.fyi.js';
import { appendClub, createCity, createFilter } from './clubs.fyi.ui.js';

window.addEventListener('load', async () => {
  console.log(new Date().toISOString(), 'index.js', 'clubs.fyi');

  const payload = await loadJSON();
  const json = payload.clubs || payload;
  const team = new Map((payload.team || []).map(person => [person.ID, person]));

  const modal = document.getElementById('about-modal');
  const closeModal = () => modal.classList.add('off');
  const teamModal = document.getElementById('team-modal');
  const teamProfile = document.getElementById('team-profile');
  const teamClose = document.getElementById('team-close');
  let teamTrigger;
  const closeTeamModal = () => {
    if(teamModal.classList.contains('off'))
      return;

    teamModal.classList.add('off');
    teamTrigger?.focus();
  };
  const openTeamModal = (person, trigger) => {
    teamTrigger = trigger;
    teamProfile.replaceChildren();
    const heading = document.createElement('div');
    heading.className = 'team-heading';

    if(person.Photo) {
      const photo = document.createElement('img');
      photo.className = 'team-photo';
      photo.alt = '';
      loadCachedImage(photo, person.Photo, () => photo.remove());
      heading.append(photo);
    }

    const identity = document.createElement('div');

    if(person.Name) {
      const name = document.createElement('p');
      name.className = 'team-name';
      name.textContent = person.Name;
      identity.append(name);
    }

    if(person.City) {
      const city = document.createElement('p');
      city.className = 'team-city';
      city.textContent = person.City;
      identity.append(city);
    }

    heading.append(identity);
    teamProfile.append(heading);

    if(person.Description) {
      const description = document.createElement('p');
      description.className = 'team-description';
      description.textContent = person.Description;
      teamProfile.append(description);
    }

    const links = document.createElement('div');
    links.className = 'team-links';

    [['Website URL', 'Website'], ['Instagram URL', 'Instagram'], ['LinkedIn URL', 'LinkedIn']].forEach(([field, label]) => {
      if(!person[field])
        return;

      const a = document.createElement('a');
      a.className = 'team-link';
      a.href = person[field];
      a.target = '_blank';
      a.rel = 'noopener';

      let value = person[field];

      try {
        const url = new URL(person[field]);
        const path = url.pathname.split('/').filter(Boolean);

        value = url.hostname.replace(/^www\./, '');

        if(label === 'Instagram' && path[0])
          value = '@' + path[0];
        else if(label === 'LinkedIn' && path.length)
          value = path[path.length - 1];
      } catch {}

      const text = document.createElement('span');
      text.textContent = value;

      const title = document.createElement('span');
      title.className = 'team-link-label';
      title.textContent = label;

      a.append(text, title);
      links.append(a);
    });

    if(links.children.length)
      teamProfile.append(links);

    teamModal.classList.remove('off');
    teamClose.focus();
  };

  teamClose.addEventListener('click', closeTeamModal);
  teamModal.addEventListener('click', e => {
    if(e.target === teamModal)
      closeTeamModal();
  });

  document.getElementById('about').addEventListener('click', () => modal.classList.remove('off'));
  document.getElementById('about-close').addEventListener('click', closeModal);

  modal.addEventListener('click', e => {
    if(e.target === modal)
      closeModal();
  });

  window.addEventListener('keydown', e => {
    if(e.key === 'Escape') {
      closeModal();
      closeTeamModal();
    }
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
      const hideCity = sel.size && !sel.has(el.dataset.tag);

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
      logo:item.Logo,
      free:item.Free === 'TRUE',
      nonprofit:item.Nonprofit === 'TRUE',
      vouchedBy:item['Vouched By'],
      url:item['Website URL'],
      instagram:item['Instagram URL'],
      review:item.Reviews,
      team
    }, openTeamModal));

    cities.append(el);

    const button = createFilter(name);

    if(name === 'Toronto') {
      sel.add(name);

      button.classList.add('on');
    }

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
