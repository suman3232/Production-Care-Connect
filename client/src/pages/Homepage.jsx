import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import { Row, Col, Spin, Empty, Space, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import DoctorList from "../components/DoctorList";

const Homepage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const getUserData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/user/getAllDoctors", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <Layout>
      <div style={{ marginBottom: "32px" }}>
        {/* Hero Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "12px",
            padding: "40px",
            color: "white",
            marginBottom: "32px",
            boxShadow: "0 10px 30px rgba(102, 126, 234, 0.2)",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "800",
              marginBottom: "12px",
              letterSpacing: "-0.5px",
            }}
          >
            Find Your Doctor
          </h1>
          <p
            style={{
              fontSize: "16px",
              opacity: 0.9,
              marginBottom: "0",
            }}
          >
            Browse our network of experienced doctors and book your consultation
            today
          </p>
        </div>

        {/* Section Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1f2937",
                margin: "0",
              }}
            >
              Available Doctors
            </h2>
            <p
              style={{
                color: "#6b7280",
                marginTop: "4px",
                fontSize: "14px",
              }}
            >
              {doctors.length} doctors available for consultation
            </p>
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : doctors && doctors.length > 0 ? (
          <Row gutter={[16, 16]}>
            {doctors.map((doctor) => (
              <Col xs={24} sm={12} md={8} lg={6} key={doctor._id}>
                <DoctorList doctor={doctor} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            description="No doctors available"
            style={{ marginTop: "40px", marginBottom: "40px" }}
          />
        )}
      </div>
    </Layout>
  );
};

export default Homepage;
