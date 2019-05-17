const fs = require('fs')
const config = {
	// This section is only needed locally
	awsUsername: 'awsUsername',
	awsPassword: 'awsPassword',
	// This section is only needed locally
	awsS3Bucket: 'awsS3Bucket',
	cert: fs.readFileSync('cert.pem'),
	key: fs.readFileSync('key.pem'),
	email_domain: 'http://localhost'
}

module.exports = config
