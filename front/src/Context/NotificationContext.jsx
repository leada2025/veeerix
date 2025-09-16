import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [bellSeen, setBellSeen] = useState(true);

 const addNotification = (notif) => {
  setMessages(prev => {
    if (prev.find(m => m.message === notif.message)) return prev; // prevent duplicates
    setBellSeen(false); // trigger bell blink
    return [...prev, notif];
  });
};


  const clearNotifications = () => {
    setMessages([]);
    setBellSeen(true);
  };

  const markBellSeen = () => setBellSeen(true);

  return (
    <NotificationContext.Provider value={{
      messages,
      bellSeen,
      addNotification,
      clearNotifications,
      markBellSeen
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
