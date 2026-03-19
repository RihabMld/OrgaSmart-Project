const express = require("express");

const {
  createUser,
  getAllUsers,
  getUser,
  getUserByIdentifier,
  updateUser,
  deleteUser,
  changeUserPassword,
} = require("../services/userService");

const {
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  getUserByIdentifierValidator,
  changeUserPasswordValidator,
  getUserValidator
} = require("../utils/validators/userValidator");

const router = express.Router();

router.post("/", createUserValidator, createUser);

router.get("/", getAllUsers);

router.get("/get-user-by-identifier", ...getUserByIdentifierValidator, getUserByIdentifier);

router.get("/:id",getUserValidator, getUser);

router.patch("/:id", ...updateUserValidator, updateUser);

router.patch( "/:id",  changeUserPasswordValidator,changeUserPassword,);

router.delete("/:id",deleteUserValidator,deleteUser);

module.exports = router;
