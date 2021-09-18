import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collatedTasksExist } from "../helpers";
import moment from "moment";

export const useOrder = (selectedProject, userId) => {
  const [orders, setOrders] = useState({});

  useEffect(() => {
    let queryUser = false;
    // Get all the collestions for a user
    let queryContents = [where("userId", "==", userId)];
    let cqueryContents = [where("userId", "==", userId)];

    // Build the query
    if (selectedProject && !collatedTasksExist(selectedProject)) {
      queryContents.push(where("projectId", "==", selectedProject));
    } else if (selectedProject === "INBOX" || selectedProject === 0) {
      queryUser = true;
      cqueryContents.push(where("projectId", "==", selectedProject));
    } else {
      setOrders({}); // No order when we are looking at TODAY or NEXT_7
      return; // Don't do anything else
    }

    // Assemble the query
    const q = query(
      collection(db, queryUser ? "users" : "projects"),
      ...queryContents
    );
    const cq = query(collection(db, "sections"), ...cqueryContents);

    (async () => {
      const querySnapshot = await getDocs(q);
      const collectionQuerySnapshot = await getDocs(cq);

      let newOrders = {};

      if (querySnapshot.docs.length) {
        newOrders[queryUser ? "INBOX" : querySnapshot.docs[0].id] =
          querySnapshot.docs[0].data().order;
      }

      if (collectionQuerySnapshot.docs.length) {
        collectionQuerySnapshot.docs.forEach((c) => {
          newOrders[c.id] = c.data().order;
        });
      }

      console.log("NEW ORDERS STATE: ", newOrders);
      setOrders(newOrders);
    })();
  }, [selectedProject]);

  return { orders, setOrders };
};

export const useSections = (selectedProject, userId) => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    // Get all the collestions for a user
    let queryContents = [where("userId", "==", userId)];

    // Build the query
    if (selectedProject && !collatedTasksExist(selectedProject)) {
      queryContents.push(where("projectId", "==", selectedProject));
    } else if (selectedProject === "INBOX" || selectedProject === 0) {
      queryContents.push(where("projectId", "==", "INBOX"));
    } else {
      setSections([]); // No sections when we are looking at TODAY or NEXT_7
      return; // Don't do anything else
    }

    // Assemble the query
    const q = query(collection(db, "sections"), ...queryContents);

    // Create a change listener, to keep in sync with the database
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // Create a tasks array
      const newSections = querySnapshot.docs.map((section) => ({
        id: section.id,
        ...section.data(),
      }));

      setSections(newSections);
    });

    return () => unsubscribe();
  }, [selectedProject]);

  return { sections };
};

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

      setTasks(newTasks.filter((task) => !task.archived));

      setArchivedTasks(newTasks.filter((task) => task.archived));
    });

    return () => unsubscribe();
  }, [selectedProject]);

  return { tasks, setTasks, archivedTasks };
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
