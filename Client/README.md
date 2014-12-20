# [ngBoilerplate](http://joshdmiller.github.com/ng-boilerplate) [![Build Status](https://api.travis-ci.org/ngbp/ngbp.png?branch=v0.3.2-release)](https://travis-ci.org/ngbp/ngbp)

An opinionated kickstarter for [AngularJS](http://angularjs.org) projects.

***

## Quick Start

Install Node.js and then:

```sh
$ git clone git://github.com/joshdmiller/ng-boilerplate
$ cd ng-boilerplate
$ sudo npm -g install grunt-cli karma bower
$ npm install
$ bower install
$ grunt watch
```

Finally, open `file:///path/to/ng-boilerplate/build/index.html` in your browser.

Happy hacking!

## Purpose

`ngBoilerplate` is designed to make life easy by providing a basic framework
with which to kickstart AngularJS projects. It contains a best-practice
directory structure to ensure code reusability and maximum scalability.
ngBoilerplate also comes prepackaged with the most popular design frameworks
around: [Twitter Bootstrap](http://getbootstrap.com),
[Angular UI](http://angular-ui.github.io),
[Angular Bootstrap](http://angular-ui.github.io/bootstrap),
[Font Awesome](http://fortawesome.github.com/Font-Awesome), and
[LESS](http://lesscss.org). Lastly, it contains a sophisticated
[Grunt](http://gruntjs.org)-based build system to ensure maximum productivity.
All you have to do is clone it and start coding!

## Philosophy

The principal goal of `ngBoilerplate` is to set projects up for long-term
success.  So `ngBoilerplate` tries to follow best practices everywhere it can.
These are:

- Properly orchestrated modules to encourage drag-and-drop component re-use.
- Tests exist alongside the component they are testing with no separate `test`
  directory required; the build process should be sophisticated enough to handle
  this.
- Speaking of which, the build system should work automagically, without
  involvement from the developer. It should do what needs to be done, while
  staying out of the way. Components should end up tested, linted, compiled,
  and minified, ready for use in a production environment.
- Integration with popular tools like Bower, Karma, and LESS.
- *Encourages* test-driven development. It's the only way to code.
- A directory structure that is cogent, meaningful to new team members, and
  supporting of the above points.
- Well-documented, to show new developers *why* things are set up the way they
  are.
- It should be responsive to evidence. Community feedback is therefore crucial
  to the success of `ngBoilerplate`.

But `ngBoilerplate` is not an example of an AngularJS app: this is a
kickstarter. If you're looking for an example of what a complete, non-trivial
AngularJS app that does something real looks like, complete with a REST backend
and authentication and authorization, then take a look at
[`angular-app`](http://github.com/angular-app/angular-app), which does just
that - and does it well.

## Learn

### Overall Directory Structure

At a high level, the structure looks roughly like this:

```
ng-boilerplate/
  |- grunt-tasks/
  |- karma/
  |- src/
  |  |- app/
  |  |  |- <app logic>
  |  |- assets/
  |  |  |- <static files>
  |  |- common/
  |  |  |- <reusable code>
  |  |- less/
  |  |  |- main.less
  |- vendor/
  |  |- angular-bootstrap/
  |  |- bootstrap/
  |  |- placeholders/
  |- .bowerrc
  |- bower.json
  |- build.config.js
  |- Gruntfile.js
  |- module.prefix
  |- module.suffix
  |- package.json
```

What follows is a brief description of each entry, but most directories contain
their own `README.md` file with additional documentation, so browse around to
learn more.

- `karma/` - test configuration.
- `src/` - our application sources. [Read more &raquo;](src/README.md)
- `vendor/` - third-party libraries. [Bower](http://bower.io) will install
  packages here. Anything added to this directory will need to be manually added
  to `build.config.js` and `karma/karma-unit.js` to be picked up by the build
  system.
- `.bowerrc` - the Bower configuration file. This tells Bower to install
  components into the `vendor/` directory.
- `bower.json` - this is our project configuration for Bower and it contains the
  list of Bower dependencies we need.
- `build.config.js` - our customizable build settings; see "The Build System"
  below.
- `Gruntfile.js` - our build script; see "The Build System" below.
- `module.prefix` and `module.suffix` - our compiled application script is
  wrapped in these, which by default are used to place the application inside a
  self-executing anonymous function to ensure no clashes with other libraries.
- `package.json` - metadata about the app, used by NPM and our build script. Our
  NPM dependencies are listed here.

### Build vs. Compile

To make the build even faster, tasks are placed into two categories: build and
compile. The build tasks (like those we've been discussing) are the minimal
tasks required to run your app during development.

Compile tasks, however, get your app ready for production. The compile tasks
include concatenation, minification, compression, etc. These tasks take a little
bit longer to run and are not at all necessary for development so are not called
automatically during build or watch.

To initiate a full compile, you simply run the default task:

```sh
$ grunt
```

This will perform a build and then a compile. The compiled site - ready for
uploading to the server! - is located in `bin/`, taking a cue from
traditional software development. To test that your full site works as
expected, open the `bin/index.html` file in your browser. Voila!

### Live Reload!

`ngBoilerplate` also includes [Live Reload](http://livereload.com/), so you no
longer have to refresh your page after making changes! You need a Live Reload
browser plugin for this:

- Chrome - [Chrome Webstore](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)
- Firefox - [Download from Live Reload](http://download.livereload.com/2.0.8/LiveReload-2.0.8.xpi)
- Safari - [Download from Live Reload](http://download.livereload.com/2.0.9/LiveReload-2.0.9.safariextz)
- Internet Explorer - Surely you jest.

Note that if you're using the Chrome version with `file://` URLs (as is the
default with `ngBoilerplate`) you need to tell Live Reload to allow it. Go to
`Menu -> Tools -> Extensions` and check the "Allow access to file URLs" box next
to the Live Reload plugin.

When you load your page, click the Live Reload icon in your toolbar and
everything should work magically. w00t!

If you'd prefer to not install a browser extension, then you must add the
following to the end of the `body` tag in `index.html`:

```html
<script src="http://localhost:35729/livereload.js"></script>
```

Boom!

### Documentation

The documentation is generated by running:

```
grunt doc
```

A folder named *docs* will be created with the generated documentation. If you want to serve the documentation, run:

```
grunt doc:serve
```

### Contributing

This is an opinionated kickstarter, but the opinions are fluid and
evidence-based. Don't like the way I did something? Think you know of a better
way? Have an idea to make this more useful? Let me know! You can contact me
through all the usual channels or you can open an issue on the GitHub page. If
you're feeling ambitious, you can even submit a pull request - how thoughtful
of you!

So join the team! We're good people.

