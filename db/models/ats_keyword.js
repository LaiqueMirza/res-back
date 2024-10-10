module.exports = ats_keyword = (sequelize, DataTypes) => {
	return sequelize.define(
		"ats_keyword",
		{
			ats_keyword_id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			industry: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			keywords: {
				type: DataTypes.JSONB,
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
			tableName: "ats_keyword",
			underscored: true,
		}
	);
};