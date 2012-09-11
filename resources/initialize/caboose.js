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

	if (child.stderr) {
		process.stderr.pipe(child.stderr, {
			end: true
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
				process.exit(success);
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
				exec("bundle", ["-v"], null, true, function (success) {
					if (success) {
						moveGemfileToRoot();
					} else {
						exec("gem", ["install", "bundler"], null, false, function (success) {
							if (success) {
								moveGemfileToRoot();
							} else {
								console.error("Error installing gems. Perhaps you need sudo privileges? (Ugh)");
								process.exit(success);
							}
						});
					}
				});
			} else {
				console.error("You need to install Ruby Gems before installing the Compass Module.");
				process.exit(success);
			}
		});
	} else {
		console.error("You need to install Ruby before installing the Compass Module.");
		process.exit(success);
	}
});
