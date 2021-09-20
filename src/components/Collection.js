import React, { useState } from "react";
import { getTitle } from "../helpers";
import { IndividualTask } from "./IndividualTask";
import { Droppable } from "react-beautiful-dnd";
import { AddTask } from "./AddTask";

export const Collection = ({
  tasks,
  projects,
  section,
  disableDrag,
  addTaskToSection,
  removeTaskFromSection,
}) => {
  const [showCollection, setShowCollection] = useState(true);

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
                    removeTaskFromSection={(taskId) =>
                      removeTaskFromSection(taskId, section ? section.id : "")
                    }
                  />
                );
              })}
            </ul>
          )}
          {provided.placeholder}
          <AddTask
            addTaskToSection={addTaskToSection}
            setShowLoader={() => {}}
            sectionId={section ? section.id : ""}
          />
        </div>
      )}
    </Droppable>
  );
};
