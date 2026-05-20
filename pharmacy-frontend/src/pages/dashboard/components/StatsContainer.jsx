import { useStats } from "../hooks/useStats";
import StatCard from "./StatCard";
import ExpiryRiskCard from "./ExpiryRiskCard";

export default function StatsContainer({
  medicines,
  salesCountMap,
  TRENDING_THRESHOLD,
  getSmartDiscount,
}) {
  const stats = useStats(
    medicines,
    salesCountMap,
    TRENDING_THRESHOLD,
    getSmartDiscount,
  );

  return (
    <div className="stats-container no-print">
      <StatCard
        value={stats.totalItems}
        label="Total Product Types"
        className="blue"
      />

      <StatCard
        value={stats.totalUnits}
        label="Total Units In Stock"
        className="cyan"
      />

      <StatCard
        value={stats.lowStockCount}
        label="Low Stock 🚨"
        className="red"
      />

      <ExpiryRiskCard
        expiringCount={stats.expiringCount}
        capitalAtRisk={stats.capitalAtRisk}
      />

      <StatCard
        value={stats.trendingCount}
        label="Trending Products 🔥"
        className="purple"
      />

      <StatCard
        value={stats.outOfStock}
        label="Out of Stock"
        className="gray"
      />
    </div>
  );
}
