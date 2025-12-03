import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai"; // SỬA: Dùng thư viện đúng
import axios from "axios";
import dotenv from "dotenv";
import { Client } from "@gradio/client";
dotenv.config();

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const HF_TOKEN = process.env.HF_TOKEN;

const HF_MODEL_URL =
  "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-medium";
if (!GEMINI_API_KEY) {
  console.error("LỖI: Chưa cấu hình GEMINI_API_KEY trong file .env");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const enhancePromptWithGemini = async (userInput) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

    const prompt = `
      You are an expert prompt engineer for AI Art Generation. 
      Your task is to convert the user's simple description into a highly detailed, artistic English prompt for Stable Diffusion.
      
      Rules:
      1. Keep it under 50 words.
      2. Focus on visual details: lighting, style, camera angle, resolution (8k, masterpiece).
      3. Return ONLY the English prompt text. Do not add explanations.
      
      User Input: "${userInput}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text(); // SỬA: Lấy text đúng cách từ response object
    return text.trim();
  } catch (error) {
    console.error("Gemini Error:", error.message);
    // Fallback nếu Gemini lỗi
    return `${userInput}, high quality, 8k, detailed, artistic`;
  }
};

// --- 2. HÀM GỌI STABLE DIFFUSION ĐỂ TẠO ẢNH ---
// const generateImageFromHF = async (prompt) => {
//   try {
//     const response = await axios.post(
//       HF_MODEL_URL,
//       { inputs: prompt },
//       {
//         headers: {
//           Authorization: `Bearer ${HF_TOKEN}`,
//           "Content-Type": "application/json",
//         },
//         responseType: "arraybuffer",
//       }
//     );

//     const base64Image = Buffer.from(response.data, "binary").toString("base64");
//     return `data:image/jpeg;base64,${base64Image}`;
//   } catch (error) {
//     console.error("HuggingFace Error Status:", error.response?.status);

//     // Xử lý lỗi model đang khởi động
//     if (error.response?.status === 503) {
//       throw new Error(
//         "AI Model is warming up (Cold Boot). Please try again in 30 seconds."
//       );
//     }

//     // Xử lý lỗi Token
//     if (error.response?.status === 401) {
//       throw new Error("Invalid Hugging Face Token (Check .env).");
//     }

//     // Xử lý lỗi Model bị xóa hoặc tắt API (Lỗi 410 bạn đang gặp)
//     if (error.response?.status === 404 || error.response?.status === 410) {
//       throw new Error(
//         "Model AI này không còn khả dụng hoặc đã bị tắt API. Vui lòng đổi URL model khác."
//       );
//     }

//     throw new Error("Failed to generate image from AI provider.");
//   }
// };

const generateImageFromHF = async (prompt) => {
  try {
    // 1. Kết nối tới Model qua Gradio Client
    // Thêm hf_token để tránh bị giới hạn rate limit hoặc truy cập private repos
    const client = await Client.connect(
      "stabilityai/stable-diffusion-3.5-medium",
      {
        hf_token: HF_TOKEN,
      }
    );

    const result = await client.predict("/infer", {
      prompt: prompt,
      negative_prompt: "low quality, ugly, distorted",
      seed: 0,
      randomize_seed: true,
      width: 1024,
      height: 1024,
      guidance_scale: 7.5, // Mức độ bám sát prompt (thường là 7 -> 10)
      num_inference_steps: 25, // Tăng lên khoảng 20-30 để ảnh đẹp hơn (1 là quá ít)
    });

    // 3. Xử lý kết quả trả về
    // Gradio trả về mảng data, phần tử đầu tiên thường là object chứa url ảnh
    // Cấu trúc thường là: result.data[0] = { url: "https://..." } hoặc trực tiếp là url string
    const imageResult = result.data[0];
    const imageUrl = imageResult.url || imageResult;

    if (!imageUrl) {
      throw new Error("Không nhận được đường dẫn ảnh từ Gradio.");
    }

    // 4. Tải ảnh từ URL về để chuyển sang Base64 (Để khớp với return cũ của bạn)
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error("Gradio/HF Error:", error);

    if (error.message?.includes("Queue")) {
      throw new Error("Server đang bận (Queue full), vui lòng thử lại sau.");
    }

    throw new Error("Failed to generate image via Gradio Client.");
  }
};
router.post("/generate-image", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    console.log("--- START GENERATION ---");
    console.log("1. Original Input:", prompt);

    const refinedPrompt = await enhancePromptWithGemini(prompt);
    console.log("2. Refined Prompt:", refinedPrompt);

    const imageUrl = await generateImageFromHF(refinedPrompt);
    console.log("3. Image Generated Successfully!");

    res.json({
      originalPrompt: prompt,
      refinedPrompt: refinedPrompt,
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Generation Failed:", error.message);
    res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
});

export default router;
