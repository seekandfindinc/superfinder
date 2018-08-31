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
var pdfmake = require("pdfmake");

http.createServer(function (req, res) {
	var header = req.headers["host"];
	res.writeHead(307, {
		Location: header.search(":") > -1 ? "https://" + header.slice(0, header.search(":")) + ":" + config.ssl_port + req.url : "https://" + header + ":" + config.ssl_port + req.url
	});
	res.end();
}).listen(config.no_ssl_port, config.web_host);

https.createServer({
	key: config.key,
	cert: config.cert
}, app).listen(config.ssl_port, config.web_host);

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

app.get("/api/order/:id/forward/recent", function(req, res){
	models.OrderForward.find({
		where:{
			OrderId: req.params.id
		},
		raw: true,
		order:[["createdAt", "DESC"]]
	}).then((orderforward) => {
		res.send(orderforward);
	}).catch((err) => {
		res.status(500).send(err.stack);
	});
});

app.post("/api/order/:id/forward", function(req, res){
	models.Order.find({
		where:{
			id: req.params.id
		},
		raw: true
	}).then((order) => {
		models.Buyer.findAll({
			where:{
				OrderId: req.params.id
				
			},
			raw: true,
			attributes: ["name", "address"]
		}).then((buyers) => {
			models.Seller.findAll({
				where:{
					OrderId: req.params.id
				},
				attributes: ["name", "address"],
				raw: true
			}).then((sellers) => {
				order.buyers = buyers;
				order.sellers = sellers;
				var forward_order_email = fs.readFileSync("email_templates/forward_order_email.html", "utf8");
				var buyersList = "";
				lodash.forEach(order.buyers, function(value, key){
					if(key === order.buyers.length - 1){
						buyersList = buyersList + value.name;
					}
					else{
						buyersList = buyersList + value.name + "<br>";
					}
				});
				var sellersList = "";
				lodash.forEach(order.sellers, function(value, key){
					if(key === order.sellers.length - 1){
						sellersList = sellersList + value.name;
					}
					else{
						sellersList = sellersList + value.name + "<br>";
					}
				});
				forward_order_email = forward_order_email.replace("[PROPERTY]", order.property_address).replace("[CORP]", order.corporation).replace("[PURCH]", "$" + order.purchase_price).replace("[LENDER]", order.lender ? order.lender : "NONE").replace("[LOAN]", order.loan_amount ? "$" + order.loan_amount : "NONE").replace("[BUYERS]", buyersList).replace("[SELLERS]", sellersList);
				models.OrderForward.create({
					email: req.body.email,
					subject: "New Order",
					html: forward_order_email,
					OrderId: req.params.id,
				}).then((orderforward) => {
					transporter.sendMail({
						from: "team@seekandfindinc.com",
						to: req.body.email,
						subject: "New Order",
						html: forward_order_email
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
		order:[["createdAt", "DESC"]],
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

app.post("/api/invoice/:orderid", function(req, res){
	var items = req.body;
	var total_cost = 0;
	lodash.forEach(items, function(order){
		order.total_cost = order.unit * order.cost; 
		total_cost = total_cost + order.total_cost;
	});
	var total_cost_with_tax = total_cost * .08875;
	models.Invoice.create({
		sub_total: total_cost,
		sales_tax: total_cost_with_tax,
		total: total_cost + total_cost_with_tax,
		OrderId: req.params.orderid
	}).then((invoice) => {
		var random_number = chance.integer({ min: 100000, max: 999999 });
		var invoice_number = invoice.id + "-" + random_number;
		lodash.forEach(items, function(order){
			order.InvoiceId = invoice.id
		});
		models.InvoiceItem.bulkCreate(items).then((invoice_item) => {
			models.Buyer.findAll({
				where:{
					OrderId: invoice.OrderId
				},
				raw: true
			}).then((buyers) => {
				var table_body = [
					[{
						text: "Unit(s)",
						style: "tableheader"
					},{
						text: "Description",
						style: "tableheader"
					},{
						text: "Unit Price",
						style: "tableheader"
					},{
						text: "Total Price",
						style: "tableheader"
					}]
				];
				lodash.forEach(items, function(item){
					var items_array = [{
						text: item.unit,
						alignment: "right"
					},item.item,{
						text: item.cost.toFixed(2),
						alignment: "right"
					},{
						text: item.total_cost.toFixed(2),
						alignment: "right"
					}];
					table_body.push(items_array)
				});
				table_body.push([{
					text: "Subtotal",
					colSpan: 3,
					style: "tablefooter"
				},"","", {
					text: invoice.sub_total.toFixed(2),
					alignment: "right"
				}]);
				table_body.push([{
					text: "Sales Tax",
					colSpan: 3,
					style: "tablefooter"
				},"","", {
					text: invoice.sales_tax.toFixed(2),
					alignment: "right"
				}]);
				table_body.push([{
					text: "Total",
					colSpan: 3,
					style: "tablefooter"
				},"","", {
					text: invoice.total.toFixed(2),
					alignment: "right"
				}]);
				var pdf_content = {
					content: [{
						text: "Seek and Find Inc.",
						style: {
						    fontSize: 22
						}
					},' ',{
						text: "1051 Port Washington Boulevard",
						style: "address"
					},{
						text: "PO Box 1313",
						style: "address"
					},{
						text: "Port Washington, NY 11050",
						style: "address"
					},{
						text: "Tel: 631-406-9427",
						style: "address"
					}," ",{
						text: "Invoice Number",
						style: {
							fontSize: 10,
							bold: true,
							decoration: "underline"
						}
					},{
						text: invoice.id + "-" + random_number,
						style: {
							fontSize: 10,
						}
					}," ",{
						text: "Buyers",
						style: {
							fontSize: 10,
							bold: true,
							decoration: "underline"
						}
					},{
						text: lodash.map(buyers, "name").join(", "),
						style: {
							fontSize: 10,
						}
					}," ",{
						table: {
						    widths: ["10%", "50%", "20%", "20%"],
							body: table_body
							
						},
						style: "table"
					}," ",{
						text: "Make all checks payable to Seek and Find Inc",
						style: {
							fontSize: 10,
							italics: true
						}
					}],
					styles: {
						address:{
							fontSize: 10,
							italics: true
						},
						table:{
						    fontSize: 9
						},
						tableheader:{
						    bold: true,
						    alignment: "center"
						},
						tablefooter:{
						    bold: true,
						    alignment: "right"
						}
					}
				};
				const doc = new pdfmake({
					Roboto:{
						normal: new Buffer(require("pdfmake/build/vfs_fonts.js").pdfMake.vfs["Roboto-Regular.ttf"], "base64"),
						italics: new Buffer(require("pdfmake/build/vfs_fonts.js").pdfMake.vfs["Roboto-Italic.ttf"], "base64"),
						bold: new Buffer(require("pdfmake/build/vfs_fonts.js").pdfMake.vfs["Roboto-Medium.ttf"], "base64")
					}
				}).createPdfKitDocument(pdf_content);
				var chunks = [];
				var result;
				doc.on("readable", function(){
					var chunk;
					while ((chunk = doc.read(9007199254740991)) !== null){
						chunks.push(chunk);
					}
				});
				doc.on("end", function(){
					result = Buffer.concat(chunks);
					models.Document.create({
						filename: "Invoice_" + moment().format("YYYYMMDD") + ".pdf",
						description: "Invoice",
						file: result,
						OrderId: invoice.OrderId
					}).then((document) => {
						models.Invoice.update({
							number: invoice_number,
							DocumentId: document.id
						},{
							where:{
								id: invoice.id
							}
						}).then(() => {
							return res.send(true);
						});
					}).catch((err) => {
						return res.status(500).send(err.stack);
					});
				});
				doc.end();
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

app.get("/*", function(req,res){
	res.sendFile(path.resolve(__dirname + "/dist/superfinder/index.html"));
});