import AuthForm from "./AuthForm";

export default function AuthContainer(props) {
  return (
    <div className="auth-container">
      <AuthForm {...props} />
    </div>
  );
}
