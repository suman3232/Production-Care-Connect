import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useSelector } from "react-redux";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Col,
  Form,
  Input,
  Row,
  TimePicker,
  message,
  Button,
  Card,
  Space,
  Spin,
  Divider,
} from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showLoading, hideLoading } from "../../redux/features/alertSlice";
import moment from "moment";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFinish = async (values) => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/doctor/updateProfile",
        {
          ...values,
          userId: user._id,
          timings: [
            moment(values.timings[0]).format("HH:mm"),
            moment(values.timings[1]).format("HH:mm"),
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success("Profile updated successfully");
        navigate("/");
      } else {
        message.error(res.data.message || "Update failed");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error(error);
      message.error("Something went wrong");
    }
  };

  const getDoctorInfo = async () => {
    try {
      const res = await axios.post(
        "/api/v1/doctor/getDoctorInfo",
        { userId: params.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (res.data.success) {
        setDoctor(res.data.data);
      } else {
        message.error("Failed to fetch doctor info");
      }
    } catch (error) {
      console.error(error);
      message.error("Error fetching doctor details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDoctorInfo();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <Spin size="large" tip="Loading profile..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
        {/* Page Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 8px 0",
            }}
          >
            <UserOutlined style={{ marginRight: "8px", color: "#1e88e5" }} />
            Manage Your Profile
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px", margin: "0" }}>
            Update your professional information
          </p>
        </div>

        {doctor ? (
          <Form
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{
              ...doctor,
              timings:
                doctor.timings && doctor.timings.length > 0
                  ? [
                      moment(doctor.timings[0], "HH:mm"),
                      moment(doctor.timings[1], "HH:mm"),
                    ]
                  : [null, null],
            }}
          >
            {/* Personal Information Section */}
            <Card
              style={{
                marginBottom: "24px",
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
              }}
              bodyStyle={{ padding: "24px" }}
              title={
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1f2937",
                    margin: "0",
                  }}
                >
                  <UserOutlined
                    style={{ marginRight: "8px", color: "#1e88e5" }}
                  />
                  Personal Information
                </h3>
              }
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[
                      { required: true, message: "First name is required" },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="First name"
                      style={{ height: "40px", borderRadius: "6px" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[
                      { required: true, message: "Last name is required" },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Last name"
                      style={{ height: "40px", borderRadius: "6px" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    label="Phone Number"
                    name="phone"
                    rules={[
                      { required: true, message: "Phone number is required" },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Phone number"
                      style={{ height: "40px", borderRadius: "6px" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
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
                      placeholder="your@email.com"
                      style={{ height: "40px", borderRadius: "6px" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item label="Website" name="website">
                    <Input
                      prefix={<GlobalOutlined />}
                      placeholder="https://yourwebsite.com"
                      style={{ height: "40px", borderRadius: "6px" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    label="Address"
                    name="address"
                    rules={[{ required: true, message: "Address is required" }]}
                  >
                    <Input
                      prefix={<EnvironmentOutlined />}
                      placeholder="Your address"
                      style={{ height: "40px", borderRadius: "6px" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Professional Information Section */}
            <Card
              style={{
                marginBottom: "24px",
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
              }}
              bodyStyle={{ padding: "24px" }}
              title={
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1f2937",
                    margin: "0",
                  }}
                >
                  <HeartOutlined
                    style={{ marginRight: "8px", color: "#1e88e5" }}
                  />
                  Professional Details
                </h3>
              }
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    label="Specialization"
                    name="specialization"
                    rules={[
                      { required: true, message: "Specialization is required" },
                    ]}
                  >
                    <Input
                      placeholder="e.g., Cardiology"
                      style={{ height: "40px", borderRadius: "6px" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    label="Years of Experience"
                    name="experience"
                    rules={[
                      { required: true, message: "Experience is required" },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="Years"
                      style={{ height: "40px", borderRadius: "6px" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    label="Consultation Fee"
                    name="feesperConsultation"
                    rules={[
                      {
                        required: true,
                        message: "Consultation fee is required",
                      },
                    ]}
                  >
                    <Input
                      prefix={<DollarOutlined />}
                      type="number"
                      placeholder="Fee"
                      style={{ height: "40px", borderRadius: "6px" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item
                    label="Available Timings"
                    name="timings"
                    rules={[
                      { required: true, message: "Timings are required" },
                    ]}
                  >
                    <TimePicker.RangePicker
                      format="HH:mm"
                      placeholder={["Start time", "End time"]}
                      style={{
                        width: "100%",
                        height: "40px",
                        borderRadius: "6px",
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Submit Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <Button
                size="large"
                style={{
                  height: "42px",
                  borderRadius: "6px",
                  fontSize: "16px",
                }}
                onClick={() => navigate("/doctor-appointments")}
              >
                Back
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  height: "42px",
                  borderRadius: "6px",
                  fontSize: "16px",
                  backgroundColor: "#1e88e5",
                  border: "none",
                }}
              >
                Update Profile
              </Button>
            </div>
          </Form>
        ) : (
          <Card
            style={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
              textAlign: "center",
              padding: "40px",
            }}
          >
            <p style={{ color: "#6b7280", fontSize: "16px" }}>
              No doctor information available
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
