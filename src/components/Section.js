import React, { useEffect, useState } from "react";
import { VscChevronDown } from "react-icons/vsc";
import { Draggable } from "react-beautiful-dnd";
import { Collection } from "./Collection";
import { IconContext } from "react-icons";
import { Grabber } from "./Grabber";

export const Section = ({ tasks, projects, section, index }) => {
  const [showSection, setShowSection] = useState(true);

  return (
    <Draggable
      draggableId={section ? "draggable_" + section.id : "not-grouped"}
      key={section ? "draggable_" + section.id : "not-grouped"}
      index={index}
      isDragDisabled={section == null}
    >
      {(provided, snapshot) => (
        <div
          key={section ? section.id : "not-grouped-draggable"}
          className="tasks__collection-container"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          {section && (
            <div className="tasks__collection-holder">
              <Grabber
                isDragging={snapshot.isDragging}
                dragHandleProps={provided.dragHandleProps}
              />
              <span
                aria-label="Show/hide tasks in this collection"
                onClick={() => setShowSection(!showSection)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setShowSection(!showSection);
                }}
                role="button"
                tabIndex={0}
                className="tasks__collection-holder-arrow"
              >
                <IconContext.Provider value={{ size: 14 }}>
                  <VscChevronDown
                    className={!showSection ? "hidden-collection" : undefined}
                    width={24}
                    height={24}
                  />
                </IconContext.Provider>
              </span>
              <h2>{section.name}</h2>
              {tasks.length ? <h6>{tasks.length}</h6> : ""}
            </div>
          )}

          {showSection && (
            <Collection section={section} tasks={tasks} projects={projects} />
          )}
        </div>
      )}
    </Draggable>
  );
};
