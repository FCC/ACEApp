module.exports = function() {
    var root = './';                     // project top-level directory. Must end in path separator
    var client = root + 'src/client/';   // root of all client source code.
    var report = root + 'report/';       // where reports get written to (lint, etc.)
    var server = root + './src/server/'; // root of all NodeJS server code.
    var temp = './.tmp/';                // temporary directory for intermediate build products (cleaned so don't keep stuff there.)
    var clienttarget = root + 'public/'; // target root for client outputs

    var config = {
        /**
         * Source File paths (do not alter or delete these with Gulp!)
         */
        src_js: [
            './src/**/*.js',
        ],
        client_ts: './src/client/**/*.ts',
        client_test_ts: './tests/client/**/*.ts',
        clientvendorlibs: 
		['./node_modules/jssip/**/jssip.min.js', 
			'./node_modules/jquery/**/jquery.min.js',
			'./node_modules/requirejs/**/require.js',
			'./node_modules/bootstrap/**/bootstrap.min.js',
			'./node_modules/bootstrap/**/bootstrap.min.css',
			],  // libraries that are 3rd party code that will not be altered but must be present on server
        fonts: './bower_components/font-awesome/fonts/**/*.*',
        html: client + 'html/**/*.html',
        templates: client + 'templates/**/*.ejs',
        images: client + 'pic/**/*.*',
        favicon: client + 'ico/favicon.ico',
        index: client + 'index.ejs',
        less: client + 'css/*.less', // was styles/styles.less but I want multiple files.
        cordova_src: './src/cordova/ACEQUILL/**',
        cordova_src_dir: './src/cordova/ACEQUILL/',
        /**
         * Target paths (build outputs)
         */
        cordova: {
          top : root + './cordova/',
          root : root + './cordova/ACEQUILL/',
          www : root + './cordova/ACEQUILL/www/',
          js : root + './cordova/ACEQUILL/www/js/'
        },
        all_build_files: clienttarget + "/**/*",
        build: clienttarget,
        css: clienttarget + './css',
        client: client,
        js : clienttarget + './js',
        lib : clienttarget + './js/lib',
        report: report,
        root: root,
        server: server,
        temp: temp,
        testoutput: temp,

        /**
         * browser sync
         */
        browserReloadDelay: 1000,

        /**
         */
        testlibraries: [
           'node_modules/mocha/mocha.js',
           'node_modules/chai/chai.js',
           'node_modules/mocha-clean/index.js',
           'node_modules/sinon-chai/lib/sinon-chai.js'
        ],
        /**
         * Typescript compiler configuration - see gulp-typescript package help for details.
         * https://www.typescriptlang.org/docs/handbook/compiler-options.html
         */
        client_ts_config : {
            noImplicitAny: false,
            target: 'es5',
            module: 'amd',  // amd and system can be used with outfile.
            removeComments: true,
            moduleResolution : 'node', // or 'classic'
            typeRoots: ['./typings','@types'],
            types: ['jquery'],

//          rootdir: './',
//            outFile: 'index.js',     // single output file.
            //outdir: './public/js',
            baseUrl: "./src/client"   // base directory to resolve non-absolute module names IMPORTANT!
        },
        client_test_ts_config : {
            noImplicitAny: false,
            target: 'es5',
            module: 'amd',
            removeComments: true,
            moduleResolution : 'node', // or 'classic'
            typeRoots: ['./typings','@types'],
            types: ['node','jquery','mocha'],
//          rootdir: './',
            //outdir: temp,
            baseUrl: "./tests/client"   // base directory to resolve non-absolute module names IMPORTANT!
        },

        /**
         * Node settings
         */
        defaultPort: 8005,
        nodeServer: './app.js'
    };
    return config;
};
