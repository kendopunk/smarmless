// smarmless gruntfile.js

(function() {
	'use strict';
	
	module.exports  = function(grunt) {
		grunt.initConfig({
			pkg: grunt.file.readJSON('package.json'),
			sass: {
				dev: {
					files: {
						'static/css/main.css' : 'sass/main.scss',
						'static/css/bootstrap_assist.css' : 'sass/bootstrap_assist.scss'
					}
				},
				dist: {
					options: {
						style: 'compressed',
						precision: 5
					},
					files: {
						'static/css/main.min.css' : 'sass/main.scss',
						'static/css/bootstrap_assist.min.css' : 'sass/bootstrap_assist.scss'
					}
				}
			},
		});
		
		/** load tasks **/
		grunt.loadNpmTasks('grunt-contrib-sass');
	};
})();