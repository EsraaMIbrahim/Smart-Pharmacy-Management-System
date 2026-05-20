import InputField from "./InputField";
import RoleSelect from "./RoleSelect";

export default function AuthForm({
  isRegistering,
  setIsRegistering,
  loginCredentials,
  setLoginCredentials,
  handleLogin,
  handleRegister,
}) {
  const handleChange = (field) => (e) => {
    setLoginCredentials({
      ...loginCredentials,
      [field]: e.target.value,
    });
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">
        {isRegistering ? "📝 Client Registration" : "✚ Smart Pharmacy Login"}
      </h2>

      <InputField placeholder="Username" onChange={handleChange("username")} />

      <InputField
        type="password"
        placeholder="Password"
        onChange={handleChange("passwordHash")}
      />

      {isRegistering && (
        <>
          <InputField
            placeholder="Full Name"
            onChange={handleChange("fullName")}
          />

          <InputField
            placeholder="Phone Number"
            onChange={handleChange("phoneNumber")}
          />
        </>
      )}

      {!isRegistering && (
        <RoleSelect
          value={loginCredentials.role}
          onChange={handleChange("role")}
        />
      )}

      <button
        className="auth-button"
        onClick={isRegistering ? handleRegister : handleLogin}
      >
        {isRegistering ? "Create Client Account" : "Enter Pharmacy System"}
      </button>

      <p
        className="auth-toggle"
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering
          ? "Already have an account? Login here"
          : "New Customer? Register as a Client"}
      </p>
    </div>
  );
}
