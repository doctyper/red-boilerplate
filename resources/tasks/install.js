/*global module:false*/
module.exports = function (grunt) {

	grunt.registerTask("install", "Install a plugin", function (plugin, isUpdate) {
		var pkg = require("./utils/pkg");
		var colors = require("colors");
		var done = this.async();

		grunt.helper("check_initialized", function (initialized) {
			if (!initialized) {
				done(false);
			}
		});

		grunt.helper("check_for_available_plugins", function (plugins) {
			var i, j, current;
			var available = [];
			var installed = [];

			for (i = 0, j = plugins.length; i < j; i++) {
				current = plugins[i];

				if (!pkg.config.installedPlugins[current]) {
					available.push(current);
				} else {
					installed.push(current);
				}
			}

			var showPlugins = function (showHelp) {
				if (showHelp) {
					grunt.log.writeln();
					grunt.log.writeln("Install plugins with grunt install:my-plugin-name");
				}

				grunt.log.writeln();
				grunt.log.writeln("[*]" + " Installed modules:");

				if (installed.length) {
					for (i = 0, j = installed.length; i < j; i++) {
						grunt.log.writeln("    " + installed[i].magenta);
					}
				} else {
					grunt.log.writeln("    You haven't installed any modules!".grey);
				}

				grunt.log.writeln();
				grunt.log.writeln("[*]" + " Available modules:");

				if (available.length) {
					for (i = 0, j = available.length; i < j; i++) {
						grunt.log.writeln("    " + available[i].cyan);
					}
				} else {
					grunt.log.writeln("    You've installed all available modules!".grey);
				}
			};

			if (!plugin) {
				showPlugins(true);
				done();
			}

			var cleanPlugin = plugin.split("@")[0];

			if ((plugins.indexOf(cleanPlugin) === -1) && (pkg.config && (cleanPlugin !== pkg.config.org.name))) {
				showPlugins();

				grunt.log.writeln();
				grunt.fail.warn(plugin.red.bold + " is not an available plugin".yellow);
			}

			var tmpDir = pkg.config.tmpDir;
			var fs = require("fs");
			var wrench = require("wrench");

			if (fs.existsSync(tmpDir)) {
				wrench.rmdirSyncRecursive(tmpDir, true);
			}

			grunt.file.mkdir(tmpDir);
			grunt.file.setBase(tmpDir);

			grunt.helper("install_plugin", plugin, isUpdate, function (stop) {
				grunt.file.setBase("../");
				wrench.rmdirSyncRecursive(tmpDir, true);

				if (stop === true) {
					done(false);
				} else {
					done();
				}
			});
		});
	});

};
