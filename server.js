const express = require('express')
const http = require('http')
const https = require('https')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const Chance = require('chance')

const chance = new Chance()
const cors = require('cors')
const path = require('path')
const { check, validationResult } = require('express-validator/check')
const lodash = require('lodash')
const moment = require('moment')
const multer = require('multer')
const nodemailer = require('nodemailer')
const Sequelize = require('sequelize')
const jwt = require('jsonwebtoken')

const app = express()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const fs = require('fs')
const config = require('./config')

const smtpTransporter = nodemailer.createTransport({
	port: 465,
	host: 'email-smtp.us-east-1.amazonaws.com',
	secure: true,
	auth: {
		user: config.awsSESUsername,
		pass: config.awsSESPassword
	},
	debug: true
})

const AWS = require('aws-sdk')
const s3 = new AWS.S3({
	accessKeyId: config.awsS3Username,
	secretAccessKey: config.awsS3Password
})

const models = require('./models')

http.createServer(function (req, res) {
	res.writeHead(307, { Location: 'https://' + req.headers.host + req.url })
	res.end()
}).listen(8080)

https.createServer({
	key: config.key,
	cert: config.cert
}, app).listen(8443)

let authToken = function (req, res, next) {
	if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') return next()
	else return res.send(401)
}

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', express.static('./dist/superfinder/'))

app.get('/api/user', function (req, res) {
	models.User.find({
		where: {
			email: req.query.email,
			approved: true
		},
		raw: true,
		attributes: ['id', 'first_name', 'last_name', 'password']
	}).then((user) => {
		if (user) {
			if (bcrypt.compareSync(req.query.password, user.password)) {
				let token = jwt.sign(user, 'secretKey')
				res.json({
					token: token,
					user: {
						id: user.id,
						initials: user.first_name.substring(0, 1) + user.last_name.substring(0, 1)
					}
				})
			} else {
				res.send(false)
			}
		} else {
			res.send(false)
		}
	}).catch((err) => {
		res.status(500).send(err.stack)
	})
})

app.put('/api/user', authToken, function (req, res) {
	if (req.body.password) {
		models.User.update({
			password: bcrypt.hashSync(req.body.password, 10)
		}, {
			where: {
				id: req.body.id
			}
		}).then((user) => {
			res.send(true)
		}).catch((err) => {
			res.status(500).send(err.stack)
		})
	} else if (req.body.approved) {
		models.User.update({
			approved: req.body.approved
		}, {
			where: {
				id: req.body.id
			}
		}).then((user) => {
			res.send(true)
		}).catch((err) => {
			res.status(500).send(err.stack)
		})
	} else {
		res.send(true)
	}
})

app.get('/api/users', authToken, function (req, res) {
	models.User.findAll({
		raw: true,
		attributes: ['id', 'email', 'approved', 'createdAt', 'updatedAt', 'deletedAt', 'first_name', 'last_name']
	}).then((users) => {
		res.send(users)
	}).catch((err) => {
		res.status(500).send(err.stack)
	})
})

app.get('/api/user/forgot/:hash', function (req, res) {
	const passwordResetStepTwoEmail = fs.readFileSync('email_templates/password_reset_step2_email.html', 'utf8')
	models.UserPasswordReset.find({
		where: {
			hash: req.params.hash,
			used: false,
			expire_date: {
				$gte: moment().format('YYYY-MM-DD HH:mm:ss')
			}
		},
		raw: true
	}).then((passwordReset) => {
		if (passwordReset) {
			var password = chance.word({ length: 12 })
			models.User.update({
				password: bcrypt.hashSync(password, 10)
			}, {
				where: {
					id: passwordReset.UserId
				}
			}).then((user) => {
				models.User.find({
					where: {
						id: passwordReset.UserId
					},
					raw: true
				}).then((user) => {
					models.UserPasswordReset.update({
						used: true
					}, {
						where: {
							id: passwordReset.id
						}
					}).then((passwordReset) => {
						smtpTransporter.sendMail({
							from: 'team@seekandfindinc.com',
							to: user.email,
							html: passwordResetStepTwoEmail.replace('[NEW_PASSWORD]', password).replace('[LOGIN_URL]', config.email_domain),
							subject: 'Reset Password'
						}, function (error, info) {
							if (error) {
								return console.log(error)
							} else {
								console.log('Message sent: ' + info.response)
							}
							return res.redirect(config.email_domain + '/admin/user/forgot?status=s')
						})
					}).catch((err) => {
						return res.status(500).send(err.stack)
					})
				}).catch((err) => {
					return res.status(500).send(err.stack)
				})
			}).catch((err) => {
				return res.status(500).send(err.stack)
			})
		} else {
			return res.redirect(config.email_domain + '/admin/user/forgot?status=f')
		}
	}).catch((err) => {
		res.status(500).send(err.stack)
	})
})

app.post('/api/user/forgot', function (req, res) {
	const passwordResetStepOneEmail = fs.readFileSync('email_templates/password_reset_step1_email.html', 'utf8')
	models.User.find({
		where: {
			$or: [{
				email: req.body.email
			}, {
				id: req.body.id
			}]
		},
		raw: true
	}).then((user) => {
		if (user) {
			var hash = chance.string({ length: 50, pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' })
			var expireDate = moment().add(24, 'hours').format('YYYY-MM-DD HH:mm:ss')
			models.UserPasswordReset.create({
				expire_date: expireDate,
				hash: hash,
				UserId: user.id
			}).then((passwordReset) => {
				smtpTransporter.sendMail({
					from: 'team@seekandfindinc.com',
					to: user.email,
					html: passwordResetStepOneEmail.replace('[PASSWORD_RESERURL]', config.email_domain + '/api/user/forgot/' + hash),
					subject: 'Reset Password'
				}, function (error, info) {
					if (error) {
						return console.log(error)
					} else {
						console.log('Message sent: ' + info.response)
					}
					return res.send(true)
				})
			}).catch((err) => {
				return res.status(500).send(err.stack)
			})
		} else {
			return res.send(true)
		}
	}).catch((err) => {
		return res.status(500).send(err.stack)
	})
})

app.post('/api/register', [
	check('email').isEmail()
], function (req, res) {
	const newAccountEmail = fs.readFileSync('email_templates/new_account_email.html', 'utf8')
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() })
	}
	var password = chance.word({ length: 12 })
	models.User.create({
		email: req.body.email,
		password: bcrypt.hashSync(password, 10),
		first_name: req.body.first_name,
		last_name: req.body.last_name
	}).then((user) => {
		smtpTransporter.sendMail({
			from: 'team@seekandfindinc.com',
			to: req.body.email,
			html: newAccountEmail.replace('[EMAIL]', req.body.email).replace('[PASSWORD]', password),
			subject: 'New User'
		}, function (error, info) {
			if (error) {
				return console.log(error)
			} else {
				console.log('Message sent: ' + info.response)
			}
			return res.send(true)
		})
	}).catch((err) => {
		return res.status(500).send(err.stack)
	})
})

app.get('/api/order', authToken, function (req, res) {
	let orderWhere = {}
	if (req.query) {
		for (let item in req.query) {
			if (item === 'corporation' || item === 'property_address' || item === 'lender') {
				orderWhere[item] = {
					$like: '%' + req.query[item] + '%'
				}
			} else if (item === 'reference_number' || item === 'closed') {
				orderWhere[item] = req.query[item]
			} else if (item === 'closing_date') {
				orderWhere[item] = {
					$gte: req.query[item] + ' 00:00:00',
					$lte: req.query[item] + ' 23:59:59'
				}
			}
		}
	}
	models.Order.findAll({
		raw: true,
		where: orderWhere,
		order: [['updatedAt', 'DESC']]
	}).then((orders) => {
		if (orders.length > 0) {
			models.Buyer.findAll({
				raw: true,
				attributes: ['name', 'OrderId']
			}).then((buyers) => {
				models.Seller.findAll({
					attributes: ['name', 'OrderId'],
					raw: true
				}).then((sellers) => {
					lodash.forEach(orders, function (order) {
						order.buyers = lodash.map(lodash.filter(buyers, {
							OrderId: order.id
						}), 'name')
						order.sellers = lodash.map(lodash.filter(sellers, {
							OrderId: order.id
						}), 'name')
					})
					res.send(orders)
				}).catch((err) => {
					res.status(500).send(err.stack)
				})
			}).catch((err) => {
				res.status(500).send(err.stack)
			})
		} else {
			res.send([])
		}
	}).catch((err) => {
		res.status(500).send(err.stack)
	})
})

app.get('/api/order/:id', authToken, function (req, res) {
	models.Order.find({
		where: {
			id: req.params.id
		},
		raw: true
	}).then((order) => {
		if (order) {
			models.Buyer.findAll({
				where: {
					OrderId: order.id
				},
				raw: true,
				attributes: ['name', 'address']
			}).then((buyers) => {
				models.Seller.findAll({
					where: {
						OrderId: order.id
					},
					attributes: ['name', 'address'],
					raw: true
				}).then((sellers) => {
					order.buyers = buyers
					order.sellers = sellers
					res.send(order)
				}).catch((err) => {
					res.status(500).send(err.stack)
				})
			}).catch((err) => {
				res.status(500).send(err.stack)
			})
		} else {
			res.send(false)
		}
	}).catch((err) => {
		res.status(500).send(err.stack)
	})
})

app.put('/api/order/:id', authToken, function (req, res) {
	models.Order.update(req.body, {
		where: {
			id: req.params.id
		}
	}).then((order) => {
		if (req.body.closed) {
			res.send(true)
		} else {
			models.Buyer.update({
				deletedAt: moment().format('YYYY-MM-DD HH:mm:ss')
			}, {
				where: {
					OrderId: req.params.id
				}
			}).then((buyers) => {
				models.Seller.update({
					deletedAt: moment().format('YYYY-MM-DD HH:mm:ss')
				}, {
					where: {
						OrderId: req.params.id
					}
				}).then((sellers) => {
					lodash.forEach(req.body.buyers, function (buyer) {
						buyer.OrderId = req.params.id
					})
					lodash.forEach(req.body.sellers, function (seller) {
						seller.OrderId = req.params.id
					})
					models.Buyer.bulkCreate(req.body.buyers).then((buyers) => {
						models.Seller.bulkCreate(req.body.sellers).then((sellers) => {
							res.send(true)
						}).catch((err) => {
							return res.status(500).send(err.stack)
						})
					}).catch((err) => {
						return res.status(500).send(err.stack)
					})
				}).catch((err) => {
					res.status(500).send(err.stack)
				})
			}).catch((err) => {
				res.status(500).send(err.stack)
			})
		}
	}).catch((err) => {
		res.status(500).send(err.stack)
	})
})

app.post('/api/order', authToken, function (req, res) {
	models.Order.create({
		property_address: req.body.property_address,
		reference_number: req.body.reference_number,
		lender: req.body.lender,
		corporation: req.body.corporation,
		purchase_price: req.body.purchase_price,
		loan_amount: req.body.loan_amount
	}).then((order) => {
		lodash.forEach(req.body.buyers, function (buyer) {
			buyer.OrderId = order.id
		})
		lodash.forEach(req.body.sellers, function (seller) {
			seller.OrderId = order.id
		})
		models.Buyer.bulkCreate(req.body.buyers).then((buyers) => {
			models.Seller.bulkCreate(req.body.sellers).then((sellers) => {
				return res.send(order)
			}).catch((err) => {
				return res.status(500).send(err.stack)
			})
		}).catch((err) => {
			return res.status(500).send(err.stack)
		})
	}).catch((err) => {
		return res.status(500).send(err.stack)
	})
})

app.get('/api/order/:id/notes', authToken, function (req, res) {
	models.Note.belongsTo(models.User, { foreignKey: 'UserId', targetKey: 'id' })
	models.Note.findAll({
		where: {
			OrderId: req.params.id
		},
		raw: true,
		order: [['createdAt', 'ASC']],
		nest: true,
		include: [{
			model: models.User,
			attributes: [[Sequelize.literal('CONCAT(UPPER(SUBSTRING(first_name, 1, 1)), UPPER(SUBSTRING(last_name, 1, 1)))'), 'initials']]

		}]
	}).then((notes) => {
		res.send(notes)
	}).catch((err) => {
		res.status(500).send(err.stack)
	})
})

app.post('/api/order/:id/note', authToken, function (req, res) {
	models.Note.create({
		text: req.body.text,
		UserId: req.body.UserId,
		OrderId: req.params.id
	}).then((note) => {
		return res.send(true)
	}).catch((err) => {
		return res.status(500).send(err.stack)
	})
})

app.get('/api/order/:id/forwards', authToken, function (req, res) {
	models.OrderForward.findAll({
		where: {
			OrderId: req.params.id
		},
		raw: true,
		order: [['createdAt', 'DESC']]
	}).then((orderforwards) => {
		res.send(orderforwards)
	}).catch((err) => {
		res.status(500).send(err.stack)
	})
})

app.post('/api/order/:id/forward', authToken, function (req, res) {
	models.Order.find({
		where: {
			id: req.params.id
		},
		raw: true
	}).then((order) => {
		models.Buyer.findAll({
			where: {
				OrderId: req.params.id
			},
			raw: true,
			attributes: ['name', 'address']
		}).then((buyers) => {
			models.Seller.findAll({
				where: {
					OrderId: req.params.id
				},
				attributes: ['name', 'address'],
				raw: true
			}).then((sellers) => {
				order.buyers = buyers
				order.sellers = sellers
				var forwardOrderEmail = fs.readFileSync('email_templates/forward_order_email.html', 'utf8')
				var buyersList = ''
				lodash.forEach(order.buyers, function (value, key) {
					if (key === order.buyers.length - 1) {
						buyersList = buyersList + value.name
					} else {
						buyersList = buyersList + value.name + '<br>'
					}
				})
				var sellersList = ''
				lodash.forEach(order.sellers, function (value, key) {
					if (key === order.sellers.length - 1) {
						sellersList = sellersList + value.name
					} else {
						sellersList = sellersList + value.name + '<br>'
					}
				})
				forwardOrderEmail = forwardOrderEmail.replace('[PROPERTY]', order.property_address).replace('[CORP]', order.corporation).replace('[PURCH]', order.purchase_price ? '$' + order.purchase_price : 'NONE').replace('[LENDER]', order.lender ? order.lender : 'NONE').replace('[LOAN]', order.loan_amount ? '$' + order.loan_amount : 'NONE').replace('[BUYERS]', buyersList).replace('[SELLERS]', sellersList).replace('[FORWARD]', '$' + req.body.coverage)
				models.OrderForward.create({
					email: req.body.email,
					coverage: req.body.coverage,
					subject: 'New Order',
					html: forwardOrderEmail,
					OrderId: req.params.id
				}).then((orderforward) => {
					smtpTransporter.sendMail({
						from: 'processing@seekandfindinc.com',
						to: req.body.email,
						html: forwardOrderEmail,
						subject: 'New Order'
					}, function (error, info) {
						if (error) {
							return console.log(error)
						} else {
							console.log('Message sent: ' + info.response)
						}
						return res.send(true)
					})
				}).catch((err) => {
					return res.status(500).send(err.stack)
				})
			}).catch((err) => {
				return res.status(500).send(err.stack)
			})
		}).catch((err) => {
			return res.status(500).send(err.stack)
		})
	}).catch((err) => {
		return res.status(500).send(err.stack)
	})
})

app.get('/api/document', function (req, res) {
	res.attachment(req.query.key)
	var fileStream = s3.getObject({
		Bucket: config.awsS3Bucket,
		Key: req.query.key
	}).createReadStream()
	fileStream.pipe(res)
})

app.get('/api/documents/:id', authToken, function (req, res) {
	s3.listObjectsV2({
		Bucket: config.awsS3Bucket,
		Prefix: req.params.id + '/'
	}, function (err, data) {
		if (err) res.status(500).send(err.stack)
		else res.send(data.Contents)
	})
})

app.post('/api/document', [authToken, upload.single('file')], function (req, res) {
	s3.upload({
		Bucket: config.awsS3Bucket,
		Key: req.body.OrderId + '/' + req.file.originalname,
		Body: req.file.buffer
	}, function (err, data) {
		if (err) return res.status(500).send(err.stack)
		else return res.send(true)
	})
})

app.get('/*', function (req, res) {
	res.sendFile(path.resolve('/dist/superfinder/index.html'))
})
