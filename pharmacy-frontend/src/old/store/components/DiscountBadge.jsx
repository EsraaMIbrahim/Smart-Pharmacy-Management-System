export default function DiscountBadge({ basePrice, price }) {
  if (basePrice <= price) return null;

  const discount = ((basePrice - price) / basePrice) * 100;

  return <div className="discount-badge">SAVE {discount.toFixed(0)}%</div>;
}
