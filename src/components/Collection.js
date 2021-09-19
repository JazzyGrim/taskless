import React, { useState } from "react";
import { getTitle } from "../helpers";
import { IndividualTask } from "./IndividualTask";
import { Droppable } from "react-beautiful-dnd";

export const Collection = ({ tasks, projects, section, disableDrag }) => {
  const [showCollection, setShowCollection] = useState(true);

  // console.log(tasks);
  return (
    <Droppable droppableId={section ? section.id : "ungrouped"} type="task">
      {(provided) => (
        <div
          ref={provided.innerRef}
          className="tasks__collection"
          {...provided.droppableProps}
        >
          {showCollection && (
            <ul className="tasks__list">
              {tasks.map((task, index) => {
                return (
                  <IndividualTask
                    key={task.id}
                    index={index}
                    task={task}
                    project={getTitle(projects, task.projectId)}
                    collectionId={section ? section.id : ""}
                    disableDrag={disableDrag}
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
