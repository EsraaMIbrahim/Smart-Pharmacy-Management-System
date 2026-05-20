import ProductCard from "./ProductCard";
import { useProducts } from "../hooks/useProducts";

export default function ProductGrid(props) {
  const products = useProducts(props.medicines);

  return (
    <div className="product-grid">
      {products.map((med) => (
        <ProductCard key={med.id} med={med} {...props} />
      ))}
    </div>
  );
}
