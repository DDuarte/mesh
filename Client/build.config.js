/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
    /**
     * The `build_dir` folder is where our projects are compiled during
     * development and the `compile_dir` folder is where our app resides once it's
     * completely built.
     */
    build_dir: 'build',
    compile_dir: 'bin',

    /**
     * This is a collection of file patterns that refer to our app code (the
     * stuff in `src/`). These file paths are used in the configuration of
     * build tasks. `js` is all project javascript, less tests. `ctpl` contains
     * our reusable components' (`src/common`) template HTML files, while
     * `atpl` contains the same, but for our app's code. `html` is just our
     * main HTML file, `less` is our main stylesheet, and `unit` contains our
     * app's unit tests.
     */
    app_files: {
        js: [ 'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js', '!src/app/config/**' ],
        jsunit: [ 'src/**/*.spec.js' ],

        atpl: [ 'src/app/**/*.tpl.html' ],
        ctpl: [ 'src/common/**/*.tpl.html' ],
        angularBootstrapTpl: [ 'src/common/templates/angular-bootstrap/**/*.html' ],

        html: [ 'src/index.html' ],
        less: 'src/less/main.less'
    },

    /**
     * This is a collection of files used during testing only.
     */
    test_files: {
        js: [
            'vendor/angular-mocks/angular-mocks.js'
        ]
    },

    /**
     * This is the same as `app_files`, except it contains patterns that
     * reference vendor code (`vendor/`) that we need to place into the build
     * process somewhere. While the `app_files` property ensures all
     * standardized files are collected for compilation, it is the user's job
     * to ensure non-standardized (i.e. vendor-related) files are handled
     * appropriately in `vendor_files.js`.
     *
     * The `vendor_files.js` property holds files to be automatically
     * concatenated and minified with our project source files.
     *
     * The `vendor_files.css` property holds any CSS files to be automatically
     * included in our app.
     *
     * The `vendor_files.assets` property holds any assets to be copied along
     * with our app's assets. This structure is flattened, so it is not
     * recommended that you use wildcards.
     */
    vendor_files: {
        js: [
            'vendor/particles.js/particles.min.js',
            'vendor/lodash/dist/lodash.min.js',
            'vendor/jquery/dist/jquery.min.js',
            'js/bootstrap.min.js',
            'vendor/angular/angular.js',
            'vendor/spin.js/spin.js',
            'vendor/angular-spinner/angular-spinner.js',
            'vendor/angular-cookie/angular-cookie.min.js',
            'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
            'vendor/placeholders/angular-placeholders-0.0.1-SNAPSHOT.min.js',
            'vendor/angular-ui-router/release/angular-ui-router.js',
            'vendor/moment/min/moment.min.js',
            'vendor/angular-moment/angular-moment.min.js',
            'vendor/ng-tags-input/ng-tags-input.min.js',
            'vendor/dropzone/downloads/dropzone.min.js',
            'vendor/angular-dropzone/lib/angular-dropzone.js',
            'lib/three.js',
            'lib/Detector.js',
            'lib/jquery.fullscreen.js',
            'lib/OrbitControls.js',
            'vendor/ngDialog/js/ngDialog.js'
        ],
        map: [
            'vendor/jquery/dist/jquery.min.map',
            'vendor/angular-moment/angular-moment.min.js.map',
            'vendor/angular-cookies/angular-cookies.min.js.map'
        ],
        css: [
            'vendor/pickadate/lib/compressed/themes/default.css',
            'vendor/pickadate/lib/compressed/themes/default.date.css',
            'vendor/ng-tags-input/ng-tags-input.min.css'
        ],
        assets: [
            'assets/weather-icons.min.css',
            'assets/jquery-ui-1.10.3.css',
            'assets/font-awesome.min.css',
            'assets/animate.min.css',
            'assets/animate.delay.css',
            'assets/toggles.css',
            'assets/pace.css',
            'fonts/**',
            'images/**',
            'assets/android.json'
        ]
    },

    config: {
        dev: {
            js: [ 'src/app/config/config.dev.js' ]
        },
        master: {
            js: [ 'src/app/config/config.master.js' ]
        },
        local: {
            js: [ 'src/app/config/config.local.js' ]
        }
    }
};
