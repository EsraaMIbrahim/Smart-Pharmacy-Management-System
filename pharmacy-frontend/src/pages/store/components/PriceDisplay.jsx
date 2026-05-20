export default function PriceDisplay({ basePrice, price }) {
  return (
    <div className="price-box">
      {basePrice > price && (
        <span className="old-price">{basePrice.toFixed(2)} EGP</span>
      )}

      <span className="new-price">
        {price.toFixed(2)} <small>EGP</small>
      </span>
    </div>
  );
}
