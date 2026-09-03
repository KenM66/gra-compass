import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        GRA Compass
      </Link>

      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/settings">Settings</Link>
      </div>
    </nav>
  );
};

export default Navbar;
