# /!\ Warning /!\
This repository here is currently looking for someone kind enough to donate
a gold or higher priviliged account API key to extract data for this userscript.
You may contact me using the email skype1234@waifu.club for further details.  
Without the right API key the batches currently in the repo will stay as they
are now, without being updated.

# Decensooru
Addon userscript for [Better Better Booru][1] to decensor Danbooru.  
You have to install [BBB v8.0][1] or newer. After installing that version make
sure your settings looks like the following example:

![_](https://github.com/friendlyanon/decensooru/blob/master/img/bbb_settings.png)

Usage
-----
The very first time you open a tab of Danbooru, you will have to click the
button in the top right hand corner, after which a popup will appear in a
separate window (you might need to enable popups for this) which will begin the
initial setup of the local database. Every other new stored post will trigger
update mechanics in the main browser window's Danbooru tabs, i.e. the changes
happen live.  
There are limitations of this initial setup procedure:
* Because I use [localForage][3] as a storage backend, it is possible that it
will fall back to using `localStorage` if `IndexedDB` nor `WebSQL` is supported
in your browser, which might cause your browser to slow down or become
unresponsive. There is nothing I can do about this, so I just ask you to not
panic.
* One of the consquence of the above mentioned is that those kinds of storage
**do not work cross protocol!** That means that storage between `http` and
`https` cannot be used, they both have their own storages. I recommend that you
stick to using the `https` version of Danbooru exclusively.
* The popup is opened via `window.open()` which might issue a popup warning if
you have it enabled. You might have to disable the popup blocker and instead I
recommend a mature blocking solution for malicious content on the web, such as:
  * [uBlock Origin][4]
  * [uMatrix][5]
* Maybe more, I don't know yet. I am doing something of this nature for the
first time, so if you find something, please head over to the issues page and
tell me your problem. If you wish to stay anonymous, you are also free to email
me using this email: skype1234@waifu.club  
I take anonymity seriously, so do not fret and report any issues.

**The initial setup will happen only once.** Further updates will display their
progress in the top right corner, which should not be intrusive at all. These
updates will check back to this repo every 8 hours and scan the `batches` folder
for new batches of posts.

After the initial setup is done, the userscript will do its best to stay out of
your way. Those pesky `Hidden` thumbnails will be revealed and their post pages
will display the picture you clicked on.

Install
-------

### Firefox
Install [Greasemonkey][6]

Ports of Greasemonkey are available for [SeaMonkey][7] and [Pale Moon][8]

### Chromium
Install Violentmonkey ([Opera store][9] / [Chrome store][10])
or [Tampermonkey][11]

### Safari
Install [JS Blocker][12] or [Tampermonkey][13]

### MS Edge
Install [Tampermonkey][14]

If you are not sure about what version of ECMAScript your browser supports, just
install the first option in the table.  
Alternatively, you can check compatibility [here][15]. If you are 15/15 on that
page using your current browser, use the second one in the table.

|                Script version                |     Link      |
| -------------------------------------------- | ------------- |
| Older browsers (with ECMAScript2015 support) | [Install][16] |
| Newer browsers (with ECMAScript2017 support) | [Install][17] |

How to build the ES6 version yourself
-------------------------------------
You will require node and npm to be installed for the building process.
```
git clone https://github.com/friendlyanon/decensooru.git
cd decensooru
npm install --save-dev babel-cli babel-preset-es2015 babel-plugin-transform-async-to-generator babel-plugin-transform-regenerator
node build_es6.js
```

License
-------
WTFPL

[1]: https://github.com/pseudonymous/better-better-booru
[2]: https://github.com/pseudonymous/better-better-booru/tree/hidden-update-cleanup
[3]: http://localforage.github.io/localForage/
[4]: https://github.com/gorhill/uBlock
[5]: https://github.com/gorhill/uMatrix
[6]: https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/
[7]: https://sourceforge.net/projects/gmport/
[8]: https://github.com/janekptacijarabaci/greasemonkey/releases/latest
[9]: https://addons.opera.com/en/extensions/details/violent-monkey/
[10]: https://chrome.google.com/webstore/detail/violent-monkey/jinjaccalgkegednnccohejagnlnfdag
[11]: https://tampermonkey.net/
[12]: http://jsblocker.toggleable.com/
[13]: http://tampermonkey.net/?browser=safari
[14]: https://www.microsoft.com/en-us/store/p/tampermonkey/9nblggh5162s
[15]: http://kangax.github.io/compat-table/es2016plus/#test-async_functions
[16]: https://github.com/friendlyanon/decensooru/raw/master/decensooru_es6.user.js
[17]: https://github.com/friendlyanon/decensooru/raw/master/decensooru.user.js
