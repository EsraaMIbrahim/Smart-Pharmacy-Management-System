import React, { useState } from 'react';
import { pharmacyApi } from '../services/apiService';

function Login({
    setIsLoggedIn,
    setUserRole,
    setCurrentUserId,
    setView,
    setLoginCredentials
}) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [credentials, setCredentials] = useState({
        username: '',
        passwordHash: '',
        role: 'Staff',
        fullName: '',
        phoneNumber: ''
    });
    const handleRegister = async () => {
        try {
            // 1. We use the pharmacyApi service
            const response = await pharmacyApi.register({
                Username: credentials.username,       
                PasswordHash: credentials.passwordHash,
                FullName: credentials.fullName,
                PhoneNumber: credentials.phoneNumber,
                Role: 'Client'
            });

            console.log("Server Response:", response.data);

            alert(`✅ Registration Successful for ${response.data.username || credentials.username}! You can now login.`);

            setIsRegistering(false); 
        } catch (error) {
            const message = error.response?.data?.message || "Username or Phone might already exist.";
            alert(`❌ Registration Failed: ${message}`);
        }
    };
    const handleLogin = async (e) => {
        if (e) e.preventDefault(); 
        console.log("Sending to C#:", credentials);
        try {
            const response = await pharmacyApi.login({
                Username: credentials.username,
                PasswordHash: credentials.passwordHash,
                Role: credentials.role || 'Staff'
            });

            // 1. Capture Data from C# Response
            const { id, role, username, fullname, phone } = response.data;

            // 2. Sync Global State (These come from props)
            setUserRole(role);
            setIsLoggedIn(true);
            setCurrentUserId(id);
            if (setLoginCredentials) {
                setLoginCredentials(prev => ({ ...prev, username: username }));
            }

            // 3. Persistent Storage
            localStorage.setItem('savedUserId', id);
            localStorage.setItem('savedUserRole', role);
            localStorage.setItem('savedUsername', username);
            localStorage.setItem('savedPhone', phone);
            localStorage.setItem('savedFullName', fullname);

            // 4. Navigation/Routing
            setView(role === 'Client' ? 'client_store' : 'inventory');
            alert(`Welcome back, ${username}!`);

        } catch (error) {
            const msg = error.response?.data?.message || "Login Failed";
            alert(`❌ ${msg}`);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '380px', textAlign: 'center' }}>
                <h2 style={{ color: '#28a745', marginBottom: '20px' }}>
                    {isRegistering ? "📝 Client Registration" : "✚ Smart Pharmacy Login"}
                </h2>

                <input
                    placeholder="Username"
                    style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd', color: 'black' }}
                    onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                />

                <input
                    type="password"
                    placeholder="Password"
                    style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd', color: 'black' }}
                    onChange={e => setCredentials({ ...credentials, passwordHash: e.target.value })}
                />

                {isRegistering && (
                    <>
                        <input
                            placeholder="Full Name"
                            value={credentials.fullName}
                            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd', color: 'black' }}
                            onChange={e => setCredentials({ ...credentials, fullName: e.target.value })}
                        />
                        <input
                            placeholder="Phone Number"
                            value={credentials.phoneNumber}
                            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd', color: 'black' }}
                            onChange={e => setCredentials({ ...credentials, phoneNumber: e.target.value })}
                        />
                    </>
                )}

                {!isRegistering && (
                    <select
                        style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ddd', backgroundColor: 'white', color: 'black' }}
                        value={credentials.role}
                        onChange={e => setCredentials({ ...credentials, role: e.target.value })}
                    >
                        <option value="Admin">🛡️ Admin</option>
                        <option value="Pharmacist">💊 Pharmacist</option>
                        <option value="Staff">👤 Staff</option>
                        <option value="Client">🛒 Client (Public)</option>
                    </select>
                )}

                <button
                    onClick={isRegistering ? handleRegister : handleLogin}
                    style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {isRegistering ? "Create Client Account" : "Enter Pharmacy System"}
                </button>

                <p
                    onClick={() => setIsRegistering(!isRegistering)}
                    style={{ marginTop: '15px', fontSize: '13px', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    {isRegistering ? "Already have an account? Login here" : "New Customer? Register as a Client"}
                </p>
            </div>
        </div>
    );
}

export default Login;