const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const app = express();
const models = require("./models");
const Chance = require("chance");
const chance = new Chance();
const cors = require("cors");
const { check, validationResult } = require('express-validator/check');

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/user", [
	check("email").isEmail(),
	check("password").isLength({
		min: 1
	})
], function(req, res){
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	};
	// console.log(req.query)
	models.User.find({
		where:{
			email: req.query.email
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
	if (!errors.isEmpty()) {
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

app.listen(3000, () => console.log("Example app listening on port 3000!"));