// import CheckoutPage from "../checkout/components/CheckoutPage";
import SuccessMessage from "../store/components/SuccessMessage";
import ClientHeader from "../store/components/ClientHeader";
import AlternativeMatcher from "../../shared/components/Alternatives/AlternativeMatcher";
import ProductGrid from "./components/ProductGrid";
import OrdersPage from "./components/OrdersPage/OrdersPage";
import "./styles/store.css";
import InteractionGuard from "../../shared/components/InteractionGuard/InteractionGuard";

export default function StorePage(props) {
  const {
    view,
    setView,
    checkoutStep,
    setCheckoutStep,

    isOrderPlaced,
    setIsOrderPlaced,

    deliveryInfo,
    setDeliveryInfo,

    setSearchTerm,
    findAlternatives,
    checkSafety,

    filteredMedicines,
    addToCart,

    salesCountMap,
    TRENDING_THRESHOLD,

    myOrders,

    cart,
    removeFromCart,
    handleCheckout,
  } = props;

  return (
    <div className="store-page">
      {/* SHOP */}
      <ClientHeader setSearchTerm={setSearchTerm} />
      <InteractionGuard checkSafety={checkSafety} />
      <AlternativeMatcher findAlternatives={findAlternatives} />
      <ProductGrid
        medicines={filteredMedicines}
        addToCart={addToCart}
        onCheckoutRedirect={() => setCheckoutStep("cart")}
        salesCountMap={salesCountMap}
        TRENDING_THRESHOLD={TRENDING_THRESHOLD}
      />

      {/* ORDERS */}
      {/* <OrdersPage myOrders={myOrders} onBack={() => setView("client_store")} /> */}
    </div>
  );
}
