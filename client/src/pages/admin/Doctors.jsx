import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { Table, message, Button, Card, Space, Tag, Spin, Badge } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch all doctors
  const getDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/admin/getAllDoctors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setDoctors(res.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Function to handle account status change
  const handleAccountStatus = async (record, newStatus) => {
    try {
      const res = await axios.post(
        "/api/v1/admin/changeAccountStatus",
        { doctorId: record._id, status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (res.data.success) {
        message.success(`Doctor status updated to ${newStatus}`);
        getDoctors();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      message.error("Something went wrong");
    }
  };

  useEffect(() => {
    getDoctors();
  }, []);

  // Define columns for the Table
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <TeamOutlined style={{ color: "#1e88e5", fontSize: "16px" }} />
          <span style={{ fontWeight: "500" }}>
            Dr. {record.firstName} {record.lastName}
          </span>
        </Space>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (text) => <span style={{ color: "#6b7280" }}>{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let icon = null;
        let label = status;

        if (status === "approved") {
          color = "success";
          icon = <CheckCircleOutlined />;
          label = "Approved";
        } else if (status === "rejected") {
          color = "error";
          icon = <CloseCircleOutlined />;
          label = "Rejected";
        } else if (status === "pending") {
          color = "processing";
          icon = <ClockCircleOutlined />;
          label = "Pending";
        }

        return (
          <Tag icon={icon} color={color}>
            {label}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="small">
          {record.status === "pending" && (
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
                onClick={() => handleAccountStatus(record, "approved")}
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
                onClick={() => handleAccountStatus(record, "rejected")}
              >
                Reject
              </Button>
            </>
          )}
          {record.status === "approved" && (
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
              onClick={() => handleAccountStatus(record, "rejected")}
            >
              Reject
            </Button>
          )}
          {record.status === "rejected" && (
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
              onClick={() => handleAccountStatus(record, "approved")}
            >
              Approve
            </Button>
          )}
        </Space>
      ),
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
            <TeamOutlined style={{ marginRight: "8px", color: "#1e88e5" }} />
            Doctor Management
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px", margin: "0" }}>
            Review and manage doctor applications
          </p>
        </div>

        {/* Doctors Table Card */}
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
              <Spin size="large" tip="Loading doctors..." />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={doctors}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]} to ${range[1]} of ${total} doctors`,
                style: { padding: "16px" },
              }}
              scroll={{ x: "max-content" }}
              rowClassName={(record, index) =>
                index % 2 === 0 ? "" : "ant-table-row-alt"
              }
            />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Doctors;
