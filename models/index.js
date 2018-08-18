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
		allowNull: false
	},
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

Buyer.belongsTo(Order);
Seller.belongsTo(Order);

sequelize.sync();

module.exports["User"] = User;