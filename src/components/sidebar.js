import { useState, useEffect, useMemo } from "react";
import { useLocation, NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import TourOutlinedIcon from "@mui/icons-material/TourOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import BookOnlineOutlinedIcon from "@mui/icons-material/BookOnlineOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import MainHeader from "./MainHeader";
import "../styles/sidebar.css";

const MENU_GROUPS = [
  {
    id: "dashboard",
    type: "single",
    items: [
      {
        path: "/dashboard",
        name: "Dashboard",
        icon: <DashboardIcon fontSize="small" />,
        roles: ["admin"],
      },
      {
        path: "/dashboard-subadmin",
        name: "Dashboard Subadmin",
        icon: <DashboardIcon fontSize="small" />,
        roles: ["admin", "subadmin"],
      },
    ],
  },
  {
    id: "tours",
    name: "Tours",
    icon: <TourOutlinedIcon fontSize="small" />,
    children: [
      {
        path: "/manage-category",
        name: "Category",
        icon: <CategoryOutlinedIcon fontSize="small" />,
        roles: ["admin"],
      },
      {
        path: "/manage-tours",
        name: "Manage Tours",
        icon: <TourOutlinedIcon fontSize="small" />,
        roles: ["admin", "subadmin"],
      },
      {
        path: "/manage-bookings",
        name: "Manage Bookings",
        icon: <BookOnlineOutlinedIcon fontSize="small" />,
        roles: ["admin"],
      },
      {
        path: "/manage-block-dates",
        name: "Block Whole Day",
        icon: <CalendarTodayIcon fontSize="small" />,
        roles: ["admin"],
      },
      {
        path: "/manage-block-times",
        name: "Block Specific Time",
        icon: <AccessTimeIcon fontSize="small" />,
        roles: ["admin"],
      },
      {
        path: "/offers",
        name: "Manage Coupons",
        icon: <LocalOfferIcon fontSize="small" />,
        roles: ["admin"],
      },
    ],
  },
  {
    id: "content",
    name: "Content",
    icon: <ArticleOutlinedIcon fontSize="small" />,
    children: [
      {
        path: "/manage-blogs",
        name: "Manage Blogs",
        icon: <ArticleOutlinedIcon fontSize="small" />,
        roles: ["admin", "subadmin"],
      },
      {
        path: "/manage-authors",
        name: "Manage Authors",
        icon: <PersonOutlineIcon fontSize="small" />,
        roles: ["admin", "subadmin"],
      },
      {
        path: "/manage-events",
        name: "Manage Events",
        icon: <EventOutlinedIcon fontSize="small" />,
        roles: ["admin", "subadmin"],
      },
      {
        path: "/manage-itineraries",
        name: "Manage Itineraries",
        icon: <MapOutlinedIcon fontSize="small" />,
        roles: ["admin", "subadmin"],
      },
      {
        path: "/manage-itinerary-details",
        name: "Itinerary Details",
        icon: <ArticleOutlinedIcon fontSize="small" />,
        roles: ["admin", "subadmin"],
      },
      {
        path: "/manage-testimonials",
        name: "Manage Testimonials",
        icon: <RateReviewOutlinedIcon fontSize="small" />,
        roles: ["admin", "subadmin"],
      },
      {
        path: "/manage-faqs",
        name: "Manage FAQs",
        icon: <QuizOutlinedIcon fontSize="small" />,
        roles: ["admin", "subadmin"],
      },
    ],
  },
  {
    id: "users",
    name: "Users & Support",
    icon: <SupportAgentOutlinedIcon fontSize="small" />,
    children: [
      {
        path: "/manage-contact-queries",
        name: "Contact Queries",
        icon: <FormatQuoteIcon fontSize="small" />,
        roles: ["admin"],
      },
      {
        path: "/manage-users",
        name: "Manage Users",
        icon: <PersonOutlineIcon fontSize="small" />,
        roles: ["admin"],
      },
    ],
  },
];

function filterByRole(items, role) {
  return items.filter((item) => item.roles.includes(role));
}

const RELATED_PATHS = {
  "/manage-category": ["/add-category", "/edit-category", "/manage-cars", "/add-cars", "/edit-car"],
  "/manage-tours": ["/add-tours", "/edit-tour", "/manage-gallery", "/add-gallery", "/edit-gallery"],
  "/manage-bookings": ["/manage-booking"],
  "/manage-block-dates": ["/add-block-date", "/edit-block-date"],
  "/manage-block-times": ["/add-block-time", "/edit-block-time"],
  "/offers": ["/add-offers", "/edit-coupon"],
  "/manage-blogs": ["/add-blogs", "/edit-blog", "/manage-meta", "/add-meta", "/edit-meta", "/manage-blog-faq", "/add-blog-faq", "/edit-blog-faq"],
  "/manage-authors": ["/add-author", "/edit-author"],
  "/manage-events": ["/add-events", "/edit-event"],
  "/manage-itineraries": ["/add-itinerary", "/edit-itinerary", "/add-itinerary-detail", "/manage-itinerary-meta", "/add-itinerary-meta", "/edit-itinerary-meta"],
  "/manage-itinerary-details": ["/add-itinerary-detail"],
  "/manage-testimonials": ["/add-testimonials", "/edit-testimonials"],
  "/manage-faqs": ["/add-faqs", "/edit-faqs"],
  "/manage-users": ["/add-users", "/edit-user"],
};

function isMenuPathActive(menuPath, currentPath) {
  if (currentPath === menuPath || currentPath.startsWith(`${menuPath}/`)) {
    return true;
  }

  return (RELATED_PATHS[menuPath] || []).some(
    (prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`)
  );
}

function Sidebar({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [openGroupId, setOpenGroupId] = useState(null);
  const location = useLocation();

  const role =
    sessionStorage.getItem("role") || localStorage.getItem("role") || "admin";

  const menuGroups = useMemo(() => {
    return MENU_GROUPS.map((group) => {
      if (group.type === "single") {
        const items = filterByRole(group.items, role);
        return items.length ? { ...group, items } : null;
      }

      const children = filterByRole(group.children, role);
      return children.length ? { ...group, children } : null;
    }).filter(Boolean);
  }, [role]);

  useEffect(() => {
    const activeGroup = menuGroups.find(
      (group) =>
        group.type !== "single" &&
        group.children?.some((child) =>
          isMenuPathActive(child.path, location.pathname)
        )
    );

    if (activeGroup) {
      setOpenGroupId(activeGroup.id);
    }
  }, [location.pathname, menuGroups]);

  const toggle = () => setIsOpen((prev) => !prev);

  const toggleGroup = (groupId) => {
    if (!isOpen) {
      setIsOpen(true);
      setOpenGroupId(groupId);
      return;
    }
    setOpenGroupId((prev) => (prev === groupId ? null : groupId));
  };

  const navLinkClass = ({ isActive }) =>
    `sidebar-link${isActive ? " sidebar-link--active" : ""}`;

  const isGroupActive = (group) =>
    group.children?.some((child) =>
      isMenuPathActive(child.path, location.pathname)
    );

  return (
    <div className="sidebar-layout">
      <aside className={`sidebar-panel${isOpen ? " sidebar-panel--open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            {isOpen && (
              <>
                <span className="sidebar-brand__mark">PCT</span>
                <div className="sidebar-brand__text">
                  {/* <span className="sidebar-brand__title">Philly City Tours</span> */}
                  <span className="sidebar-brand__subtitle">Admin Panel</span>
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={toggle}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuGroups.map((group) => {
            if (group.type === "single") {
              return group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={navLinkClass}
                  title={item.name}
                >
                  <span className="sidebar-link__icon">{item.icon}</span>
                  {isOpen && (
                    <span className="sidebar-link__text">{item.name}</span>
                  )}
                </NavLink>
              ));
            }

            const isExpanded = openGroupId === group.id;
            const groupActive = isGroupActive(group);

            return (
              <div
                key={group.id}
                className={`sidebar-group${groupActive ? " sidebar-group--active" : ""}`}
              >
                <button
                  type="button"
                  className={`sidebar-group__header${isExpanded ? " sidebar-group__header--open" : ""}`}
                  onClick={() => toggleGroup(group.id)}
                  title={group.name}
                >
                  <span className="sidebar-link__icon">{group.icon}</span>
                  {isOpen && (
                    <>
                      <span className="sidebar-link__text">{group.name}</span>
                      <ExpandMoreIcon
                        className={`sidebar-group__chevron${isExpanded ? " sidebar-group__chevron--open" : ""}`}
                        fontSize="small"
                      />
                    </>
                  )}
                </button>

                <div
                  className={`sidebar-group__items${isExpanded && isOpen ? " sidebar-group__items--open" : ""}`}
                  style={{
                    "--item-count": group.children.length,
                  }}
                >
                  {group.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={() =>
                        `sidebar-link sidebar-link--nested${
                          isMenuPathActive(child.path, location.pathname)
                            ? " sidebar-link--active"
                            : ""
                        }`
                      }
                      title={child.name}
                    >
                      <span className="sidebar-link__icon">{child.icon}</span>
                      {isOpen && (
                        <span className="sidebar-link__text">{child.name}</span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="sidebar-main">
        <MainHeader />
        <div className="sidebar-main__content">{children}</div>
      </main>
    </div>
  );
}

export default Sidebar;
