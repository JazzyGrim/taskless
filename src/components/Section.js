import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Draggable } from "react-beautiful-dnd";
import { Collection } from "./Collection";

export const Section = ({ tasks, projects, section, index, offset }) => {
  const [showSection, setShowSection] = useState(true);

  return (
    <Draggable
      draggableId={section ? section.id : "not-grouped"}
      key={section ? section.id : "not-grouped"}
      index={index}
    >
      {(provided) => (
        <div
          className="tasks__collection-container"
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          {section && (
            <div
              className="tasks__collection-holder"
              aria-label="Show/hide tasks in this collection"
              onClick={() => setShowSection(!showSection)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setShowSection(!showSection);
              }}
              role="button"
              tabIndex={0}
              {...provided.dragHandleProps}
            >
              <span>
                <FaChevronDown
                  className={!showSection ? "hidden-collection" : undefined}
                />
              </span>
              <h2 {...provided.dragHandleProps}>{section.name}</h2>
            </div>
          )}

          <Collection
            section={section}
            tasks={tasks}
            projects={projects}
            offset={offset}
          />
        </div>
      )}
    </Draggable>
  );
};
