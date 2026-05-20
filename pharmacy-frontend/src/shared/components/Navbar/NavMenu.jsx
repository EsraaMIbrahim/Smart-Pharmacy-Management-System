import NavButton from "./NavButton";
import { navigationConfig } from "../config/navigationConfig";

export default function NavMenu({ userRole, view, setView, fetchMyHistory }) {
  const menu = navigationConfig[userRole] || [];

  const handleClick = (item) => {
    setView(item.view);

    if (item.action === "fetchHistory") {
      fetchMyHistory();
    }
  };

  return (
    <div className="nav-menu">
      {menu.map((item) => (
        <NavButton
          key={item.view}
          label={item.label}
          active={view === item.view}
          onClick={() => handleClick(item)}
          variant={userRole === "Client" ? "client" : "staff"}
        />
      ))}
    </div>
  );
}
