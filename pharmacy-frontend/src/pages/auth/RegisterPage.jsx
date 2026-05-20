import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../../services/auth";

import AuthLayout from "../../app/layouts/AuthLayout";

import "./auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",

    passwordHash: "",

    email: "",

    phoneNumber: "",
  });

  const [message, setMessage] = useState("");

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
  // REGISTER
  // ============================================

  const handleRegister = async () => {
    try {
      setError("");

      const response = await registerUser(form);

      setMessage(response.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <h2>Create Account</h2>

        {message && <div className="auth-success">{message}</div>}

        {error && <div className="auth-error">{error}</div>}

        <input
          placeholder="Username"
          value={form.username}
          onChange={handleChange("username")}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={handleChange("email")}
        />

        <input
          placeholder="Phone Number"
          value={form.phoneNumber}
          onChange={handleChange("phoneNumber")}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.passwordHash}
          onChange={handleChange("passwordHash")}
        />

        <button onClick={handleRegister}>Register</button>

        <span>
          Already have an account? <Link to="/login">Login</Link>
        </span>
      </div>
    </AuthLayout>
  );
}
