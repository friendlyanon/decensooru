/*@cc_on
@if (@_jscript)
  WScript.CreateObject("WScript.Shell").Exec("node " + WScript.ScriptFullName);
  WScript.Quit();
@else @*/
var fs = require("fs");
var code = String(fs.readFileSync("decensooru.user.js")).split('"use strict";');
var es6 = require("babel-core").transform('"use strict";\n\nvar regeneratorRuntime = require("regenerator-runtime/runtime");' + code[1], {
  presets: ["es2015"],
  plugins: ["transform-regenerator", "transform-async-to-generator"]
});
fs.writeFileSync("temp_es6.js", es6.code);
var b = require('browserify')();
b.add("temp_es6.js");
var bundle = b.bundle(function(err, buf) {
  fs.writeFileSync("decensooru_es6.user.js", code[0] + String(String(buf)));
  fs.unlink(require("path").resolve(__dirname, "temp_es6.js"));
});
/*@end @*/