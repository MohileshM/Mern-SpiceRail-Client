import React from "react";

const StatusBadge = ({ status }) => (
  <span className={`badge-status status-${status}`}>{status}</span>
);

export default StatusBadge;
