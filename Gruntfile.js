module.exports = function(grunt) {

    // LiveReload的默认端口号，你也可以改成你想要的端口号
    var lrPort = 35729;
    // 使用connect-livereload模块，生成一个与LiveReload脚本
    // <script src="http://127.0.0.1:35729/livereload.js?snipver=1" type="text/javascript"></script>
    var lrSnippet = require('connect-livereload')({ port: lrPort });
    // 使用 middleware(中间件)，就必须关闭 LiveReload 的浏览器插件
    var lrMiddleware = function(connect, options) {
        return [
            // 把脚本，注入到静态文件中
            lrSnippet,
            // 静态文件服务器的路径
            connect.static(options.base[0]),
            // 启用目录浏览(相当于IIS中的目录浏览)
            connect.directory(options.base[0])
        ];
    };

    // Project configuration.
    grunt.initConfig({
        // 读取我们的项目配置并存储到pkg属性中
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
        },

        watch: {

            scripts: {
                files: ['./src/js/*.js'],
                tasks: ['jshint','concat','uglify'],
                //options: {
                    //spawn: false,
                //},
            },

            less: {
                files: ['./src/*.less'],
                tasks: ['less']
            },

            livereload: {
                options: {
                    livereload: true
                },
                files: ['*.html', './src']
            }

        },
        // 通过connect任务，创建一个静态服务器
        connect: {
            options: {
                // 服务器端口号
                port: 8080,
                // 服务器地址(可以使用主机名localhost，也能使用IP)
                hostname: 'localhost',
                // 物理路径(默认为. 即根目录) 注：使用'.'或'..'为路径的时，可能会返回403 Forbidden. 此时将该值改为相对路径 如：/grunt/reloard。
                base: './'
            },
            livereload: {
                options: {
                    // 通过LiveReload脚本，让页面重新加载。
                    middleware: lrMiddleware
                },
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-contrib-jshint');

    //less
    grunt.loadNpmTasks('grunt-contrib-less');

    //合并js
    grunt.loadNpmTasks('grunt-contrib-concat');

    // 加载包含 "uglify" 任务的插件。
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // 默认被执行的任务列表。
    grunt.registerTask('default', ['connect','watch','jshint', 'concat', 'uglify']);

};
