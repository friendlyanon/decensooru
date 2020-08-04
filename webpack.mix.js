"use strict";

const fs = require("fs");
const path = require("path");
const mix = require("laravel-mix");
require("laravel-mix-polyfill");

const pkg = require("./package.json");
const targets = pkg.browserslist?.join(", ") ?? "defaults";

const addUserScriptHeader = ({ compilation }) => {
  const [{ existsAt: file }] = Object.values(compilation.assets);
  const header = fs
    .readFileSync("header.js", "utf8")
    .replace(/\{([^}]+)\}/gu, (_, key) => pkg[key]);
  const id = Math.random()
    .toString(36)
    .slice(2);
  const extras = `
const d = self.document;
const $ = (s, r = d) => r.querySelector(s);
const $$ = (s, r = d) => r.querySelectorAll(s);
const on = (t, ...a) => t.addEventListener(...a);
const off = (t, ...a) => t.removeEventListener(...a);
const messageId = "${id}";
`;
  const contents = fs
    .readFileSync(file, "utf8")
    .replace(/(['"])use strict\1;/g, "");
  fs.unlinkSync(file);
  const name = `dist${path.sep}${pkg.name}.user.js`;
  fs.writeFileSync(name, header + extras + contents, "utf8");
};

// noinspection JSUnresolvedFunction
mix.polyfill({ targets })
  .ts(pkg.main, "dist")
  .then(addUserScriptHeader);
