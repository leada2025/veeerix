import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [hasNotification, setHasNotification] = useState(false);
  const [messages, setMessages] = useState([]);

  const addNotification = (msg) => {
    setMessages((prev) => {
      // ✅ avoid adding duplicate messages
      if (prev.includes(msg)) return prev;

      setHasNotification(true);
      return [...prev, msg];
    });
  };

  const clearNotifications = () => {
    setHasNotification(false);
    setMessages([]);
  };

  return (
    <NotificationContext.Provider
      value={{ hasNotification, addNotification, clearNotifications, messages }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
