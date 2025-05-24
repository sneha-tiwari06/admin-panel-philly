import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ImageIcon from "@mui/icons-material/Image";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MenuIcon from "@mui/icons-material/Menu";
import Star from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import CategoryIcon from "@mui/icons-material/Category";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BlockIcon from '@mui/icons-material/Block';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTime from '@mui/icons-material/AccessTime';
import Offers from "./coupon/listCoupon";
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
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
      name: "Category",
      icon: <ImageIcon />,
      submenu: [
        { path: "/manage-category", name: "Manage Category", icon: <CategoryIcon /> },
      ],
    },
    {
      name: "Manage Tours",
      icon: <ImageIcon />,
      submenu: [
        { path: "/manage-tours", name: "Manage Tours", icon: <CategoryIcon /> },
        { path: "/manage-bookings", name: "Manage Booking", icon: <CategoryIcon /> },
      ],
    },
    {
      name: "Block Tours",
      icon: <BlockIcon />,
      submenu: [
        { path: "/manage-block-dates", name: "Block Whole Day", icon: <CalendarTodayIcon /> },
        { path: "/manage-block-times", name: "Block Specific Time", icon: <AccessTime /> },        
      
      ],
    },
    {
      path: "/offers",
      name: "Manage Coupons",
      icon: <LocalOfferIcon />,
    },
    {
      name: "Manage Others",
      icon: <ImageIcon />,
      submenu: [
        { path: "/manage-blogs", name: "Manage Blogs", icon: <CategoryIcon /> },
        { path: "/manage-events", name: "Manage Events", icon: <CategoryIcon /> },
        { path: "/manage-testimonials", name: "Manage Testimonials", icon: <CategoryIcon /> },
        { path: "/manage-faqs", name: "Manage FAQs", icon: <CategoryIcon /> },
      ],
    },
    {
      name: "Manage Queries",
      icon: <FormatQuoteIcon />,
      submenu: [
        { path: "/manage-contact-queries", name: "Manage Contact Query", icon: <FormatQuoteIcon /> },
      ],
    },
  ];

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
          {menuItem.map((item, index) => {
            if (item.submenu) {
              const isSubmenuOpen = openSubmenu === index;
              return (
                <div key={index}>
                  <div
                    className="link"
                    onClick={() => handleSubmenuToggle(index)}
                    style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div className="icon">{item.icon}</div>
                      {isOpen && <div className="link-text">{item.name}</div>}
                    </div>
                    {isOpen && (
                      <ExpandMoreIcon
                        style={{
                          transition: "transform 0.3s ease",
                          transform: isSubmenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    )}
                  </div>
                  {/* Submenu container with smooth animation */}
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
