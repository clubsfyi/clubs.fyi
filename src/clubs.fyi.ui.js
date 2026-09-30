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
  list.append(row);

  return row;
};

export const createCity = name => {
  const city = document.createElement('div');
  city.className = 'city';
  city.dataset.city = name;

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
  button.dataset.city = name;
  button.textContent = name;

  return button;
};
