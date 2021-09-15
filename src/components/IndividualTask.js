import React, { useState } from "react";
import { Checkbox } from "./Checkbox";
import { db } from "../firebase.js";
import { doc, updateDoc } from "firebase/firestore";

export const IndividualTask = ({ task }) => {
  const [checked, setChecked] = useState(false);

  const archiveWithTimer = () => {
    setChecked(true);
    setTimeout(() => {
      archiveTask();
    }, 5000);
  };
  const archiveTask = () => {
    const documentRef = doc(db, "tasks", task.id);

    (async () => {
      await updateDoc(documentRef, { archived: true });
    })();
  };

  return (
    <li key={`${task.id}`}>
      <Checkbox
        taskDesc={task.task}
        checked={checked}
        archiveWithTimer={archiveWithTimer}
      />
      <span className={checked ? "strikethrough" : null}>{task.task}</span>
    </li>
  );
};
