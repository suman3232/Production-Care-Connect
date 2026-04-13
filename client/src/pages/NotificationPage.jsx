import React from "react";
import Layout from "./../components/Layout";
import { message, Tabs, Card, Button, Space, Empty } from "antd";
import { BellOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { setUser } from "../redux/features/userSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NotificationPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  // Mark All Notifications as Read
  const handleMarkAllRead = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/get-all-notification",
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      dispatch(hideLoading());

      if (res.data.success) {
        message.success(res.data.message);
        dispatch(setUser(res.data.data));
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Something went wrong while marking notifications as read");
    }
  };

  // Delete All Read Notifications
  const handleDeleteAllRead = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/delete-all-notification",
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      dispatch(hideLoading());

      if (res.data.success) {
        message.success(res.data.message);
        // Update Redux state with the updated user data (notifications deleted)
        dispatch(setUser(res.data.data));
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Something went wrong while deleting notifications");
    }
  };

  const NotificationCard = ({ notification, onNavigate }) => (
    <Card
      hoverable
      style={{
        marginBottom: "12px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        cursor: "pointer",
      }}
      onClick={() => onNavigate(notification.onClickPath)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <BellOutlined style={{ fontSize: "20px", color: "#1e88e5" }} />
        <p style={{ margin: "0", color: "#1f2937", fontSize: "14px" }}>
          {notification.message}
        </p>
      </div>
    </Card>
  );

  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <BellOutlined style={{ marginRight: "8px" }} />
          Unread
        </span>
      ),
      children: (
        <div>
          {user?.notification?.length > 0 ? (
            <>
              <div style={{ marginBottom: "16px", textAlign: "right" }}>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleMarkAllRead}
                >
                  Mark All Read
                </Button>
              </div>
              {user.notification.map((notif, index) => (
                <NotificationCard
                  key={index}
                  notification={notif}
                  onNavigate={navigate}
                />
              ))}
            </>
          ) : (
            <Empty description="No unread notifications" />
          )}
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <CheckOutlined style={{ marginRight: "8px" }} />
          Read
        </span>
      ),
      children: (
        <div>
          {user?.seennotification?.length > 0 ? (
            <>
              <div style={{ marginBottom: "16px", textAlign: "right" }}>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteAllRead}
                >
                  Delete All
                </Button>
              </div>
              {user.seennotification.map((notif, index) => (
                <NotificationCard
                  key={index}
                  notification={notif}
                  onNavigate={navigate}
                />
              ))}
            </>
          ) : (
            <Empty description="No read notifications" />
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div>
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 8px 0",
            }}
          >
            <BellOutlined style={{ marginRight: "8px", color: "#1e88e5" }} />
            Notifications
          </h1>
        </div>
        <Tabs items={tabItems} />
      </div>
    </Layout>
  );
};

export default NotificationPage;
