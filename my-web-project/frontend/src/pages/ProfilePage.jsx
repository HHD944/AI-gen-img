import { useAuthStore } from "../store/userAuthStore";
import { useState } from "react";
import { Camera, User, Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdateProfile, updateProfile, onlineUsers } =
    useAuthStore();

  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
  });

  // Kiểm tra trạng thái Online dựa trên mảng onlineUsers từ socket
  const isOnline = onlineUsers.includes(authUser?._id);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;
        await updateProfile({ profilePic: base64Image });
      };
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim())
      return toast.error("Full name cannot be empty");

    // Gọi hàm updateProfile từ store để cập nhật tên
    await updateProfile({ fullName: formData.fullName });
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-16 bg-base-200 select-none">
      <div className="max-w-md w-full bg-base-100 p-6 rounded-2xl shadow space-y-6">
        {/* AVATAR SECTION */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={
                authUser?.profilePic ||
                "https://ui-avatars.com/api/?name=" + authUser?.fullName
              }
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-base-200"
            />
            <label
              htmlFor="avatar-upload"
              className={`absolute bottom-0 right-0 bg-primary p-2 rounded-full cursor-pointer shadow-lg hover:scale-105 transition-all ${
                isUpdateProfile ? "animate-pulse pointer-events-none" : ""
              }`}
              title="Change avatar"
            >
              <Camera className="text-white w-4 h-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isUpdateProfile}
              />
            </label>
          </div>
          <p className="text-sm text-base-content/60 mt-2">
            {isUpdateProfile
              ? "Uploading..."
              : "Click the camera icon to update your photo"}
          </p>
        </div>

        {/* FORM UPDATE NAME */}
        <form onSubmit={handleUpdateName} className="space-y-4">
          <div className="space-y-1.5">
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="input input-bordered flex-1 h-11"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Your full name"
                disabled={isUpdateProfile}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm h-11 px-6"
                disabled={
                  isUpdateProfile || formData.fullName === authUser?.fullName
                }
              >
                {isUpdateProfile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </div>
            <p className="px-4 py-2.5 bg-base-200 rounded-lg border text-base-content/70">
              {authUser?.email}
            </p>
          </div>
        </form>

        {/* ACCOUNT INFORMATION */}
        <div className="bg-base-200 rounded-xl p-4 mt-4">
          <h2 className="font-semibold text-lg mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-base-300">
              <span className="text-base-content/70">Member Since</span>
              <span className="font-medium text-primary">
                {authUser?.createdAt
                  ? new Date(authUser.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-base-content/70">Account Status</span>
              <span
                className={`flex items-center gap-2 font-medium ${
                  isOnline ? "text-green-500" : "text-zinc-500"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-green-500 animate-pulse" : "bg-zinc-500"
                  }`}
                ></span>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
