import React, { useState } from "react";
import "../styles/LayoutStyles.css";
import { message, Badge, Drawer } from "antd";
import { adminMenu, userMenu } from "../Data/Data";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MenuOutlined, BellOutlined, LogoutOutlined } from "@ant-design/icons";

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout Successfully");
    navigate("/login");
  };

  const doctorMenu = [
    {
      name: "Dashboard",
      path: "/doctor/dashboard",
      icon: "fa-solid fa-house",
    },
    {
      name: "Appointments",
      path: "/doctor-appointments",
      icon: "fa-solid fa-list",
    },
    {
      name: "Availability",
      path: "/doctor/availability",
      icon: "fa-solid fa-calendar-days",
    },
    {
      name: "Health Plans",
      path: "/doctor/health-plans",
      icon: "fa-solid fa-heartbeat",
    },
    {
      name: "Patient Monitoring",
      path: "/doctor/patient-monitoring",
      icon: "fa-solid fa-chart-line",
    },
    {
      name: "Profile",
      path: `/doctor/profile/${user?._id}`,
      icon: "fa-solid fa-user",
    },
  ];

  const SidebarMenu = user?.isAdmin
    ? adminMenu
    : user?.isDoctor
      ? doctorMenu
      : userMenu;

  return (
    <div className="main">
      <div className="layout">
        {/* Desktop Sidebar */}
        <nav className="sidebar desktop-sidebar">
          <div className="logo">
            <h6>💚 CARE CONNECT</h6>
            <hr />
          </div>
          <div className="menu">
            {SidebarMenu.map((menu) => {
              const isActive = location.pathname === menu.path;
              return (
                <div
                  key={menu.path}
                  className={`menu-items ${isActive ? "active" : ""}`}
                >
                  <i className={menu.icon}></i>
                  <Link to={menu.path}>{menu.name}</Link>
                </div>
              );
            })}
            <div className="menu-items logout-item" onClick={handleLogout}>
              <LogoutOutlined
                style={{
                  fontSize: "18px",
                  marginRight: "12px",
                  color: "#60a5fa",
                }}
              />
              <Link to="/login">Logout</Link>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Drawer */}
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          bodyStyle={{ padding: "0" }}
          headerStyle={{ borderBottom: "1px solid #e5e7eb" }}
        >
          <div className="mobile-menu-drawer">
            {SidebarMenu.map((menu) => {
              const isActive = location.pathname === menu.path;
              return (
                <div
                  key={menu.path}
                  className={`mobile-menu-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    navigate(menu.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  <i className={menu.icon}></i>
                  <span>{menu.name}</span>
                </div>
              );
            })}
            <div
              className="mobile-menu-item logout"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
            >
              <LogoutOutlined style={{ fontSize: "18px" }} />
              <span>Logout</span>
            </div>
          </div>
        </Drawer>

        <div className="content">
          {/* Modern Header */}
          <div className="header">
            <div className="header-left">
              {isMobile && (
                <button
                  className="kebab-menu-btn"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Menu"
                >
                  <MenuOutlined style={{ fontSize: "24px" }} />
                </button>
              )}
              <div className="logo-mobile">
                <h6>💚 CARE CONNECT</h6>
              </div>
            </div>
            <div className="header-content">
              <Badge
                count={user?.notification?.length || 0}
                onClick={() => navigate("/notification")}
              >
                <BellOutlined className="header-icon" />
              </Badge>
              <Link
                to={
                  user?.isAdmin
                    ? "/admin/dashboard"
                    : user?.isDoctor
                      ? "/doctor/dashboard"
                      : "/home"
                }
                className="user-name"
              >
                {user?.name}
              </Link>
            </div>
          </div>
          <div className="body">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
