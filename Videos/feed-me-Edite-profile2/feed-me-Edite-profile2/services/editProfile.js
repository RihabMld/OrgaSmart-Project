const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const crypto = require("crypto");
const { Op } = require("sequelize");

const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");
const { GENERATE_TOKEN } = require("../utils/createToken");

const { User, UserProfile, RestaurantProfile } = require("../models");
const userAttributes = [
  "id",
  "userName",
  "email",
  "role",
  "status",
  "isVerified",
  "createdAt",
  "isLoggedOut",
  "isOnboardingCompleted",
    "pendingEmail",

  "updatedAt",
  "slug",
];
// check if the user has the right role before doing anything

exports.allwodTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.authenticatedUser)
      return next(new ApiError("You are not logged in", 401));
    if (!roles.includes(req.authenticatedUser.role))
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    next();
  });

//edit user profile
exports.editUserProfile = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const user = await User.findByPk(userId);
  if (user.isLoggedOut) {
    return next(new ApiError("you logged out ,please sign in again", 403));
  }
  let profile = await UserProfile.findOne({ where: { userId } });
  if (!profile) profile = await UserProfile.create({ userId });
  const { userBasicInformation, userUsagePreferences } = req.body.profile || {};
  if (userBasicInformation) {
    const basicFields = [
      "fullName",
      "city",
      "phoneNumber",
      "bio",
      "profilePicture",
    ];
    basicFields.forEach((field) => {
      if (userBasicInformation[field] !== undefined) {
        profile[field] = userBasicInformation[field];
      }
    });
  }
  if (userUsagePreferences) {
    const prefFields = ["usageGoal", "kitchenCategory"];
    prefFields.forEach((field) => {
      if (userUsagePreferences[field] !== undefined) {
        profile[field] = userUsagePreferences[field];
      }
    });
  }

  await profile.save();
  await user.save();

  const newUser = await User.findByPk(userId, {
    attributes: userAttributes,
    include: [UserProfile, RestaurantProfile],
  });
  res.status(200).json({
    status: "SUCCESS",
    message: "User profile updated successfully",
    data: {
      user: newUser,
    },
    errors: null,
  });
});

exports.editRestaurantProfile = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const user = await User.findByPk(userId);
  if (user.isLoggedOut) {
    return next(new ApiError("you logged out ,please sign in again", 403));
  }

  let profile = await RestaurantProfile.findOne({ where: { userId } });

  if (!profile) {
    profile = await RestaurantProfile.create({
      userId,
      services: {
        dineIn: "NO",
        takeAway: "NO",
        delivery: "NO",
        reservation: "NO",
        parkAvailability: "NO",
      },
      workingDays: [],
      kitchenCategory: [],
    });
  }
  const {
    restaurantBasicInformation,
    restaurantLocationAndContact,
    restaurantDetails,
    restaurantServices,
  } = req.body.profile || {};

  if (restaurantBasicInformation) {
    const basicFields = [
      "restaurantName",
      "businessEmail",
      "phoneNumber",
      "restaurantLogoUrl",
      "bio"
    ];
    basicFields.forEach((field) => {
      if (restaurantBasicInformation[field] !== undefined)
        profile[field] = restaurantBasicInformation[field];
    });
  }

  if (restaurantLocationAndContact) {
    const locationFields = ["city", "street", "postalCode", "googleMapsLink"];
    locationFields.forEach((field) => {
      if (restaurantLocationAndContact[field] !== undefined)
        profile[field] = restaurantLocationAndContact[field];
    });
  }

  if (restaurantDetails) {
    if (restaurantDetails.kitchenCategory !== undefined)
      profile.kitchenCategory = restaurantDetails.kitchenCategory;
    if (restaurantDetails.workingDays !== undefined)
      profile.workingDays = restaurantDetails.workingDays;}
    if (restaurantServices !== undefined) {
      profile.services = restaurantServices;

    }


  await profile.save();
  await user.save();
  
  const newUser = await User.findByPk(userId, {
    attributes: userAttributes,
    include: [UserProfile, RestaurantProfile],
  });

  res.status(200).json({
    status: "SUCCESS",
    message: "Restaurant profile updated successfully",
    data: { user: newUser },
    errors: null,
  });
});
/////
/////
/////
exports.editAccount = asyncHandler(async (req, res, next) => {
  const { userName, currentPassword, newPassword, email } = req.body;

  const user = await User.findByPk(req.authenticatedUser.id);
  if (user.isLoggedOut) {
    return next(new ApiError("you logged out ,please sign in again", 403));
  }

  //edit user name
  if (userName !== undefined) {
    user.userName = userName;
  }

  //edit user password
  if (currentPassword || newPassword) {
    const correct = await bcrypt.compare(currentPassword, user.password);
    if (!correct) {
      return next(new ApiError("Current password is incorrect", 401));
    }
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
  }
  //edit email
  if (email) {
    const existing = await User.findOne({ where: { email } });
    if (existing) return next(new ApiError("Email already in use", 400));

    if (user.email === email)
      return next(new ApiError("This is already your current email", 400));

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    user.pendingEmail = email;
    user.verificationTokenHash = hashedToken;
    user.verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);

    const verificationURL = `${process.env.NGROK_URL}/api/profile/verify-new-email/${verificationToken}`;

    const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; color: #333333;">
        <div style="background-color: #1a1a1a; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">DZ Community Food</h1>
        </div>
        <div style="padding: 40px 30px;">
            <h2 style="color: #2d3436; margin-top: 0;">Confirm your new email, ${user.userName}!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #636e72;">
                You requested to change your email address to <strong>${email}</strong>. Click below to confirm.
            </p>
            <div style="background-color: #fff5f5; border-left: 4px solid #ff7675; padding: 15px; margin: 25px 0;">
                <p style="margin: 0; color: #d63031; font-weight: bold; font-size: 14px;">
                    ⚠️ Important: This link will expire in 10 minutes.
                </p>
            </div>
            <div style="text-align: center; margin: 35px 0;">
                <a href="${verificationURL}" style="background-color: #2ecc71; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">
                   Confirm New Email
                </a>
            </div>
            <p style="font-size: 12px; color: #0984e3; word-break: break-all; background: #f9f9f9; padding: 10px; border-radius: 5px;">
                ${verificationURL}
            </p>
        </div>
        <div style="background-color: #f1f2f6; padding: 20px; text-align: center; font-size: 12px; color: #95a5a6;">
            <p style="margin: 0;">&copy; 2026 DZ Community Food. All rights reserved.</p>
        </div>
    </div>
  `;

    await sendEmail({
      email: email,
      subject: "Confirm your new email address (10 min expiration)",
      html: htmlContent,
    });
  }

  await user.save();

  const jwtToken = await GENERATE_TOKEN({
    email: user.email,
    id: user.id,
    userName: user.userName,
  });

  user.password = undefined;
  const newUser = await User.findByPk(req.authenticatedUser.id, {
    attributes: userAttributes,
    include: [UserProfile, RestaurantProfile],
  });

  res.status(200).json({
    status: "SUCCESS",
    message: "Account  changed successfully",
    data: {
      user: newUser,
      jwtToken,
    },
    errors: null,
  });
});

////////
exports.verifyNewEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    where: {
      verificationTokenHash: hashedToken,
      verificationTokenExpires: { [Op.gt]: new Date() },
    },
  });

  if (!user)
    return next(new ApiError("Invalid or expired verification token", 400));

  user.email = user.pendingEmail;

  user.pendingEmail = null;
  user.verificationTokenHash = null;
  user.verificationTokenExpires = null;

  await user.save();

  const jwtToken = await GENERATE_TOKEN({
    email: user.email,
    id: user.id,
    userName: user.userName,
  });

  user.password = undefined;
  const newUser = await User.findByPk(req.authenticatedUser.id, {
    attributes: userAttributes,
    include: [UserProfile, RestaurantProfile],
  });

  res.status(200).json({
    status: "SUCCESS",
    message: "Email updated successfully!",
    data: { 
      user: newUser, 
      jwtToken 
    },
  });
});
