import { useState, useEffect } from "react";
import { Palette, ChevronDown } from "lucide-react"; // Icon
import { THEMES } from "../constants/themes"; // Import danh sách theme

const ThemeSelector = () => {
  const [theme, setTheme] = useState("cupcake"); // Theme mặc định

  // Hàm đổi theme và lưu vào HTML
  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("chat-theme", newTheme); // (Tùy chọn) Lưu vào bộ nhớ để reload không mất
  };

  // Hàm Random theme
  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * THEMES.length);
    const randomTheme = THEMES[randomIndex];
    applyTheme(randomTheme);
  };

  // (Tùy chọn) Load theme từ localStorage khi vào web
  useEffect(() => {
    const savedTheme = localStorage.getItem("chat-theme") || "cupcake";
    applyTheme(savedTheme);
  }, []);

  return (
    <div className="join">
      {/* PHẦN 1: Nút Random (Bấm vào là đổi ngay) */}
      <button
        className="btn join-item btn-primary"
        onClick={handleRandom}
        title="Click để Random Theme"
      >
        <Palette className="w-5 h-5" />
        <span className="hidden md:block">Random Theme</span>{" "}
        {/* Ẩn chữ trên mobile cho gọn */}
      </button>

      {/* PHẦN 2: Dropdown (Chọn thủ công) */}
      <div className="dropdown dropdown-end join-item">
        <div
          tabIndex={0}
          role="button"
          className="btn join-item btn-primary"
          title="Chọn theme thủ công"
        >
          <ChevronDown className="w-5 h-5" />
        </div>

        {/* Danh sách xổ xuống */}
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-52 max-h-96 overflow-y-auto mt-4"
        >
          {THEMES.map((t) => (
            <li key={t}>
              <button
                className={`${t === theme ? "active" : ""}`} // Highlight theme đang chọn
                onClick={() => applyTheme(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}{" "}
                {/* Viết hoa chữ cái đầu */}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ThemeSelector;
