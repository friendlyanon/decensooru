// ==UserScript==
// @id             decensooru
// @name           decensooru
// @version        0.9.3.0
// @namespace      friendlyanon
// @author         friendlyanon
// @description    Addon for Better Better Booru to reveal hidden content.
// @license        WTFPL; http://www.wtfpl.net/about/
// @match          *://*.donmai.us/*
// @require        https://github.com/friendlyanon/decensooru/raw/master/imports.js
// @grant          none
// ==/UserScript==

/* This program is free software. It comes without any warranty, to the extent
 * permitted by applicable law. You can redistribute it and/or modify it under
 * the terms of the Do What The Fuck You Want To Public License, Version 2,
 * as published by Sam Hocevar. See http://www.wtfpl.net/ for more details. */

"use strict";

/* eslint-disable no-cond-assign, no-empty, no-fallthrough */
/* globals localforage, Danbooru, notInDatabase, HTML, $, $$ */

decensooru: {

/**
 * BASIC CONSTANTS
 */
$.DEBUG = false;
const d = document;
const w = window;
const isImagePage = /^\/posts\/(\d+)$/.test(location.pathname);

/**
 * RESTORE THE `HIDDEN` THUMBNAILS OR IMAGE VIEW ON A POST'S PAGE
 */
const Decensor = {
  async listing(node) {
    const href = node.parentNode.parentNode.getAttribute("href");
    const path = href.split("?")[0];
    const id = path.split("/").pop();
    const md5 = await $.get(id);
    const prev = node.previousElementSibling;
    if (md5) {
      const jpg = md5.split(".")[0] + ".jpg";
      const local = `https://danbooru.donmai.us//data/preview/${jpg}`;
      node.setAttribute("src", local);
      prev.setAttribute("srcset", local);
      prev.previousElementSibling.setAttribute("srcset", HTML.src(jpg));
    }
    else {
      node.setAttribute("src", notInDatabase);
      prev.setAttribute("srcset", notInDatabase);
      prev.previousElementSibling.setAttribute("srcset", notInDatabase);
    }
  },
  noteNodeMapper(note) {
    const { id, x, y, width, height, body } = note;
    return $.c("article", {
      id, textContent: body,
      dataset: { x, y, width, height, body }
    });
  },
  _notes() {
    const D = Danbooru;
    D.Note.embed = "true" === D.meta("post-has-embedded-notes");
    D.Note.load_all("bbb");
    D.Note.initialize_shortcuts();
    D.Note.initialize_highlight();
    $(window).on("hashchange", D.Note.initialize_highlight);
  },
  async notes(id) {
    const notesUrl = "/notes.json?group_by=note&search[post_id]=" + id;
    try {
      const res = (await $.xhr(notesUrl, "json")).response;
      $.extend($.id("notes"), { _children: res.map(Decensor.noteNodeMapper) });
    }
    catch(_) {}
    $.eval(Decensor._notes, true);
  },
  _post(e) {
    e.preventDefault();
    $.safe(w.Danbooru.Note.Box.toggle_all);
  },
  _error({ currentTarget: e }) {
    e.src = "/cached" + e.getAttribute("src");
  },
  async getDetails() {
    if (!isImagePage) return;
    Main.postInit();
    if (Decensor.postWorking) {
      return void ($.id("image") && (Decensor.postWorking = false));
    }
    Decensor.postWorking = true;
    $.safe($.propSet, $("#image-container object"), "id", "image");
    const postInfo = $("#post-information li");
    if (!postInfo) return Decensor.postWorking = false;
    const id = postInfo.textContent.trim().split(" ")[1];
    const data = await $.get(id);
    const parent = $.id("image-container");
    const lastEl = parent.lastElementChild;
    if (!data) {
      Decensor.postWorking = false;
      return void $.replace(lastEl, $.c("img", {
        src: notInDatabase
      }));
    }
    const [md5, ext] = data.split(".");
    const width = $("span[itemprop='width']").textContent.trim();
    const height = $("span[itemprop='height']").textContent.trim();
    return { ext, lastEl, data, md5, width, height };
  },
  finish(img, width, height, ugoira, data, type) {
    $.extend(img, {
      _event: { error_o: Decensor._error, load_o: Decensor.notes }
    });
    if (type) {
      $.add($.c("p", {
        innerHTML: `<a href="/data/${data}">Save this ${type} (right click and save)</a>`,
        _children: Decensor.saveContent(ugoira)
      }), parent);
    }
    $.extend(img, {
      dataset: {
        originalWidth: width,
        originalHeight: height
      }
    });
    $.add($.c("p", {
      className: "desc",
      textContent: d.title.slice(0, ~10)
    }), parent);
    Decensor.postWorking = false;
  },
  async post() {
    const details = await Decensor.getDetails();
    if (!details) return;
    const { ext, lastEl, data, md5, width, height } = details;
    let type, ugoira, img;
    switch (ext) {
      case "swf":
        type = "flash";
        $.replace(lastEl, $.c("object", {
          id: "image",
          innerHTML: `<params name="movie" value="/data/${data}"></params>`,
          width, height
        }));
        img = $.add($.c("embed", {
          src: `/data/${data}`,
          width, height, _setAttribute: { allowscriptaccess: "never" }
        }), $("params"));
        break;
      case "zip":
        ugoira = true;
      case "webm":
        type = "video";
        img = $.replace(lastEl, $.c("video", {
          src: `/data/${ugoira ? "sample/sample-" : ""}${md5}.webm`,
          id: "image",
          autoplay: true,
          loop: true,
          controls: true,
          alt: parent.dataset.tags,
          _setAttribute: { style: "max-width: 100%" }
        }));
        break;
      default:
        img = $.replace(lastEl, $.c("img", {
          src: `/data/${data}`,
          id: "image",
          alt: parent.dataset.tags,
          _setAttribute: { style: "max-width: 100%" }
        }));
        break;
    }
    Decensor.finish(img, width, height, ugoira, data, type);
  },
  saveContent(ugoira) {
    if (!ugoira) return [];
    const content = [];
    content.push(new Text(" | "));
    content.push($.c("a", {
      textContent: "Toggle notes", href: "#",
      _event: { click: Decensor._post }
    }));
    return content;
  }
};

/**
 * HANDLE THE RETRIEVAL AND UPDATE OF DATABASE
 */
const DataBase = {
  notDone: true,
  batches: "https://cdn.rawgit.com/friendlyanon/decensooru/master/batches/",
  async _initDB({ key, newValue }) {
    if (key !== "ayy") return;
    switch (newValue) {
      case "done":
        w.removeEventListener("storage", DataBase._initDB);
        DataBase.batchNumber = await $.get("db_version");
        localStorage.removeItem("ayy");
        return Main.init();
      case "startInit":
        return DataBase.cleanUp();
    }
    const el = $(".decensooru");
    if (el) {
      const svg = $("svg", el);
      if (!svg) {
        $.rm(el);
      }
    }
    Decensor.post();
  },
  async initDB() {
    $("body").classList.add("decensooru");
    $.add($.c("div", {
      id: "populating",
      innerHTML: HTML.populating
    }));
    DataBase.displayProgress = $("#populating .loadingText").children;
    DataBase.batchNumber = 0;
    while (DataBase.notDone) await DataBase.pullBatch();
    localStorage.setItem("ayy", "done");
    w.close();
  },
  all(line) {
    return $.set.apply(null, line.trim().split(":"));
  },
  async pullBatch() {
    try {
      fetcher: {
        const { batchNumber } = DataBase;
        const x = await $.xhr(DataBase.batches + batchNumber);
        const [outLeft, outRight] = DataBase.displayProgress;
        outLeft.textContent = "Downloading batch #";
        outRight.textContent = batchNumber;
        switch (x.status) {
          case 404: DataBase.notDone = false; break fetcher;
          case 200: case 304: break;
          default: throw new Error("Network error");
        }
        const pairs = x.responseText.trim().split("\n");
        outLeft.textContent = "Processing batch: ";
        for (let i = 0, len = Math.ceil(pairs.length / 500); i < len; ) {
          const pairBatch = pairs.splice(0, 500).map(DataBase.all);
          outRight.textContent = `${++i} / ${len}`;
          await Promise.all(pairBatch);
          Main.postInit();
        }
        await $.set("db_version", batchNumber);
      }
    }
    catch (err) {
      DataBase.notDone = null;
    }
    finally {
      switch (DataBase.notDone) {
        case true: ++DataBase.batchNumber; break;
        case false: await $.set("timestamp", Date.now());
        case null: DataBase.cleanUp();
      }
    }
  },
  async update() {
    $.add($.c("div", {
      id: "update",
      className: "decensooru",
      innerHTML: HTML.update
    }));
    DataBase.displayProgress = $("#update.decensooru .progress").children;
    while (DataBase.notDone) await DataBase.pullBatch();
    if (isImagePage) Decensor.post();
    else Main.postInit();
  },
  cleanUp() {
    $.each($$(".decensooru"), $.rm);
  }
};

/**
 * ENTRYPOINT
 */
const Main = {
  async setup() {
    const awaiter = { then(_) { this._ = _; } };
    console.log("Decensooru!");
    $.add($.c("style", { textContent: HTML.css }), d.head);
    $.add($.c("script", {
      type: "text/javascript",
      src: HTML.forage,
      _event: { load_o: function() { awaiter._(); } }
    }), d.head);
    await awaiter;
    localforage.config({
      name: "hiddenContent"
    });
    await localforage.ready();
    DataBase.batchNumber = await $.get("db_version");
    await Main.init();
  },
  openInitPage() {
    localStorage.setItem("ayy", "startInit");
    DataBase.cleanUp();
    w.open(location.origin + "/?initDB", "initDB", HTML.window);
  },
  async init() {
    if (location.pathname === "/" && location.search === "?initDB") {
      return DataBase.initDB();
    }
    if (DataBase.batchNumber == null) {
      w.addEventListener("storage", DataBase._initDB);
      return $.add($.c("div", {
        id: "update",
        className: "decensooru",
        innerHTML: "Click here to begin initial Decensooru setup",
        _setAttribute: { style: "padding: 5px" },
        _event: { click_o: Main.openInitPage }
      }));
    }
    if (Date.now() - 288e5 /* 8 HOURS */ > await $.get("timestamp")) {
      ++DataBase.batchNumber;
      DataBase.update();
    }
    if (isImagePage && !$.id("image")) {
      d.hidden ? setTimeout(Decensor.post, 500) : Decensor.post();
    }
    if (Main.mutObserver) return;
    (Main.mutObserver = new MutationObserver(Main.postInit)).observe(d.body, {
      childList: true,
      subtree: true
    });
    Main.postInit();
  },
  postInit() {
    $.each($$("img[src^='data:image']"), Decensor.listing);
  }
};

Main.setup().catch(console.error);

} // decensooru
