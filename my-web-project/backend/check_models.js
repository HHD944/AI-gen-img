import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
  try {
    console.log("Đang kiểm tra danh sách model...");
    const response = await axios.get(URL);

    console.log("--- CÁC MODEL KHẢ DỤNG ---");
    response.data.models.forEach((model) => {
      // Chỉ hiện các model tạo được nội dung (generateContent)
      if (model.supportedGenerationMethods.includes("generateContent")) {
        console.log(`- Name: ${model.name.replace("models/", "")}`);
      }
    });
  } catch (error) {
    console.error("Lỗi:", error.response ? error.response.data : error.message);
  }
}

listModels();
