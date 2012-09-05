/*jslint node: true */
/*global jake, desc, task, error, pkg, installModule, parseFiles */
"use strict";

var fs = require("fs");
var cp = require("child_process");
var path = require("path");
var installpath = path.join(__dirname, "project/static/js/libs/_install");

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
		child.stderr.pipe(process.stderr);
	}

	child.addListener("exit", function (code) {
		doneCB(!code);
	});
};

exec("node", [path.join(installpath, "installer")], null, false, function (success) {
	if (!success) {
		console.error("An error occurred while installing external libraries.");
		process.exit(false);
	}

	if (fs.existsSync(installpath)) {
		var installer = path.join(installpath, "installer.js");
		var config = path.join(installpath, "libs.config.js");

		if (fs.existsSync(installer)) {
			fs.unlinkSync(installer);
		}

		if (fs.existsSync(config)) {
			fs.unlinkSync(config);
		}

		fs.rmdirSync(installpath);
	} else {
		console.error("Can't find %s. Exiting.".replace("%s", installpath));
		process.exit(false);
	}

	process.exit();
});
