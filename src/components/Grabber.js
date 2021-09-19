import React from "react";
import { IconContext } from "react-icons";
import { VscGripper } from "react-icons/vsc";

export const Grabber = ({ isDragging, dragHandleProps }) => {
  return (
    <IconContext.Provider
      value={{
        size: 24,
        color: "grey",
        className: isDragging ? "handle visible" : "handle",
      }}
    >
      <div {...dragHandleProps}>
        <VscGripper />
      </div>
    </IconContext.Provider>
  );
};
