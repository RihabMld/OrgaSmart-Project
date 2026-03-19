const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const { Op } = require("sequelize");
const { sendVerificationEmail } = require("./authService");
const { GENERATE_TOKEN } = require('../utils/createToken');



const { User, UserProfile, RestaurantProfile } = require("../models/index");
const userAttributes = [
  'id', 'userName', 'email', 'role', 'status', 
  'isVerified', 'createdAt', 'isLoggedOut', 
  'isOnboardingCompleted',  "pendingEmail"
, 'updatedAt', "slug"
];
//des       create a user
//route      post /api/users/
//access     ADMIN
exports.createUser = asyncHandler(async (req, res) => {
  const { userName, email, password, role } = req.body;
  const user = await User.create({
    userName,
    email,
    password,
    role: role || "user",
  });
   const jwtToken = await GENERATE_TOKEN({ 
        email: user.email, 
        id: user.id, 
        userName: user.userName 
    });
await sendVerificationEmail(user); 
user.password = undefined;
res.status(201).json({ 
    status: 'SUCCESS', 
    message: "User created successfully. Verification email sent.",
    data: { user,jwtToken },
    errors: null 
  });
});

//des       GET ALL USERS
//route      GET /api/users/
//access     ADMIN

exports.getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;      
  const limit = parseInt(req.query.limit) || 10 ;      
  const offset = (page - 1) * limit;                
  const { count, rows: users } = await User.findAndCountAll({
attributes: userAttributes,
  include: [UserProfile, RestaurantProfile],
    limit: limit,
    offset: offset,
    distinct: true, 
  });
  const totalPages = Math.ceil(count / limit);
  const remainingPages = totalPages - page;
    User.password = undefined;

  res.status(200).json({
    status: "SUCCESS",
    message: "list of users",
    data:{
    results: users.length,       
    totalCount: count,            
    pagination: {
      currentPage: page,
      limit: limit,
      totalPages: totalPages,
      remainingPages: Math.max(0, remainingPages),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
          users,
    },
    } ,
    errors:null
  });
});


//des       get single user by id
//route      get /api/users/:id
//access     ADMIN
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    attributes: userAttributes,
    include: [UserProfile, RestaurantProfile],
  });
  if (!user)
    return next(new ApiError(`No user found for  this id :${req.params.id}`, 404));
    user.password = undefined;
res.status(200).json({ 
    status: "success", 
    message: "  find User  successfully",
    data:{user}, 
    errors:null 
  });});


//des       GET USER BY IDENTIFIER (email or username)//req.query (params)
//route      get /api/users/get-user-by-identifier
//access     ADMIN
exports.getUserByIdentifier = asyncHandler(async (req, res, next) => {
  const { identifier } = req.query;
  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: identifier }, { userName: identifier }],
    },
    attributes: userAttributes,
    include: [UserProfile, RestaurantProfile],  });
  if (!user) return next(new ApiError(`No user found for: ${identifier}`, 404));
      user.password = undefined;
res.status(200).json({ 
    status: "SUCCESS", 
    message: "find User successfully",
    data:{user}, 
    errors:null 
  })});


//des        UPDATE USER BY id 
//route      patch/api/users/:id
//access     ADMIN
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id,{
    attributes: userAttributes,
    include: [UserProfile, RestaurantProfile],
  });
  if (!user)
    return next(new ApiError(`No user found for this  id ${req.params.id}`, 404));
  const { userName, email } = req.body;
  if (userName) user.userName = userName;
  if (email) user.email = email;
  await user.save();
    user.password = undefined;
res.status(200).json({ 
   status: "SUCCESS", 
   message: "update User successful",
   data: {user}, 
   error:null,
  })
});


  //des     DELETE USER BY id 
//route      delete /api/users/:id
//access     ADMIN
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const deleted = await User.destroy({
    where: { id: req.params.id },
  });
if (!deleted)
    return next(new ApiError(`No user found for id ${req.params.id}`, 404));
res.status(200)
    .json({ status: "SUCCESS", message: "User deleted successfully",data:null,errors:null });
});



  //des    CHANGE PASSWORD USER BY id 
//route      put /api/users/:id
//access     ADMIN

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id,{
    attributes: userAttributes,
    include: [UserProfile, RestaurantProfile],
  
  });
  if (!user)
    return next(new ApiError(`No user found for id ${req.params.id}`, 404));
  const isCorrect = await bcrypt.compare(
    req.body.currentPassword,
    user.password,
  );
  if (!isCorrect) return next(new ApiError("Current password is wrong", 401));
  user.password = req.body.password;
  user.passwordChangedAt = Date.now();
  await user.save();
      user.password = undefined;
  res.status(200).json({ 
    status: "SUCCESS", 
    message: "change password successfully",
    data: {user}, 
    errors: null,
  })
});

