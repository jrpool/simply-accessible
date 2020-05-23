/*
  maketallscope.mjs
  Use a specified table-definition file to create a tall complex table
  with scope attributes. Write an HTML document containing the
  table to a specified file. Refuse to do this if the table has row
  complexity that exceeds what scope attributes can support.
  Arguments:
    0: table-definition file.
    1: output file.
*/

// Imports
import fs from 'fs';
import jsdom from 'jsdom';
const {JSDOM} = jsdom;
import pretty from  'pretty';
import {insertEl, insertAtts, makeStd} from './makestd.mjs';

const args = process.argv.slice(2);

// Validate the output file path.
let destFilePath;
if (args.length === 2 && args[1].endsWith('.html')) {
  destFilePath = args[1];
}
else {
  throw new Error('Path of .html destination file is required argument 1.');
}

// Extract an object from the source file.
let srcFilePath;
if (args.length && args[0].endsWith('.json')) {
  srcFilePath = args[0];
}
else {
  throw new Error('Path of .json source file is required argument 0.');
}
const srcString = fs.readFileSync(srcFilePath, 'utf8');
let src;
if (srcString) {
  src = JSON.parse(srcString);
  console.log('Source file parsed.');
}
else {
  throw new Error('Source file not readable.');
}

// Check the object's row complexity.
if (src.schema.categories.length > 2) {
  throw new Error('Row complexity too great for scope support.');
}

// Create an empty JSDOM HTML document.
const dom = new JSDOM('<!DOCTYPE html>');
const {window} = dom;
const doc = window.document;

// Add standard content to it.
makeStd(src, doc);

// Add a stylesheet reference to it.
insertEl(doc, 'head', false, 'link', null, {
  type: 'text/css',
  rel: 'stylesheet',
  href: 'tall-style.css'
});

// Function to process a top-level category.
const handleCat = (key, val, isFirst) => {
  let row;
  if (Array.isArray(val)) {
    row = insertEl(doc, 'tbody:last-child', false, 'tr', null, {});
    insertEl(doc, row, false, 'th', key, {
      scope: 'row'
    });
  }
  else {
    let tbody;
    if (isFirst) {
      tbody = doc.querySelector('tbody');
    }
    else {
      tbody = insertEl(doc, 'table', false, 'tbody', null, {});
    }
    row = insertEl(doc, tbody, false, 'tr', null, {});
    insertEl(doc, row, false, 'th', key, {
      colspan: src.schema.facts.colCount,
      scope: 'rowgroup'
    });
    Object.keys(val).forEach(key => {
      handleCat(key, val[key], false);
    });
  }
};

// Add a tall table to it.
let lastID = -1;
const IDMap = [];
const facts = src.schema.facts;
const headerSpecs = facts.headerSpecs;
headerSpecs.forEach(rowSpecs => {
  const tr = insertEl(doc, 'thead', false, 'tr', null, {});
  rowSpecs.forEach(cellSpecs => {
    const cell = insertEl(doc, tr, false, 'th', cellSpecs[0], {});
    if (cellSpecs[1] > 1) {
      insertAtts(doc, cell, {rowspan: cellSpecs[1]});
    }
    if (cellSpecs[2] > 1) {
      insertAtts(doc, cell, {
        colspan: cellSpecs[2],
        scope: 'colgroup'
      });
    }
    else {
      insertAtts(doc, cell, {scope: 'col'});
    }
    if (cellSpecs[3].length) {
      insertAtts(doc, cell, {id: `hd${++lastID}`});
      cellSpecs[3].forEach(col => {
        if (IDMap[col]) {
          IDMap[col].push(lastID);
        }
        else {
          IDMap[col] = [lastID];
        }
      });
    }
  });
});
const data = src.data;
Object.keys(data).forEach(key => {
  handleCat(key, data[key], IDMap, []);
});

// Output the HTML of the document.
fs.writeFileSync(destFilePath, pretty(dom.serialize()));
console.log(`File ${destFilePath} written.`);
