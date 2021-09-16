import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collatedTasksExist } from "../helpers";
import moment from "moment";

export const useTasks = (selectedProject, userId) => {
  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);

  useEffect(() => {
    // Get all the tasks for a user
    let queryContents = [where("userId", "==", userId)];

    // Build the query
    if (selectedProject && !collatedTasksExist(selectedProject)) {
      queryContents.push(where("projectId", "==", selectedProject));
    } else if (selectedProject === "NEXT_7") {
      queryContents.push(where("date", ">=", moment().format("DD/MM/YYYY")));
      queryContents.push(
        where("date", "<=", moment().add(7, "days").format("DD/MM/YYYY"))
      );
      queryContents.push(orderBy("date"));
    } else if (selectedProject === "TODAY") {
      queryContents.push(where("date", "==", moment().format("DD/MM/YYYY")));
    } else if (selectedProject === "INBOX" || selectedProject === 0) {
      queryContents.push(where("projectId", "==", "INBOX"));
    }

    // Assemble the query
    const q = query(collection(db, "tasks"), ...queryContents);

    // Create a change listener, to keep in sync with the database
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // Create a tasks array
      const newTasks = querySnapshot.docs.map((task) => ({
        id: task.id,
        ...task.data(),
      }));

      console.log(newTasks);

      setTasks(newTasks.filter((task) => !task.archived));

      setArchivedTasks(newTasks.filter((task) => task.archived));
    });

    return () => unsubscribe();
  }, [selectedProject]);

  return { tasks, archivedTasks };
};

export const useProjects = (userId) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Get all the user's projects
    const q = query(
      collection(db, "projects"),
      where("userId", "==", userId),
      orderBy("projectId")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // Create a projects array
      const allProjects = querySnapshot.docs.map((project) => ({
        ...project.data(),
        docId: project.id,
      }));

      setProjects(allProjects);
    });

    return () => unsubscribe();
  }, []);

  return { projects, setProjects };
};

export const useAuth = () => {
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const auth = getAuth();

    if (userData.listener == null) {
      setUserData({
        ...userData,
        listener: onAuthStateChanged(auth, (user) => {
          if (user)
            setUserData((oldState) => ({
              ...oldState,
              userDataPresent: true,
              user: user,
            }));
          else
            setUserData((oldState) => ({
              ...oldState,
              userDataPresent: false,
              user: null,
            }));
        }),
      });
    }
    return () => {
      if (userData.listener) userData.listener();
    };
  }, []);

  return { userData };
};
