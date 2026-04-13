import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import {
  Table,
  message,
  Card,
  Row,
  Col,
  Tag,
  Space,
  Empty,
  Button,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payingAppointmentId, setPayingAppointmentId] = useState(null);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const verifyPayment = async (appointmentId, response) => {
    try {
      const res = await axios.post(
        "/api/v1/user/verify-payment",
        {
          appointmentId,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (res.data.success) {
        message.success("Payment verified successfully");
        getAppointments();
      } else {
        message.error(res.data.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      message.error(
        error.response?.data?.message || "Payment verification failed",
      );
    } finally {
      setPayingAppointmentId(null);
    }
  };

  const handlePayment = async (record) => {
    try {
      setPayingAppointmentId(record._id);
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        message.error("Razorpay SDK failed to load");
        setPayingAppointmentId(null);
        return;
      }

      const orderRes = await axios.post(
        "/api/v1/user/create-order",
        { appointmentId: record._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!orderRes.data.success) {
        message.error(orderRes.data.message || "Unable to initialize payment");
        setPayingAppointmentId(null);
        return;
      }

      const order = orderRes.data.data;
      const options = {
        key: orderRes.data.key,
        amount: order.amount,
        currency: "INR",
        name: "Doctor Appointment",
        description: "Appointment payment",
        order_id: order.id,
        handler: async function (response) {
          await verifyPayment(record._id, response);
        },
        prefill: {
          name: record.userInfo?.name || "",
          email: record.userInfo?.email || "",
        },
        theme: {
          color: "#1e88e5",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(
        error.response?.data?.message || "Unable to process payment",
      );
      setPayingAppointmentId(null);
    }
  };

  const getAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/user/user-appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data.success) {
        setAppointments(res.data.data);
      } else {
        message.error(res.data.message || "Failed to fetch appointments");
      }
    } catch (error) {
      message.error("Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);
  const handlePreConsultation = (appointmentId) => {
    navigate(`/pre-consultation/${appointmentId}`);
  };
  const columns = [
    {
      title: "Date & Time",
      dataIndex: "date",
      key: "datetime",
      width: 180,
      render: (text, record) => (
        <Space>
          <CalendarOutlined style={{ color: "#1e88e5" }} />
          <span>
            {moment(record.date).format("DD MMM, YYYY")}{" "}
            {moment(record.time).format("HH:mm")}
          </span>
        </Space>
      ),
    },
    {
      title: "Doctor",
      dataIndex: "doctorInfo",
      key: "doctor",
      width: 200,
      render: (text) => {
        if (typeof text === "string") {
          return <span>{text}</span>;
        }
        const name =
          text?.name ||
          `${text?.firstName || ""} ${text?.lastName || ""}`.trim() ||
          "N/A";
        return <span>{name}</span>;
      },
    },
    {
      title: "Type",
      dataIndex: "consultationType",
      key: "consultationType",
      width: 120,
      render: (type) => {
        if (type === "online") {
          return (
            <Tag color="blue" icon={<PhoneOutlined />}>
              Online
            </Tag>
          );
        } else if (type === "offline") {
          return (
            <Tag color="green" icon={<EnvironmentOutlined />}>
              In-Clinic
            </Tag>
          );
        }
        return <Tag>Unknown</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const colors = {
          pending: "orange",
          confirmed: "green",
          cancelled: "red",
          completed: "blue",
          approved: "green",
        };
        return (
          <Tag color={colors[status?.toLowerCase()] || "default"}>{status}</Tag>
        );
      },
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 140,
      render: (paymentStatus) => {
        const colors = {
          pending: "orange",
          paid: "green",
          failed: "red",
        };
        return (
          <Tag color={colors[paymentStatus?.toLowerCase()] || "default"}>
            {paymentStatus?.charAt(0).toUpperCase() + paymentStatus?.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 220,
      render: (_, record) => {
        const now = new Date();
        const appointmentTime = new Date(record.appointmentDateTime);
        const timeDiff = appointmentTime - now;
        const minutesDiff = timeDiff / (1000 * 60);

        // Allow joining within ±10 minutes of scheduled time
        const canJoinCall =
          record.consultationType === "online" &&
          record.status?.toLowerCase() === "approved" &&
          record.meetingLink &&
          minutesDiff >= -10 &&
          minutesDiff <= 10;

        if (record.status?.toLowerCase() === "approved") {
          if (record.consultationType === "online") {
            if (canJoinCall) {
              return (
                <Button
                  type="primary"
                  onClick={() => window.open(record.meetingLink, "_blank")}
                >
                  Join Call
                </Button>
              );
            } else if (minutesDiff > 10) {
              return (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      color: "#666",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    Call available at scheduled time
                  </div>
                  <Button disabled>
                    Join Call ({Math.ceil(minutesDiff)} min left)
                  </Button>
                </div>
              );
            } else {
              return <Button disabled>Call time has passed</Button>;
            }
          } else if (record.consultationType === "offline") {
            return (
              <div>
                <strong>Clinic Address:</strong>
                <br />
                {record.clinicAddress || "Address not available"}
              </div>
            );
          }
        }

        if (record.status?.toLowerCase() === "completed") {
          return (
            <Button type="default" onClick={() => navigate("/activity")}>
              View Health Plan
            </Button>
          );
        }

        return (
          <Button disabled>
            {record.status?.toLowerCase() === "pending"
              ? "Awaiting Approval"
              : "No actions available"}
          </Button>
        );
      },
    },
  ];

  const renderMobileCards = () => (
    <Row gutter={[16, 16]}>
      {appointments.map((apt) => (
        <Col xs={24} sm={12} key={apt._id}>
          <Card
            hoverable
            style={{ borderRadius: "8px" }}
            bodyStyle={{ padding: "16px" }}
          >
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#1f2937",
                  marginBottom: "8px",
                }}
              >
                {typeof apt.doctorInfo === "string"
                  ? apt.doctorInfo
                  : apt.doctorInfo?.name || "Doctor"}
              </div>
            </div>
            <Space
              direction="vertical"
              style={{ width: "100%", fontSize: "14px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#6b7280",
                }}
              >
                <CalendarOutlined />
                {moment(apt.date).format("DD MMM, YYYY")}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#6b7280",
                }}
              >
                <ClockCircleOutlined />
                {moment(apt.time).format("HH:mm")}
              </div>
              <div>
                <Tag
                  color={
                    {
                      pending: "orange",
                      confirmed: "green",
                      cancelled: "red",
                      completed: "blue",
                      approved: "green",
                    }[apt.status?.toLowerCase()] || "default"
                  }
                >
                  {apt.status}
                </Tag>
              </div>
              <div>
                <Tag
                  color={
                    {
                      pending: "orange",
                      paid: "green",
                      failed: "red",
                    }[apt.paymentStatus?.toLowerCase()] || "default"
                  }
                >
                  {apt.paymentStatus}
                </Tag>
              </div>
              {apt.paymentStatus?.toLowerCase() !== "paid" ? (
                <Button
                  type="primary"
                  block
                  style={{ marginTop: "16px" }}
                  loading={payingAppointmentId === apt._id}
                  onClick={() => handlePayment(apt)}
                >
                  {apt.paymentStatus?.toLowerCase() === "failed"
                    ? "Retry Payment"
                    : "Pay Now"}
                </Button>
              ) : apt.status?.toLowerCase() === "approved" ? (
                <Button
                  type="primary"
                  block
                  style={{ marginTop: "16px" }}
                  onClick={() => handlePreConsultation(apt._id)}
                >
                  Start Consultation
                </Button>
              ) : (
                <Button
                  type="default"
                  block
                  style={{ marginTop: "16px" }}
                  disabled
                >
                  Awaiting Approval
                </Button>
              )}
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );

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
            My Appointments
          </h1>
          <p style={{ color: "#6b7280", margin: "0", fontSize: "14px" }}>
            View and manage your upcoming appointments
          </p>
        </div>

        {loading ? (
          <Card>
            <div style={{ textAlign: "center", padding: "40px" }}>
              Loading...
            </div>
          </Card>
        ) : appointments.length === 0 ? (
          <Empty
            description="No appointments found"
            style={{ marginTop: "40px", marginBottom: "40px" }}
          />
        ) : (
          <>
            {/* Mobile view */}
            <div style={{ display: "none" }} className="mobile-appointments">
              {renderMobileCards()}
            </div>

            {/* Desktop view */}
            <Card
              style={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
              bodyStyle={{ padding: "0" }}
            >
              <Table
                columns={columns}
                dataSource={appointments}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                loading={loading}
                style={{ borderRadius: "8px" }}
              />
            </Card>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-appointments {
            display: block !important;
          }
          .ant-table {
            display: none;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Appointments;
