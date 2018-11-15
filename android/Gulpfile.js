/**
 * Gulpfile for building various targets from our sources.
 *
 * By default, code and tests are always rebuilt because determining dependency changes is complex.
 * (technically, less files could also have deps but we don't have any yet)
 *
 * tasks prefixed with 'private-' are not designed to be used from the command line
 *
 * The watch tasks are broken. Don't use them.
 */


var gulp = require('gulp');
var del = require('del');
var child_process = require('child_process');
var os = require('os');
var args = require('yargs').argv;
// var runSequence = require('run-sequence');  // powerful stopgap until Gulp v4   things in [] are parallel, things with commas are sequential.
var config = require('./gulp.config')();
var path = require('path');
var glob = require('glob');
var _ = require('lodash');
var $ = require('gulp-load-plugins')({lazy: true}); // this will load gulp plugins automatically

var port = process.env.PORT || config.defaultPort;

var beautify_html = require('js-beautify').html;
var fs = require('fs');

const buildCountFileName = "buildnbr.txt";

///////////// WATCH TASKS ////////////////

gulp.task('watch', $.sequence(['watch-images', 'watch-client-code', 'watch-html', 'watch-styles']) );

gulp.task('watch-html', function() {
    var watcher = gulp.watch([config.html, config.templates], ['build-html']);
    watcher.on('change', function(event) {
        log('File ' + event.path + ' was ' + event.type + ', running tasks ...');
    });
});
gulp.task('watch-styles', function() {
    var watcher = gulp.watch(config.less, ['build-styles']);
    watcher.on('change', function(event) {
        log('File ' + event.path + ' was ' + event.type + ', running tasks ...');
    });
});

gulp.task('watch-images', function() {
    var watcher = gulp.watch(config.images, ['build-images']);
    watcher.on('change', function(event) {
        log('File ' + event.path + ' was ' + event.type + ', running tasks ...');
    });
});

gulp.task('watch-client-code', function() {
    log("Files: " + JSON.stringify(config.client_ts));
    var watcher = gulp.watch(config.client_ts, ['build-client-code']);
    watcher.on('change', function(event) {
        log('File ' + event.path + ' was ' + event.type + ', running tasks ...');
    });
    /*
    return $.watch(config.client_ts, {ignoreInitial:true})
        .pipe($.debug({title: 'code changed:', minimal:false}))
        .pipe($.typescript(config.client_ts_config))
        .pipe($.debug({title: 'code rebuilt:', minimal:false}))
        .pipe(gulp.dest(config.js));
        */
});


//////////////////////////// BUILD ON DEMAND ///////////////////////////////

// full build is squeaky clean and will take quite a while.
gulp.task('static-assets', ['images','fonts','styles','libs', 'html']);

gulp.task('full-build', $.sequence( 'static-assets', 'code' , 'tests' , 'full-build-cordova', 'update-build-count'));

// fast build means no cleaning in some cases.
gulp.task('build', $.sequence('build-webclient' , 'build-cordova' ,'update-build-count'));

gulp.task('update-build-count', function() { incrementBuildCounter(); });

gulp.task('build-webclient', $.sequence( ['clean-images','build-images' , 'build-favicon' ,  'build-fonts', 'build-styles', 'build-libs', 'build-html'], 'build-client-code' , 'tests'));

/**
 * TODO: Fix this task to delete old TypeScript-generated files.
 */

gulp.task('clean', $.sequence(['clean-images', 'clean-favicon', 'clean-fonts', 'clean-styles', 'clean-libs', 'clean-html', 'clean-client-code','clean-client-test' ]) );

//////////////////////////// TESTS ///////////////////////////////

gulp.task('tests', $.sequence('clean-client-test', 'build-client-test' /*, 'run-client-test' */ ));

gulp.task('clean-client-test', function(done) {
    // log("cleaning test output directories");
    var files = [].concat(
                            config.temp + '**/*.js',
                            config.temp + '**/*.html'
                        );
    return clean(files, done);
});

function buildTypescript(title, inpath, outpath, cb) {
    log('Compiling '+title+' --> JS');
    var err = null;
    var stream = gulp
        .src(inpath)
        // .pipe($.plumber())
        // .pipe($.debug({title: 'input:'}))
        .pipe($.typescript(config.client_ts_config))
        .on('error', error => { log("got typescript error"); err = error;})
        .pipe(gulp.dest(outpath))
        ;
    // if(err) return cb({error:"fatal compile error"}); else return cb();
    return stream;
};

gulp.task('build-client-test', cb => { return buildTypescript("test code", config.client_test_ts, config.testoutput, cb); });


gulp.task('run-client-test', function() {
    // NOT IMPLEMENTED.
});

/**
 * Run test once and exit
 */

gulp.task('test', function (done) {
});

//////////////////////////// CORDOVA ///////////////////////////////

// NOTE: Cordova cannot build under the Windows bash shell -- yet.


gulp.task('full-build-cordova', $.sequence('clean-cordova','private-construct-cordova', 'build-cordova'));

gulp.task('build-cordova', $.sequence('clone-webclient', 'build-cordova-html', 'build-cordova-root', 'build-cordova-hack'));

gulp.task('clean-cordova', function() {
    // log('remove entire cordova build area')

    del(config.cordova.root, null);
});

gulp.task('clone-webclient', function() {
    log('Clone webclient into cordova shell...');

    return gulp
        .src(config.all_build_files, {base: config.build})
        .pipe(gulp.dest(config.cordova.www));
});

gulp.task('build-cordova-root', function() {
    // log('build cordova root (overwrite files from our ACEQUILL src/** directories...)');

    return gulp
        .src(config.cordova_src) //, {base: config.cordova_src})
        .pipe($.plumber())
       //  .pipe($.debug({title: 'test:'}))
        .pipe(gulp.dest(config.cordova.root));
});
gulp.task('run-cordova', $.sequence('build-cordova-html', 'build-cordova-root', 'build-cordova-hack', 'private-exec-cordova'));

gulp.task('private-exec-cordova', function() {
    var cwd = process.cwd();
    // log("Running cordova in simulator from:" + cwd);
    cordova_run(config.cordova.root, ['run','android']);
});

gulp.task('private-construct-cordova', function() {
    // assumes the config.cordova.root tree has been cleaned first.
    // log("reconstructing cordova in :" + config.cordova.root);

    cordova_run(config.cordova.top + '/cordova', ['create','ACEQUILL','org.organization.acequill', 'ACE Quill']);
    cordova_run(config.cordova.root, ['platform', 'add', 'android']);
});

/**
 * @param cwd where you want cordova commands to run
 */
function cordova_run(cwd, args) {
    var proc;
    if (typeof args.length !== 'number') throw "args is not an array";

    const options =  { cwd: cwd, 
                        shell:true, 
                        detached:false,
                        windowsHide: true };
    if (false) {
        if(os.platform() === 'win32') { 
            proc = child_process.spawn('cmd.exe',['/c', 'cordova'].concat(args), options);
        }else{
            proc = child_process.spawn('cordova',args, options);
        }
    }else{
        proc = child_process.spawn('cordova',args, options);
    }
    proc.stdout.on('data', (data) => { log(data.toString()); });
    proc.stderr.on('data', (data) => { console.error(data.toString()); });
    proc.on('error',        (code) => { log(`error: child exited with code ${code}`); });
    proc.on('exit',        (code) => { log(`child exited with code ${code}`); });
}

gulp.task('build-cordova-hack', function() {
    // log('build cordova hack (so as to identify cordova or not in JS code)...');

    try {
        var target = config.cordova.js + 'main.js';
        var content = fs.readFileSync(target, 'utf8');
//        log("loaded file");
        content = content.replace("window['isCordova'] = false",() => {
//            log("Matched!");
            return "window['isCordova'] = true"; });
        fs.writeFileSync(target, content, 'utf8');
    }catch(ex) {
        log("Exception: " + ex);
    }
});

//////////////////////////// CODE ///////////////////////////////

gulp.task('code', $.sequence('clean-client-code', 'build-client-code'));

gulp.task('clean-client-code', function(done) {
    var files = [].concat( config.build + 'js/*.js');
    return clean(files, done);
});

gulp.task('build-client-code', cb => { return buildTypescript('client-code', config.client_ts, config.js, cb); });


//////////////////////////// STYLES ///////////////////////////////

gulp.task('styles', $.sequence('clean-styles', 'build-styles'));

gulp.task('clean-styles', function(done) {
    return clean(config.css, done);
});


gulp.task('build-styles', function() {
    // log('Compiling Less --> CSS');

    return gulp
        .src(config.less)
        .pipe($.plumber())
//        .pipe($.changed(config.css, { extension:'.less'}))
//        .pipe($.debug({title:"changed:"}))
//        .pipe($.debug({title: 'styles:'}))
        .pipe($.less())
//        .pipe($.debug({title: 'output :'}))
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))  // not sure what this does.
//        .pipe($.csslint({ids:false, "order-alphabetical":false}))  // uses .csslintrc file
//        .pipe($.csslint.formatter())  // uses .csslintrc file
        .pipe($.concatCss("bundle.css"))
        .pipe(gulp.dest(config.css));
});

//////////////////////////// FONTS ///////////////////////////////
//
gulp.task('fonts', $.sequence('clean-fonts', 'build-fonts'));

gulp.task('clean-fonts', function(done) {
    return clean(config.build + 'fonts/**/*.*', done);
});


gulp.task('build-fonts', function() {
    // log('Copying fonts');

    return gulp
        .src(config.fonts)
        .pipe($.plumber())
        .pipe($.changed(config.build))
        .pipe($.debug({title:"changed:"}))
        .pipe(gulp.dest(config.build + 'fonts'));
});

//////////////////////////// LIBS ///////////////////////////////

gulp.task('libs', $.sequence('clean-libs', 'build-libs'));

gulp.task('clean-libs', done => { return clean(config.build + 'js/lib/**/*.*', done); });

// remove ANSI color sequences from string
//  match   \e[xxxxxm 
function unchalk(v) {
    var w = "";
    var inSeq = false;
    for(var i = 0; i < v.length; i++) {
        if (!inSeq && v.charCodeAt(i) === 27) {
            inSeq = true;
            continue;
        }
        if(inSeq && v.charAt(i) === 'm') {
            inSeq = false;
            continue;
        }
        if (!inSeq) w += v.charAt(i);
    }
    return w;
}
gulp.task('build-libs', function() {
    // log('Copying 3rd party libs');

    var target = config.build + 'js/lib';
    var expected = config.clientvendorlibs.length;

    return gulp
        .src(config.clientvendorlibs,{base:"./node_modules/"})
        .pipe($.plumber())
        .pipe($.count({
                message: '##',
                logger: (msg) => {
                       var msg = unchalk(msg);
                       var actual = parseInt(msg, 10);
                       if ( expected  !== actual) {
                            // This error will be emited if the source
                            // files do not match. So, it means it didn't find the library files where they once were.
                            console.error("Error: not all files were copied during build-libs. Expected " + expected +  " but got " + actual);
                        }
                    }
            }))
        .pipe($.changed(target))  // no sense copying unchanged files.
        .pipe($.debug({title:"changed:"}))
        .pipe(gulp.dest(target));
});

//////////////////////////// HTML ///////////////////////////////

gulp.task('html', $.sequence('clean-html', 'build-html'));

gulp.task('clean-html', function(done) {
    return clean(config.build + '/**/*.html', done);
});

// log('Copying and EJS templatizing the html');

const html_options = { // https://github.com/htmllint/htmllint/wiki/Options
  rules: {

    "line-end-style": false,
    "tag-close" : true,
    "id-no-dup" : true	,	// important for jquery mobile
    "id-class-style" : false,
    "indent-style" : false,
    "indent-width" : false,
    "attr-bans" : ['align', 'background', 'bgcolor', 'border', 'frameborder', 'longdesc', 'marginwidth', 'marginheight', 'scrolling' // ,'style'
            , 'width'],
    "attr-name-style" : false,
    "attr-value-style" : false,
    "attr-quote-style": "double",
    "img-req-alt": false,  // alt tag not required at this time.
    "table-req-header" : false,	// doesn't seem to work correctly anyhow...
    "table-req-caption" : false,
    "tag-name-match": true,
    "title-no-dup": true
  }
};

const HTMLBeautifyOptions =  {
    indent_size : 2
};

gulp.task('build-html', () => { return buildStuff(false, config.build); });

/*
 * same idea as build-html BUT generates any Cordova specific output
 * in the HTML.
 */
gulp.task('build-cordova-html', () => { return buildStuff(true, config.cordova.www); } );

function buildStuff(generate_cordova, targetdir){
	
    var buildnbr = getBuildCounter();
    var gitcommit = getGitCommit();
	var srcs = [].concat(config.index);
	var script_srcs = config.clientvendorlibs
                .map(x=> {
                    var matches = glob.sync(x);
                    if (matches.length >= 1) return matches[0].replace('./node_modules/','');
                    else throw "BARF! Could not find file to match '" + x + "'"; 
                })
                .filter(x => {return x.indexOf('require')})
    return gulp
        .src(srcs)
        .pipe($.plumber())
		.pipe($.ejs({script_srcs,generate_cordova, buildnbr, gitcommit}, {}, {ext:'.html'}))
        .pipe($.debug({title: 'build-html:'}))
        .pipe($.concat('index.html', {newLine:'\n'}))
        .pipe($.htmllint(html_options))
        .pipe($.prettify(HTMLBeautifyOptions))
        .pipe(gulp.dest(targetdir));
}

//////////////////////////// IMAGES ///////////////////////////////

gulp.task('images', $.sequence('clean-images', 'clean-favicon', 'build-images', 'build-favicon'));

gulp.task('clean-images', function(done) {
    return clean(config.build + 'pic/**/*.*', done);
});

gulp.task('clean-favicon', function(done) {
    return clean(config.build + 'favicon.ico', done);
});

gulp.task('build-images', function() {
    // log('Copying and compressing the images');
    var target = config.build + 'pic';
    return gulp
        .src(config.images)
        .pipe($.plumber())
        .pipe($.changed(target))  // no sense copying unchanged files.
//        RIGHT NOW STRAIGHT COPY.
//        .pipe($.debug({title: 'build-images:'}))
//        .pipe($.imagemin({optimizationLevel: 4}))
        .pipe(gulp.dest(target));
});

gulp.task('build-favicon', function() {
    var target = config.build;
    return gulp
        .src(config.favicon)
        .pipe($.plumber())
        .pipe($.changed(target))
        .pipe(gulp.dest(target));
});

gulp.task('default', ['help']);

gulp.task('help', function() {
    // log("GULP HELP");
    log("       gulp command         where command is one of the following:");
    log("");
    log("common commands:");
    log("");
    log("               build               build all the code, images, fonts, etc.");
    log("               build-webclient     build all the code, images, fonts, etc BUT not Cordova.");
    log("               full-build          clean and build all the code, images, fonts, etc. Slower but better.");
    log("               full-build-cordova  clean and build all the Cordova code, images, fonts, etc. Slower but better.");
    log("               run-cordova         build and run the Cordova simulator.");
    log("               clean               clean all intermediate build products and targets");
    log("               clean-cordova       clean all intermediate build products and targets for cordova");
    log("               help                this page of helpful text");
    log("");
    log(" less common:");
    log("               images      build just images");
    log("               fonts       build just fonts");
    log("               styles      build just LESS/CSS");
    log("               libs        copy vendor libraries to public\\js\\lib");

});

// Tasks that are Not Yet Working / Old Stuff. Do not use.

gulp.task('less-watcher', () => { gulp.watch([config.less], ['styles']); });

gulp.task("gitcommit", () => { console.log(getGitCommit()); });


////////////////////// SUPPORT FUNCTIONS ////////////////////

function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    return del(path, done);
}

function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

function incrementBuildCounter() {
    var count = 0;
    var wholefile;

    try {
        wholefile = fs.readFileSync(buildCountFileName, 'utf8').trim();
        count = parseInt(wholefile, 10);
        count++;
    }catch(ex) {
        console.log("Unable to open build file. Assuming this is the first run");
        // console.log(ex);
        count = 1000;
    }
    try {
        fs.writeFileSync(buildCountFileName, count.toString(), 'utf8');
    }catch(ex) {
        console.error("ERROR: Unable to write build count file named: " + buildCountFileName);
        console.log(ex);
    }   
}
function getBuildCounter() { // : string
    var wholefile;
	var count;
	var defaultCount = '2000'
    try {
        wholefile = fs.readFileSync(buildCountFileName, 'utf8').trim();
		count = parseInt(wholefile,10); 
		if(typeof count === 'number') return count + '';
		else return defaultCount;
    }catch(ex) {
        console.log("Unable to open build file. Assuming this is the first run");
        // console.log(ex);
        return defaultCount;
    }
}

function getGitCommit() {
    var cmd = "git";
    var args = ["rev-parse", "HEAD", "--symbolic"];
    var proc;
    var options =  {} // { cwd: cwd };

    if(os.platform() === 'win32') { 
        proc = child_process.spawnSync('cmd.exe',['/c', cmd].concat(args), options);
    }else{
        proc = child_process.spawnSync(cmd, args, options);
    }

    return proc.stdout.toString().trim();
}
