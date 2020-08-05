"use strict";

const fs = require("fs");
const path = require("path");
const mix = require("laravel-mix");
require("laravel-mix-polyfill");

const pkg = require("./package.json");
const targets = pkg.browserslist?.join(", ") ?? "defaults";
const destinationFolder = "dist";

const addUserScriptHeader = ({ compilation }) => {
  const [{ existsAt: file }] = Object.values(compilation.assets);
  if (file == null || !file.endsWith(".js")) {
    return;
  }

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
  const name = path.join(destinationFolder, `${pkg.name}.user.js`);
  fs.writeFileSync(name, header + extras + contents, "utf8");
};

const rawLoader = {
  module: {
    rules: [
      {
        // have to use a different extension, because mix already loads css
        // with style-loader
        test: /\.css\.inc$/i,
        use: ["raw-loader"],
      }
    ],
  },
};

// noinspection JSUnresolvedFunction
mix.polyfill({ targets })
  .ts(pkg.main, destinationFolder)
  .setPublicPath(destinationFolder)
  .webpackConfig(rawLoader)
  .then(addUserScriptHeader);
