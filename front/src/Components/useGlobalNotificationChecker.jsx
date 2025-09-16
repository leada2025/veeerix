import { useEffect, useRef } from "react";
import api from "../api/Axios";
import { useNotifications } from "../Context/NotificationContext";

const useGlobalNotificationChecker = (customerId) => {
  const { addNotification } = useNotifications();
  const notifiedRequests = useRef({});
  const notifiedPacking = useRef({});

  useEffect(() => {
    if (!customerId) return;

    const checkNotifications = async () => {
      try {
        // 🔹 Brand Requests
        const { data: brandData } = await api.get(`/api/brand-request/${customerId}`);
        const lastSeenTabs = JSON.parse(localStorage.getItem(`seenTabs_${customerId}`) || '{}');

        brandData.forEach(req => {
          if (!req._id) return;

          const lastMsgTs = req.messages?.length
            ? new Date(req.messages[req.messages.length - 1].timestamp).getTime()
            : 0;
          const approvedAtTs = req.approvedAt ? new Date(req.approvedAt).getTime() : 0;
          const requestedPaymentAtTs = req.requestedPaymentAt ? new Date(req.requestedPaymentAt).getTime() : 0;
          const paidAtTs = req.paidAt ? new Date(req.paidAt).getTime() : 0;
          const statusActivity = Math.max(approvedAtTs, requestedPaymentAtTs, paidAtTs);
          const lastActivity = Math.max(lastMsgTs, statusActivity);
          const seenTs = req.seenByCustomer ? new Date(req.seenByCustomer).getTime() : 0;

         if (lastActivity > seenTs) {
  if (req.payment === "Paid" && lastActivity > (lastSeenTabs.history || 0) && !notifiedRequests.current[req._id]?.history) {
    addNotification({ 
      message: `History updated for request Request Quote`,
      link: "/create-brand"   // 👈 navigation path
    });
    notifiedRequests.current[req._id] = {
      ...(notifiedRequests.current[req._id] || {}),
      history: true
    };
  }
  // similarly for status
  else if (lastActivity > (lastSeenTabs.status || 0) && !notifiedRequests.current[req._id]?.status) {
    addNotification({ 
      message: `Status updated for Request Quote`,
      link: "/create-brand"   // 👈 navigation path
    });
    notifiedRequests.current[req._id] = {
      ...(notifiedRequests.current[req._id] || {}),
      status: true
    };
  }
}

        });

        // 🔹 Customer Packing Updates
        const { data: packingData } = await api.get(`/packing/history/${customerId}`);
        const packingSeenTime = JSON.parse(localStorage.getItem(`packingSeen_${customerId}`) || '{}');

        packingData.forEach(entry => {
          if (!entry._id) return;

          const lastAdminUpdate = entry.lastAdminUpdate ? new Date(entry.lastAdminUpdate).getTime() : 0;
          const approvedTime = entry.status === "Approved" ? new Date(entry.updatedAt || entry.createdAt).getTime() : 0;
          
          // Status update (ongoing)
          if (entry.status !== "Approved" && lastAdminUpdate > (packingSeenTime.status || 0) && !notifiedPacking.current[entry._id]?.status) {
  addNotification({
    message: `New Status update from Packing `,
    link: "/packing-approval"   
  });
  notifiedPacking.current[entry._id] = { ...(notifiedPacking.current[entry._id] || {}), status: true };
}

if (entry.status === "Approved" && approvedTime > (packingSeenTime.history || 0) && !notifiedPacking.current[entry._id]?.history) {
  addNotification({
    message: `New Approval update from Packing `,
    link: "/packing-approval"   
  });
  notifiedPacking.current[entry._id] = { ...(notifiedPacking.current[entry._id] || {}), history: true };
}
        });

      } catch (err) {
        console.error("Notification check failed:", err);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, [customerId, addNotification]);
};

export default useGlobalNotificationChecker;
