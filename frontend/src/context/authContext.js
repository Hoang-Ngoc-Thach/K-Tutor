import { createContext } from "react";

export const AuthContext = createContext(null);

export function getHomePath(user) {
  return user?.role === "admin" ? "/admin" : "/";
}
