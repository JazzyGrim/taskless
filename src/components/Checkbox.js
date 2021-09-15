import React from "react";
import { db } from "../firebase.js";
import { doc, updateDoc } from "firebase/firestore";

export const Checkbox = ({ id, taskDesc }) => {
  const archiveTask = () => {
    const documentRef = doc(db, "tasks", id);

    (async () => {
      await updateDoc(documentRef, { archived: true });
    })();
  };
  return (
    <div
      className="checkbox-holder"
      data-testid="checkbox-action"
      onClick={() => archiveTask()}
      onKeyDown={(e) => {
        if (e.key === "Enter") archiveTask();
      }}
      aria-label={`Mark ${taskDesc} as done?`}
      role="button"
      tabIndex={0}
    >
      <span className="checkbox" />
    </div>
  );
};
