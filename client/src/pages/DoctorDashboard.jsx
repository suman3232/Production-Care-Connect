import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table, Tag, Spin, Empty } from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Layout from "../components/Layout";
import moment from "moment";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/doctor/doctor-appointments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  const upcoming = appointments.filter((apt) => apt.status === "pending");
  const approved = appointments.filter((apt) => apt.status === "approved");

  const columns = [
    {
      title: "Patient",
      dataIndex: "userInfo",
      key: "patient",
      render: (userInfo) => userInfo.name,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => moment(date).format("DD MMM, YYYY"),
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "approved"
              ? "green"
              : status === "rejected"
                ? "red"
                : "blue"
          }
        >
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <Layout>
      <div style={{ padding: "24px" }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card
              className="dashboard-card"
              title="Upcoming Requests"
              bordered={false}
            >
              <div className="dashboard-card-value">{upcoming.length}</div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              className="dashboard-card"
              title="Approved Today"
              bordered={false}
            >
              <div className="dashboard-card-value">{approved.length}</div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              className="dashboard-card"
              title="Total Appointments"
              bordered={false}
            >
              <div className="dashboard-card-value">{appointments.length}</div>
            </Card>
          </Col>
        </Row>

        <Card
          style={{ marginTop: "24px" }}
          title="Recent Appointments"
          bordered={false}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin />
            </div>
          ) : appointments.length > 0 ? (
            <Table
              rowKey={(record) => record._id}
              columns={columns}
              dataSource={appointments.slice(0, 5)}
              pagination={false}
            />
          ) : (
            <Empty description="No appointments yet" />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;
