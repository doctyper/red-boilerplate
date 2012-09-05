/*jslint node: true */
/*global jake, desc, task, error, pkg, installModule, parseFiles */
"use strict";

var fs = require("fs");
var cp = require("child_process");
var path = require("path");
var installpath = "./project/static/js/libs/_install";

var exec = function (exec, args, cwd, suppress, doneCB) {
	process.stdin.resume();

	var child = cp.spawn(exec, args || [], {
		cwd: cwd,
		env: null,
		setsid: true
	});

	process.stdin.resume();
	process.stdin.pipe(child.stdin, {end: false});

	if (!suppress) {
		child.stdout.pipe(process.stdout);
	}

	child.addListener("exit", function (code) {
		doneCB(!code);
	});
};

exec("node", [path.join(installpath, "installer")], null, false, function (success) {
	if (fs.existsSync(installpath)) {
		fs.unlinkSync(path.join(installpath, "installer.js"));
		fs.unlinkSync(path.join(installpath, "libs.config.js"));
		fs.rmdirSync(installpath);
	}

	process.exit();
});
