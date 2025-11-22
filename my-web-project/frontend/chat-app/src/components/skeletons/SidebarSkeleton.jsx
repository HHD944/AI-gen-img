import React from "react";

const SidebarSkeleton = () => {
  return (
    <aside className="w-64 bg-base-100 border-r h-full p-4 animate-pulse">
      <div className="h-6 w-1/2 bg-base-300 rounded mb-6"></div>
      <ul className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <li key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-base-300"></div>
            <div className="h-4 w-24 bg-base-300 rounded"></div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default SidebarSkeleton;
