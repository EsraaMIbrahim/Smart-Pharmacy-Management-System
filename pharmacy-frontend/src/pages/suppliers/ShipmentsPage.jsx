import ShipmentForm from "./components/ShipmentForm";

import SupplyHistory from "./components/SupplyHistory";

import "./styles/suppliers.css";

export default function ShipmentsPage(props) {
  const {
    suppliers,

    medicines,

    purchaseHistory,

    order,

    setOrder,

    submitShipment,
  } = props;

  return (
    <>
      <article className="page_header no-print">
        <h1 className="page_title">Shipment Management</h1>
      </article>

      <div className="suppliers-page">
        <ShipmentForm
          order={order}
          setOrder={setOrder}
          medicines={medicines}
          suppliers={suppliers}
          onSubmit={submitShipment}
        />

        <SupplyHistory history={purchaseHistory} />
      </div>
    </>
  );
}
