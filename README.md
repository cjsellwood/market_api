# The Nexus API

## Description

This API is used with [The Nexus frontend](https://github.com/cjsellwood/the_nexus) to manage user authentication and the various interactions with the products in the marketplace. Requests by users to register and login are handled by a JWT system that is used to verify access to restricted routes such as creating and changing products. The products in the market can be returned based upon sort, page, category, search term or a combination of these. Products created by users include their text data as well as their uploaded images which are uploaded and stored for display on the frontend.

## Technologies

- Node and Express - Using this javascript framework with Node allows writing the API in a cleaner and faster way
- PostgreSQL - A fast and reliable relational database was great for storing and accessing users and products
- Typescript - Adding typescript to the project ensured that type errors during coding were caught before they effected the running server
- Jest and Supertest - These two libraries allowed for thoroughly testing all the cases in which the API could be used
- Cloudinary - Is used to upload and store the users product images which can be easily accessed on the frontend
- Joi - Ensures that requests coming from the frontend to a route have the required information to respond to it
- Heroku - It is used for hosting as it has a decent free option and can run with a limited postgresQL database

## Prerequisites

An .env is required at the root of the project containing:

- DATABASE_URL - postgresql database connection string
- JWT_PRIVATE - a private key for JWT creation and verification
- CLOUD_NAME - cloudinary username
- CLOUD_KEY - cloudinary API key
- CLOUD_SECRET - cloudinary API Secret

If hosting on heroku, it will need to be setup:

1. `heroku login` - to authenticate
2. `heroku create` - to create a new heroku app
3. `heroku addons:create heroku-postgresql:hobby-dev` - to create postgresql database
4. `heroku config:set JWT_PRIVATE=key` - to set a private key for JWT authentication
5. `git push heroku master` - to deploy app from master branch

## Scripts

### `npm start`

Run development server

### `npm run start:prod`

Run production build

### `npm run pretest`

Create database for use in tests

### `npm test`

Run tests locally and run on changes

### `npm run test:actions`

Runs tests once for use with github actions

### `npm run test:coverage`

Runs test once locally and show coverage

### `npm run seed`

Seed sql database

### `npm run build`

Create js output production files

### `npm run heroku-postbuild`

Builds js output app and seeds heroku postgresql database after installing dependencies. Runs when deployed to heroku
