const fs = require("fs");
var config = {
	email_username: "email_username",
	email_password: "email_password",
	cert: fs.readFileSync("cert.pem"),
	key: fs.readFileSync("key.pem"),
	email_domain: "http://localhost:4200/",
	awsS3Username: "awsS3Username",
	awsS3Password: "awsS3Password",
	awsS3Bucket: "awsS3Bucket"
};

module.exports = config;