const fs = require("fs");
const config = {
	awsUsername: "awsUsername",
	awsPassword: "awsPassword",
	cert: fs.readFileSync("cert.pem"),
	key: fs.readFileSync("key.pem"),
	email_domain: "http://localhost"
};

module.exports = config;