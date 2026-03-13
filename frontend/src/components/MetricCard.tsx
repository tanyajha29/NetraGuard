type Props = {
  title: string;
  value: number | string;
  tone?: "default" | "success" | "warning" | "critical";
};

const tones: Record<NonNullable<Props["tone"]>, string> = {
  default: "linear-gradient(120deg, rgba(59,130,246,0.18), rgba(14,165,233,0.15))",
  success: "linear-gradient(120deg, rgba(34,197,94,0.18), rgba(52,211,153,0.18))",
  warning: "linear-gradient(120deg, rgba(245,158,11,0.18), rgba(234,179,8,0.16))",
  critical: "linear-gradient(120deg, rgba(239,68,68,0.2), rgba(251,113,133,0.18))",
};

export const MetricCard = ({ title, value, tone = "default" }: Props) => (
  <div className="card" style={{ backgroundImage: tones[tone] }}>
    <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
  </div>
);
