import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Shield, UserCog, MapPin } from "lucide-react";
import "../styles/main-header.css";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/dashboard-subadmin": "Dashboard",
  "/manage-category": "Manage Categories",
  "/add-category": "Add Category",
  "/manage-cars": "Manage Cars",
  "/manage-tours": "Manage Tours",
  "/add-tours": "Add Tour",
  "/manage-bookings": "Manage Bookings",
  "/manage-block-dates": "Block Whole Day",
  "/manage-block-times": "Block Specific Time",
  "/offers": "Manage Coupons",
  "/manage-blogs": "Manage Blogs",
  "/manage-events": "Manage Events",
  "/manage-testimonials": "Manage Testimonials",
  "/manage-faqs": "Manage FAQs",
  "/manage-contact-queries": "Contact Queries",
  "/manage-users": "Manage Users",
};

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  const match = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname.startsWith(`${path}/`)
  );
  if (match) return match[1];

  if (pathname.includes("/edit-")) return "Edit";
  if (pathname.includes("/add-")) return "Add New";

  return "Admin Panel";
}

function formatRole(role) {
  if (role === "admin") return "Administrator";
  if (role === "subadmin") return "Sub Admin";
  return role || "User";
}

function MainHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const role =
    sessionStorage.getItem("role") || localStorage.getItem("role") || "admin";
  const username =
    sessionStorage.getItem("username") ||
    localStorage.getItem("username") ||
    "Admin User";

  const pageTitle = useMemo(
    () => getPageTitle(location.pathname),
    [location.pathname]
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("username");
    navigate("/");
  };

  const RoleIcon = role === "admin" ? Shield : UserCog;

  return (
    <header className="main-header">
      <div className="main-header__brand">
        {/* <span className="main-header__mark">PCT</span> */}
        <div className="main-header__brand-text">
          <h1 className="main-header__title">Philly City Tours</h1>
          <p className="main-header__subtitle">
            <MapPin size={12} />
            Admin Panel · {pageTitle}
          </p>
        </div>
      </div>

      <div className="main-header__actions">
        <div className="main-header__user">
          <span className="main-header__avatar">
            {username.charAt(0).toUpperCase()}
          </span>
          <div className="main-header__user-info">
            <span className="main-header__username">{username}</span>
            <span className={`main-header__role main-header__role--${role}`}>
              <RoleIcon size={12} />
              {formatRole(role)}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="main-header__logout"
          onClick={handleLogout}
          title="Log out"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </header>
  );
}

export default MainHeader;
