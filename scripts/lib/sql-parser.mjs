// Minimal MySQL dump INSERT parser.
// Extracts rows from `INSERT INTO \`table\` (cols) VALUES (...),(...);` statements.

/**
 * Parse all INSERT statements for a given table from a SQL dump string.
 * Returns an array of row objects keyed by column name.
 */
export function extractTable(sql, table) {
  const rows = [];
  const marker = `INSERT INTO \`${table}\``;
  let idx = 0;
  while ((idx = sql.indexOf(marker, idx)) !== -1) {
    // Parse column list
    const colStart = sql.indexOf('(', idx);
    const colEnd = sql.indexOf(')', colStart);
    const cols = sql
      .slice(colStart + 1, colEnd)
      .split(',')
      .map((c) => c.trim().replace(/^`|`$/g, ''));

    const valuesIdx = sql.indexOf('VALUES', colEnd);
    let i = valuesIdx + 'VALUES'.length;

    // Parse tuples until statement-terminating semicolon
    while (i < sql.length) {
      // skip whitespace and commas
      while (i < sql.length && /[\s,]/.test(sql[i])) i++;
      if (sql[i] === ';') {
        i++;
        break;
      }
      if (sql[i] !== '(') break; // unexpected; bail out of this statement
      const { values, next } = parseTuple(sql, i);
      i = next;
      const row = {};
      for (let c = 0; c < cols.length; c++) row[cols[c]] = values[c];
      rows.push(row);
    }
    idx = i;
  }
  return rows;
}

function parseTuple(sql, start) {
  // start points at '('
  const values = [];
  let i = start + 1;
  while (i < sql.length) {
    while (/\s/.test(sql[i])) i++;
    const ch = sql[i];
    if (ch === ')') {
      i++;
      break;
    }
    if (ch === ',') {
      i++;
      continue;
    }
    if (ch === "'") {
      const { str, next } = parseString(sql, i);
      values.push(str);
      i = next;
    } else if (sql.startsWith('NULL', i)) {
      values.push(null);
      i += 4;
    } else {
      // number or bare token
      let j = i;
      while (j < sql.length && !/[,)]/.test(sql[j])) j++;
      values.push(sql.slice(i, j).trim());
      i = j;
    }
  }
  return { values, next: i };
}

function parseString(sql, start) {
  // start points at opening quote
  let out = '';
  let i = start + 1;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === '\\') {
      const nx = sql[i + 1];
      const map = { n: '\n', t: '\t', r: '\r', '0': '\0', b: '\b', Z: '\x1a' };
      out += map[nx] !== undefined ? map[nx] : nx;
      i += 2;
    } else if (ch === "'") {
      if (sql[i + 1] === "'") {
        out += "'";
        i += 2;
      } else {
        i++;
        break;
      }
    } else {
      out += ch;
      i++;
    }
  }
  return { str: out, next: i };
}
