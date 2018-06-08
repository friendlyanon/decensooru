// ==UserScript==
// @id             decensooru
// @name           decensooru
// @version        0.9.1.0
// @namespace      friendlyanon
// @author         friendlyanon
// @description    Addon for Better Better Booru to reveal hidden content.
// @license        WTFPL; http://www.wtfpl.net/about/
// @match          *://*.donmai.us/*
// @grant          none
// ==/UserScript==

/* This program is free software. It comes without any warranty, to the extent
 * permitted by applicable law. You can redistribute it and/or modify it under
 * the terms of the Do What The Fuck You Want To Public License, Version 2,
 * as published by Sam Hocevar. See http://www.wtfpl.net/ for more details. */

"use strict";

/* eslint-disable no-cond-assign, no-empty, no-fallthrough */
/* globals localforage, Danbooru */

/**
 * BASIC CONSTANTS
 */
const DEBUG_SAFE = false;
const d = document;
const w = window;
const notInDatabase = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCA\
MAAAAL34HQAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABhQTFRF/52d//b2/\
9HRAAAA/8LC/7Ky/4iI/+LjcCOcXAAAA0BJREFUeNrsl4u2oyAMRSMHyv//8WhLK48AKtrGOwkrigHS\
wzZ4Z2gSaaSyVJbKUlkqS2WpLJWlslSWyurJ8vNVnAt+iefv14/mEFxbAhtNImteKi2R3wfBtCQ2pbW\
Tlvc99xvmnLtWKq10T9yds6kyPjXWTcz4VBmXS0ui0UA1X+hiadWqrlWhE1PNvvJl8BvyF6ftEC0g3C\
+trStl4auysFeW+YaswOtKWqbafG0EZv651z1uWKwT2dgO0nrhAlNxuJyWadD6eEQm3FNeR/LPtExUk\
7H7LB73EdggnovQRzIfppK71R+gtdABx+UsWvsbwhWF1uIc4JCqAVoGEEnLFF8DRsdRWmY2H5wzz/Tx\
6gPp1PCVyoNlDp/1czfHaF3fyIg0CuQ8Q9NnfV+lvo55pu+Z9bXfC3GxtFTWH5Bl56s4F0xLYDtMy5r\
oL9Gg2Qto4RJaIt8hT8v+vraGMyB9o8s/bk6gZUcNyQPelzHjadnsTVrmzdqMll3rH/ka26gU7rdOp1\
WGDtOyQ474Gc87RnPKpSVWlgteM9eMI16PZx/8Grex7wTTchIbre+w5rbzvHf9lnGptNzOvX/HD9JyA\
7GNtCQ2cmFPslwuLYlGTuRbzGhheJ84jdZqNksa7yGPczbH0ZtrK/dkfC8t/IKWKFmRNFAUI2YOmLXJ\
PKTP+dapRME9r6HlP3j5Xp+x7BmtCYvuMsZNY0ORstCwXAFycUPwNELpqnQN4IpYmQfEZv5EspeDXrF\
snYD2tNowMlqIdpHsHU1az5dR8GOoZnmQ5wnr3rneuEKtI61JrDUcHGktI1lDYb8U8n3mIuRqVBteFu\
Y0aVUqIHvq0wLHOSOWZqEW+/qvdnWjk4ef4/g5TJ2gRwv9kwieTeskplVZVmpx1pFVfJG9OAVMHhRnq\
Tg9JNQltlVfbFzcMfF8nJjxWh6qcHqPyKQl1SRW/J2Mq+pWxe85DdSJ342V2u3sMeSPk9aUMam0Vr15\
v9fohDlUicqlJa+RSJdKq32Gf8lT25lfHm0fWg/GqOGPSj+OPZjnXt40331osQAHjXbPv09t/d5Ipou\
lJZKX4NpSWSpLZakslaWyVJbKUln/nax/AgwAE+Yw8Q3qDzQAAAAASUVORK5CYII=";
const strings = [
  "https://cdn.rawgit.com/github/fetch/master/fetch.js",
  "https://cdn.rawgit.com/mozilla/localForage/master/dist/localforage.js",
  "width=600,height=300,toolbar=0,menubar=0,location=0,status=0,scrollbars=0,re\
sizable=0"
];
let postsAreObserved;

/**
 * VARIABLE TO HELP WITH STAGGERING REFRESHES IN `DataBase.pullBatch`
 */
let counter = 0;

/**
 * UTILITIES
 */
const $$ = (a, b = d) => b.querySelectorAll(a);
const $ = (a, b) => $$(a, b)[0] || null;

$.keys = Object.keys;

$.extend = function(obj, props) {
  let _setAttribute, _event, _children, _dataset;
  if (props.hasOwnProperty("_setAttribute")) {
    _setAttribute = props._setAttribute;
    delete props._setAttribute;
  }
  if (props.hasOwnProperty("_children")) {
    _children = props._children;
    delete props._children;
  }
  if (props.hasOwnProperty("_event")) {
    _event = props._event;
    delete props._event;
  }
  if (props.hasOwnProperty("dataset")) {
    _dataset = props.dataset;
    delete props.dataset;
  }
  for (let i = 0, arr = $.keys(props), len = arr.length, key; i < len; ++i) {
    obj[key = arr[i]] = props[key];
  }
  if (obj instanceof Node) {
    if (_setAttribute) {
      const _props = _setAttribute, arr = $.keys(_props);
      for (let i = 0, len = arr.length, key; i < len; ++i) {
        obj.setAttribute(key = arr[i], _props[key]);
      }
    }
    if (_children) {
      const arr = _children;
      for (let i = 0, len = arr.length; i < len; ++i) {
        $.add(arr[i], obj);
      }
    }
    if (_event) {
      const arr = $.keys(_event);
      for (let i = 0, len = arr.length, key, evt; i < len; (evt = $.u) || ++i) {
        const opts = [];
        if ((key = arr[i]).endsWith("_o")) {
          evt = key.substring(0, key.length - 2);
          opts[0] = { once: true };
        }
        obj.addEventListener(evt || key, _event[key], ...opts);
      }
    }
    if (_dataset) {
      $.extend(obj.dataset, _dataset);
    }
  }
  return obj;
};

$.extend($, {
  c(c, o) {
    const el = d.createElement(c);
    return o ? $.extend(el, o) : el;
  },
  r: (function(){
    let queue = [];
    d.addEventListener("DOMContentLoaded", () => {
      for (let i = 0, len = queue.length; i < len; ++i) {
        $.safe(queue[i].fn, ...queue[i].args);
      }
      queue = $.u;
    }, { once: true });
    return (fn, ...args) => queue
    ? queue[queue.length] = { fn, args }
    : $.safe(fn, ...args);
  }()),
  _rm(el) { el.parentNode.removeChild(el); },
  rm(el) {
    $.safe($._rm, el);
  },
  _add(el, to) { to.appendChild(el); },
  add(el, to = d.body) {
    $.safe($._add, el, to);
    return el;
  },
  _replace(o, n) {
    o.parentNode.replaceChild(n, o);
    return n;
  },
  replace(old, replacement) {
    return $.safe($._replace, old, replacement);
  },
  safe(fn, ...args) {
    let ret;
    try { ret = fn(...args); }
    catch(err) { if (DEBUG_SAFE) console.error(err); }
    return ret;
  },
  eval(text = "", objMethod = false) {
    const script = $.c("script");
    if (typeof text === "function") {
      text = (objMethod ? "(function " : "(") + String(text) + ")()";
    }
    $.add(new Text(text), script);
    $.add(script, d.documentElement);
    $.rm(script);
  },
  get(key) {
    return localforage.getItem(key);
  },
  set(key, value) {
    if (++counter > 100) {
      counter = 0;
      localStorage.setItem("ayy", key);
    }
    return localforage.setItem(key, value);
  },
  propSet(parent, prop, value) {
    parent[prop] = value;
  },
  u: void 0,
  _regex: [/^\/posts\/(\d+)$/]/* 0 */
});

/**
 * SVG CONSTANTS
 */
const SVG = {
  spinner: 'px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preser\
veAspectRatio="xMidYMid" class="uil-ring-alt"><rect x="0" y="0" width="100" hei\
ght="100" fill="none" class="bk"></rect><circle cx="50" cy="50" r="40" stroke="\
#b4b197" fill="none" stroke-width="10" stroke-linecap="round"></circle><circle \
cx="50" cy="50" r="40" stroke="#f4efcc" fill="none" stroke-width="6" stroke-lin\
ecap="round"><animate attributeName="stroke-dashoffset" dur="1s" repeatCount="i\
ndefinite" from="0" to="502"></animate><animate attributeName="stroke-dasharray\
" dur="1s" repeatCount="indefinite" values="150.6 100.4;1 250;150.6 100.4"></an\
imate></circle></svg>'
};
$.extend(SVG, {
  spinner100: '<svg width="100px" height="100' + SVG.spinner,
  spinner34: '<svg width="34px" height="34' + SVG.spinner
});

/**
 * NAMESPACES
 */
let Main, DataBase, Decensor;

/**
 * RESTORE THE `HIDDEN` THUMBNAILS OR IMAGE VIEW ON A POST'S PAGE
 */
Decensor = {
  async listing(node) {
    const href = node.parentNode.getAttribute("href");
    const path = href.split("?")[0];
    const id = path.split("/").pop();
    const md5 = await $.get(id);
    let reveal = notInDatabase;
    if (md5) {
      reveal = `/data/preview/${md5.split(".")[0]}.jpg`;
    }
    node.setAttribute("src", reveal);
  },
  _notes() {
    let D = Danbooru;
    D.Note.embed = "true" === D.meta("post-has-embedded-notes");
    D.Note.load_all("bbb");
    D.Note.initialize_shortcuts();
    D.Note.initialize_highlight();
    $(window).on("hashchange", D.Note.initialize_highlight);
  },
  async notes(id) {
    const notesUrl = "/notes.json?group_by=note&search[post_id]=" + id;
    try {
      const request = await fetch(notesUrl);
      const json = await request.json();
      const _children = [];
      for (let i = -1, note; json[++i] = note; ) {
        const { id, x, y, width, height, body } = note;
        _children[i] = $.c("article", {
          id, textContent: body,
          dataset: { x, y, width, height, body }
        });
      }
      $.add($.extend(d.createDocumentFragment(), { _children }), $("#notes"));
    }
    catch(_) {}
    $.eval(Decensor._notes, true);
  },
  _post(e) {
    e.preventDefault();
    $.safe(w.Danbooru.Note.Box.toggle_all);
  },
  _error({currentTarget: e}) {
    e.src = "/cached" + e.getAttribute("src");
  },
  async post() {
    Main.postInit();
    if (Decensor.postWorking) return;
    else {
      Decensor.postWorking = true;
    }
    $.safe($.propSet, $("#image-container object"), "id", "image");
    if ($("#image")) {
      return Decensor.postWorking = false;
    }
    const id = $("#post-information li").textContent.trim().split(" ")[1];
    const data = await $.get(id);
    const parent = $("#image-container");
    const lastEl = parent.lastElementChild;
    if (!data) {
      Decensor.postWorking = false;
      return $.replace(lastEl, $.c("img", {
        src: notInDatabase
      }));
    }
    const [md5, ext] = data.split(".");
    const width = $("span[itemprop='width']").textContent.trim();
    const height = $("span[itemprop='height']").textContent.trim();
    let type, ugoira, img;
    switch(ext) {
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
        src: "/data/" + (ugoira ? "sample/sample-" : "") + `${md5}.webm`,
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
    $.extend(img, {
      _event: { error_o: Decensor._error, load_o: Decensor.notes }
    });
    if (!type) {
      $.extend(img, {
        dataset: {
          originalWidth: width,
          originalHeight: height
        }
      });
      Decensor.postWorking = false;
      return $.add($.c("p", {
        className: "desc",
        textContent: d.title.substring(0, d.title.length - 11)
      }), parent);
    }
    const _children = ugoira
    ? [
      new Text(" | "),
      $.c("a", {
        textContent: "Toggle notes", href: "#",
        _event: { click: Decensor._post }
      })
    ]
    : [];
    $.add($.c("p", {
      innerHTML:
        `<a href="/data/${data}">Save this ${type} (right click and save)</a>`,
      _children
    }), parent);
    Decensor.postWorking = false;
  }
};

/**
 * HANDLE THE RETRIEVAL AND UPDATE OF DATABASE
 */
DataBase = {
  notDone: true,
  batches: "https://cdn.rawgit.com/friendlyanon/decensooru/master/batches/",
  async _initDB({key, newValue}) {
    if (key !== "ayy") return;
    switch(newValue) {
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
      innerHTML: `<div class="loadingSpinner"><div>${SVG.spinner100}</div></div>
<div class="loadingText">Downloading batch #<span class="progress">0</span> . . 
.<br /><br /><strong>Your browser might freeze for several minutes. Don't panic!
</strong><br />This is the initial setup and will only occur this one time.
<br />Future updates to the local database will happen in a non-intrusive way.
<br />Happy Booru browsing!</div>`
    }));
    DataBase.displayProgress = $("#populating .progress").lastChild;
    DataBase.batchNumber = 0;
    while(DataBase.notDone) {
      await DataBase.pullBatch();
    }
    localStorage.setItem("ayy", "done");
    w.close();
  },
  _all(post) {
    return $.set(...post.split(":"));
  },
  all(text) {
    return text.trim().split("\n").map(DataBase._all);
  },
  async pullBatch() {
    try {
      fetcher: {
        const {batchNumber} = DataBase;
        const request = await fetch(DataBase.batches + batchNumber);
        let networkError = true, _404 = false;
        switch(request.status) {
         case 404:
          _404 = true;
         case 200:
         case 304:
          networkError = false;
        }
        if (_404) {
          DataBase.notDone = false;
          break fetcher;
        }
        if (networkError) {
          throw new Error("Network error");
        }
        $.safe($.propSet, DataBase.displayProgress, "data", batchNumber);
        await Promise.all(DataBase.all(await request.text()));
        await $.set("db_version", batchNumber);
      }
    }
    catch (err) {
      DataBase.notDone = null;
    }
    finally {
      switch(DataBase.notDone) {
       case true:
        ++DataBase.batchNumber;
        break;
       case false:
        await $.set("timestamp", Date.now());
       case null:
        DataBase.cleanUp();
      }
    }
  },
  async update() {
    $.add($.c("div", {
      id: "update",
      className: "decensooru",
      innerHTML: `${SVG.spinner34}<br />Updating to 
#<span class="progress">${DataBase.batchNumber}</span>`
    }));
    DataBase.displayProgress = $("#update.decensooru .progress").lastChild;
    while(DataBase.notDone) {
      await DataBase.pullBatch();
    }
    Decensor.post();
  },
  async cleanUp() {
    for (let i = 0, arr = $$(".decensooru"), len = arr.length; i < len; ++i) {
      $.rm(arr[i]);
    }
  }
};

/**
 * ENTRYPOINT
 */
Main = {
  async _setup() {
    localforage.config({
      name: "hiddenContent"
    });
    await localforage.ready();
    DataBase.batchNumber = await $.get("db_version");
    try {
      await Main.init();
    } catch(err) { console.error(err); }
  },
  setup() {
    console.log("Decensooru!");
    $.add($.c("style", { textContent: Main.css }), d.head);
    Main.polyfill();
  },
  polyfill() {
    if (!w.fetch) {
      console.log("Polyfilling `fetch`");
      $.add($.c("script", {
        type: "text/javascript",
        src: strings[0],
        _event: { load_o: Main.localForage }
      }), d.head);
    }
    else {
      Main.localForage();
    }
  },
  localForage() {
    $.add($.c("script", {
      type: "text/javascript",
      src: strings[1],
      _event: { load_o: Main._setup }
    }), d.head);
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
        innerHTML: `Click here to begin initial Decensooru setup`,
        _setAttribute: { style: "padding: 5px" },
        _event: {
          click_o: () => {
            localStorage.setItem("ayy", "startInit");
            return w.open(location.origin + "/?initDB", "initDB", strings[2]);
          }
        }
      }));
    }
    if (Date.now() - 288e5 /* 8 HOURS */ > await $.get("timestamp")) {
      ++DataBase.batchNumber;
      DataBase.update();
    }
    $.safe(Main.pageMode);
  },
  pageMode() {
    if (!postsAreObserved) {
      postsAreObserved = true;
      const mutObserver = new MutationObserver(Main.postInit);
      mutObserver.observe(d.body, {
        childList: true,
        subtree: true
      });
      Main.postInit();
    }
    if ($._regex[0].test(location.pathname) && !$("#image")) {
      return d.hidden ? setTimeout(Decensor.post, 500) : Decensor.post();
    }
  },
  postInit() {
    const arr = $$("img[src^='data:image']");
    for (let i = 0, len = arr.length; i < len; ++i) {
      $.safe(Decensor.listing, arr[i]);
    }
  },
  css: `
body.decensooru > *:not(#populating) {
  display: none ! important;
}
#populating {
  text-align: center;
  width: 100vw;
  height: 100vh;
}
#populating > div {
  height: 50vh;
}
.loadingSpinner {
  position: relative;
}
.loadingSpinner > div {
  position: absolute;
  bottom: 0;
  width: 100%;
  text-align: center;
}
#update.decensooru {
  background: white;
  text-align: center;
  display: inline-block;
  position: fixed;
  top: 0;
  right: 0;
  border-bottom: 1px solid black;
  border-left: 1px solid black;
  font-size: 16px;
}
`
};

Main.setup();
