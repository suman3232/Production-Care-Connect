import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spin, Empty } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import Layout from "../components/Layout";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/admin/dashboard-stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Layout>
      <div style={{ padding: "24px" }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card
              title="Total Users"
              bordered={false}
              className="dashboard-card"
            >
              <div className="dashboard-card-value">
                {stats?.totalUsers ?? 0}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              title="Total Doctors"
              bordered={false}
              className="dashboard-card"
            >
              <div className="dashboard-card-value">
                {stats?.totalDoctors ?? 0}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              title="Total Appointments"
              bordered={false}
              className="dashboard-card"
            >
              <div className="dashboard-card-value">
                {stats?.totalAppointments ?? 0}
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          title="Appointments Per Day"
          style={{ marginTop: "24px", borderRadius: "12px" }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin />
            </div>
          ) : stats?.appointmentsPerDay?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={stats.appointmentsPerDay}
                margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1e88e5" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="No appointment data yet" />
          )}
        </Card>

        <Card
          title="Appointment Status"
          style={{ marginTop: "24px", borderRadius: "12px" }}
        >
          {stats?.statusDistribution?.length ? (
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {stats.statusDistribution.map((item) => (
                <Card
                  key={item._id}
                  style={{ width: "220px", borderRadius: "12px" }}
                >
                  <h3 style={{ marginBottom: "6px" }}>{item._id}</h3>
                  <p style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
                    {item.count}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Empty description="No status data yet" />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
