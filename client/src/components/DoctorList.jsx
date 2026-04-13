import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Tag, Space, Rate } from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const DoctorList = ({ doctor }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 12px 24px rgba(30, 136, 229, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
      }}
    >
      <Card
        hoverable
        style={{
          height: "100%",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
        bodyStyle={{ padding: "20px" }}
        onClick={() => navigate(`/doctor/book-appointment/${doctor._id}`)}
      >
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#1f2937",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <UserOutlined style={{ color: "#1e88e5" }} />
            Dr. {doctor.firstName} {doctor.lastName}
          </div>
          <Tag color="blue" style={{ marginBottom: "12px" }}>
            {doctor.specialization}
          </Tag>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {(doctor.consultationModes || ["online", "offline"]).map((mode) => (
              <Tag key={mode} color={mode === "online" ? "blue" : "green"}>
                {mode === "online" ? "Online" : "Offline"}
              </Tag>
            ))}
          </div>
        </div>

        <Space direction="vertical" style={{ width: "100%", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#6b7280",
            }}
          >
            <FileTextOutlined />
            <span>
              <b>Experience:</b> {doctor.experience} years
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#6b7280",
            }}
          >
            <DollarOutlined />
            <span>
              <b>Consultation Fee:</b> ₹{doctor.feesperConsultation}
            </span>
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
            <span>
              <b>Timings:</b> {doctor.timings?.startTime || "9:00 AM"} -{" "}
              {doctor.timings?.endTime || "6:00 PM"}
            </span>
          </div>
        </Space>

        <Button
          type="primary"
          block
          style={{
            marginTop: "16px",
            height: "40px",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          Book Appointment
        </Button>
      </Card>
    </div>
  );
};

export default DoctorList;
