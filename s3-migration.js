const config = require("./config");
const fs = require('fs');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
	accessKeyId: config.awsS3Username,
	secretAccessKey: config.awsS3Password
});
const models = require("./models");
const Sequelize = require("sequelize");

models.finder.query("SELECT * FROM documents").then(documents => {
	documents.forEach(function(doc){
		s3.upload({
			Bucket: config.awsS3Bucket,
			Key: doc.OrderId + "/" + doc.filename,
			Body: doc.file
		}, function(err, data) {
			console.log(err, data);
		});
	});
	console.log("Finished Uploading Documents")
});