import NavMenu from "./NavMenu";
import UserInfo from "./UserInfo";

export default function Navbar(props) {
  return (
    <div className="navbar no-print">
      <NavMenu {...props} />
      <UserInfo userRole={props.userRole} handleLogout={props.handleLogout} />
    </div>
  );
}
