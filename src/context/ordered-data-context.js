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

const sortArrayById = (sortable, sortWith) => {
  return sortable.slice().sort(function (a, b) {
    return sortWith.indexOf(a.id) - sortWith.indexOf(b.id);
  });
};

export const OrderedDataContext = createContext();
export const OrderedDataProvider = ({ children }) => {
  const [showLoader, setShowLoader] = useState(false);
  const { userData } = useAuthValues();
  const { selectedProject } = useSelectedProjectValue();
  const { projects, userInfo } = useProjectsValue();
  const { tasks } = useTasks(selectedProject, userData.user.uid);
  const { sections } = useSections(selectedProject, userData.user.uid);

  /* NEW STUFF */

  const [dataObject, setDataObject] = useState({
    for: selectedProject,
    ungrouped: [],
    sectionOrder: [],
    sections: {},
  });

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
    let newOrder = ungroupedOrder.map((task) => task.id);

    // CHECK BACK ON THIS IF THE SECTIONS ARE ORDERED
    // NOW ILL ORDER THEM JUST IN CASE

    // !!!!!!!!!!!!!!!!1
    // SECTIONS IS AN OBJECT
    const sortedSections = sectionOrder.map(
      (sectionId) => newSections[sectionId]
    );

    sortedSections.forEach((section) => {
      section.taskOrder.forEach((task) => {
        newOrder.push(task.id);
      });
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

  // Once the tasks update, stop the loader
  useEffect(() => {
    setShowLoader(false);
  }, [tasks]);

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
      newDataObject.ungrouped = project.order
        .filter((taskId) =>
          newTaskObject[taskId] ? newTaskObject[taskId].sectionId === "" : false
        )
        .map((taskId) => newTaskObject[taskId]);
    // We now have an ordered ungrouped task list

    // Sort the sections
    const orderedSections = sections.length
      ? sortArrayById(sections, project.sectionOrder)
      : [];

    // Now filter through each section's tasks and map each ID in the project order array to their corresponding task
    orderedSections.forEach((section) => {
      newDataObject.sections[section.id] = section;
      newDataObject.sections[section.id].taskOrder = project.order
        .filter((taskId) =>
          newTaskObject[taskId]
            ? newTaskObject[taskId].sectionId === section.id
            : false
        )
        .map((taskId) => newTaskObject[taskId]);
      // We now have an ordered section task list
    });

    // Set the section order
    newDataObject.sectionOrder = project.sectionOrder;

    setDataObject(newDataObject);
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

    let newItem = tasks.find((task) => task.id === taskId);

    // Now if the task was created in time, we don't have to do this
    // Otherwise, the task is yet to be created
    // We are setting the ID inside an object ( an object is used inside the dataObject.ungrouped array )
    if (!newItem) newItem = { id: taskId };

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

    saveProjectOrder(
      newDataObject.ungrouped,
      newDataObject.sectionOrder,
      newDataObject.sections,
      selectedProject === "INBOX"
        ? "INBOX"
        : getProjectById(projects, selectedProject).docId
    );
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    // If dropping item randomly
    if (!destination) return;
    // If the item returned to the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "section") {
      // First update the section order
      let newSectionOrder = [...dataObject.sectionOrder];

      newSectionOrder.splice(source.index, 1);
      newSectionOrder.splice(destination.index, 0, { id: draggableId });

      // Now sort the sections based on the new order
      let newSections = [...dataObject.sections];
      newSections = sortArrayById(newSections, newSectionOrder);

      // Update the order object!
      setDataObject({
        ...dataObject,
        sectionOrder: newSectionOrder,
        sections: newSections,
      });

      // Save to database
      saveProjectOrder(
        dataObject.ungrouped,
        newSectionOrder,
        newSections,
        selectedProject === "INBOX"
          ? "INBOX"
          : getProjectById(projects, selectedProject).docId
      );

      return;
    }
    // ----------------
    // We are dealing with a task
    // ----------------
    // Reorder elements
    // ----------------
    let home = dataObject.sections[source.droppableId];
    let foreign = dataObject.sections[destination.droppableId];

    // If we are dealing with the ungrouped section
    if (!home) home = { id: "ungrouped", taskOrder: dataObject.ungrouped };
    if (!foreign)
      foreign = { id: "ungrouped", taskOrder: dataObject.ungrouped };

    // We moved an item inside the same section
    if (JSON.stringify(home) === JSON.stringify(foreign)) {
      const newTaskOrder = Array.from(home.taskOrder);

      // Switch positions of the tasks
      const oldTask = newTaskOrder[source.index];

      newTaskOrder.splice(source.index, 1);
      newTaskOrder.splice(destination.index, 0, oldTask);

      // If we are setting the ungrouped order
      if (home.id === "ungrouped") {
        setDataObject({ ...dataObject, ungrouped: newTaskOrder });

        saveProjectOrder(
          newTaskOrder,
          dataObject.sectionOrder,
          dataObject.sections,
          selectedProject === "INBOX"
            ? "INBOX"
            : getProjectById(projects, selectedProject).docId
        );
      } else {
        // We are setting a section order
        // Update the task order for that section
        let newSections = { ...dataObject.sections };
        newSections[home.id].taskOrder = newTaskOrder;

        setDataObject({ ...dataObject, sections: newSections });

        saveProjectOrder(
          dataObject.ungrouped,
          dataObject.sectionOrder,
          newSections,
          selectedProject === "INBOX"
            ? "INBOX"
            : getProjectById(projects, selectedProject).docId
        );
      }
      return;
    }

    let ungroupedOrder = [...dataObject.ungrouped];

    // Moving from one section to another
    const homeOrder = Array.from(home.taskOrder);

    // Update the task section ID
    // 1. Get the task ID
    const homeTaskId = homeOrder[source.index];

    updateTaskSectionId(
      homeTaskId.id,
      destination.droppableId === "ungrouped" ? "" : destination.droppableId
    );

    // Switch positions of the tasks
    const oldTask = homeOrder[source.index];
    homeOrder.splice(source.index, 1);
    const newHome = {
      ...home,
      taskOrder: homeOrder,
    };

    if (newHome.id === "ungrouped") ungroupedOrder = homeOrder;

    const foreignOrder = Array.from(foreign.taskOrder);
    foreignOrder.splice(destination.index, 0, oldTask);
    const newForeign = {
      ...foreign,
      taskOrder: foreignOrder,
    };

    if (newForeign.id === "ungrouped") ungroupedOrder = foreignOrder;

    // We are updating the sections
    let newSections = { ...dataObject.sections };
    if (home.id !== "ungrouped") newSections[home.id] = newHome;
    if (foreign.id !== "ungrouped") newSections[foreign.id] = newForeign;

    setDataObject({
      ...dataObject,
      ungrouped: ungroupedOrder,
      sections: newSections,
    });

    saveProjectOrder(
      ungroupedOrder,
      dataObject.sectionOrder,
      newSections,
      selectedProject === "INBOX"
        ? "INBOX"
        : getProjectById(projects, selectedProject).docId
    );
  };

  return (
    <OrderedDataContext.Provider
      value={{
        dataObject,
        showLoader,
        setShowLoader,
        tasks,
        sections,
        onDragEnd,
        addTaskToSection,
        removeTaskFromSection,
      }}
    >
      {children}
    </OrderedDataContext.Provider>
  );
};

export const useOrderedDataValue = () => useContext(OrderedDataContext);
