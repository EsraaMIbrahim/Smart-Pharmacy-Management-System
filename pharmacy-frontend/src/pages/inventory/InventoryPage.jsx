import SafetyActions from "../../shared/components/SafteyActions/SafetyActions";
import MedicineForm from "./components/MedicineForm";
import AlternativeMatcher from "../../shared/components/Alternatives/AlternativeMatcher";
import InteractionGuard from "../../shared/components/InteractionGuard/InteractionGuard";
import Search from "../../shared/components/Search/Search";
import BarcodeScanner from "./components/BarcodeScanner/BarcodeScanner";
import Cart from "../../shared/components/Cart/Cart";
import MedicineTable from "./components/MedicineTable";
import { useBarcodeScanner } from "./hooks/useBarcodeScanner";
// import { useInventoryStats } from "./hooks/useInventoryStats";
import "./styles/inventoryPage.css";

export default function InventoryPage(props) {
  const {
    medicines,
    salesCountMap,
    TRENDING_THRESHOLD,
    getSmartDiscount,
    disableExpiredMedicines,
    formData,
    setFormData,
    isEditing,
    addMedicine,
    updateMedicine,
    findAlternatives,
    checkSafety,
    setSearchTerm,
    handlePrint,
    cart,
    removeFromCart,
    handleCheckout,
    filteredMedicines,
    addToCart,
    handleEditClick,
  } = props;

  const { barcodeInput, setBarcodeInput, handleBarcodeKeyDown } =
    useBarcodeScanner({
      medicines,
      addToCart,
    });

  return (
    <>
      <article className="page_header no-print">
        <h1 className="page_title">Inventory Management</h1>
      </article>

      <div className="app_container">
        <MedicineForm
          formData={formData}
          setFormData={setFormData}
          isEditing={isEditing}
          addMedicine={addMedicine}
          updateMedicine={updateMedicine}
        />

        <InteractionGuard checkSafety={checkSafety} />

        <div className="alternatives-and-search">
          <Search onSearchChange={setSearchTerm} handlePrint={handlePrint} />
          <AlternativeMatcher findAlternatives={findAlternatives} />
        </div>

        <Cart
          cart={cart}
          removeFromCart={removeFromCart}
          handleCheckout={handleCheckout}
        />

        <div className="print-section">
          <h1>Pharmacy Inventory Report</h1>
          <MedicineTable
            medicines={filteredMedicines}
            getSmartDiscount={getSmartDiscount}
            addToCart={addToCart}
            handleEditClick={handleEditClick}
          />
        </div>
      </div>
    </>
  );
}
