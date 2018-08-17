const Sequelize = require("sequelize");
const sequelize = new Sequelize("finder", "root", "scsa1985", {
	host: "localhost",
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

sequelize.sync();

module.exports["User"] = User;