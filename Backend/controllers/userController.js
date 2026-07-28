const User = require("../models/userModel");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const { generateToken } = require("../utils/chatbotToken");
const CustomError = require("../utils/errorHandler");
require("dotenv").config();
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const {
    name,
    email,
    password,

    bussinessName,
    bussinessDescription,
    bussinessCategory,
  } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  const chatbot_token = await generateToken();
  const user = await User.create({
    name,
    email,
    password,
    bussinessName,
    bussinessCategory,
    bussinessDescription,
    chatbot_token,
  });
  sendToken(user, 200, res, "User registered successfully");
});
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter email & password",
    });
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid Email or Password",
    });
  }
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return res.status(401).json({
      success: false,
      message: "Invalid Email or Password",
    });
  }
  sendToken(user, 200, res, "User logged in successfully");
});
exports.logoutUser = catchAsyncError(async (req, res, next) => {
  res.cookie("token", "", {
    expires: new Date(0),
    path: "/",
    secure: true,
    sameSite: "None",
  });
  res.setHeader("Cache-Control", "no-store");

  console.log("Cookie cleared.");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});
exports.loadUserProfile = catchAsyncError(async (req, res, next) => {
  const userId = req.params.userId || req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  res.status(200).json({
    success: true,
    user,
  });
});
exports.addBussinessDetails = catchAsyncError(async (req, res, next) => {
  const { question, answer, details } = req.body;
  const user = req.user;

  let itemsToAdd = [];

  if (Array.isArray(details) && details.length > 0) {
    itemsToAdd = details.filter((item) => item.question && item.question.trim() && item.answer && item.answer.trim());
  } else if (question && answer) {
    itemsToAdd = [{ question, answer }];
  }

  if (itemsToAdd.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please enter question and answer for at least one item",
    });
  }

  if (user.bussinessDetails.length + itemsToAdd.length > 50) {
    return res.status(400).json({
      success: false,
      message: "Details limit reached. You cannot add more details (max 50)",
    });
  }

  itemsToAdd.forEach((item) => {
    user.bussinessDetails.push({
      question: item.question.trim(),
      answer: item.answer.trim(),
    });
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: "Business details added successfully",
    bussinessDetails: user.bussinessDetails,
  });
});
exports.updateBussinessDetails = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const { question, answer } = req.body;

  const index = user.bussinessDetails.findIndex(
    (bussinessDetail) => bussinessDetail._id.toString() === id.toString()
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Business detail not found",
    });
  }

  if (question !== undefined) user.bussinessDetails[index].question = question.trim();
  if (answer !== undefined) user.bussinessDetails[index].answer = answer.trim();

  await user.save();

  res.status(200).json({
    success: true,
    message: "Business detail updated successfully",
    bussinessDetails: user.bussinessDetails,
  });
});
exports.deleteBussinessDetails = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;

  const bussinessDetails = user.bussinessDetails;

  const index = bussinessDetails.findIndex(
    (bussinessDetail) => bussinessDetail._id.toString() === id.toString()
  );

  if (index > -1) {
    bussinessDetails.splice(index, 1);
  } else {
    return res.status(404).json({
      success: false,
      message: "Business detail not found",
    });
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Business detail deleted successfully",
    bussinessDetails: user.bussinessDetails,
  });
});

exports.findChatbotUsingToken = catchAsyncError(async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({ chatbot_token: token });

  if (!user) {
    throw new CustomError("Invalid Token", 400);
  }

  const {
    bussinessName,
    bussinessCategory,
    bussinessDescription,
    bussinessDetails,
    _id
  } = user;

  res.status(200).json({
    data: {
      bussinessName,
      bussinessCategory,
      bussinessDescription,
      bussinessDetails,
      id: _id
    },
    message: "Chatbot Details"
  })
});

exports.generateNewToken = catchAsyncError(async (req, res, next) => {
  const user = req.user;

  const token = await generateToken();

  user.chatbot_token = token;

  await user.save();

  res.status(200).json({
    success: true,
    message: "New token generated successfully",
  });
});


