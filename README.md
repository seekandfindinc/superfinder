# superfinder

[![Build Status](https://travis-ci.com/seekandfindinc/superfinder.svg?branch=master)](https://travis-ci.com/seekandfindinc/superfinder)

## Build for Development

- Create .env file with values below

```bash
## RDS OR LOCAL DB CREDS
RDS_DB_NAME = finder
RDS_HOSTNAME = 127.0.0.1
RDS_PASSWORD = password
RDS_USERNAME = username
## S3 BUCKET NAME
S3_BUCKET = [name]
## AWS KEYS FOR LOCAL
AWS_KEY_ID = key
AWS_SECRET_ACCESS_KEY = secret
## HOST FOR EMAILS
DNS = http://localhost:4200
## REDIS Details
REDIS_HOST = 127.0.0.1
REDIS_PORT = 6379
REDIS_EXPIRATION = 60
```

- Run `npm start`

- Navigate to `http://localhost:4200`. The app will automatically reload if you change any of the source files.

## Build Angular For Production

- Run `npm run build`