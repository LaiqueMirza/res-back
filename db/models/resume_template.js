module.exports = resume_template = (sequelize, DataTypes) => {
    return sequelize.define(
			"resume_template",
			{
				resume_template_id: {
					type: DataTypes.INTEGER,
					autoIncrement: true,
					primaryKey: true,
					allowNull: false,
				},
				name: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				category: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				template_view_content: {
					type: DataTypes.TEXT,
					allowNull: false,
				},
				template_render_content: {
					type: DataTypes.TEXT,
					allowNull: false,
				},
				template_used_count: {
					type: DataTypes.TEXT,
					allowNull: false,
				},
				header_template: {
					type: DataTypes.TEXT,
					allowNull: false,
				},
				footer_template: {
					type: DataTypes.TEXT,
					allowNull: false,
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
				default_settings: {
					type: DataTypes.JSONB,
				},
			},
			{
				timestamps: true,
				createdAt: "created_at",
				updatedAt: "updated_at",
				paranoid: true,
				deletedAt: "deleted_at",
				freezeTableName: true,
				tableName: "resume_template",
				underscored: true,
			}
		);
}