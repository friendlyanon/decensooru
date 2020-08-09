import resolve from "@rollup/plugin-node-resolve";
import { string } from "rollup-plugin-string";
import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

function banner() {
  const id = Math.random()
    .toString(36)
    .slice(2);

  return `
// ==UserScript==
// @name           ${pkg.name}
// @version        ${pkg.version}
// @namespace      ${pkg.author}
// @author         ${pkg.author}
// @description    ${pkg.description}
// @license        ${pkg.license}
// @match          https://danbooru.donmai.us/*
// @grant          none
// @run-at         document-start
// ==/UserScript==

// This program is free software. It comes without any warranty, to the extent
// permitted by applicable law. You can redistribute it and/or modify it under
// the terms of the Do What The Fuck You Want To Public License, Version 2, as
// published by Sam Hocevar. See http://www.wtfpl.net/ for more details.

"use strict";

const d = self.document;
const $ = (s, r = d) => r.querySelector(s);
const $$ = (s, r = d) => r.querySelectorAll(s);
const on = (t, ...a) => t.addEventListener(...a);
const off = (t, ...a) => t.removeEventListener(...a);
const messageId = "${id}";

`.slice(1, -1);
}

export default {
  input: pkg.main,
  output: {
    file: "dist/decensooru.user.js",
    format: "es",
    banner,
  },
  plugins: [
    resolve(),
    string({ include: "**/*.css" }),
    typescript({
      tsconfig: "./tsconfig.rollup.json",
    }),
  ],
};
