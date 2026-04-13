import React from "react";
import Layout from "./../components/Layout";
import {
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  TimePicker,
  message,
  Button,
  Card,
  Divider,
  Space,
} from "antd";
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
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import axios from "axios";
import moment from "moment";

const ApplyDoctor = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFinish = async (values) => {
    try {
      dispatch(showLoading());
      console.log("Submitting doctor application with values:", values);
      const formattedValues = {
        ...values,
        userId: user._id,
        timings: [
          moment(values.timings[0]).format("HH:mm"),
          moment(values.timings[1]).format("HH:mm"),
        ],
      };
      console.log("Formatted values:", formattedValues);

      const res = await axios.post(
        "/api/v1/user/apply-doctor",
        formattedValues,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success("Doctor Applied Successfully");
        navigate("/");
      } else {
        console.log("Apply doctor failed:", res.data);
        message.error(res.data.message || res.data.error || "Failed to apply");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Apply doctor error:", error);
      console.error("Error response:", error.response?.data);
      message.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Something went wrong",
      );
    }
  };

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
            <HeartOutlined style={{ marginRight: "8px", color: "#1e88e5" }} />
            Apply as a Doctor
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px", margin: "0" }}>
            Join our healthcare network and help patients
          </p>
        </div>

        <Form layout="vertical" onFinish={handleFinish}>
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
                  rules={[{ required: true, message: "Last name is required" }]}
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
                    type="email"
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
                    placeholder="e.g., Cardiology, Neurology"
                    style={{ height: "40px", borderRadius: "6px" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="Experience (Years)"
                  name="experience"
                  rules={[
                    { required: true, message: "Experience is required" },
                  ]}
                >
                  <Input
                    type="number"
                    placeholder="Years of experience"
                    style={{ height: "40px", borderRadius: "6px" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="Consultation Fee"
                  name="feesperConsultation"
                  rules={[
                    { required: true, message: "Consultation fee is required" },
                  ]}
                >
                  <Input
                    prefix={<DollarOutlined />}
                    type="number"
                    placeholder="Fee per consultation"
                    style={{ height: "40px", borderRadius: "6px" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} lg={8}>
                <Form.Item
                  label="Consultation Modes"
                  name="consultationModes"
                  rules={[
                    {
                      required: true,
                      message: "Please select at least one consultation mode",
                    },
                  ]}
                >
                  <Checkbox.Group
                    options={[
                      { label: "Online", value: "online" },
                      { label: "Offline", value: "offline" },
                    ]}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} lg={8}>
                <Form.Item
                  label="Clinic Address"
                  name="clinicAddress"
                  dependencies={["consultationModes"]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const selectedModes =
                          getFieldValue("consultationModes") || [];
                        if (
                          selectedModes.includes("offline") &&
                          (!value || !value.trim())
                        ) {
                          return Promise.reject(
                            new Error(
                              "Clinic address is required for offline consultations",
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input
                    prefix={<EnvironmentOutlined />}
                    placeholder="Clinic address (required for offline)"
                    style={{ height: "40px", borderRadius: "6px" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} lg={8}>
                <Form.Item label="Online Meeting Link" name="meetingLink">
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Optional meeting link for online consultations"
                    style={{ height: "40px", borderRadius: "6px" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item
                  label="Available Timings"
                  name="timings"
                  rules={[
                    {
                      required: true,
                      message: "Please select available timings",
                    },
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
            style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}
          >
            <Button
              size="large"
              style={{
                height: "42px",
                borderRadius: "6px",
                fontSize: "16px",
              }}
              onClick={() => navigate("/")}
            >
              Cancel
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
              Submit Application
            </Button>
          </div>
        </Form>
      </div>
    </Layout>
  );
};

export default ApplyDoctor;
