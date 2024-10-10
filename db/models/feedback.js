module.exports = feedback = (sequelize, DataTypes) => {
	return sequelize.define(
		"feedback",
		{
			feedback_id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			resume_id: {
				type: DataTypes.INTEGER,
				references: {
					model: "resume",
					key: "resume_id",
				},
				onDelete: "CASCADE",
			},
			user_id: {
				type: DataTypes.INTEGER,
				references: {
					model: "user",
					key: "user_id",
				},
			},
			feedback: {
				type: DataTypes.TEXT,
			},
			meeting_link: {
				type: DataTypes.STRING,
			},
			rating: {
				type: DataTypes.INTEGER,
				validate: {
					min: 1,
					max: 5,
				},
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
			tableName: "feedback",
			underscored: true,
		}
	)
}
