
import { useNotifications } from "../Context/NotificationContext";
import api from "../api/Axios";

const useGlobalNotificationChecker = () => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const customerId = JSON.parse(localStorage.getItem("user"))?._id;
        if (!customerId) return;

        const res = await api.get(`/api/brand-request/${customerId}`);
        res.data.forEach((row) => {
          const lastActivity = new Date(row.lastAdminActivityAt || 0).getTime();
          const seenTs = row.seenByCustomer ? new Date(row.seenByCustomer).getTime() : 0;

          if (lastActivity > seenTs) {
            addNotification(`New update for ${row.moleculeName || row.customMolecule || "your request"}`);
          }
        });
      } catch (err) {
        console.error("Notification check failed", err);
      }
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [addNotification]);
};

export default useGlobalNotificationChecker;
