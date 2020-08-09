"use strict";

const fsPromises = require("fs").promises;
const path = require("path");

const replacements = ["\n", "  "];
const regex = / {4}|\x0D\x0A/g;
const replacer = match => replacements[match.length >> 2];
const file = path.join(__dirname, "dist", "decensooru.user.js");

async function format() {
  const content = await fsPromises.readFile(file, "utf8");
  await fsPromises.writeFile(file, content.replace(regex, replacer));
}

format().then(null, console.error);
