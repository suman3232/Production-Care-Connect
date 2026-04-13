import React from "react";
import { Form, Input, message, Button, Card, Divider } from "antd";
import "../styles/Register.css";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";

const Register = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const onFinishHandler = async (values) => {
    try {
      dispatch(showLoading());
      console.log("Attempting registration with:", values);
      const res = await axios.post("/api/v1/user/register", values);
      console.log("Registration response:", res.data);
      dispatch(hideLoading());
      if (res.data.success) {
        message.success("Registration successful !");
        navigate("/login");
      } else {
        message.error(res.data.message);
        console.log("Registration failed:", res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log("Registration error:", error);
      console.log("Error response:", error.response?.data);
      message.error("Something went wrong");
    }
  };

  return (
    <PublicLayout>
      <div
        style={{
          minHeight: "calc(100vh - 180px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: "400px",
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          }}
          bodyStyle={{ padding: "40px 32px" }}
        >
          {/* Header */}
          <div style={{ marginBottom: "32px", textAlign: "center" }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#1f2937",
                margin: "0 0 8px 0",
              }}
            >
              Create Account
            </h1>
            <p style={{ color: "#6b7280", fontSize: "14px", margin: "0" }}>
              Join our healthcare community
            </p>
          </div>

          <Form layout="vertical" onFinish={onFinishHandler}>
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: "Full name is required" }]}
            >
              <Input
                prefix={<UserOutlined />}
                type="text"
                placeholder="Enter your full name"
                size="large"
                style={{ borderRadius: "6px", height: "40px" }}
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                type="email"
                placeholder="your@email.com"
                size="large"
                style={{ borderRadius: "6px", height: "40px" }}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Create a password"
                size="large"
                style={{ borderRadius: "6px", height: "40px" }}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              style={{
                height: "42px",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "6px",
                backgroundColor: "#1e88e5",
                border: "none",
                marginTop: "12px",
              }}
            >
              Register
            </Button>
          </Form>

          <Divider style={{ margin: "24px 0" }} />

          {/* Login Link */}
          <div style={{ textAlign: "center" }}>
            <span style={{ color: "#6b7280", fontSize: "14px" }}>
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              style={{
                color: "#1e88e5",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Sign in here
            </Link>
          </div>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default Register;
