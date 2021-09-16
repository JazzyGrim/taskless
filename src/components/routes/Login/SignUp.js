import React, { useState, useEffect } from "react";
import { useAuthValues } from "../../../context";
import "./Login.scss";
import { useHistory } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { userData } = useAuthValues();
  let history = useHistory();

  const handleSignUp = () => {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode) console.error(errorCode + " | " + errorMessage);
    });
  };

  useEffect(() => {
    // Redirect on signup
    if (userData.user) history.push("/app");
  }, [userData]);

  return (
    <div className="login__container">
      <div className="login">
        <label className="login__label">E-mail</label>
        <input
          className="login__content"
          aria-label="Enter your email"
          data-testid="login__content-email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="login__label">Password</label>
        <input
          className="login__content"
          aria-label="Enter your password"
          data-testid="login__content-password"
          type="password"
          value={password}
          placeholder="********"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="login__submit"
          data-testid="login"
          onClick={() => handleSignUp()}
        >
          Sign Up
        </button>
        <span
          onClick={() => history.push("/login")}
          onKeyDown={(e) => {
            if (e.key === "Enter") history.push("/login");
          }}
          tabIndex={0}
          role="button"
          aria-label="Sign up to Taskless"
        >
          Have an account? Log in instead
        </span>
      </div>
    </div>
  );
};
