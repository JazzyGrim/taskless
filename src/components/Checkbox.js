import React from "react";
import { db } from "../firebase.js";
import { doc, updateDoc } from "firebase/firestore";

export const Checkbox = ({ id }) => {
  const archiveTask = () => {
    const documentRef = doc(db, "tasks", id);

    (async () => {
      await updateDoc(documentRef, { archived: true });
    })();
  };
  return (
    <div
      className="checkbox--holder"
      data-testid="checkbox-action"
      onClick={() => archiveTask()}
    >
      <span className="checkbox" />
    </div>
  );
};
