import React, { useContext, useState } from "react";
import { NotificationContext } from "../context/NotificationContext";
import api from "../api/api";

export default function Invites() {
  const { notifications, removeNotification } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);

  const pendingInvites = notifications.filter((n) => n.type === "In-App"); // assuming notification has type

  const respondInvite = async (notificationId, groupId, status) => {
    try {
      setLoading(true);
      await api.post(`/groups/${groupId}/respond`, { status });

      // ✅ remove from context after responding
      removeNotification(notificationId);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <section className="bg-white p-6 rounded-lg shadow mt-10">
        <h2 className="text-xl font-semibold mb-4">Pending Invites</h2>

        {loading ? (
          <p>Processing...</p>
        ) : pendingInvites.length === 0 ? (
          <p className="text-gray-500">No invites available.</p>
        ) : (
          <ul className="space-y-3">
            {pendingInvites.map((inv) => (
              <li
                key={inv._id}
                className="p-4 border rounded-lg flex justify-between items-center"
              >
                <span>{inv.message}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => respondInvite(inv._id, inv.groupId, "accepted")}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondInvite(inv._id, inv.groupId, "rejected")}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}