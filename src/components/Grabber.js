import React from "react";
import { IconContext } from "react-icons";
import { VscGripper } from "react-icons/vsc";

export const Grabber = ({ isDragging, dragHandleProps, disabled }) => {
  const getClassName = () => {
    if (disabled) return "handle disabled";
    return isDragging ? "handle visible" : "handle";
  };

  return (
    <IconContext.Provider
      value={{
        size: 24,
        color: "grey",
        className: getClassName(),
      }}
    >
      <div {...dragHandleProps}>
        <VscGripper />
      </div>
    </IconContext.Provider>
  );
};
