const dotenv = require('dotenv');
dotenv.config();
const Sequelize = require('sequelize')
const sequelize = new Sequelize(process.env.RDS_DB_NAME, process.env.RDS_USERNAME, process.env.RDS_PASSWORD, {
	host: process.env.RDS_HOSTNAME,
	dialect: 'mysql',
	logging: false
})
const User = sequelize.define('User', {
	email: {
		type: Sequelize.STRING,
		allowNull: false
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false
	},
	approved: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	first_name: {
		type: Sequelize.STRING,
		allowNull: false
	},
	last_name: {
		type: Sequelize.STRING,
		allowNull: false
	}
}, {
	paranoid: true
})

const Order = sequelize.define('Order', {
	property_address: {
		type: Sequelize.STRING,
		allowNull: false
	},
	reference_number: {
		type: Sequelize.STRING,
		allowNull: true
	},
	lender: {
		type: Sequelize.STRING,
		allowNull: true
	},
	corporation: {
		type: Sequelize.STRING,
		allowNull: false
	},
	purchase_price: {
		type: Sequelize.FLOAT,
		allowNull: true
	},
	loan_amount: {
		type: Sequelize.FLOAT,
		allowNull: true
	},
	closing_date: {
		type: Sequelize.DATE,
		allowNull: true
	},
	closed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	closed_date: {
		type: Sequelize.DATE,
		allowNull: true
	}
}, {
	paranoid: true
})

const Buyer = sequelize.define('Buyer', {
	name: {
		type: Sequelize.STRING,
		allowNull: false
	},
	address: {
		type: Sequelize.STRING,
		allowNull: false
	}
}, {
	paranoid: true
})

const Seller = sequelize.define('Seller', {
	name: {
		type: Sequelize.STRING,
		allowNull: false
	},
	address: {
		type: Sequelize.STRING,
		allowNull: false
	}
}, {
	paranoid: true
})

const OrderForward = sequelize.define('OrderForward', {
	email: {
		type: Sequelize.STRING,
		allowNull: false
	},
	subject: {
		type: Sequelize.STRING,
		allowNull: false
	},
	html: {
		type: Sequelize.TEXT,
		allowNull: false
	},
	coverage: {
		type: Sequelize.FLOAT,
		allowNull: false
	}
}, {
	paranoid: true
})

const UserPasswordReset = sequelize.define('UserPasswordReset', {
	expire_date: {
		type: Sequelize.DATE,
		allowNull: true
	},
	hash: {
		type: Sequelize.STRING,
		allowNull: false
	},
	used: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
}, {
	paranoid: true
})

const Note = sequelize.define('Note', {
	text: {
		type: Sequelize.TEXT,
		allowNull: true
	}
}, {
	paranoid: true
})

Order.hasMany(Buyer)
Order.hasMany(Seller)
Order.hasMany(OrderForward)
User.hasMany(UserPasswordReset)
User.hasMany(Note)
Order.hasMany(Note)

sequelize.sync()

module.exports['User'] = User
module.exports['UserPasswordReset'] = UserPasswordReset
module.exports['Order'] = Order
module.exports['Buyer'] = Buyer
module.exports['Seller'] = Seller
module.exports['OrderForward'] = OrderForward
module.exports['Note'] = Note
module.exports['finder'] = sequelize
