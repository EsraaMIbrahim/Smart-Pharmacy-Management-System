import React, { useState, useEffect } from 'react';
import './App.css';
import { pharmacyApi } from './services/apiService';
import Login from './pages/Login';
import Navbar from './pages/Navbar';
import Inventory from './pages/Inventory';
import ClientStore from './pages/ClientStore';
import Patients from './pages/Patients';
import Suppliers from './pages/Suppliers';
import InvoiceModal from './pages/InvoiceModal';
import OrderHistory from './pages/OrderHistory';
import Analytics from './pages/Analytics';
import OnlineOrders from './pages/OnlineOrders';
import ClientAppointments from './pages/ClientAppointments';
import AppointmentManagement from './pages/AppointmentManagement';
import MedicineExplainer from './pages/MedicineExplainer';

/**
 * Smart Pharmacy Management System - Core Logic
 * Author: Esraa M. Ibrahim & Team
 */
function App() {
    // ---------------------------------------------------------
    // 1. GLOBAL AUTHENTICATION STATE
    // ---------------------------------------------------------
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({
        id: null,
        role: 'Staff',
        username: ''
    });

    // ---------------------------------------------------------
    // 2. NAVIGATION & UI CONTROL
    // ---------------------------------------------------------
    const [view, setView] = useState('inventory');
    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);

    // ---------------------------------------------------------
    // 3--- SHARED DATA LISTS ---
    // ---------------------------------------------------------
    const [medicines, setMedicines] = useState([]);
    const [patients, setPatients] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [cart, setCart] = useState([]);

    // =========================================================
    // 4. DATA ANALYTICS (GLOBAL INTELLIGENCE)
    // =========================================================
    const [salesHistory, setSalesHistory] = useState([]);

    const salesCountMap = React.useMemo(() => {
        return salesHistory.reduce((map, record) => {
            // 🔗 LOGIC UPDATE: Handles reading backend camelCase serialization names securely
            const name = (record?.medicineName || record?.MedicineName || "").toLowerCase().trim();
            const qty = parseInt(record?.quantity || record?.Quantity || 0, 10);
            if (name) {
                map[name] = (map[name] || 0) + qty;
            }
            return map;
        }, {});
    }, [salesHistory]);

    // =========================================================
    // 5. SESSION MANAGEMENT
    // =========================================================
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser({ id: null, role: 'Staff', username: '' });
        localStorage.clear();
        setView('inventory');
        alert("Session terminated securely.");
    };

    // =========================================================
    // 6. GLOBAL DATA SYNCHRONIZATION (SQL)
    // =========================================================
    const [isLoading, setIsLoading] = useState(false);

    const fetchMedicines = async () => {
        setIsLoading(true);
        try {
            const response = await pharmacyApi.getMedicines();
            setMedicines(response.data || []);
        } catch (error) {
            console.error("Critical: Failed to fetch inventory from SQL.", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSalesHistory = async () => {
        try {
            const response = await pharmacyApi.getSalesHistory();
            setSalesHistory(response.data || []);
        } catch (error) {
            console.error("SQL Sync Error (Sales):", error);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await pharmacyApi.getPatients();
            setPatients(response.data || []);
        } catch (error) {
            console.error("Patient Retrieval Error:", error);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await pharmacyApi.getSuppliers();
            setSuppliers(response.data || []);
        } catch (error) {
            console.error("Supplier Fetch Error", error);
        }
    };

    const addToCart = (medicine) => {
        if (!medicine) return;
        const medId = medicine.id || medicine.Id;
        const medName = medicine.name || medicine.Name;
        const medPrice = Number(medicine.price || medicine.Price || 0);

        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === medId);
            if (existing) {
                return prevCart.map(item =>
                    item.id === medId
                        ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * medPrice }
                        : item
                );
            }
            return [...prevCart, {
                cartId: Date.now(),
                id: medId,
                Id: medId,
                name: medName,
                price: medPrice,
                quantity: 1,
                totalPrice: medPrice
            }];
        });
    };

    const removeFromCart = (cartId) => {
        setCart(cart.filter(item => item.cartId !== cartId));
    };

    const handleCheckout = async (deliveryData) => {
        if (cart.length === 0) return alert("⚠️ Your cart is empty!");

        const activeUserId = user.id ?? parseInt(localStorage.getItem('savedUserId'), 10);

        if (!activeUserId || isNaN(activeUserId)) {
            alert("❌ Session expired. Please log out and log back in.");
            return;
        }

        try {
            const orderPayload = {
                UserId: activeUserId,
                MedicineName: cart.map(item => item.name).join(", "),
                Quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
                TotalPrice: parseFloat(cart.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)),
                ShippingAddress: deliveryData.address || "Zahraa, Cairo",
                PaymentMethod: deliveryData.method || "Cash",
                OrderDate: new Date().toISOString(),
                Status: "Processing"
            };

            console.log("🚀 Sending to SQL:", JSON.stringify(orderPayload));
            const response = await pharmacyApi.createOnlineOrder(orderPayload);

            console.log(response);

            alert("✅ Order Placed Successfully! you will be redirected to payment page soon");

            setCart([]);
            fetchSalesHistory();
            setView('my_orders');

            // Return created order id (attempt common id property names)
            const createdId = response?.data?.id ?? null;
            console.log(createdId);

            localStorage.setItem("lastOnlineOrderItem", createdId);
            return createdId;
        } catch (error) {
            console.error("❌ SQL Handshake Failed:", error.response?.data);
            const serverError = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join(", ")
                : error.response?.data || "Check Server Connection";
            alert("❌ Checkout failed: " + serverError);
        }
        return null;
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchMedicines();
            fetchPatients();
            fetchSuppliers();
            fetchSalesHistory();
        }
    }, [isLoggedIn]);

    // 1. If the user is NOT logged in, show ONLY the Login page
    if (!isLoggedIn) {
        return (
            <Login
                setIsLoggedIn={setIsLoggedIn}
                setUserRole={(role) => setUser(prev => ({ ...prev, role }))}
                setCurrentUserId={(id) => setUser(prev => ({ ...prev, id }))}
                setLoginCredentials={(updater) => setUser(prev => updater(prev))}
                setView={setView}
            />
        );
    }

    // 2. If logged in, show the Main Application
    return (
        <div className="App">
            <Navbar
                userRole={user.role}
                username={user.username}
                setView={setView}
                currentView={view}
                onLogout={handleLogout}
            />

            <header className="App-main-header" style={headerStyle}>
                <div style={brandWrapper}>
                    <div style={logoIcon}>
                        <span style={{ marginTop: '-2px' }}>✚</span>
                    </div>

                    <div style={textWrapper}>
                        <h1 style={mainTitleStyle}>
                            SMART <span style={highlightText}>PHARMACY</span>
                        </h1>
                        <div style={subTitleRow}>
                            <div style={line}></div>
                            <span style={subTitleStyle}>MANAGEMENT SYSTEM</span>
                            <div style={line}></div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="main-content-area">
                {isLoading && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#28a745', fontWeight: 'bold' }}>
                        ⏳ Synchronizing with SQL Server...
                    </div>
                )}

                {!isLoading && view === 'inventory' && (
                    <Inventory
                        userRole={user.role}
                        medicines={medicines}
                        setMedicines={setMedicines}
                        fetchMedicines={fetchMedicines}
                        salesCountMap={salesCountMap}
                        currentUserId={user.id}
                        loginCredentials={user}
                        setView={setView}
                        cart={cart}
                        setCart={setCart}
                        isOrderPlaced={isOrderPlaced}
                        setIsOrderPlaced={setIsOrderPlaced}
                        currentInvoice={currentInvoice}
                        setCurrentInvoice={setCurrentInvoice}
                        fetchPatients={fetchPatients}
                        fetchMyHistory={fetchSalesHistory}
                    />
                )}

                {view === 'patients' && (
                    <Patients
                        patients={patients}
                        refreshPatients={fetchPatients}
                        userRole={user.role}
                    />
                )}

                {!isLoading && view === 'suppliers' && (
                    <Suppliers
                        userRole={user.role}
                        suppliers={suppliers}
                        medicines={medicines}
                        refreshSuppliers={fetchSuppliers}
                        refreshMedicines={fetchMedicines}
                    />
                )}

                {view === 'client_store' && (
                    <ClientStore
                        medicines={medicines || []}
                        cart={cart}
                        addToCart={addToCart}
                        removeFromCart={removeFromCart}
                        handleCheckout={handleCheckout}
                        userId={user.id}
                        salesCountMap={salesCountMap}
                        TRENDING_THRESHOLD={5}
                        setView={setView}
                    />
                )}

                {view === 'analytics' && (
                    <Analytics setView={setView} medicines={medicines} />
                )}

                {/* 📋 All orders (not for clients) */}
                {view === 'online_orders' && (
                    <OnlineOrders 
                        setView={setView} 
                    />
                )}

                {view === 'my_orders' && (
                    <OrderHistory
                        userId={user.id}
                        setView={setView}
                    />
                )}
                {view === 'consultations' && user.role === 'Client' && <ClientAppointments userId={user.id} />}
                {view === 'consultation_management' && (user.role === 'Admin' || user.role === 'Pharmacist') && <AppointmentManagement userId={user.id} userRole={user.role} />}
                {view === 'ai_explainer' && <MedicineExplainer userId={user.id} />}
            </main>

            {currentInvoice && (
                <InvoiceModal
                    invoice={currentInvoice}
                    onClose={() => setCurrentInvoice(null)}
                />
            )}
        </div>
    );
}

// ---  STYLES ---
const headerStyle = {
    padding: '60px 0 40px 0',
    background: 'linear-gradient(180deg, #f8faf9 0%, #ffffff 100%)',
    textAlign: 'center',
};

const brandWrapper = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '20px',
    textAlign: 'left'
};

const logoIcon = {
    width: '70px',
    height: '70px',
    backgroundColor: '#28a745',
    color: 'white',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    boxShadow: '0 10px 20px rgba(40, 167, 69, 0.2)',
    background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)'
};

const textWrapper = {
    display: 'flex',
    flexDirection: 'column'
};

const mainTitleStyle = {
    fontSize: '52px',
    margin: 0,
    fontWeight: '900',
    letterSpacing: '-1.5px',
    color: '#1a1a1a',
    lineHeight: '1',
    fontFamily: "'Inter', sans-serif"
};

const highlightText = {
    color: '#28a745',
    background: 'linear-gradient(to bottom, #28a745, #1e7e34)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
};

const subTitleRow = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginTop: '8px'
};

const subTitleStyle = {
    fontSize: '18px',
    fontWeight: '800',
    color: '#495057',
    letterSpacing: '4px',
    textTransform: 'uppercase'
};

const line = {
    flex: 1,
    height: '3px',
    backgroundColor: '#adb5bd',
    minWidth: '20px',
    borderRadius: '2px'
};

export default App;
