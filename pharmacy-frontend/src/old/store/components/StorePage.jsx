import ClientHeader from "./ClientHeader";
import PurchasingAssist from "../../purchasingAssist/components/PurchasingAssist";
import ProductGrid from "./ProductGrid";
import OrdersPage from "../../orders/components/OrdersPage";
import CheckoutPage from "../../checkout/components/CheckoutPage";
import SuccessMessage from "../../orders/components/SuccessMessage";

export default function StorePage(props) {
  const {
    checkoutStep,
    setCheckoutStep,
    view,
    setView,
    isOrderPlaced,
    deliveryInfo,
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
    setDeliveryInfo,
    handleCheckout,
  } = props;

  return (
    <div className="store-page">
      {/* SUCCESS MESSAGE */}
      <SuccessMessage
        isVisible={isOrderPlaced}
        deliveryInfo={deliveryInfo}
        onClose={() => props.setIsOrderPlaced(false)}
      />

      {/* 🛍️ SHOP VIEW */}
      {checkoutStep === "shop" && view === "client_store" && (
        <>
          <ClientHeader setSearchTerm={setSearchTerm} />

          <PurchasingAssist
            findAlternatives={findAlternatives}
            checkSafety={checkSafety}
          />

          <ProductGrid
            medicines={filteredMedicines}
            addToCart={addToCart}
            onCheckoutRedirect={() => setCheckoutStep("cart")}
            salesCountMap={salesCountMap}
            TRENDING_THRESHOLD={TRENDING_THRESHOLD}
          />
        </>
      )}

      {/* 📦 ORDERS */}
      {view === "my_orders" && (
        <OrdersPage
          myOrders={myOrders}
          onBack={() => setView("client_store")}
        />
      )}

      {/* 💳 CHECKOUT */}
      {checkoutStep === "cart" && (
        <CheckoutPage
          cart={cart}
          removeFromCart={removeFromCart}
          deliveryInfo={deliveryInfo}
          setDeliveryInfo={setDeliveryInfo}
          handleCheckout={handleCheckout}
          onBack={() => setCheckoutStep("shop")}
        />
      )}
    </div>
  );
}
