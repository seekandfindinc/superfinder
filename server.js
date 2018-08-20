const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const app = express();
const models = require("./models");
const Chance = require("chance");
const chance = new Chance();
const cors = require("cors");
const path = require("path");
const { check, validationResult } = require("express-validator/check");
const lodash = require("lodash");
const moment = require("moment");

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
	console.log(password);
	models.User.create({
		email: req.body.email,
		password: bcrypt.hashSync(password, 10)
	}).then((user) => {
		return res.send(user)
	}).catch((err) => {
		return res.status(500).send(err.stack);
	});
});

app.get("/api/orders", function(req, res){
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

app.get("/*", function(req,res){
	res.sendFile(path.resolve(__dirname + "/dist/superfinder/index.html"));
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));