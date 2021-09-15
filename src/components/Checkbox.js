import React from "react";

export const Checkbox = ({ taskDesc, checked, archiveWithTimer }) => {
  return (
    <div
      className="checkbox-holder"
      data-testid="checkbox-action"
      onClick={() => archiveWithTimer()}
      onKeyDown={(e) => {
        if (e.key === "Enter") archiveWithTimer();
      }}
      aria-label={`Mark ${taskDesc} as done?`}
      role="button"
      tabIndex={0}
    >
      <span className={checked ? "checkbox checkbox__checked" : "checkbox"} />
    </div>
  );
};
