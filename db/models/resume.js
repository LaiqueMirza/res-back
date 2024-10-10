module.exports = resume = (sequelize, DataTypes) => {
    return sequelize.define(
        "resume",
        {
            resume_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: "user",
                    key: "user_id",
                },
                onDelete: "CASCADE",
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            resume_data: {
                type: DataTypes.JSONB,
            },
            resume_template_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: "resume_template",
                    key: "resume_template_id",
                },
            },
            ats_score: {
                type: DataTypes.INTEGER,
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
            tableName: "resume",
            underscored: true,
        }
    )
}