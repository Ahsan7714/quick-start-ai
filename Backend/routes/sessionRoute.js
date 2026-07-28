const express = require("express");
const router = express.Router();
const {
    createSession,
    addMessageToSession
} = require("../controllers/sessionController");

// POST -> Add messages to a session
// URL -> /api/v1/session/addMessages
// Description -> Add messages to a session by chatbot widget

router.route("/addMessages").post(addMessageToSession);

// POST -> create a session
// URL -> /api/v1/session/create
// Description -> Create a session by chatbot widget
// Request Body -> username, email, chatbotId

router.route("/create").post(createSession);

module.exports = router;
