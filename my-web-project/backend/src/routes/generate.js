import { PredictionServiceClient, helpers } from "@google-cloud/aiplatform";

// Khởi tạo Client cho Imagen (Thay vì dùng Python Worker)
const clientOptions = {
  apiEndpoint: "us-central1-aiplatform.googleapis.com", // Region hỗ trợ Imagen 3
};
const predictionServiceClient = new PredictionServiceClient(clientOptions);

const generateImageWithImagen = async (prompt, imageBuffer) => {
  const project = process.env.GOOGLE_PROJECT_ID; // Cần ID Project Google Cloud của bạn
  const location = "us-central1";
  const model = "imagen-3.0-capability-001"; // Phiên bản Imagen 3 mới nhất

  const endpoint = `projects/${project}/locations/${location}/publishers/google/models/${model}`;

  // Cấu hình tham số cho Image-to-Image (Image Conditioning)
  const instance = {
    prompt: prompt,
    image: {
      bytesBase64Encoded: imageBuffer.toString("base64"),
    },
  };
  const instanceValue = helpers.toValue(instance);
  const instances = [instanceValue];

  const parameter = {
    sampleCount: 1,
    aspectRatio: "1:1",
    storageUri: "gs://your-bucket-name/temp", // Optional: để lưu trữ kết quả
  };
  const parameters = helpers.toValue(parameter);

  const request = { endpoint, instances, parameters };

  // Gọi API của Google Cloud
  const [response] = await predictionServiceClient.predict(request);

  // Lấy dữ liệu ảnh trả về
  const prediction = response.predictions[0].structValue.fields;
  const base64Image = prediction.bytesBase64Encoded.stringValue;

  return `data:image/png;base64,${base64Image}`;
};
