import React, { useState } from "react";
import { getTitle } from "../helpers";
import { IndividualTask } from "./IndividualTask";
import { Droppable } from "react-beautiful-dnd";

export const Collection = ({ tasks, projects, section, offset }) => {
  const [showCollection, setShowCollection] = useState(true);

  return (
    <Droppable droppableId={section ? section.id : "unsorted"} type="task">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          className="tasks__collection"
          {...provided.droppableProps}
          className={
            snapshot.isDraggingOver
              ? "tasks__collection drag-over"
              : "tasks__collection"
          }
        >
          {showCollection && (
            <ul className="tasks__list">
              {tasks.map((task, index) => {
                let calcIndex = offset ? index + offset : index;
                // console.log(calcIndex);
                return (
                  <IndividualTask
                    key={task.id}
                    index={calcIndex}
                    task={task}
                    project={getTitle(projects, task.projectId)}
                    collectionId={section ? section.id : ""}
                  />
                );
              })}
            </ul>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
