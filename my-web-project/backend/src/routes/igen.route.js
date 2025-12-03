// backend/routes/igen.route.js
import express from "express";
import axios from "axios";
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// --- GEMINI: Enhance Prompt ---
const enhancePromptWithGemini = async (userInput) => {
  const geminiModels = ["gemini-pro", "gemini-1.5-pro", "gemini-1.5-flash"];

  for (const modelName of geminiModels) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Convert this to a detailed English image generation prompt (max 80 words):
"${userInput}"

Focus on: visual style, lighting, quality. Return ONLY the enhanced prompt.`,
                },
              ],
            },
          ],
        },
        { timeout: 10000 }
      );

      const text = response.data.candidates[0].content.parts[0].text.trim();
      console.log(`✓ Gemini (${modelName}) worked`);
      return text;
    } catch (error) {
      console.log(
        `✗ Gemini ${modelName} failed:`,
        error.response?.data?.error?.message || error.message
      );
      continue;
    }
  }

  // Fallback
  console.log("Using fallback prompt");
  return `${userInput}, highly detailed, 8k, professional, cinematic lighting, masterpiece`;
};

// --- REPLICATE: Generate Image ---
const generateImageWithReplicate = async (prompt) => {
  try {
    console.log("Creating prediction on Replicate...");

    // Bước 1: Tạo prediction
    const response = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version:
          "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", // SDXL Lightning
        input: {
          prompt: prompt,
          num_inference_steps: 4,
          guidance_scale: 0,
          width: 1024,
          height: 1024,
        },
      },
      {
        headers: {
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const predictionId = response.data.id;
    console.log(`Prediction created: ${predictionId}`);

    // Bước 2: Poll để đợi kết quả
    let prediction = response.data;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed" &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusResponse = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Token ${REPLICATE_API_TOKEN}`,
          },
        }
      );

      prediction = statusResponse.data;
      attempts++;

      if (attempts % 5 === 0) {
        console.log(`Status: ${prediction.status} (${attempts}s)`);
      }
    }

    if (prediction.status === "succeeded") {
      console.log("✓ Image generated successfully");
      return prediction.output[0]; // URL của ảnh
    } else {
      throw new Error(`Generation failed: ${prediction.status}`);
    }
  } catch (error) {
    console.error("Replicate Error:", error.response?.data || error.message);
    throw new Error("Failed to generate image with Replicate");
  }
};

// --- FALLBACK: Picsum (Ảnh placeholder) ---
const generatePlaceholderImage = () => {
  const width = 1024;
  const height = 1024;
  const randomId = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/${randomId}/${width}/${height}`;
};

// --- MAIN ROUTE ---
router.post("/generate-image", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    console.log("\n=== IMAGE GENERATION START ===");
    console.log("Original prompt:", prompt);

    // Step 1: Enhance with Gemini
    const refinedPrompt = await enhancePromptWithGemini(prompt);
    console.log("Enhanced prompt:", refinedPrompt);

    // Step 2: Generate image
    let imageUrl;

    if (
      REPLICATE_API_TOKEN &&
      REPLICATE_API_TOKEN !== "your_replicate_token_here"
    ) {
      try {
        imageUrl = await generateImageWithReplicate(refinedPrompt);
      } catch (error) {
        console.log("Replicate failed, using placeholder");
        imageUrl = generatePlaceholderImage();
      }
    } else {
      console.log("No Replicate token, using placeholder");
      imageUrl = generatePlaceholderImage();
    }

    console.log("✓ Complete\n");

    res.json({
      success: true,
      originalPrompt: prompt,
      refinedPrompt: refinedPrompt,
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// --- TEST ROUTE ---
router.get("/test-keys", async (req, res) => {
  const results = {
    gemini: { status: "Not configured", working: false },
    replicate: { status: "Not configured", working: false },
  };

  // Test Gemini
  if (GEMINI_API_KEY) {
    try {
      await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: "test" }] }] },
        { timeout: 5000 }
      );
      results.gemini = { status: "✓ Working", working: true };
    } catch (error) {
      results.gemini = {
        status: "✗ Failed",
        working: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  if (
    REPLICATE_API_TOKEN &&
    REPLICATE_API_TOKEN !== "your_replicate_token_here"
  ) {
    try {
      await axios.get("https://api.replicate.com/v1/models", {
        headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
        timeout: 5000,
      });
      results.replicate = { status: "✓ Working", working: true };
    } catch (error) {
      results.replicate = {
        status: "✗ Failed",
        working: false,
        error: error.message,
      };
    }
  }

  res.json(results);
});

export default router;
