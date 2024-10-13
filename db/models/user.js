module.exports = user = (sequelize, DataTypes) => {
	return sequelize.define(
		"user",
		{
			user_id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
			},
			email: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: false,
			},
			password: {
				type: DataTypes.STRING,
			},
			image: {
				type: DataTypes.STRING,
			},
			auth_through: {
				type: DataTypes.JSON,
			},
			is_anonymous: {
				type: DataTypes.BOOLEAN,
			},
			is_email_verified: {
				type: DataTypes.BOOLEAN,
			},
			created_at: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
			updated_at: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
			deleted_at: {
				type: DataTypes.DATE,
			},
		},
		{
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			paranoid: true,
			deletedAt: "deleted_at",
			freezeTableName: true,
			tableName: "user",
			underscored: true,
		}
	);
};
