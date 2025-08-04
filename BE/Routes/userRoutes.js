const express = require("express")
const {signUp,login, getAllUsers,deleteUser} = require("../controllers/userController.js");
const router = express.Router();
router.post("/signup",signUp);
router.post("/login",login);
router.get("/users",getAllUsers);
// router.delete("/user/:id", deleteUser);
module.exports=router;