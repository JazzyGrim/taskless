import { useState, useEffect } from "react";
import { fb, db } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { collatedTasksExist } from "../helpers";
import moment from "moment";

export const useTasks = (selectedProject) => {
  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);

  useEffect(() => {
    // Get all the tasks for a user
    let queryContents = [where("userId", "==", "3ARLP53uPgxb2RrtcWoK")];

    // Build the query
    if (selectedProject && !collatedTasksExist(selectedProject)) {
      queryContents.push(where("projectId", "==", selectedProject));
    } else if (selectedProject === "TODAY") {
      queryContents.push(where("date", "==", moment().format("DD/MM/YY")));
    } else if (selectedProject === "INBOX" || selectedProject === 0) {
      queryContents.push(where("date", "==", ""));
    }

    // Assemble the query
    const q = query(collection(db, "tasks"), ...queryContents);

    // Get the tasks
    (async () => {
      const querySnapshot = await getDocs(q);

      // Create a tasks array
      const newTasks = querySnapshot.docs.map((task) => ({
        id: task.id,
        ...task.data(),
      }));

      console.log(newTasks);

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
    })();
  }, [selectedProject]);

  return { tasks, archivedTasks };
};

export const useProjects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Get all the user's projects
    const q = query(
      collection(db, "projects"),
      where("userId", "==", "3ARLP53uPgxb2RrtcWoK"),
      orderBy("projectId")
    );

    // Get the tasks
    (async () => {
      const querySnapshot = await getDocs(q);

      // Create a projects array
      const allProjects = querySnapshot.docs.map((project) => ({
        ...project.data(),
        docId: project.id,
      }));

      console.log(allProjects);
      // When we check for new projects, check if the projects have changed
      // If they have, update the state, otherwise avoid an infinite loop
      if (JSON.stringify(allProjects) != JSON.stringify(projects))
        setProjects(allProjects);
    })();
  }, [projects]);

  return { projects, setProjects };
};
