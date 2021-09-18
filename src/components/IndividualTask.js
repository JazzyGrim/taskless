import React, { useState, useRef } from "react";
import { Checkbox } from "./Checkbox";
import { db } from "../firebase.js";
import { doc, updateDoc } from "firebase/firestore";
import { collatedTasksExist } from "../helpers";
import moment from "moment";
import { FaRegCalendar } from "react-icons/fa";
import { useSelectedProjectValue } from "../context";
import { Draggable } from "react-beautiful-dnd";

const today = moment();
const tomorrow = moment().add(1, "days");
const week = moment().add(2, "days");

export const IndividualTask = ({ task, index, project, collectionId }) => {
  const [checked, setChecked] = useState(false);
  const taskDate = useRef(moment(task.date, "DD-MM-YYYY"));
  const { selectedProject, setSelectedProject } = useSelectedProjectValue();

  const showProjectName = collatedTasksExist(selectedProject);

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
    <Draggable draggableId={task.id} key={task.id} index={index}>
      {(provided, snapshot) => (
        <li
          key={`${task.id}`}
          className={
            collectionId
              ? `tasks__list-item indented ${
                  snapshot.isDragging ? "dragging" : ""
                }`
              : `tasks__list-item ${snapshot.isDragging ? "dragging" : ""}`
          }
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Checkbox
            taskDesc={task.task}
            checked={checked}
            archiveWithTimer={archiveWithTimer}
          />
          <div className="tasks__list-item-content">
            <span
              className={checked ? "strikethrough task-title" : "task-title"}
            >
              {/* {index + " | " + task.task} */}
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
      )}
    </Draggable>
  );
};
