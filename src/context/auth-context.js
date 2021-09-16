import React, { createContext, useContext } from "react";
import { useAuth } from "../hooks";

export const AuthContext = createContext({
  userDataPresent: false,
  user: null,
});

export const AuthProvider = ({ children }) => {
  const { userData } = useAuth();

  return (
    <AuthContext.Provider value={{ userData }}>{children}</AuthContext.Provider>
  );
};

export const useAuthValues = () => useContext(AuthContext);
