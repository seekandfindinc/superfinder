const fs = require("fs");
const config = {
	awsUsername: "awsUsername",
	awsPassword: "awsPassword",
	cert: fs.readFileSync("cert.pem"),
	key: fs.readFileSync("key.pem"),
	email_domain: "http://localhost"
	awsS3Username: "awsS3Username",
	awsS3Password: "awsS3Password",
	awsS3Bucket: "awsS3Bucket"
};

module.exports = config;