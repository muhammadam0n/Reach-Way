const express = require("express");
const router = express.Router();
const { generateImageFromPrompt, generatePromptsFromIdea, generatePromptsFromImage } = require("../controllers/aiController");

router.post("/ai/generate-image", generateImageFromPrompt);
router.post("/ai/generate-prompts", generatePromptsFromIdea);
router.post("/ai/generate-prompts-from-image", generatePromptsFromImage);

module.exports = router; 