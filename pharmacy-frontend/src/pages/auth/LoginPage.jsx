import { useState } from "react";

import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import { loginUser } from "../../services/auth";

import AuthLayout from "../../app/layouts/AuthLayout";

import "./auth.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",

    passwordHash: "",

    role: "Client",
  });

  const [error, setError] = useState("");

  // ============================================
  // HANDLE CHANGE
  // ============================================

  const handleChange = (field) => (e) => {
    setForm({
      ...form,

      [field]: e.target.value,
    });
  };

  // ============================================
  // HANDLE LOGIN
  // ============================================

  const handleLogin = async () => {
    try {
      setError("");

      const data = await loginUser(form);

      login(data);

      // ============================================
      // REDIRECT BASED ON ROLE
      // ============================================

      if (data.role === "Client") {
        navigate("/store");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <h2>Welcome Back</h2>

        <p>Login to Smart Pharmacy</p>

        {error && <div className="auth-error">{error}</div>}

        <input
          placeholder="Username"
          value={form.username}
          onChange={handleChange("username")}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.passwordHash}
          onChange={handleChange("passwordHash")}
        />

        {/* ============================================
            ROLE
        ============================================ */}

        <select value={form.role} onChange={handleChange("role")}>
          <option value="Client">Client</option>

          <option value="Pharmacist">Pharmacist</option>

          <option value="Admin">Admin</option>
        </select>

        <button onClick={handleLogin}>Login</button>

        <span>
          No account? <Link to="/register">Register</Link>
        </span>
      </div>
    </AuthLayout>
  );
}
