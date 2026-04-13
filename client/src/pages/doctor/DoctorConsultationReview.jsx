import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, message, Button, Tag } from "antd";
import { ArrowLeftOutlined, FileTextOutlined } from "@ant-design/icons";
import axios from "axios";
import Layout from "../../components/Layout";
import moment from "moment";

const DoctorConsultationReview = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConsultation = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/v1/doctor/get-consultation/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (res.data.success) {
        setConsultation(res.data.data);
      } else {
        message.error(res.data.message || "Unable to load consultation");
      }
    } catch (error) {
      console.error(error);
      message.error(
        error.response?.data?.message || "Unable to load consultation",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointmentId) {
      fetchConsultation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  return (
    <Layout>
      <div style={{ padding: "24px", maxWidth: "950px", margin: "0 auto" }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: "20px" }}
        >
          Back
        </Button>

        <Card style={{ borderRadius: "12px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "28px", margin: 0 }}>
              <FileTextOutlined style={{ marginRight: "10px" }} />
              Consultation Details
            </h1>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
            </div>
          ) : consultation ? (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "16px", fontWeight: 600 }}>
                  Patient: {consultation.userInfo?.name || "Unknown"}
                </div>
                <div style={{ color: "#6b7280", marginTop: "8px" }}>
                  Appointment:{" "}
                  {moment(consultation.date).format("DD MMM, YYYY")}
                  {" at "}
                  {consultation.time}
                </div>
                <Tag style={{ marginTop: "12px" }} color="blue">
                  {consultation.status || "Approved"}
                </Tag>
              </div>

              <Card
                style={{ marginBottom: "20px", borderRadius: "10px" }}
                title="Consultation Summary"
              >
                <p>
                  <strong>Symptoms:</strong> {consultation.symptoms}
                </p>
                <p>
                  <strong>Description:</strong> {consultation.description}
                </p>
                <p>
                  <strong>Duration:</strong> {consultation.duration}
                </p>
              </Card>

              <Card
                title="Doctor Instructions"
                style={{ borderRadius: "10px" }}
              >
                <p>
                  After reviewing this consultation, assign a health plan and
                  begin patient monitoring.
                </p>
              </Card>
            </div>
          ) : (
            <div style={{ color: "#b91c1c", fontWeight: 600 }}>
              Consultation not found or you are not authorized.
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default DoctorConsultationReview;
