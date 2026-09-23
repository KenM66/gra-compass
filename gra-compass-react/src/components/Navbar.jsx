import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ setIsAuthenticated }) => {
  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        GRA Compass
      </Link>

      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/settings">Settings</Link>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
