// ==UserScript==
// @id             decensooru
// @name           decensooru
// @version        0.9.2.1
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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const DEBUG = false;
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
const isImagePage = /^\/posts\/(\d+)$/.test(location.pathname);
let postsAreObserved;

/**
 * UTILITIES
 */
function $$(a, b = d.body) {
  return b.querySelectorAll(a);
}
function $(a, b = d) {
  return b.querySelector(a);
}

$.extend = function (obj, props) {
  let _setAttribute, _event, _children, _dataset;
  for (const key in props) {
    switch (key) {
      case "_setAttribute":
        _setAttribute = props._setAttribute;continue;
      case "_children":
        _children = props._children;continue;
      case "_event":
        _event = props._event;continue;
      case "dataset":
        _dataset = props.dataset;continue;
      default:
        obj[key] = props[key];continue;
    }
  }
  if (obj instanceof Node) {
    if (_setAttribute) {
      for (const key in _setAttribute) {
        obj.setAttribute(key, _setAttribute[key]);
      }
    }
    if (_children) {
      for (let i = 0, len = _children.length; i < len; ++i) {
        $.add(_children[i], obj);
      }
    }
    if (_event) {
      const on = obj.addEventListener;
      for (const key in _event) {
        const args = [key, _event[key]];
        if (key.endsWith("_o")) {
          args[0] = key.substring(0, key.length - 2);
          args.push({ once: true });
        }
        on.apply(obj, args);
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
  _rm(el) {
    el.parentNode.removeChild(el);
  },
  rm(el) {
    $.safe($._rm, el);
  },
  _add(el, to) {
    to.appendChild(el);
  },
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
  safe() {
    let ret;
    const args = [];
    args.push.apply(args, arguments);
    try {
      ret = args.shift().apply($.u, args);
    } catch (err) {
      if (DEBUG) console.error(err);
    }
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
    return localforage.setItem(key, value);
  },
  propSet(parent, prop, value) {
    parent[prop] = value;
  },
  u: void 0
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
  listing(node) {
    return _asyncToGenerator(function* () {
      const href = node.parentNode.parentNode.getAttribute("href");
      const path = href.split("?")[0];
      const id = path.split("/").pop();
      const md5 = yield $.get(id);
      if (md5) {
        const jpg = md5.split(".")[0] + ".jpg";
        const local = `https://danbooru.donmai.us//data/preview/${jpg}`;
        node.setAttribute("src", local);
        node.previousElementSibling.setAttribute("srcset", local);
        node.previousElementSibling.previousElementSibling.setAttribute("srcset", `https://raikou3.donmai.us/crop/${jpg.slice(0, 2)}/${jpg.slice(2, 4)}/${jpg}`);
      } else {
        node.setAttribute("src", notInDatabase);
        node.previousElementSibling.setAttribute("srcset", notInDatabase);
        node.previousElementSibling.previousElementSibling.setAttribute("srcset", notInDatabase);
      }
    })();
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
  notes(id) {
    return _asyncToGenerator(function* () {
      const notesUrl = "/notes.json?group_by=note&search[post_id]=" + id;
      try {
        const x = new XMLHttpRequest();
        const awaiter = { then(ok, err) {
            x.onload = ok;x.onerror = err;
          } };
        x.open("GET", notesUrl);
        x.responseType = "json";
        x.send();
        const json = (yield awaiter).response;
        const _children = json.map(Decensor.noteNodeMapper);
        $.add($.extend(d.createDocumentFragment(), { _children }), $("#notes"));
      } catch (_) {}
      $.eval(Decensor._notes, true);
    })();
  },
  _post(e) {
    e.preventDefault();
    $.safe(w.Danbooru.Note.Box.toggle_all);
  },
  _error({ currentTarget: e }) {
    e.src = "/cached" + e.getAttribute("src");
  },
  post() {
    return _asyncToGenerator(function* () {
      if (!isImagePage) return;
      Main.postInit();
      if (Decensor.postWorking) return;else {
        Decensor.postWorking = true;
      }
      if ($("#image")) {
        return Decensor.postWorking = false;
      }
      $.safe($.propSet, $("#image-container object"), "id", "image");
      const postInfo = $("#post-information li");
      if (!postInfo) return Decensor.postWorking = false;
      const id = postInfo.textContent.trim().split(" ")[1];
      const data = yield $.get(id);
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
        $.add($.c("p", {
          className: "desc",
          textContent: d.title.substring(0, d.title.length - 11)
        }), parent);
        return Decensor.postWorking = false;
      }
      const _children = ugoira ? [new Text(" | "), $.c("a", {
        textContent: "Toggle notes", href: "#",
        _event: { click: Decensor._post }
      })] : [];
      $.add($.c("p", {
        innerHTML: `<a href="/data/${data}">Save this ${type} (right click and save)</a>`,
        _children
      }), parent);
      Decensor.postWorking = false;
    })();
  }
};

/**
 * HANDLE THE RETRIEVAL AND UPDATE OF DATABASE
 */
DataBase = {
  notDone: true,
  batches: "https://cdn.rawgit.com/friendlyanon/decensooru/master/batches/",
  _initDB({ key, newValue }) {
    return _asyncToGenerator(function* () {
      if (key !== "ayy") return;
      switch (newValue) {
        case "done":
          w.removeEventListener("storage", DataBase._initDB);
          DataBase.batchNumber = yield $.get("db_version");
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
    })();
  },
  initDB() {
    return _asyncToGenerator(function* () {
      $("body").classList.add("decensooru");
      $.add($.c("div", {
        id: "populating",
        innerHTML: `<div class="loadingSpinner"><div>${SVG.spinner100}</div></div>
<div class="loadingText"><span></span><span></span> . . .<br /><br /><strong>
Your browser might freeze for several minutes. Don't panic!</strong><br />This 
is the initial setup and will only occur this one time.<br />Future updates to 
the local database will happen in a non-intrusive way.<br />Happy Booru 
browsing!</div>`
      }));
      DataBase.displayProgress = $("#populating .loadingText").children;
      DataBase.batchNumber = 0;
      while (DataBase.notDone) yield DataBase.pullBatch();
      localStorage.setItem("ayy", "done");
      w.close();
    })();
  },
  all(line) {
    return $.set.apply($.u, line.trim().split(":"));
  },
  pullBatch() {
    return _asyncToGenerator(function* () {
      try {
        fetcher: {
          const { batchNumber } = DataBase;
          const x = new XMLHttpRequest();
          const awaiter = { then(ok, err) {
              x.onload = ok;x.onerror = err;
            } };
          x.open("GET", DataBase.batches + batchNumber);
          x.send();
          DataBase.displayProgress[0].textContent = "Downloading batch #";
          DataBase.displayProgress[1].textContent = batchNumber;
          yield awaiter;
          let networkError = true,
              _404 = false;
          switch (x.status) {
            case 404:
              _404 = true;break;
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
          const pairs = x.responseText.trim().split("\n");
          DataBase.displayProgress[0].textContent = "Processing batch: ";
          for (let i = 0, len = Math.ceil(pairs.length / 500); i < len;) {
            const pairBatch = pairs.splice(0, 500).map(DataBase.all);
            DataBase.displayProgress[1].textContent = `${++i} / ${len}`;
            yield Promise.all(pairBatch);
            Main.postInit();
          }
          yield $.set("db_version", batchNumber);
        }
      } catch (err) {
        DataBase.notDone = null;
      } finally {
        switch (DataBase.notDone) {
          case true:
            ++DataBase.batchNumber;
            break;
          case false:
            yield $.set("timestamp", Date.now());
          case null:
            DataBase.cleanUp();
        }
      }
    })();
  },
  update() {
    return _asyncToGenerator(function* () {
      $.add($.c("div", {
        id: "update",
        className: "decensooru",
        innerHTML: `${SVG.spinner34}<br /><span class="progress"><span></span><span></span></span>`
      }));
      DataBase.displayProgress = $("#update.decensooru .progress").children;
      while (DataBase.notDone) yield DataBase.pullBatch();
      if (isImagePage) Decensor.post();else Main.postInit();
    })();
  },
  cleanUp() {
    Array.from($$(".decensooru"), $.rm);
  }
};

/**
 * ENTRYPOINT
 */
Main = {
  setup() {
    return _asyncToGenerator(function* () {
      const awaiter = { then(_) {
          this._ = _;
        } };
      console.log("Decensooru!");
      $.add($.c("style", { textContent: Main.css }), d.head);
      $.add($.c("script", {
        type: "text/javascript",
        src: "https://cdn.rawgit.com/mozilla/localForage/master/dist/localforage.js",
        _event: { load_o: function () {
            awaiter._();
          } }
      }), d.head);
      yield awaiter;
      localforage.config({
        name: "hiddenContent"
      });
      yield localforage.ready();
      DataBase.batchNumber = yield $.get("db_version");
      yield Main.init();
    })();
  },
  openInitPage() {
    localStorage.setItem("ayy", "startInit");
    DataBase.cleanUp();
    w.open(location.origin + "/?initDB", "initDB", "width=600,height=300,toolbar=0,menubar=0,location=0,status=0,scrollbars=0,resizable=0");
  },
  init() {
    return _asyncToGenerator(function* () {
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
      if (Date.now() - 288e5 /* 8 HOURS */ > (yield $.get("timestamp"))) {
        ++DataBase.batchNumber;
        DataBase.update();
      }
      if (!postsAreObserved) {
        postsAreObserved = true;
        const mutObserver = new MutationObserver(Main.postInit);
        mutObserver.observe(d.body, {
          childList: true,
          subtree: true
        });
        Main.postInit();
      }
      if (isImagePage && !$("#image")) {
        return d.hidden ? setTimeout(Decensor.post, 500) : Decensor.post();
      }
    })();
  },
  postInit() {
    Array.from($$("img[src^='data:image']"), Decensor.listing);
  },
  css: "body.decensooru {\n  overflow: hidden;\n}\nbody.decensooru > *:not(#populating) {\n  display: none ! important;\n}\n#populating {\n  text-align: center;\n  width: 100vw;\n  height: 100vh;\n}\n#populating > div {\n  height: 50vh;\n}\n.loadingSpinner {\n  position: relative;\n}\n.loadingSpinner > div {\n  position: absolute;\n  bottom: 0;\n  width: 100%;\n  text-align: center;\n}\n#update.decensooru {\n  background: white;\n  text-align: center;\n  display: inline-block;\n  position: fixed;\n  top: 0;\n  right: 0;\n  border-bottom: 1px solid black;\n  border-left: 1px solid black;\n  font-size: 16px;\n}"
};

Main.setup()["catch"](console.error);
