import { useState, useEffect } from "react";
import { firebase } from "../firebase";
import { collatedTasksExist } from "../helpers";
import moment from "moment";

export const useTasks = (selectedProject) => {
  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);

  // Get all the tasks for a user
  useEffect(() => {
    let unsubscribe = firebase
      .firestore()
      .collection("tasks")
      .where("userId", "==", "3ARLP53uPgxb2RrtcWoK");

    // Unsubscribe now contains all the tasks
    // Now filter those tasks based on the selected project
    unsubscribe =
      selectedProjects && !collatedTasksExist(selectedProject)
        ? (unsubscribe = unsubscribe.where(
            "projectId",
            "==",
            "selectedProject"
          ))
        : selectedProject === "TODAY"
        ? (unsubscribe = unsubscribe.where(
            "date",
            "==",
            moment().format("DD/MM/YY")
          ))
        : selectedProject === "INBOX" || selectedProject === 0
        ? (unsubscribe = unsubscribe.where("date", "==", ""))
        : unsubscribe;

    unsubscribe = unsubscribe.onSnapshot((snapshot) => {
      const newTasks = snapshot.docs.map((task) => ({
        id: task.id,
        ...task.data(),
      }));

      setTasks(
        selectedProject == "NEXT_7"
          ? newTasks.filter(
              (task) =>
                moment(task.date, "DD-MM-YYYY").diff(moment(), "days") < 7 &&
                !task.archived
            )
          : newTasks.filter((task) => !task.archived)
      );

      setArchivedTasks(newTasks.filter((task) => task.archived));
    });

    return () => unsubscribe();
  }, [selectedProject]);

  return { tasks, archivedTasks };
};

export const useProjects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    firebase.firestore
      .collection("projects")
      .where("userId", "==", "3ARLP53uPgxb2RrtcWoK")
      .orderBy("projectId")
      .get()
      .then((snapshot) => {
        const allProjects = snapshot.docs.map((project) => ({
          ...project.data(),
          docId: project.id,
        }));
      });

    // When we check for new projects, check if the projects have changed
    // If they have, update the state, otherwise avoid an infinite loop
    if (JSON.stringify(allProjects) != JSON.stringify(projects))
      setProjects(allProjects);
  }, [projects]);

  return { projects, setProjects };
};
