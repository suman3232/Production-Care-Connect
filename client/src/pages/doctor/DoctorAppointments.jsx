import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { Table, message, Button, Card, Space, Tag, Spin, Empty, Modal, Form, Input } from "antd";
import Layout from "../../components/Layout";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [form] = Form.useForm();

  const getAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Fetching doctor appointments...");

      const res = await axios.get("/api/v1/doctor/doctor-appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Appointments response:", res.data);

      if (res.data.success) {
        console.log("Appointments fetched:", res.data.data);
        setAppointments(res.data.data);
      } else {
        console.log("Failed to fetch appointments:", res.data.message);
        message.error(res.data.message || "Failed to fetch appointments");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      console.error("Error details:", error.response?.data);
      message.error(
        error.response?.data?.message || "Error fetching appointments",
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  const handleStatus = async (record, status, meetingLink = undefined) => {
    try {
      console.log("Updating appointment status:", {
        appointmentId: record._id,
        status,
        meetingLink,
      });

      const payload = { appointmentId: record._id, status };
      if (typeof meetingLink !== "undefined") payload.meetingLink = meetingLink;

      const res = await axios.post("/api/v1/doctor/update-status", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Status update response:", res.data);

      if (res.data.success) {
        message.success(res.data.message || `Appointment ${status} successfully`);
        getAppointments();
      } else {
        message.error(res.data.message || "Failed to update status");
        console.log("Status update failed:", res.data);
      }
    } catch (error) {
      console.error("Status update error:", error);
      console.error("Error details:", error.response?.data);
      message.error(error.response?.data?.message || "Something Went Wrong");
    }
  };

  const onApproveClick = (record) => {
    // If online appointment, prompt for meeting link
    if (record.consultationType === "online") {
      setSelectedAppointment(record);
      setIsModalVisible(true);
      form.setFieldsValue({ meetingLink: record.meetingLink || "" });
    } else {
      handleStatus(record, "approved");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedAppointment(null);
    form.resetFields();
  };

  const handleModalFinish = async (values) => {
    if (!selectedAppointment) return;
    await handleStatus(selectedAppointment, "approved", values.meetingLink);
    handleModalCancel();
  };

  const onEditMeetingLink = (record) => {
    setSelectedAppointment(record);
    setIsModalVisible(true);
    form.setFieldsValue({ meetingLink: record.meetingLink || "" });
  };

  const handleViewConsultation = (appointmentId) => {
    navigate(`/doctor/consultation/${appointmentId}`);
  };

  const columns = [
    {
      title: "Patient Name",
      dataIndex: "userId",
      key: "patient",
      render: (userId) => {
        const name = userId?.name || userId || "Unknown";
        console.log("Rendering patient name:", userId, "→", name);
        return <span style={{ fontWeight: "500" }}>{name}</span>;
      },
    },
    {
      title: "Consultation Type",
      dataIndex: "consultationType",
      key: "consultationType",
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
      title: "Date & Time",
      dataIndex: "date",
      key: "datetime",
      render: (text, record) => (
        <Space>
          <CalendarOutlined style={{ color: "#1e88e5" }} />
          <span>
            {moment(record.date).format("DD-MM-YYYY")} at {record.time}
          </span>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let icon = null;

        if (status === "confirmed" || status === "approved") {
          color = "success";
          icon = <CheckCircleOutlined />;
        } else if (status === "reject" || status === "rejected") {
          color = "error";
          icon = <CloseCircleOutlined />;
        } else if (status === "pending") {
          color = "processing";
          icon = <ClockCircleOutlined />;
        }

        return (
          <Tag icon={icon} color={color}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "action",
      render: (text, record) => {
        console.log("Rendering actions for record:", {
          id: record._id,
          status: record.status,
        });

        const appointmentTime = new Date(record.appointmentDateTime || `${record.date} ${record.time}`);
        const minutesDiff = (appointmentTime - new Date()) / (1000 * 60);
        const canJoinCall =
          record.consultationType === "online" &&
          record.status?.toLowerCase() === "approved" &&
          record.meetingLink &&
          minutesDiff >= -10 &&
          minutesDiff <= 10;

        return (
          <Space size="small">
            {(record.status === "pending" || record.status === "confirmed") && (
              <>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  style={{
                    backgroundColor: "#22c55e",
                    border: "none",
                    borderRadius: "4px",
                    height: "32px",
                  }}
                  onClick={() => onApproveClick(record)}
                >
                  Approve
                </Button>
                <Button
                  danger
                  type="primary"
                  size="small"
                  icon={<CloseCircleOutlined />}
                  style={{
                    backgroundColor: "#ef4444",
                    border: "none",
                    borderRadius: "4px",
                    height: "32px",
                  }}
                  onClick={() => handleStatus(record, "rejected")}
                >
                  Reject
                </Button>
              </>
            )}
            {record.status?.toLowerCase() === "approved" && (
              <>
                {record.consultationType === "online" && (
                  <>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => onEditMeetingLink(record)}
                    >
                      {record.meetingLink ? "Edit Meeting Link" : "Add Meeting Link"}
                    </Button>
                    {record.meetingLink && canJoinCall && (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => window.open(record.meetingLink, "_blank")}
                      >
                        Join Call
                      </Button>
                    )}
                    {!record.meetingLink && (
                      <span style={{ color: "#6b7280", fontSize: "14px" }}>
                        Meeting link not set
                      </span>
                    )}
                  </>
                )}
                {record.consultationType === "offline" && (
                  <span style={{ color: "#6b7280", fontSize: "14px" }}>
                    In-Clinic Visit
                  </span>
                )}
                <Button
                  type="default"
                  size="small"
                  onClick={() => handleViewConsultation(record._id)}
                >
                  View Details
                </Button>
              </>
            )}
            {record.status?.toLowerCase() !== "pending" &&
              record.status?.toLowerCase() !== "confirmed" &&
              record.status?.toLowerCase() !== "approved" && (
                <span style={{ color: "#6b7280", fontSize: "14px" }}>
                  No actions available
                </span>
              )}
          </Space>
        );
      },
    },
  ];

  return (
    <Layout>
      <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Page Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 8px 0",
            }}
          >
            <CalendarOutlined
              style={{ marginRight: "8px", color: "#1e88e5" }}
            />
            My Appointments
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px", margin: "0" }}>
            Manage your daily appointments
          </p>
        </div>

        {/* Meeting link modal for approving online appointments */}
        <Modal
          title="Add Meeting Link"
          open={isModalVisible}
          onCancel={handleModalCancel}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleModalFinish}>
            <Form.Item
              name="meetingLink"
              label="Google Meet Link"
              rules={[
                { required: true, message: "Please enter the meeting link" },
                {
                  type: "url",
                  message: "Please enter a valid URL (include https://)",
                },
              ]}
            >
              <Input placeholder="https://meet.google.com/xxx-xxxx-xxx" />
            </Form.Item>
            <Form.Item>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <Button onClick={handleModalCancel}>Cancel</Button>
                <Button type="primary" onClick={() => form.submit()}>
                  Save & Approve
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Appointments Table Card */}
        <Card
          style={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          }}
          bodyStyle={{ padding: "0" }}
        >
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <Spin size="large" tip="Loading appointments..." />
            </div>
          ) : appointments && appointments.length > 0 ? (
            <Table
              columns={columns}
              dataSource={appointments}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]} to ${range[1]} of ${total} appointments`,
                style: { padding: "16px" },
              }}
              scroll={{ x: "100%" }}
              style={{ padding: "0" }}
            />
          ) : (
            <Empty
              description="No appointments found"
              style={{ padding: "40px" }}
            />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default DoctorAppointments;
