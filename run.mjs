import fetch from 'node-fetch';
import parse from 'parse-apache-directory-index';
import { glob } from 'glob';
import fs from 'node:fs/promises';

const host = "https://download.kiwix.org";
// const response = await fetch(host + '/zim/wikipedia/?F=2');
// const body = await response.text();

const body = await fs.readFile('dump.html', 'utf8')
const listing = parse(body);

// fs.writeFile("dump.html", body)

const pathGlob = process.argv[2];

console.log({pathGlob});

const paths = await glob(pathGlob);
const path = paths[0];

if (!path) {
  console.log('no existing file found')
  exit(1);
}
console.log({path})


function zimFileMatch(input) {
  const match = input.match(/^(.*)((\d{4})-(\d{2}))\.zim$/)
  if (!match) return false;

  const [fullName, prefix, yearMonth, year, month] = match;
  return {fullName, prefix, yearMonth, year, month};
}

const match = zimFileMatch(path);
if (!match) {
  console.log("file doesn't match <filename><year-<month>.zim")
  exit(1);
}

const matchingPaths = listing.files.filter(path => {
  if (!path.name.startsWith(match.prefix)) {
    return false;
  }

  const pathMatch = zimFileMatch(path.name);

  return pathMatch.yearMonth > match.yearMonth;
})

if (matchingPaths.length === 0) {
  console.log("No newer file found.")
  exit(0);
}

const matchingPath = matchingPaths[0];

console.log(`New file found at ${host}${matchingPath.path}`)

// system('mv old file new file')
// system('curl new file')
// system('syctl kiwix restart')
// move old file aside
// download new file it its place
// restart kiwix server

