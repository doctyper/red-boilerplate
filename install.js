/*jslint node: true */
/*global jake, desc, task, error, pkg, installModule, parseFiles */
"use strict";

var fs = require("fs");
var path = require("path");

var url = require("url");
var http = require("http");
var https = require("https");

var wrench = require("wrench");
var colors = require("colors");

var jslibs = require("libs").libs;
var libpath = "project/static/js/libs";

var libdir = wrench.mkdirSyncRecursive(libpath);

(function downloadLib(lib, plugin) {
	lib = lib || jslibs.shift();

	var curr = (plugin || lib);

	var options = url.parse(curr.src);
	var protocol = (options.protocol === "https:") ? https : http;
	var filename = curr.filename || (options.pathname.split("/").reverse()[0]);
	var pluginspath;

	if (plugin) {
		pluginspath = path.join(libpath, "plugins", lib.pluginsPath);
		wrench.mkdirSyncRecursive(pluginspath);
	}

	var file = fs.createWriteStream(path.join(pluginspath || libpath, filename));
	console.log("    " + (plugin ? "  + " : "") + "Installing %n from %u".replace("%n", curr.name.cyan).replace("%u", curr.src.grey));

	protocol.get(options, function (res) {
		res.on("data", function (data) {
			file.write(data);
		});

		res.on("end", function () {
			file.end();

			if (lib.plugins && lib.plugins.length) {
				downloadLib(lib, lib.plugins.shift());
			} else if (jslibs.length) {
				downloadLib();
			} else {
				process.exit();
			}
		});
	});
}());
