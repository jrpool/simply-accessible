// Imports
import fs from 'fs';
import jsdom from 'jsdom';
const {JSDOM} = jsdom;
import {insertEl, insertAtts, makeStd} from './makestd.mjs';

// Extract an object from the source file.
const args = process.argv.slice(2);
let srcFilePath;
if (args.length && args[0].endsWith('.json')) {
  srcFilePath = args[0];
}
else {
  throw new Error('Path of .json source file a required argument.');
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

// Create an empty JSDOM HTML document.
const dom = new JSDOM('<!DOCTYPE html>');
const {window} = dom;
const doc = window.document;
/*
console.log(
  JSON.stringify(
    Object.getOwnPropertyNames(Object.getPrototypeOf(doc)).sort(), null, 2
  )
);
*/

// Add content to it.
makeStd(src, doc);

console.log(JSON.stringify(doc.documentElement.outerHTML));
