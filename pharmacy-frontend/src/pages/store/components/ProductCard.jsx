import DiscountBadge from "./DiscountBadge";
import PriceDisplay from "./PriceDisplay";

export default function ProductCard({
  med,

  addToCart,

  onCheckoutRedirect,

  salesCountMap = {},

  TRENDING_THRESHOLD = 5,
}) {
  const isTrending =
    (salesCountMap?.[med.name?.toLowerCase().trim()] || 0) >=
    TRENDING_THRESHOLD;

  const handleAdd = () => {
    addToCart(med);

    const confirm = window.confirm(`✅ ${med.name} added! Go to checkout now?`);

    if (confirm) {
      onCheckoutRedirect();
    }
  };

  return (
    <div className="product-card">
      <DiscountBadge basePrice={med.basePrice} price={med.price} />

      <div className="product-icon">💊</div>

      <h3 className="product-title">
        {med.name}
        {isTrending && <span> 🔥</span>}
      </h3>

      <p className="product-category">{med.category}</p>

      <PriceDisplay basePrice={med.basePrice} price={med.price} />

      <button className="product-btn" onClick={handleAdd}>
        🛒 Add to Order
      </button>
    </div>
  );
}
