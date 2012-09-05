/*jslint node: true */
/*global jake, desc, task, error, pkg, installModule, parseFiles */
"use strict";

var fs = require("fs");
var cp = require("child_process");

var spawn = function (exec, args, suppress, doneCB) {
	process.stdin.resume();

	var child = cp.spawn(exec, args || [], {
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

var exec = function (exec, suppress, doneCB) {

	cp.exec(exec, function (error, stdout, stderr) {

		if (!suppress) {

			if (stdout) {
				console.log(stdout);
			}

			if (stderr) {
				console.error(stderr);
			}
		}

		if (doneCB) {
			doneCB(!error);
		}
	});
};

function installComplete () {
	process.exit();
}

function finishSetup () {
	spawn("sh", ["./scripts/setup.sh"], false, function (success) {
		if (!success) {
			console.error("Something went wrong trying to run setup.sh");
		}

		installComplete();
	});
}

function runRedStart () {
	exec("source env/bin/activate && red-start --no-prompt --no-git", false, function (success) {
		if (!success) {
			console.error("Something went wrong trying to run red-start");
			installComplete();
		}

		finishSetup();
	});
}

function installRedStart () {

	exec("source env/bin/activate && pip install red-start", false, function (success) {
		if (success) {
			runRedStart();
		} else {
			console.error("This bit might require sudo privileges. Try installing via `sudo pip install red-start`.");
			installComplete();
		}
	});
}

function testRedStart () {
	exec("source env/bin/activate && red-start --help", true, function (success) {
		if (success) {
			runRedStart();
		} else {
			installRedStart();
		}
	});
}

function setupVirtualEnv () {
	spawn("virtualenv", ["./env"], true, function (success) {
		if (success) {
			testRedStart();
		} else {
			console.error("Something went wrong when initializing the virtualenv.");
			installComplete();
		}
	});
}

function testVirtualEnvSupport () {
	spawn("virtualenv", ["--version"], true, function (success) {
		if (success) {
			setupVirtualEnv();
		} else {
			console.error("You need to install virtualenv before installing RED Start.");
			installComplete();
		}
	});
}

function testPythonSupport () {
	spawn("python", ["--version"], true, function (success) {
		if (success) {
			testVirtualEnvSupport();
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
		console.log("Looks like RED Start is already installed. Skipping ahead...");
		finishSetup();
	}
}());
