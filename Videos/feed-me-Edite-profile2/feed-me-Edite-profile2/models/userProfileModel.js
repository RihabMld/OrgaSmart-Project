const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const UserProfile = sequelize.define("UserProfile", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
      defaultValue: null, // مصفوفة فارغة افتراضياً

  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
      defaultValue: null, // مصفوفة فارغة افتراضياً

  },
   phoneNumber: {
    type: DataTypes.STRING(20), 
    allowNull: true,
      defaultValue: null, // مصفوفة فارغة افتراضياً

  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
      defaultValue: null, // مصفوفة فارغة افتراضياً

  },
  
  profilePicture: {
    type: DataTypes.STRING(255),
    defaultValue: null,
  },
usageGoal: {
  type: DataTypes.JSON, 
  allowNull: true,
  defaultValue: null, // مصفوفة فارغة افتراضياً
},
kitchenCategory: {
  type: DataTypes.JSON, 
  allowNull: true,
  defaultValue: null,
},
  
  userId: {
    type: DataTypes.UUID, 
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'users_profiles',
  timestamps: true,
});

module.exports = UserProfile;