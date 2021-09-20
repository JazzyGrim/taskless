import React, { createContext, useContext, useEffect, useState } from "react";
import { useOrder, useUserInfo } from "../hooks";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { useSections, useTasks } from "../hooks";
import { collatedTasks } from "../constants";
import {
  getTitle,
  getCollatedTitle,
  collatedTasksExist,
  getProjectById,
} from "../helpers";
import { useSelectedProjectValue, useProjectsValue, useAuthValues } from ".";

export const OrderedDataContext = createContext();
export const OrderedDataProvider = ({ children }) => {
  const [showLoader, setShowLoader] = useState(false);
  const { userData } = useAuthValues();
  const { selectedProject } = useSelectedProjectValue();
  const { projects, userInfo } = useProjectsValue();
  const { tasks } = useTasks(selectedProject, userData.user.uid);
  const { sections } = useSections(selectedProject, userData.user.uid);

  const [orderObject, setOrderObject] = useState({
    for: selectedProject,
    ungrouped: [],
    sectionOrder: [],
    sections: [],
  });

  /* NEW STUFF */

  const [dataObject, setDataObject] = useState({
    for: selectedProject,
    ungrouped: [],
    sectionOrder: [],
    sections: {},
  });

  const [ungroupedOrder, setUngroupedOrder] = useState([]);
  const [sectionOrder, setSectionOrder] = useState([]);

  const updateTaskSectionId = async (taskDocId, sectionId) => {
    const taskRef = doc(db, "tasks", taskDocId);

    await updateDoc(taskRef, {
      sectionId,
    });
  };

  const saveProjectOrder = async (
    ungroupedOrder,
    sectionOrder,
    newSections,
    projectDocId
  ) => {
    let newOrder = [...ungroupedOrder];

    sectionOrder.forEach((sectionId) => {
      const curSection = newSections.find((s) => s.id === sectionId);
      if (curSection) {
        newOrder = [...newOrder, ...curSection.order];
      }
    });

    if (projectDocId === "INBOX") {
      const userRef = doc(db, "users", userInfo.docId);

      await updateDoc(userRef, {
        inboxOrder: newOrder,
        inboxSectionOrder: sectionOrder,
      });

      return;
    }

    const projectRef = doc(db, "projects", projectDocId);

    await updateDoc(projectRef, {
      order: newOrder,
      sectionOrder,
    });
  };

  // When we change the project, we need to update the data object
  useEffect(() => {
    setShowLoader(true);
    setDataObject({ ...dataObject, for: selectedProject });
  }, [selectedProject]);

  // When our data updates, recaulate the order
  useEffect(() => {
    // There isn't any ordering for TODAY and NEXT_7
    if (
      !projects ||
      !projects.length ||
      selectedProject === "TODAY" ||
      selectedProject === "NEXT_7"
    )
      return;

    const currentProject =
      selectedProject === "INBOX"
        ? {
            order: userInfo.inboxOrder,
            sectionOrder: userInfo.inboxSectionOrder,
          }
        : getProjectById(projects, selectedProject);

    calculateOrder(currentProject);
  }, [selectedProject, tasks, sections, userInfo]);

  const calculateOrder = (project) => {
    if (!project) return; // If we have just deleted a project and it's momentarily empty

    let newDataObject = {
      for: selectedProject,
      ungrouped: [],
      sectionOrder: [],
      sections: {},
    };

    // Transform the tasks into an object instead of an array
    const newTaskObject = tasks.reduce(function (result, currentObject) {
      result[currentObject.id] = currentObject;
      return result;
    }, {});

    // Now map each ID in the UNGROUPED task order array to their corresponding task
    // If we have a stored order for the ungrouped tasks, and the tasks aren't empty ( important )
    if (project.order.length != 0 && tasks.length)
      newDataObject.ungrouped = project.order.map(
        (taskId) => newTaskObject[taskId]
      );
    // We now have an ordered ungrouped task list

    // Sort the sections
    const orderedSections = sections.length
      ? sortArrayById(sections, project.sectionOrder)
      : [];

    // Now map each ID in the task order array to their corresponding task
    orderedSections.forEach((section) => {
      newDataObject.sections[section.id] = section;
      newDataObject.sections[section.id].taskOrder = newDataObject.sections[
        section.id
      ].taskOrder.map((taskId) => newTaskObject[taskId]);
      // We now have an ordered section task list
    });

    // Set the section order
    newDataObject.sectionOrder = project.sectionOrder;

    console.log(newDataObject);
    setDataObject(newDataObject);
  };

  const sortArrayById = (sortable, sortWith) => {
    return sortable.slice().sort(function (a, b) {
      return sortWith.indexOf(a.id) - sortWith.indexOf(b.id);
    });
  };

  const removeTaskFromSection = (taskId, sectionId) => {
    let newDataObject = { ...dataObject };

    // If we are changing the ungrouped section
    if (sectionId === "") {
      newDataObject.ungrouped = newDataObject.ungrouped.filter(
        (task) => task.id !== taskId
      );
    } else {
      // We are setting a section order
      let newSections = { ...dataObject.sections };

      // Remove the task from the proper section
      newSections[sectionId].taskOrder = newSections[sectionId].filter(
        (task) => task.id !== taskId
      );

      newDataObject = { ...dataObject, sections: newSections };
    }

    setDataObject(newDataObject);

    return; // For now
    saveProjectOrder(
      newDataObject.ungrouped,
      newDataObject.sectionOrder,
      newDataObject.sections,
      selectedProject === "INBOX"
        ? "INBOX"
        : getProjectById(projects, selectedProject).docId
    );
  };

  const addTaskToSection = (taskId, sectionId) => {
    let newDataObject = { ...dataObject };

    const newItem = tasks.find((task) => task.id === taskId);
    if (!newItem) return; // If the item doesn't exist for some reason

    // If we are changing the ungrouped section
    if (sectionId === "") {
      newDataObject.ungrouped.push(newItem);
    } else {
      // We are setting a section order
      let newSections = { ...dataObject.sections };

      // Remove the task from the proper section
      newSections[sectionId].taskOrder.push(newItem);

      newDataObject = { ...dataObject, sections: newSections };
    }

    setDataObject(newDataObject);

    return; // For now
    saveProjectOrder(
      newDataObject.ungrouped,
      newDataObject.sectionOrder,
      newDataObject.sections,
      selectedProject === "INBOX"
        ? "INBOX"
        : getProjectById(projects, selectedProject).docId
    );
  };

  return (
    <OrderedDataContext.Provider value={{ dataObject }}>
      {children}
    </OrderedDataContext.Provider>
  );
};

export const useOrderedDataValue = () => useContext(OrderedDataContext);
