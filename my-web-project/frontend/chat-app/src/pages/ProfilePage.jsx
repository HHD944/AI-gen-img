import daisyui from "daisyui";
import { useAuthStore } from "../store/userAuthStore";
import { useState } from "react";
import { Camera } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdateProfile, updateProfile } = useAuthStore();

  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    email: authUser?.email || "",
    authUserPic: authUser?.profilePic || "",
  });
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

  return (
    <div className="min-h-screen flex items-start justify-center pt-16 bg-base-200 select-none">
      <form className="max-w-md w-full bg-base-100 p-6 rounded-2xl shadow space-y-6">
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={
                authUser.profilePic || "https://ui-avatars.com/api/?name=User"
              }
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-info"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-info p-2 rounded-full cursor-pointer shadow-lg"
              title="Change avatar"
            >
              <Camera className="text-white w-3 h-3" />
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
        </div>
        <div className="space-y-1.5">
          <div className="text-sm text-zinc-400 flex item-center gap-2">
            Full Name
          </div>
          <p className="px-4 py-2.5 bg-base-200 rounded-lg border ">
            {authUser?.fullName}
          </p>
        </div>
        <div className="space-y-1.5">
          <div className="text-sm text-zinc-400 flex item-center gap-2">
            Email
          </div>
          <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
            {authUser?.email}
          </p>
        </div>
        <div className="bg-base-200 rounded-xl p-4 mt-4">
          <h2 className="font-semibold text-lg mb-2">Account information</h2>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span className="text-base-content/70">Since:</span>
              <span className="font-medium  text-green-500">
                {authUser?.createdAt
                  ? new Date(authUser.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-base-content/70">Status:</span>
              <span
                className={`font-medium ${
                  authUser?.isActive ? "text-green-500" : "text-red-500"
                }`}
              >
                {authUser?.isActive ? "Active" : "Inactive"}
              </span>
            </li>
          </ul>
        </div>
      </form>
    </div>
  );
};
export default ProfilePage;
