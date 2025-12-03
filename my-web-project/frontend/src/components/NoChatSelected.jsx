import React from "react";

const NoChatSelected = () => {
  return (
    <div className="w-[760px] min-w-[760px] flex flex-1 flex-col items-center justify-center h-full text-center select-none">
      <div className="text-4xl mb-2">💬</div>
      <h2 className="text-xl font-semibold mb-1">No Chat Selected</h2>
      <p className="text-base-content/60">
        Please select a friend from the list to start chatting.
      </p>
    </div>
  );
};

export default NoChatSelected;
