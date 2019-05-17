# superfinder

[![Build Status](https://travis-ci.com/seekandfindinc/superfinder.svg?branch=master)](https://travis-ci.com/seekandfindinc/superfinder)

## Build for Development

- Run `npm start` for a dev server to turn on FE

- Configure config files in "config" folder.

- Run `node server.js --dbname dbname --dbuser dbuser --dbpass dbpass --dbhost dbhost`  to turn on BE

- Navigate to `http://localhost:4200`. The app will automatically reload if you change any of the source files.

## Build for Production

- Configure config files in "config" folder.

- Run `npm run-script build` to build the project.

- Run `node server.js --dbname dbname --dbuser dbuser --dbpass dbpass --dbhost dbhost` to start it.