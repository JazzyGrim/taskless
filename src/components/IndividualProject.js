import React, { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import PropTypes from "prop-types";
import { useAuthValues, useSelectedProjectValue } from "../context";
import { db } from "../firebase.js";
import {
  doc,
  deleteDoc,
  getDocs,
  query,
  collection,
  where,
} from "firebase/firestore";

export const IndividualProject = ({ project, removeProjectFromOrder }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { userData } = useAuthValues();
  // const { projects, setProjects } = useProjectsValue();
  const { setSelectedProject } = useSelectedProjectValue();

  const deleteProject = (docId) => {
    const documentRef = doc(db, "projects", docId);

    const projectId = project.projectId;

    const q = query(
      collection(db, "tasks"),
      where("projectId", "==", projectId),
      where("userId", "==", userData.user.uid)
    );

    (async () => {
      await deleteDoc(documentRef);

      setSelectedProject("INBOX");
      removeProjectFromOrder(projectId);

      const querySnapshot = await getDocs(q);
      querySnapshot.docs.forEach((document) => {
        deleteDoc(doc(db, "tasks", document.id));
      });
    })();
  };

  return (
    <>
      <span className="sidebar__dot">•</span>
      <span className="sidebar__project-name">{project.name}</span>
      <span
        className="sidebar__project-delete"
        data-testid="delete-project"
        onClick={() => setShowConfirm(!showConfirm)}
        onKeyDown={(e) => {
          if (e.key === "Enter") setShowConfirm(!showConfirm);
        }}
        tabIndex={0}
        role="button"
        aria-label="Confirm deletion of project"
      >
        <FaTrashAlt />
        {showConfirm && (
          <div className="project-delete-modal">
            <div className="project-delete-modal__inner">
              <p>Are you sure you want to delete this project?</p>
              <button
                type="button"
                onClick={() => deleteProject(project.docId)}
              >
                Delete
              </button>
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setShowConfirm(!showConfirm);
                }}
                tabIndex={0}
                role="button"
                aria-label="Cancel adding project, do not delete"
              >
                Cancel
              </span>
            </div>
          </div>
        )}
      </span>
    </>
  );
};

IndividualProject.propTypes = {
  project: PropTypes.object.isRequired,
};
