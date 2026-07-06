export async function loadTimeline(target, url, options = {}) {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Could not load timeline JSON: ${response.status} ${response.statusText}`);
  }

  return createTimeline(target, await response.json(), options);
}

export function createTimeline(target, data, options = {}) {
  const element = resolveTarget(target);
  const timeline = normalizeTimeline(data);
  const settings = {
    allowHtml: options.allowHtml !== false
  };

  element.replaceChildren();
  element.classList.add('tlm');
  element.style.setProperty('--tlm-accent', options.accent || timeline.accent || '#b43f3f');

  const header = renderHeader(timeline, settings);
  const viewport = document.createElement('div');
  viewport.className = 'tlm__viewport';

  const rail = renderRail(timeline);
  const slides = renderSlides(timeline, settings);

  viewport.append(rail, slides);
  element.append(header, viewport);

  return {
    element,
    data: timeline
  };
}

function resolveTarget(target) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) {
    throw new Error('Timeline target element was not found.');
  }

  return element;
}

export function normalizeTimeline(data) {
  if (!data || !Array.isArray(data.events) || data.events.length === 0) {
    throw new Error('Timeline JSON must include a non-empty events array.');
  }

  const events = data.events.map((event, index) => {
    const start = parseTimelineDate(event.start_date || event.startDate || event.date);
    const end = event.end_date || event.endDate ? parseTimelineDate(event.end_date || event.endDate) : null;

    if (!start) {
      throw new Error(`Event ${index} is missing a valid start date.`);
    }

    return {
      id: event.unique_id || event.id || `event-${index}`,
      start,
      end,
      group: event.group || '',
      media: event.media || {},
      background: event.background || {},
      overlays: normalizeOverlays(event.overlays),
      text: normalizeText(event.text),
      raw: event
    };
  }).sort((a, b) => a.start.valueOf() - b.start.valueOf());

  const eras = Array.isArray(data.eras) ? data.eras.map((era, index) => ({
    id: era.unique_id || era.id || `era-${index}`,
    start: parseTimelineDate(era.start_date || era.startDate),
    end: parseTimelineDate(era.end_date || era.endDate),
    text: normalizeText(era.text),
    raw: era
  })).filter((era) => era.start && era.end) : [];

  return {
    title: normalizeTitle(data.title),
    accent: data.accent || null,
    events,
    eras
  };
}

function normalizeTitle(title) {
  if (!title) {
    return { headline: 'Timeline', text: '' };
  }

  return normalizeText(title.text || title);
}

function normalizeText(text) {
  if (!text) {
    return { headline: '', text: '' };
  }

  if (typeof text === 'string') {
    return { headline: '', text };
  }

  return {
    headline: text.headline || '',
    text: text.text || ''
  };
}

function normalizeOverlays(overlays) {
  if (!Array.isArray(overlays)) {
    return [];
  }

  return overlays.map((overlay) => ({
    label: overlay.label || '',
    value: overlay.value || '',
    color: overlay.color || ''
  })).filter((overlay) => overlay.label || overlay.value);
}

function parseTimelineDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? null : date;
  }

  const year = parseInt(value.year, 10);
  if (!Number.isFinite(year)) {
    return null;
  }

  const month = clampDatePart(value.month, 1, 12, 1) - 1;
  const day = clampDatePart(value.day, 1, 31, 1);
  const hour = clampDatePart(value.hour, 0, 23, 0);
  const minute = clampDatePart(value.minute, 0, 59, 0);
  const second = clampDatePart(value.second, 0, 59, 0);

  const date = new Date(Date.UTC(0, month, day, hour, minute, second));
  date.setUTCFullYear(year);

  return date;
}

function clampDatePart(value, min, max, fallback) {
  const number = parseInt(value, 10);
  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, number));
}

function renderHeader(timeline, settings) {
  const header = document.createElement('header');
  header.className = 'tlm__header';

  const heading = document.createElement('h2');
  heading.textContent = timeline.title.headline || 'Timeline';
  header.append(heading);

  if (timeline.title.text) {
    const intro = document.createElement('p');
    setRichText(intro, timeline.title.text, settings);
    header.append(intro);
  }

  return header;
}

function renderRail(timeline) {
  const rail = document.createElement('div');
  rail.className = 'tlm__rail';

  timeline.eras.forEach((era) => {
    const item = document.createElement('div');
    item.className = 'tlm__era';
    item.innerHTML = `<span>${escapeHtml(era.text.headline || formatYearRange(era.start, era.end))}</span>`;
    rail.append(item);
  });

  const nav = document.createElement('ol');
  nav.className = 'tlm__markers';

  timeline.events.forEach((event, index) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${event.id}`;
    link.innerHTML = `<span>${escapeHtml(formatDate(event.start))}</span>${escapeHtml(event.text.headline || `Event ${index + 1}`)}`;
    item.append(link);
    nav.append(item);
  });

  rail.append(nav);
  return rail;
}

function renderSlides(timeline, settings) {
  const slides = document.createElement('section');
  slides.className = 'tlm__slides';

  timeline.events.forEach((event) => {
    const article = document.createElement('article');
    article.className = 'tlm__slide';
    article.id = event.id;

    const media = renderMedia(event.media);
    const body = document.createElement('div');
    body.className = 'tlm__body';

    const eyebrow = document.createElement('time');
    eyebrow.dateTime = event.start.toISOString();
    eyebrow.textContent = event.end ? formatDateRange(event.start, event.end) : formatDate(event.start);

    const heading = document.createElement('h3');
    heading.textContent = event.text.headline || formatDate(event.start);

    body.append(eyebrow, heading);

    if (event.text.text) {
      const text = document.createElement('div');
      text.className = 'tlm__text';
      setRichText(text, event.text.text, settings);
      body.append(text);
    }

    if (event.overlays.length > 0) {
      body.append(renderOverlays(event.overlays));
    }

    if (event.group) {
      const group = document.createElement('p');
      group.className = 'tlm__group';
      group.textContent = event.group;
      body.append(group);
    }

    article.append(media, body);
    slides.append(article);
  });

  return slides;
}

function renderOverlays(overlays) {
  const list = document.createElement('ul');
  list.className = 'tlm__overlays';

  overlays.forEach((overlay) => {
    const item = document.createElement('li');
    if (overlay.color) {
      item.style.setProperty('--tlm-overlay-color', overlay.color);
    }

    if (overlay.label) {
      const label = document.createElement('span');
      label.textContent = overlay.label;
      item.append(label);
    }

    if (overlay.value) {
      const value = document.createElement('strong');
      value.textContent = overlay.value;
      item.append(value);
    }

    list.append(item);
  });

  return list;
}

function renderMedia(media) {
  const frame = document.createElement('figure');
  frame.className = 'tlm__media';

  if (media.url && isImageUrl(media.url)) {
    const image = document.createElement('img');
    image.src = media.url;
    image.alt = media.alt || media.caption || '';
    image.loading = 'lazy';
    frame.append(image);
  } else if (media.thumbnail && isImageUrl(media.thumbnail)) {
    const image = document.createElement('img');
    image.src = media.thumbnail;
    image.alt = media.alt || media.caption || '';
    image.loading = 'lazy';
    frame.append(image);
  } else if (media.url) {
    const link = document.createElement('a');
    link.href = media.url;
    link.textContent = media.caption || media.url;
    frame.append(link);
  }

  if (media.caption || media.credit) {
    const caption = document.createElement('figcaption');
    caption.textContent = [media.caption, media.credit].filter(Boolean).join(' ');
    frame.append(caption);
  }

  return frame;
}

function isImageUrl(url) {
  return /\.(apng|avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(url);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date);
}

function formatDateRange(start, end) {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function formatYearRange(start, end) {
  return `${start.getUTCFullYear()}-${end.getUTCFullYear()}`;
}

function setRichText(element, html, settings) {
  if (settings.allowHtml) {
    element.innerHTML = html;
    return;
  }

  element.textContent = html;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[char]);
}
