import "./layouts.css";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-overlay">{children}</div>
    </div>
  );
}
