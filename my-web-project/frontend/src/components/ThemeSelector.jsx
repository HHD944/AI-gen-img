import { useState, useEffect } from "react";
import { Palette, ChevronDown } from "lucide-react";
import { THEMES } from "../constants/themes";

const ThemeSelector = () => {
  const [theme, setTheme] = useState("light");

  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("chat-theme", newTheme);
  };

  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * THEMES.length);
    const randomTheme = THEMES[randomIndex];
    applyTheme(randomTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("chat-theme") || "light";
    applyTheme(savedTheme);
  }, []);

  return (
    <div className="join">
      <button
        className="btn join-item btn-primary"
        onClick={handleRandom}
        title="Click để Random Theme"
      >
        <Palette className="w-5 h-5" />
        <span className="hidden md:block">Random Theme</span>{" "}
      </button>

      <div className="dropdown dropdown-end join-item">
        <div
          tabIndex={0}
          role="button"
          className="btn join-item btn-primary"
          title="Chọn theme thủ công"
        >
          <ChevronDown className="w-5 h-5" />
        </div>

        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-52 max-h-96 overflow-y-auto mt-4"
        >
          {THEMES.map((t) => (
            <li key={t}>
              <button
                className={`${t === theme ? "active" : ""}`}
                onClick={() => applyTheme(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}{" "}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ThemeSelector;
