import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";
import {
  connectSocket,
  disconnectSocket,
} from "../services/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("chat_user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("chat_token");
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        setUser(response.data.user);

        localStorage.setItem(
          "chat_user",
          JSON.stringify(response.data.user)
        );

        connectSocket(token);
      } catch (error) {
        console.error("Authentication failed:", error);

        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("chat_token", token);
    localStorage.setItem("chat_user", JSON.stringify(user));

    setToken(token);
    setUser(user);

    connectSocket(token);

    return response.data;
  };

  const register = async ({
    name,
    email,
    password,
    username,
  }) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      username,
    });

    const { token, user } = response.data;

    localStorage.setItem("chat_token", token);
    localStorage.setItem("chat_user", JSON.stringify(user));

    setToken(token);
    setUser(user);

    connectSocket(token);

    return response.data;
  };

  const logout = () => {
    disconnectSocket();

    localStorage.removeItem("chat_token");
    localStorage.removeItem("chat_user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};