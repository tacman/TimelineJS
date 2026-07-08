export async function loadStory(target, url, options = {}) {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Could not load story JSON: ${response.status} ${response.statusText}`);
  }

  return createStory(target, await response.json(), options);
}

export function createStory(target, data, options = {}) {
  const element = resolveTarget(target);
  const story = normalizeStory(data);
  const settings = { allowHtml: options.allowHtml !== false };

  element.replaceChildren();
  element.classList.add('xst');

  element.append(renderHero(story, settings));
  const body = document.createElement('div');
  body.className = 'xst__body';

  story.blocks.forEach((block) => {
    body.append(renderBlock(block, story, settings));
  });

  element.append(body);

  return { element, data: story };
}

export function normalizeStory(data) {
  if (!data || !data.story || !Array.isArray(data.blocks)) {
    throw new Error('Story JSON must include story metadata and a blocks array.');
  }

  const assets = indexById(data.assets || []);
  const contexts = indexById(data.contexts || []);
  const connectors = indexById(data.connectors || []);

  return {
    story: data.story,
    album: data.album || {},
    assets,
    contexts,
    connectors,
    blocks: data.blocks.map((block, index) => ({
      id: block.id || `block-${index}`,
      type: block.type || 'text',
      title: block.title || '',
      eyebrow: block.eyebrow || block.date_range || '',
      body: block.body || '',
      assetId: block.asset_id || null,
      assetIds: block.asset_ids || [],
      quoteIds: block.quote_ids || [],
      contextIds: block.context_ids || [],
      connectorIds: block.connector_ids || [],
      raw: block
    })),
    projections: data.projections || {}
  };
}

function resolveTarget(target) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) {
    throw new Error('Story target element was not found.');
  }

  return element;
}

function indexById(items) {
  return new Map(items.filter((item) => item.id).map((item) => [item.id, item]));
}

function renderHero(story, settings) {
  const header = document.createElement('header');
  header.className = 'xst__hero';

  const text = document.createElement('div');
  text.className = 'xst__hero-text';

  const title = document.createElement('h1');
  title.textContent = story.story.title || 'Untitled story';
  text.append(title);

  if (story.story.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.className = 'xst__subtitle';
    subtitle.textContent = story.story.subtitle;
    text.append(subtitle);
  }

  if (story.story.dek) {
    const dek = document.createElement('p');
    dek.className = 'xst__dek';
    setRichText(dek, story.story.dek, settings);
    text.append(dek);
  }

  const meta = document.createElement('dl');
  meta.className = 'xst__meta';
  appendMeta(meta, 'Album', story.album.title || 'Curated bookmarks');
  appendMeta(meta, 'Blocks', String(story.blocks.length));
  appendMeta(meta, 'Assets', String(story.assets.size));
  appendMeta(meta, 'Connectors', String(story.connectors.size));

  header.append(text, meta);
  return header;
}

function renderBlock(block, story, settings) {
  switch (block.type) {
    case 'section':
      return renderSection(block, settings);
    case 'image_text':
      return renderImageText(block, story, settings);
    case 'image_full':
      return renderImageFull(block, story, settings);
    case 'quote_group':
      return renderQuoteGroup(block, story);
    case 'timeline_strip':
      return renderTimelineStrip(block, story);
    case 'connector_list':
      return renderConnectorList(block, story);
    case 'credits':
      return renderCredits(block, story, settings);
    default:
      return renderTextBlock(block, story, settings);
  }
}

function renderSection(block, settings) {
  const section = document.createElement('section');
  section.className = 'xst__block xst__section';
  section.id = block.id;

  appendHeading(section, block);
  appendBody(section, block.body, settings);

  return section;
}

function renderTextBlock(block, story, settings) {
  const section = document.createElement('section');
  section.className = 'xst__block xst__text-block';
  section.id = block.id;

  appendHeading(section, block);
  appendBody(section, block.body, settings);
  appendContextList(section, block, story);

  return section;
}

function renderImageText(block, story, settings) {
  const section = document.createElement('section');
  section.className = 'xst__block xst__image-text';
  section.id = block.id;

  const asset = story.assets.get(block.assetId);
  section.append(renderAsset(asset));

  const text = document.createElement('div');
  text.className = 'xst__block-copy';
  appendHeading(text, block);
  appendBody(text, block.body, settings);
  appendContextList(text, block, story);
  appendConnectorBadges(text, block, story);
  section.append(text);

  return section;
}

function renderImageFull(block, story, settings) {
  const section = document.createElement('section');
  section.className = 'xst__block xst__image-full';
  section.id = block.id;

  appendHeading(section, block);
  section.append(renderAsset(story.assets.get(block.assetId)));
  appendBody(section, block.body, settings);
  appendContextList(section, block, story);
  appendConnectorBadges(section, block, story);

  return section;
}

function renderQuoteGroup(block, story) {
  const section = document.createElement('section');
  section.className = 'xst__block xst__quote-group';
  section.id = block.id;

  appendHeading(section, block);

  const list = document.createElement('div');
  list.className = 'xst__quotes';
  block.quoteIds.map((id) => story.contexts.get(id)).filter(Boolean).forEach((quote) => {
    const item = document.createElement('blockquote');
    item.textContent = quote.body || '';
    if (quote.title) {
      const cite = document.createElement('cite');
      cite.textContent = quote.title;
      item.append(cite);
    }
    list.append(item);
  });

  section.append(list);
  return section;
}

function renderTimelineStrip(block, story) {
  const section = document.createElement('section');
  section.className = 'xst__block xst__timeline-strip';
  section.id = block.id;

  appendHeading(section, block);

  const list = document.createElement('ol');
  (story.projections.timeline?.items || []).forEach((item) => {
    const li = document.createElement('li');
    const range = document.createElement('span');
    range.textContent = [item.start, item.end].filter(Boolean).join('-');
    const label = document.createElement('strong');
    label.textContent = item.label;
    li.append(range, label);
    list.append(li);
  });

  section.append(list);
  return section;
}

function renderConnectorList(block, story) {
  const section = document.createElement('section');
  section.className = 'xst__block xst__connector-list';
  section.id = block.id;

  appendHeading(section, block);

  const list = document.createElement('ul');
  const connectorIds = block.connectorIds.length > 0 ? block.connectorIds : Array.from(story.connectors.keys());
  connectorIds.map((id) => story.connectors.get(id)).filter(Boolean).forEach((connector) => {
    const item = document.createElement('li');
    const label = document.createElement('strong');
    label.textContent = connector.label || connector.type;
    const body = document.createElement('p');
    body.textContent = connector.body || '';
    item.append(label, body);
    list.append(item);
  });

  section.append(list);
  return section;
}

function renderCredits(block, story, settings) {
  const section = document.createElement('section');
  section.className = 'xst__block xst__credits';
  section.id = block.id;

  appendHeading(section, block);
  appendBody(section, block.body, settings);

  if (story.story.credits?.length) {
    const list = document.createElement('ul');
    story.story.credits.forEach((credit) => {
      const item = document.createElement('li');
      item.textContent = credit;
      list.append(item);
    });
    section.append(list);
  }

  return section;
}

function renderAsset(asset) {
  const figure = document.createElement('figure');
  figure.className = 'xst__asset';

  if (!asset) {
    figure.textContent = 'Missing asset';
    return figure;
  }

  if (asset.media_url) {
    const image = document.createElement('img');
    image.src = asset.media_url;
    image.alt = asset.alt || asset.caption || asset.title || '';
    image.loading = 'lazy';
    figure.append(image);
  } else {
    const placeholder = document.createElement('a');
    placeholder.href = asset.source_url || '#';
    placeholder.className = 'xst__asset-placeholder';
    placeholder.textContent = asset.id;
    figure.append(placeholder);
  }

  const caption = document.createElement('figcaption');
  const title = document.createElement('strong');
  title.textContent = asset.title || asset.id;
  caption.append(title);

  const details = [asset.date, asset.creator, asset.rights].filter(Boolean).join(' | ');
  if (details) {
    caption.append(document.createTextNode(` ${details}`));
  }

  if (asset.caption) {
    const copy = document.createElement('p');
    copy.textContent = asset.caption;
    caption.append(copy);
  }

  figure.append(caption);
  return figure;
}

function appendHeading(element, block) {
  if (block.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'xst__eyebrow';
    eyebrow.textContent = block.eyebrow;
    element.append(eyebrow);
  }

  if (block.title) {
    const heading = document.createElement('h2');
    heading.textContent = block.title;
    element.append(heading);
  }
}

function appendBody(element, body, settings) {
  if (!body) {
    return;
  }

  const copy = document.createElement('div');
  copy.className = 'xst__copy';
  setRichText(copy, body, settings);
  element.append(copy);
}

function appendContextList(element, block, story) {
  const contexts = block.contextIds.map((id) => story.contexts.get(id)).filter(Boolean);
  if (contexts.length === 0) {
    return;
  }

  const list = document.createElement('aside');
  list.className = 'xst__contexts';
  contexts.forEach((context) => {
    const item = document.createElement('p');
    item.textContent = `${context.title}: ${context.body}`;
    list.append(item);
  });
  element.append(list);
}

function appendConnectorBadges(element, block, story) {
  const connectors = block.connectorIds.map((id) => story.connectors.get(id)).filter(Boolean);
  if (connectors.length === 0) {
    return;
  }

  const list = document.createElement('ul');
  list.className = 'xst__connector-badges';
  connectors.forEach((connector) => {
    const item = document.createElement('li');
    item.textContent = connector.label || connector.type;
    list.append(item);
  });
  element.append(list);
}

function appendMeta(list, term, description) {
  const dt = document.createElement('dt');
  dt.textContent = term;
  const dd = document.createElement('dd');
  dd.textContent = description;
  list.append(dt, dd);
}

function setRichText(element, html, settings) {
  if (settings.allowHtml) {
    element.innerHTML = html;
    return;
  }

  element.textContent = html;
}
