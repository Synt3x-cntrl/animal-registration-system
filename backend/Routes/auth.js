const express = require("express");
const { register, login, getUsers, deleteUser, updateUser } = require("../controllers/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id", updateUser);

module.exports = router;
