import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { Table, Button, Badge, Card, Space, Spin, Tag } from "antd";
import { DeleteOutlined, UserOutlined } from "@ant-design/icons";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/admin/getAllUsers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setUsers(res.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: "#1e88e5", fontSize: "16px" }} />
          <span style={{ fontWeight: "500" }}>{text}</span>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span style={{ color: "#6b7280" }}>{text}</span>,
    },
    {
      title: "Doctor Status",
      dataIndex: "isDoctor",
      key: "isDoctor",
      render: (isDoctor) => (
        <Tag color={isDoctor ? "green" : "default"}>
          {isDoctor ? "✓ Doctor" : "Patient"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Button
            danger
            type="primary"
            size="small"
            icon={<DeleteOutlined />}
            style={{
              backgroundColor: "#ef4444",
              border: "none",
              borderRadius: "4px",
              height: "32px",
            }}
          >
            Block
          </Button>
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
            <UserOutlined style={{ marginRight: "8px", color: "#1e88e5" }} />
            User Management
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px", margin: "0" }}>
            View and manage all registered users
          </p>
        </div>

        {/* Users Table Card */}
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
              <Spin size="large" tip="Loading users..." />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={users}
              rowKey={(record) => record._id}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]} to ${range[1]} of ${total} users`,
                style: { padding: "16px" },
              }}
              style={{
                borderRadius: "12px",
              }}
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

export default Users;
