/*jslint node: true */
/*global jake, desc, task, error, pkg, installModule, parseFiles */
"use strict";

var fs = require("fs");
var cp = require("child_process");

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

function installComplete () {
	process.exit();
}

function runRedStart () {
	exec("red-start", ["--no-prompt", "--no-git"], null, false, function (success) {
		if (!success) {
			console.error("Something went wrong trying to run red-start");
		}

		installComplete();
	});
}

function installRedStart () {
	exec("pip", ["install", "red-start"], null, false, function (success) {
		if (success) {
			runRedStart();
		} else {
			console.error("This bit might require sudo privileges. Try installing via `sudo pip install red-start`.");
			installComplete();
		}
	});
}

function testRedStart () {
	exec("red-start", ["--help"], null, true, function (success) {
		if (success) {
			runRedStart();
		} else {
			installRedStart();
		}
	});
}

function testPipSupport () {
	exec("pip", ["--version"], null, true, function (success) {
		if (success) {
			testRedStart();
		} else {
			console.error("You need to install pip before installing RED Start.");
			installComplete();
		}
	});
}

function testPythonSupport () {
	exec("python", ["--version"], null, true, function (success) {
		if (success) {
			testPipSupport();
		} else {
			console.error("You need to install Python before installing RED Start.");
			installComplete();
		}
	});
}

(function checkInstall () {
	var filesToCheck = [
		"fabfile.py",
		"project/manage.py",
		"scripts/setup.sh"
	];

	var isInstalled = true;

	for (var i = 0, j = filesToCheck.length; i < j; i++) {
		if (!fs.existsSync(filesToCheck[i])) {
			isInstalled = false;
			break;
		}
	}

	if (!isInstalled) {
		testPythonSupport();
	} else {
		console.log("Looks like this project was initialized using RED Start. Skipping ahead...");
		installComplete();
	}
}());
