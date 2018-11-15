
# Introduction.

The ACE Quill client software may be built on Mac, Linux, or Windows.

The code is written in TypeScript and uses EJS templates.

# Prerequisites.

To build this software, you will need to install the following tools:

* Java Developer kit - from Oracle https://java.com for your platform
* Android Studio - from Google https://developer.android.com/studio/install.html
* NodeJS - to operate build tools and run Cordova tools http://nodejs.org
* cordova - the Apache Cordova mobile application framework http://cordova.apache.org
* yarn - to manage javascript packages (alternative to npm) http://yarnpkg.com
* gulp - to compile and package code http://gulpjs.com

Install these tools one at a time:

* install NodeJS with a version >=8 
* install yarn from the website (not with npm) 
* install Java Developer Kit version >= 8
* install Android studio from the website
* install cordova by typing:  yarn global add cordova
* install gulp by typing: yarn global add gulp

# Prior to running builds

1. make sure your proxy settings are correct since both yarn and cordova will need to pull
code and data from the Internet.

2. Make sure the ANDROID_HOME environment variable points to the correct directory.

# First Time build:

The first time you prepare this environment, you will need to install the cordova template.

In the toplevel directory, type:

```bash
$ cordova-install.sh    # on windows, type cordova-install.bat
```
# Building the ACE Quill Client:

In the top level directory, type the following to install all necessary packages:

```bash
$ yarn install
$ gulp build
```

# Additional Gulp Commands

To see what other commands you can run, type:

```bash
$ gulp help
```
