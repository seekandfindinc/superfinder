const express = require("express");
const http = require("http");
const https = require("https");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const models = require("./models");
const Chance = require("chance");
const chance = new Chance();
const cors = require("cors");
const path = require("path");
const { check, validationResult } = require("express-validator/check");
const lodash = require("lodash");
const moment = require("moment");
const multer  = require("multer");
const stream = require("stream");
const mime = require("mime");
const nodemailer = require("nodemailer");
const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const fs = require("fs");
const new_account_email = fs.readFileSync("email_templates/new_account_email.html", "utf8");
const config = require("./config");
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: config.email_username,
		pass: config.email_password
	}
});

http.createServer(function (req, res) {
	res.writeHead(301, {
		Location: "https://localhost:" + config.ssl_port
	});
	res.end();
}).listen(config.no_ssl_port, "localhost");

https.createServer({
	key: config.key,
	cert: config.cert
}, app).listen(config.ssl_port, "localhost");

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", express.static("./dist/superfinder/"));

app.get("/api/user", [
	check("email").isEmail(),
	check("password").isLength({
		min: 1
	})
], function(req, res){
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(422).json({ errors: errors.array() });
	};
	models.User.find({
		where:{
			email: req.query.email,
			approved: true
		},
		raw: true
	}).then((user) => {
		if(user){
			if(bcrypt.compareSync(req.query.password, user.password)){
				res.send({
					id: user.id,
					email: user.email
				});
			}
			else{
				res.send(false);
			}
		}
		else{
			res.send(false);
		}
	}).catch((err) => {
		res.status(500).send(err.stack);
	});
});

app.post("/api/register", [
	check("email").isEmail()
], function(req, res){
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(422).json({ errors: errors.array() });
	};
	var password = chance.word({length: 12});
	models.User.create({
		email: req.body.email,
		password: bcrypt.hashSync(password, 10)
	}).then((user) => {
		transporter.sendMail({
			from: "team@seekandfindinc.com",
			to: req.body.email,
			subject: "New User",
			html: new_account_email.replace("[EMAIL]", req.body.email).replace("[PASSWORD]", password)
		}, (error, info) => {
			if (error) {
				return console.log(error);
			}
			console.log("Message sent: %s", info.messageId);
			return res.send(true);
		});
	}).catch((err) => {
		return res.status(500).send(err.stack);
	});
});

app.get("/api/order", function(req, res){
	models.Order.findAll({
		raw: true
	}).then((orders) => {
		res.send(orders);
	}).catch((err) => {
		res.status(500).send(err.stack);
	});
});

app.get("/api/order/:id", function(req, res){
	models.Order.find({
		where:{
			id: req.params.id
		},
		raw: true
	}).then((order) => {
		models.Buyer.findAll({
			where:{
				OrderId: order.id
				
			},
			raw: true,
			attributes: ["name", "address"]
		}).then((buyers) => {
			models.Seller.findAll({
				where:{
					OrderId: order.id
				},
				attributes: ["name", "address"],
				raw: true
			}).then((sellers) => {
				order.buyers = buyers;
				order.sellers = sellers;
				res.send(order);
			}).catch((err) => {
				res.status(500).send(err.stack);
			});
		}).catch((err) => {
			res.status(500).send(err.stack);
		});
	}).catch((err) => {
		res.status(500).send(err.stack);
	});
});

app.put("/api/order/:id", function(req, res){
	models.Order.update(req.body,{
		where:{
			id: req.params.id
		}
	}).then((order) => {
		if(req.body.closed){
			res.send(true);
		}
		else{
			models.Buyer.update({
				deletedAt: moment().format("YYYY-MM-DD HH:mm:ss")
			},{
				where:{
					OrderId: req.params.id
				}
			}).then((buyers) => {
				models.Seller.update({
					deletedAt: moment().format("YYYY-MM-DD HH:mm:ss")
				},{
					where:{
						OrderId: req.params.id
					}
				}).then((sellers) => {
					lodash.forEach(req.body.buyers, function(buyer){
						buyer.OrderId = req.params.id;
					});
					lodash.forEach(req.body.sellers, function(seller){
						seller.OrderId = req.params.id;
					});
					models.Buyer.bulkCreate(req.body.buyers).then((buyers) => {
						models.Seller.bulkCreate(req.body.sellers).then((sellers) => {
							res.send(true);
						}).catch((err) => {
							return res.status(500).send(err.stack);
						});
					}).catch((err) => {
						return res.status(500).send(err.stack);
					});
				}).catch((err) => {
					res.status(500).send(err.stack);
				});
			}).catch((err) => {
				res.status(500).send(err.stack);
			});
		}
	}).catch((err) => {
		res.status(500).send(err.stack);
	});
});

app.post("/api/order", function(req, res){
	models.Order.create({
		property_address: req.body.propertyAddress,
		reference_number: req.body.referenceNumber,
		lender: req.body.lender,
		corporation: req.body.corporation,
		purchase_price: req.body.purchasePrice,
		loan_amount: req.body.loanAmount
	}).then((order) => {
		lodash.forEach(req.body.buyerFieldArray, function(buyer){
			buyer.OrderId = order.id;
		});
		lodash.forEach(req.body.sellerFieldArray, function(seller){
			seller.OrderId = order.id;
		});
		models.Buyer.bulkCreate(req.body.buyerFieldArray).then((buyers) => {
			models.Seller.bulkCreate(req.body.sellerFieldArray).then((sellers) => {
				return res.send(order);
			}).catch((err) => {
				return res.status(500).send(err.stack);
			});
		}).catch((err) => {
			return res.status(500).send(err.stack);
		});
	}).catch((err) => {
		return res.status(500).send(err.stack);
	});
});

app.get("/api/document/:id", function(req, res){
	models.Document.find({
		where:{
			id: req.params.id
		},
		raw: true,
		attributes: ["filename", "file", "createdAt"]
	}).then((document) => {
		var fileContents = Buffer.from(document.file, "base64");
		var mimetype = mime.getType(document.filename);
		res.setHeader("Content-disposition", "attachment; filename=" + document.filename);
		res.setHeader("Content-type", mimetype);
		var readStream = new stream.PassThrough();
		readStream.end(fileContents);
		readStream.pipe(res);
	}).catch((err) => {
		res.status(500).send(err.stack);
	});
});

app.get("/api/documents/:id", function(req, res){
	models.Document.findAll({
		where:{
			OrderId: req.params.id
		},
		raw: true,
		attributes: ["description", "id", "createdAt"]
	}).then((documents) => {
		res.send(documents);
	}).catch((err) => {
		res.status(500).send(err.stack);
	});
});

app.post("/api/document", upload.single("file"), function(req, res){
	models.Document.create({
		filename: req.file.originalname,
		description: req.body.description,
		file: req.file.buffer,
		OrderId: req.body.OrderId
	}).then((document) => {
		return res.send(document);
	}).catch((err) => {
		return res.status(500).send(err.stack);
	});
});

app.get("/*", function(req,res){
	res.sendFile(path.resolve(__dirname + "/dist/superfinder/index.html"));
});

