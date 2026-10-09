import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getMeRequest, loginRequest } from "../api/auth";
import { clearToken, getToken, saveToken } from "../api/client";
import { AuthContext } from "./authContext";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True while we verify a stored token on first load.
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  // Restore the session: a stored token is only trusted after /auth/me accepts it.
  useEffect(() => {
    // No stored token: `loading` already started as false.
    if (!getToken()) return;

    let cancelled = false;
    getMeRequest()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // apiFetch fires this when an authenticated request gets 401 (expired token).
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async ({ email, password, remember }) => {
    const data = await loginRequest({ email, password });
    saveToken(data.accessToken, remember);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
