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
	}
},{
	paranoid: true
});

sequelize.sync();

module.exports["User"] = User;