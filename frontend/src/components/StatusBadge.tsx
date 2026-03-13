export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = status?.toLowerCase() || "unknown";
  const tone =
    normalized === "active"
      ? "green"
      : normalized === "deprecated"
      ? "amber"
      : normalized === "shadow"
      ? "blue"
      : "red";
  return <span className={`badge ${tone}`}>{status}</span>;
};
