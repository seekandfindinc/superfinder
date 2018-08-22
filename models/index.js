const Sequelize = require("sequelize");
const config = require("../config");
const sequelize = new Sequelize(config.dbname, config.user, config.password, {
	host: config.host,
	dialect: "mysql",
	logging: false
});

const User = sequelize.define("User", {
	email:{
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
	}
},{
	paranoid: true
});

const Order = sequelize.define("Order", {
	property_address:{
		type: Sequelize.STRING,
		allowNull: false
	},
	reference_number:{
		type: Sequelize.STRING,
		allowNull: false
	},
	lender:{
		type: Sequelize.STRING,
		allowNull: false
	},
	corporation:{
		type: Sequelize.STRING,
		allowNull: false
	},
	purchase_price:{
		type: Sequelize.FLOAT,
		allowNull: false
	},
	loan_amount:{
		type: Sequelize.FLOAT,
		allowNull: false
	},
	closing_date:{
		type: Sequelize.DATE,
		allowNull: true
	},
	closed:{
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
},{
	paranoid: true
});

const Buyer = sequelize.define("Buyer", {
	name:{
		type: Sequelize.STRING,
		allowNull: false
	},
	address:{
		type: Sequelize.STRING,
		allowNull: false
	}
},{
	paranoid: true
});

const Seller = sequelize.define("Seller", {
	name:{
		type: Sequelize.STRING,
		allowNull: false
	},
	address:{
		type: Sequelize.STRING,
		allowNull: false
	}
},{
	paranoid: true
});

const Document = sequelize.define("Document", {
	filename:{
		type: Sequelize.STRING,
		allowNull: false
	},
	description:{
		type: Sequelize.STRING,
		allowNull: false
	},
	file: {
		type: Sequelize.BLOB("long"),
		allowNull: false
	}
},{
	paranoid: true
});

Order.hasMany(Buyer)
Order.hasMany(Seller)
Order.hasMany(Document)

sequelize.sync();

module.exports["User"] = User;
module.exports["Order"] = Order;
module.exports["Buyer"] = Buyer;
module.exports["Seller"] = Seller;
module.exports["Document"] = Document;