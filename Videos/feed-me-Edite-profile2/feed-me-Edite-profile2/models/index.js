const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// استيراد الموديلات
const User = require("./userModel");
const UserProfile = require("./userProfileModel");
const RestaurantProfile = require("./restaurantProfileModel");

// التحقق من أن الموديلات تم تحميلها بنجاح (للتصحيح)
if (!User || !UserProfile || !RestaurantProfile) {
    console.error("تعذر تحميل أحد الموديلات، تأكد من مسارات الملفات!");
}

// إعداد العلاقات (Associations)
User.hasOne(UserProfile, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
UserProfile.belongsTo(User, {
  foreignKey: "userId",
});

User.hasOne(RestaurantProfile, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
RestaurantProfile.belongsTo(User, {
  foreignKey: "userId",
});

module.exports = {
  sequelize,
  User,
  UserProfile,
  RestaurantProfile,
};