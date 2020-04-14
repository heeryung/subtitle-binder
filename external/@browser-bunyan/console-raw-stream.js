(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
window.consoleRawStream = require('@browser-bunyan/console-raw-stream')

},{"@browser-bunyan/console-raw-stream":2}],2:[function(require,module,exports){
var o=10,e=20,r=30,n=40,l=50,c=60,t={trace:o,debug:e,info:r,warn:n,error:l,fatal:c};Object.keys(t).forEach(function(o){});var a=function(){};a.prototype.write=function(o){o.level<r?console.log(o):o.level<n?console.info(o):o.level<l?console.warn(o):console.error(o),o.err&&o.err.stack&&console.error(o.err.stack),o.obj&&console.log(o.obj)},exports.ConsoleRawStream=a;


},{}]},{},[1]);
