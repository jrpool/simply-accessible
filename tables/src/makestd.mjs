// Function to return an identified element.
const elementOf = (doc, selectorOrElement) => {
  let element;
  if (typeof selectorOrElement === 'string') {
    element = doc.querySelector(selectorOrElement);
  }
  else {
    element = selectorOrElement;
  }
  return element;
};

// Function to insert an element into a document.
const insertEl = (
  doc, selectorOrElement, isAtStart, type, textContent, attributes
) => {
  const newEl = doc.createElement(type);
  if (textContent) {
    newEl.textContent = textContent;
  }
  Object.keys(attributes).forEach(key => {
    newEl.setAttribute(key, attributes[key]);
  });
  elementOf(doc, selectorOrElement).insertAdjacentElement(
    isAtStart ? 'afterbegin' : 'beforeend', newEl
  );
  return newEl;
};

// Function to insert attributes into an element.
const insertAtts = (doc, selectorOrElement, attributes) => {
  const element = elementOf(doc, selectorOrElement);
  Object.keys(attributes).forEach(key => {
    element.setAttribute(key, attributes[key]);
  });
};

// Function to insert a meta element into the head.
const insertMeta = (doc, src, name) => {
  if (src[name]) {
    insertEl(doc, 'head', false, 'meta', null, {
      name,
      content: src[name]
    });
  }
};

// Function to populate the document with standard content.
const makeStd = (src, doc) => {
  insertAtts(doc, 'html', {'lang': 'en-US'});
  insertEl(doc, 'head', false, 'meta', null, {
    name: 'viewport',
    content: 'width=device-width, initial-scale=1'
  });
  insertMeta(doc, src, 'author');
  if (src.authorlink) {
    insertEl(doc, 'head', false, 'link', null, {
      'rel': 'author',
      'href': src.authorlink
    });
  }
  insertMeta(doc, src, 'creator');
  insertMeta(doc, src, 'publisher');
  insertMeta(doc, src, 'description');
  insertMeta(doc, src, 'keywords');
  insertEl(doc, 'head', false, 'title', src.titleh1, {});
  insertEl(doc, 'body', false, 'main', null, {});
  insertEl(doc, 'main', false, 'header', null, {});
  insertEl(doc, 'header', false, 'h1', src.titleh1, {});
  insertEl(doc, 'main', false, 'table', null, {});
  if (src.caption) {
    insertEl(doc, 'table', false, 'caption', src.caption, {});
  }
  insertEl(doc, 'table', false, 'thead', null, {});
  insertEl(doc, 'table', false, 'tbody', null, {});
};

export {insertEl, insertAtts, makeStd};
