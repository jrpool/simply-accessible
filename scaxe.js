// scaxe: Tally success criteria tested by axe-core.

const fs = require('fs');
// Get the axe-core rule data.
const axetsv = fs.readFileSync(
  `${__dirname}/../data/assets/axecore.txt`, 'utf8'
);
// Convert the data to an array of arrays.
const axetable = axetsv.split('\n').map(line => line.split('\t'));
// Initialize an object describing success criteria.
const sctable = {};
// For each axe-core rule:
axetable.forEach(row => {
  // If it has the correct count of items:
  if (row.length === 4) {
    // Identify the authorities it invokes.
    const authorities = row[3];
    // Identify the WCAG success criteria implied by the authorities.
    const sca = authorities.match(/(?<=wcag)\d{3,}(?=[,"])/g);
    // If there are any such success criteria:
    if (sca) {
      // For each of them:
      sca.forEach(sc => {
        // Identify its conventional ID.
        dottedsc = `${sc[0]}.${sc[1]}.${sc.slice(2)}`;
        // If the success-criterion table already contains an entry for it:
        if (sctable[dottedsc]) {
          // Append the rule to its rule array.
          sctable[dottedsc].push(row[0]);
        }
        // Otherwise:
        else {
          // Create an entry for it, with its rule as a 1-item array value.
          sctable[dottedsc] = [row[0]];
        }
      });
    }
  }
});
// Identify the success criteria with entries in the table, sorted.
const sca = Object.keys(sctable).sort((a, b) => {
  const aranker = a.split('.').map(part => Number.parseInt(part));
  const branker = b.split('.').map(part => Number.parseInt(part));
  const arank = 1000 * aranker[0] + 100 * aranker[1] + aranker[2];
  const brank = 1000 * branker[0] + 100 * branker[1] + branker[2];
  return Math.sign(arank - brank);
});
/*
  Identify an array of items, each being an array with a success criterion
  as its first item and a sorted array of its axe-core rules as its second
  item.
*/
const screport = sca.map(sc => [sc, sctable[sc].sort()]);
// Output the report.
fs.writeFileSync(
  `${__dirname}/../data/assets/scaxe.txt`, JSON.stringify(screport, null, 2)
);
