// src/components/RecentActivityCard.js
import React from "react";

export default function RecentActivityCard({ activities }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
      {activities.length === 0 ? (
        <p>No recent activity.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {activities.map((act, index) => (
            <li key={index} className="border-b pb-2">
              <span className="font-semibold">{act.user}</span> {act.action}{" "}
              <span className="text-gray-500 text-sm">({new Date(act.date).toLocaleString()})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
