import { loadCachedImage } from './clubs.fyi.js';

export const appendClub = (city, club, onTeamClick) => {
  const list = city.querySelector('.clubs');

  const row = document.createElement('div');
  row.className = 'club';

  const identity = document.createElement('span');
  identity.className = 'identity';

  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = club.name;

  const logo = document.createElement('span');
  logo.className = 'logo';
  logo.setAttribute('aria-hidden', 'true');

  if(club.logo) {
    const image = document.createElement('img');
    image.alt = '';
    image.loading = 'lazy';
    loadCachedImage(image, club.logo, () => {
      logo.classList.add('placeholder');
      image.remove();
    });
    logo.append(image);
  } else
    logo.classList.add('placeholder');

  identity.append(logo, name);

  const badge = text => {
    const el = document.createElement('span');
    el.className = 'badge';
    el.textContent = text;
    identity.append(el);
  };

  if(club.free)
    badge('FREE');

  if(club.nonprofit)
    badge('NONPROFIT');

  const tags = document.createElement('span');
  tags.className = 'tags';
  tags.textContent = club.tags;

  const meta = document.createElement('span');
  meta.className = 'meta';

  if(club.vouchedBy) {
    const person = club.team?.get(club.vouchedBy);
    const vouched = document.createElement('span');
    vouched.className = 'badge vouched';
    vouched.dataset.tooltip = 'Vouched by ' + (person?.Name || club.vouchedBy);

    const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    star.classList.add('vouched-star');
    star.setAttribute('viewBox', '0 0 24 24');
    star.setAttribute('width', '18');
    star.setAttribute('height', '18');
    star.setAttribute('aria-hidden', 'true');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 2.5 14.9 8.45 21.5 9.4 16.75 14.05 17.9 20.6 12 17.5 6.1 20.6 7.25 14.05 2.5 9.4 9.1 8.45Z');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '0.8');
    path.setAttribute('stroke-linejoin', 'round');
    star.append(path);
    vouched.append(star);

    if(person?.Photo) {
      vouched.classList.add('has-photo');

      const photo = document.createElement('img');
      photo.className = 'vouched-avatar';
      photo.alt = '';
      loadCachedImage(photo, person.Photo, () => {
        photo.remove();
        vouched.classList.remove('has-photo');
      });
      vouched.append(photo);
    }

    meta.append(vouched);
  }

  meta.append(tags);

  row.dataset.tags = club.tags;

  row.append(identity, meta);

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
        const byline = document.createElement(person ? 'button' : 'span');

        if(person) {
          byline.className = 'review-credit';
          byline.type = 'button';
          byline.setAttribute('aria-label', 'Open team member details for ' + author);
          byline.addEventListener('click', () => onTeamClick(person, byline));
        }

        if(person?.Photo) {
          const photo = document.createElement('img');
          photo.className = 'review-avatar';
          photo.alt = '';
          loadCachedImage(photo, person.Photo, () => photo.remove());
          byline.append(photo);
        }

        const name = document.createElement('span');
        name.textContent = author;
        byline.append(name);
        cite.append(byline);
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
      if(e.target.closest('.details'))
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
