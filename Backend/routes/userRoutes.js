const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  loadUserProfile,
  addBussinessDetails,
  updateBussinessDetails,
  deleteBussinessDetails,
  generateNewToken,
  getAllUsers,
  getUsersMonthly,
  findChatbotUsingToken
} = require("../controllers/userController");

const { isAuthenticatedUser } = require("../middleware/Auth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/bussinessDetails").post(isAuthenticatedUser, addBussinessDetails);
router.route("/businessDetails")
  .post(isAuthenticatedUser, addBussinessDetails);

router.route("/businessDetails/:id")
  .put(isAuthenticatedUser, updateBussinessDetails)
  .delete(isAuthenticatedUser, deleteBussinessDetails);

router.route("/bussinessDetails/:id")
  .put(isAuthenticatedUser, updateBussinessDetails)
  .delete(isAuthenticatedUser, deleteBussinessDetails);

router.route("/token").post(isAuthenticatedUser, generateNewToken);
router.route("/token/verify").get(findChatbotUsingToken);

// user profile route
router
  .route("/me")
  .get(isAuthenticatedUser, loadUserProfile);

  router.route("/all").get(isAuthenticatedUser, getAllUsers);

  router.route("/monthly").get(isAuthenticatedUser, getUsersMonthly);


  



module.exports = router;
