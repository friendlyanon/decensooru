"use strict";

const { readFile, writeFile } = require("fs").promises;
const path = require("path");

const replacements = ["\n", "  "];
const regex = / {4}|\x0D\x0A/g;
const replacer = match => replacements[match.length >> 2];
const file = path.join(__dirname, "dist", "decensooru.user.js");

readFile(file, "utf8")
  .then(content => writeFile(file, content.replace(regex, replacer)))
  .then(null, console.error);
