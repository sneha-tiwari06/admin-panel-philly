import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ImageIcon from "@mui/icons-material/Image";
import MenuIcon from "@mui/icons-material/Menu";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CategoryIcon from "@mui/icons-material/Category";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTime from "@mui/icons-material/AccessTime";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
function Sidebar({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  // Track which submenu is open (if any)
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggle = () => setIsOpen(!isOpen);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const menuItem = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <DashboardIcon />,
    },
    {
      path: "/dashboard-subadmin",
      name: "Dashboard Subadmin",
      icon: <DashboardIcon />,
    },
    {
      path: "/manage-category",
      name: "Category",
      icon: <ImageIcon />,
    },
    {
      path: "/manage-tours",
      name: "Manage Tours",
      icon: <CategoryIcon />,
    },   
    {
      path: "/manage-bookings",
      name: "Manage Bookings",
      icon: <CategoryIcon />,
    },
    {
      path: "/manage-block-dates",
      name: "Block Whole Day",
      icon: <CalendarTodayIcon />,
    },
    {
      path: "/manage-block-times",
      name: "Block Specific Time",
      icon: <AccessTime />,
    },
    {
      path: "/offers",
      name: "Manage Coupons",
      icon: <LocalOfferIcon />,
    },
    {
      path: "/manage-blogs",
      name: "Manage Blogs",
      icon: <CategoryIcon />,
    },
    {
      path: "/manage-events",
      name: "Manage Events",
      icon: <CategoryIcon />,
    },
    {
      path: "/manage-testimonials",
      name: "Manage Testimonials",
      icon: <CategoryIcon />,
    },
    { path: "/manage-faqs", name: "Manage FAQs", icon: <CategoryIcon /> },
    {
      path: "/manage-contact-queries",
      name: "Manage Contact Query",
      icon: <FormatQuoteIcon />,
    },
    { path: "/manage-users", name: "Manage Users", icon: <PersonOutlineIcon /> },

  ];

  // Get role from sessionStorage or localStorage
  const role =
    sessionStorage.getItem("role") || localStorage.getItem("role");

  // Define allowed menu names for subadmin
  const subadminAllowed = [
    "Dashboard Subadmin",
    "Manage Tours",
    "Manage Blogs",
    "Manage Testimonials",
    "Manage FAQs",
    "Manage Events",
  ];

  // Filter menu items if role is subadmin
  const filteredMenuItem =
    role === "subadmin"
      ? menuItem.filter((item) => subadminAllowed.includes(item.name))
      : menuItem;

  const handleSubmenuToggle = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  return (
    <div className="sidebar-side">
      <div style={{ width: isOpen ? "300px" : "50px" }} className="sidebar">
        <div className="top-section">
          {isOpen && <h4 className="logo">Philly City Tours</h4>}
          <div style={{ marginLeft: isOpen ? "50px" : "0px" }} className="bars">
            <MenuIcon onClick={toggle} />
          </div>
        </div>
        {filteredMenuItem.map((item, index) => {
          if (item.submenu) {
            const isSubmenuOpen = openSubmenu === index;
            return (
              <div key={index}>
                <div
                  className="link"
                  onClick={() => handleSubmenuToggle(index)}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div className="icon">{item.icon}</div>
                    {isOpen && <div className="link-text">{item.name}</div>}
                  </div>
                  {isOpen && (
                    <ExpandMoreIcon
                      style={{
                        transition: "transform 0.3s ease",
                        transform: isSubmenuOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  )}
                </div>
                <div
                  className={`submenu ${isSubmenuOpen ? "open" : ""}`}
                  style={{
                    maxHeight: isSubmenuOpen ? "200px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease-in-out",
                  }}
                >
                  {item.submenu.map((sub, subIndex) => (
                    <NavLink
                      to={sub.path}
                      key={subIndex}
                      className="link submenu-item"
                      activeclassname="active"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: "40px",
                        fontSize: "0.85rem",
                      }}
                    >
                      <div className="icon">{sub.icon}</div>
                      {isOpen && <div className="link-text">{sub.name}</div>}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          } else {
            return (
              <NavLink
                to={item.path}
                key={index}
                className="link"
                activeclassname="active"
              >
                <div className="icon">{item.icon}</div>
                {isOpen && <div className="link-text">{item.name}</div>}
              </NavLink>
            );
          }
        })}
        <div className="w-auto log-out-btn">
          <button className="button-save" onClick={handleLogout}>
            {isOpen ? "Log Out" : <ExitToAppIcon />}
          </button>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}

export default Sidebar;
