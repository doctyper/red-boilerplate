/*jslint node: true, onevar: false */
/*global jake, desc, task, error, pkg, installModule, parseFiles */
"use strict";

var fs = require("fs");
var cp = require("child_process");
var path = require("path");

var exec = function (exec, args, cwd, suppress, doneCB) {
	process.stdin.resume();

	var child = cp.spawn(exec, args || [], {
		cwd: cwd,
		env: null,
		setsid: true,
		stdio: (suppress) ? null : "inherit"
	}), data;

	if (child.stdout) {
		data = "";

		child.stdout.on("data", function (buffer) {
			data += buffer.toString();
		});
	}

	child.on("exit", function (code) {
		doneCB(!code, data);
	});
};

function moveGemfileToRoot() {
	var gempath = path.join(__dirname, "../tasks/config/Gemfile");

	if (fs.existsSync(gempath)) {
		exec("mv", [gempath, gempath + ".lock", "."], null, false, function (success) {
			if (success) {
				installGems();
			} else {
				console.error("Failed to move %s".replace("%s", gempath));
				process.exit(false);
			}
		});
	} else {
		installGems();
	}
}

function installGems() {
	exec("bundle", ["install", "--path", "resources/compass/gems"], null, false, function (success) {
		if (!success) {
			console.error("Error installing gems. Perhaps you need sudo privileges? (Ugh)");
		}

		process.exit();
	});
}

exec("ruby", ["-v"], null, true, function (success) {
	if (success) {
		exec("gem", ["-v"], null, true, function (success) {
			if (success) {
				exec("bundle", ["-v"], null, true, function (success, data) {
					if (success) {
						var version = data.toString().replace("Bundler version", "").trim();

						if (version < "1.2.0") {
							exec("gem", ["update", "bundler"], null, false, function (success) {
								if (success) {
									moveGemfileToRoot();
								} else {
									console.log("You are using Bundler version %s".replace("%s", version));
									console.log("Bundler version 1.2.0 or higher is required");
									console.log("Please update your gem via `gem update bundler` and re-install the Caboose plugin");

									process.exit(false);
								}
							});
						} else {
							moveGemfileToRoot();
						}
					} else {
						exec("gem", ["install", "bundler"], null, false, function (success) {
							if (success) {
								moveGemfileToRoot();
							} else {
								process.exit(false);
							}
						});
					}
				});
			} else {
				console.error("You need to install Ruby Gems before installing the Compass Module.");
				process.exit(false);
			}
		});
	} else {
		console.error("You need to install Ruby before installing the Compass Module.");
		process.exit(false);
	}
});
