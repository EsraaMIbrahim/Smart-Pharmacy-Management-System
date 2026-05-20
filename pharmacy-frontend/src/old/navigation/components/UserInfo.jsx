export default function UserInfo({ userRole, handleLogout }) {
  return (
    <div className="user-info">
      <span className="user-label">Logged in as:</span>
      <span className="user-role">{userRole}</span>

      <button className="logout-button" onClick={handleLogout}>
        Logout / Change User
      </button>
    </div>
  );
}
