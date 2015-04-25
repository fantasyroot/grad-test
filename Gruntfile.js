module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            dist: {
                src: ['js/*.js'],
                dest: 'build/js/<%= pkg.name %>.js'
            }
        },

        jshint: {
            files: ['Gruntfile.js', 'js/digTreasure.js']
        },

        less: {
            development: {
                files: {
                    "css/result.css": "css/*.less"
                }
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: '<%= concat.dist.dest %>',
                dest: 'build/js/<%= pkg.name %>.min.js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

    //less
    grunt.loadNpmTasks('grunt-contrib-less');

    //合并js
    grunt.loadNpmTasks('grunt-contrib-concat');

    // 加载包含 "uglify" 任务的插件。
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // 默认被执行的任务列表。
    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};
