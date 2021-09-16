import React, { useState, useRef } from "react";
import { Checkbox } from "./Checkbox";
import { db } from "../firebase.js";
import { doc, updateDoc } from "firebase/firestore";
import moment from "moment";
import { FaRegCalendar } from "react-icons/fa";
import { useSelectedProjectValue } from "../context";

const today = moment();
const tomorrow = moment().add(1, "days");
const week = moment().add(2, "days");

export const IndividualTask = ({
  task,
  project,
  showProjectName,
  setSelectedProject,
}) => {
  const [checked, setChecked] = useState(false);
  const taskDate = useRef(moment(task.date, "DD-MM-YYYY"));

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
    <li key={`${task.id}`} className="tasks__list-item">
      <Checkbox
        taskDesc={task.task}
        checked={checked}
        archiveWithTimer={archiveWithTimer}
      />
      <div className="tasks__list-item-content">
        <span className={checked ? "strikethrough task-title" : "task-title"}>
          {task.task}
        </span>
        {taskDate.current.isSame(today, "d") && (
          <span className="task-info task-info--today">
            <FaRegCalendar />
            Today
          </span>
        )}
        {taskDate.current.isSame(tomorrow, "d") && (
          <span className="task-info task-info--tomorrow">
            <FaRegCalendar />
            Tomorrow
          </span>
        )}
        {taskDate.current.isSameOrAfter(week, "d") && (
          <span className="task-info task-info--week">
            <FaRegCalendar />
            This week
          </span>
        )}
        {showProjectName && project && project.name && (
          <span
            onClick={() => setSelectedProject(project.projectId)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSelectedProject(project.projectId);
            }}
            tabIndex={0}
            role="button"
            aria-label={`Open the ${project.name} project.`}
            className="task-info task-info--project"
          >
            {project.name}
          </span>
        )}
      </div>
    </li>
  );
};
