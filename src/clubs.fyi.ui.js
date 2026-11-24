export const appendClub = (city, club) => {
  const list = city.querySelector('.clubs');

  const row = document.createElement('div');
  row.className = 'club';

  const name = club.url ? document.createElement('a') : document.createElement('span');
  name.className = 'name';
  name.textContent = club.name;

  if(club.url) {
    name.href = club.url;
    name.target = '_blank';
    name.rel = 'noopener';
  }

  const tags = document.createElement('span');
  tags.className = 'tags';
  tags.textContent = club.tags;

  row.dataset.tags = club.tags;

  row.append(name, tags);

  if(club.url || club.instagram || club.review) {
    const details = document.createElement('div');
    details.className = 'details';

    const link = (label, href, text) => {
      const a = document.createElement('a');
      a.className = 'detail';
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener';

      const value = document.createElement('span');
      value.textContent = text;

      const title = document.createElement('span');
      title.className = 'detail-label';
      title.textContent = label;

      a.append(value, title);
      details.append(a);
    };

    if(club.url) {
      let site = club.url;

      try { site = new URL(club.url).hostname.replace(/^www\./, ''); } catch {}

      link('Website', club.url, site);
    }

    if(club.instagram) {
      let handle = club.instagram;

      try {
        const path = new URL(club.instagram).pathname.split('/').filter(Boolean)[0];

        if(path)
          handle = '@' + path;
      } catch {}

      link('Instagram', club.instagram, handle);
    }

    if(club.review) {
      const separator = club.review.indexOf(':');
      const id = (separator < 0 ? '' : club.review.slice(0, separator)).trim().replace(/^"|"$/g, '');
      const person = club.team?.get(id);
      const author = person?.Name || id;
      const text = (separator < 0 ? club.review : club.review.slice(separator + 1)).trim().replace(/^"|"$/g, '');
      const quote = document.createElement('blockquote');
      quote.className = 'review';

      const content = document.createElement('p');
      const review = document.createElement('span');
      review.textContent = text;
      content.append(review);
      quote.append(content);

      if(author) {
        const cite = document.createElement('cite');

        if(person?.Photo) {
          const photo = document.createElement('img');
          photo.className = 'review-avatar';
          photo.src = person.Photo;
          photo.alt = '';
          photo.addEventListener('error', () => photo.remove());
          cite.append(photo);
        }

        const name = document.createElement('span');
        name.textContent = author;
        cite.append(name);
        quote.append(cite);
      }

      details.append(quote);
    }

    row.append(details);
    row.classList.add('expandable');
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.setAttribute('aria-expanded', 'false');

    const toggle = () => row.setAttribute('aria-expanded', row.classList.toggle('open'));

    row.addEventListener('click', e => {
      if(e.target.closest('.name, .details'))
        return;

      toggle();
    });

    row.addEventListener('keydown', e => {
      if(e.target !== row)
        return;

      if(e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();

        toggle();
      }
    });
  }

  list.append(row);

  return row;
};

export const createCity = name => {
  const city = document.createElement('div');
  city.className = 'city';
  city.dataset.tag = name;

  const rule = document.createElement('hr');
  rule.className = 'rule';

  const label = document.createElement('p');
  label.className = 'label';
  label.textContent = 'CITY /';

  const title = document.createElement('p');
  title.className = 'title';
  title.textContent = name;

  const list = document.createElement('div');
  list.className = 'clubs';

  city.append(rule, label, title, list);

  return city;
};

export const createFilter = name => {
  const button = document.createElement('button');
  button.dataset.tag = name;
  button.textContent = name;

  return button;
};
