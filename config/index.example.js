const fs = require("fs");
var config = {
	dbname: "dbname",
	user: "user",
	password: "password",
	host: "host",
	email_username: "email_username",
	email_password: "email_password",
	ssl_port: 443,
	no_ssl_port: 80,
	cert: fs.readFileSync("cert.pem"),
	key: fs.readFileSync("key.pem"),
	web_host: "localhost",
	email_domain: "http://localhost:4200/"
};

module.exports = config;