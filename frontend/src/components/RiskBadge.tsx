export const RiskBadge: React.FC<{ level: string }> = ({ level }) => {
  const normalized = level?.toLowerCase() || "unknown";
  const tone =
    normalized === "critical"
      ? "red"
      : normalized === "high"
      ? "red"
      : normalized === "medium"
      ? "amber"
      : "green";
  return <span className={`badge ${tone}`}>{level || "unknown"}</span>;
};
