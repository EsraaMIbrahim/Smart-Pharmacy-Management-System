export default function ExpiryRiskCard({ expiringCount, capitalAtRisk }) {
  return (
    <div className="stat-card expiry">
      <div className="expiry-header">
        <span>⚠️ Expiry Alert Center</span>
        <span className="badge">ACTION REQUIRED</span>
      </div>

      <h2>
        {expiringCount} <small>Items Expiring</small>
      </h2>

      <div className="expiry-footer">
        <span className="risk">{capitalAtRisk} EGP</span>
        <div className="risk-label">
          ⚠️ Requires Attention (Capital at Risk)
        </div>
      </div>
    </div>
  );
}
