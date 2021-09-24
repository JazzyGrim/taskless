import React, { useEffect, useState } from "react";
import { VscChevronDown } from "react-icons/vsc";
import { BsThreeDots } from "react-icons/bs";
import { Draggable } from "react-beautiful-dnd";
import { Collection } from "./Collection";
import { IconContext } from "react-icons";
import { Grabber } from "./Grabber";
import { FaTrashAlt } from "react-icons/fa";
import { db } from "../firebase.js";
import {
  doc,
  deleteDoc,
  getDocs,
  query,
  collection,
  where,
} from "firebase/firestore";
import { useAuthValues, useOrderedDataValue } from "../context";

export const Section = ({ tasks, projects, section, index }) => {
  const [showSection, setShowSection] = useState(true);
  const [showSectionOptions, setShowSectionOptions] = useState(false);
  const { userData } = useAuthValues();
  const { removeSectionFromProject } = useOrderedDataValue();

  const deleteSection = () => {
    const documentRef = doc(db, "sections", section.id);

    const q = query(
      collection(db, "tasks"),
      where("sectionId", "==", section.id),
      where("userId", "==", userData.user.uid)
    );

    (async () => {
      await deleteDoc(documentRef);

      removeSectionFromProject(section.id);

      const querySnapshot = await getDocs(q);
      querySnapshot.docs.forEach((document) => {
        deleteDoc(doc(db, "tasks", document.id));
      });
    })();
  };

  return (
    <Draggable
      draggableId={section ? section.id : "not-grouped"}
      key={section ? section.id : "not-grouped"}
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
              <span
                aria-label="Show/hide section options"
                onClick={() => setShowSectionOptions(!showSectionOptions)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    setShowSectionOptions(!showSectionOptions);
                }}
                role="button"
                tabIndex={0}
                className="tasks__collection-holder-settings"
              >
                <IconContext.Provider value={{ size: 14 }}>
                  <BsThreeDots width={24} height={24} />
                </IconContext.Provider>
                {showSectionOptions && (
                  <div className="tasks__collection-popup">
                    <span
                      onClick={() => {
                        deleteSection();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          deleteSection();
                        }
                      }}
                      aria-label="Sign out of Taskless"
                      tabIndex={0}
                      role="button"
                    >
                      <FaTrashAlt />
                      Delete Section
                    </span>
                  </div>
                )}
              </span>
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
