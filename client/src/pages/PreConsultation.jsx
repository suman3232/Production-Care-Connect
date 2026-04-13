import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, message, Spin, Tag } from "antd";
import axios from "axios";
import Layout from "../components/Layout";
import moment from "moment";
import { FileTextOutlined } from "@ant-design/icons";

const PreConsultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      console.log("Fetching appointment with ID:", appointmentId);
      const res = await axios.get(`/api/v1/user/appointment/${appointmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Appointment response:", res.data);
      if (res.data.success) {
        setAppointment(res.data.data);
      } else {
        console.error("API returned error:", res.data.message);
        message.error(res.data.message || "Unable to load appointment");
      }
    } catch (error) {
      console.error("Fetch appointment error:", error);
      console.error("Error response:", error.response?.data);
      message.error(
        error.response?.data?.message || "Unable to load appointment",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    }
    // eslint-disable-next-line
  }, [appointmentId]);

  const onFinish = async (values) => {
    if (!appointment || appointment.status !== "approved") {
      message.error(
        "Consultation can only be submitted for approved appointments.",
      );
      return;
    }
    try {
      setSubmitting(true);
      const res = await axios.post(
        "/api/v1/user/add-consultation",
        {
          appointmentId,
          symptoms: values.symptoms,
          description: values.description,
          duration: values.duration,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (res.data.success) {
        message.success("Pre-consultation submitted successfully.");
        navigate("/appointments");
      } else {
        message.error(res.data.message || "Unable to submit consultation");
      }
    } catch (error) {
      console.error(error);
      message.error(
        error.response?.data?.message || "Unable to submit consultation",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "20px" }}>
          <FileTextOutlined style={{ marginRight: "10px", color: "#1e88e5" }} />
          Pre-Consultation Form
        </h1>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : appointment ? (
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "16px", fontWeight: 600 }}>
                Appointment for Dr.{" "}
                {appointment.doctorInfo?.name ||
                  `${appointment.doctorInfo?.firstName || ""} ${appointment.doctorInfo?.lastName || ""}`.trim() ||
                  "your doctor"}
              </div>
              <div style={{ color: "#6b7280", marginTop: "6px" }}>
                {moment(appointment.date).format("DD MMM YYYY")} at{" "}
                {appointment.time}
              </div>
              <div style={{ marginTop: "12px" }}>
                <strong>Status:</strong> {appointment.status}
              </div>
              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                <Tag
                  color={
                    appointment.consultationType === "online" ? "blue" : "green"
                  }
                >
                  {appointment.consultationType === "online"
                    ? "Online Consultation"
                    : "Offline Consultation"}
                </Tag>
                {appointment.consultationType === "online" &&
                  appointment.meetingLink && (
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => window.open(appointment.meetingLink, "_blank")}
                    >
                      Join Call
                    </Button>
                  )}
                {appointment.consultationType === "offline" &&
                  appointment.clinicAddress && (
                    <div style={{ color: "#374151" }}>
                      <strong>Clinic Address:</strong> {appointment.clinicAddress}
                    </div>
                  )}
              </div>
            </div>
            {appointment.status !== "approved" ? (
              <div style={{ color: "#b91c1c", fontWeight: 600 }}>
                Pre-consultation is only available for approved appointments.
              </div>
            ) : appointment.paymentStatus !== "paid" ? (
              <div style={{ color: "#b91c1c", fontWeight: 600 }}>
                Payment must be completed before starting the consultation.
              </div>
            ) : (
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                  label="Symptoms"
                  name="symptoms"
                  rules={[
                    {
                      required: true,
                      message: "Please describe your symptoms",
                    },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Describe your current symptoms"
                  />
                </Form.Item>
                <Form.Item
                  label="Description"
                  name="description"
                  rules={[
                    { required: true, message: "Please provide a description" },
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Add any relevant medical history or details"
                  />
                </Form.Item>
                <Form.Item
                  label="Duration"
                  name="duration"
                  rules={[{ required: true, message: "Please enter duration" }]}
                >
                  <Input placeholder="e.g., 3 days, 1 week" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={submitting}>
                    Submit Consultation
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Card>
        ) : (
          <div style={{ color: "#b91c1c", fontWeight: 600 }}>
            Appointment not found or you are not authorized.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PreConsultation;
