// Function to insert an element into a document.
const insertEl = (doc, selector, isAtStart, type, textContent, attributes) => {
  const newEl = doc.createElement(type);
  if (textContent) {
    newEl.textContent = textContent;
  }
  Object.keys(attributes).forEach(key => {
    newEl.setAttribute(key, attributes[key]);
  });
  doc.querySelector(selector).insertAdjacentElement(
    isAtStart ? 'afterbegin' : 'beforeend', newEl
  );
  return newEl;
};

// Function to insert attributes into an element.
const insertAtts = (doc, selector, attributes) => {
  const el = doc.querySelector(selector);
  Object.keys(attributes).forEach(key => {
    el.setAttribute(key, attributes[key]);
  });
};

const makeStd = (src, doc) => {
  insertAtts(doc, 'html', {'lang': 'en-US'});
  insertEl(doc, 'head', true, 'meta', null, {
    'name': 'viewport',
    'content': 'width=device-width, initial-scale=1'
  });
  insertEl(doc, 'head', true, 'title', src.title, {});
};

// module.exports = {insertEl, insertAtts, makeStd};
export {insertEl, insertAtts, makeStd};
