import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  message,
  Button,
  Form,
  Input,
  Space,
  Divider,
  Tag,
  Row,
  Col,
  Avatar,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  VideoCameraOutlined,
  EnvironmentOutlined,
  UserOutlined,
  FileTextOutlined,
  SaveOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Layout from "../../components/Layout";
import moment from "moment";

const { TextArea } = Input;
const { Title, Text } = Typography;

const DoctorConsultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/v1/doctor/get-appointment/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (res.data.success) {
        setAppointment(res.data.data);
        // Check if consultation already exists
        if (res.data.data.consultationId) {
          fetchConsultationDetails(res.data.data.consultationId);
        }
      } else {
        message.error(res.data.message || "Unable to load appointment");
      }
    } catch (error) {
      console.error(error);
      message.error(
        error.response?.data?.message || "Unable to load appointment",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultationDetails = async (consultationId) => {
    try {
      const res = await axios.get(
        `/api/v1/doctor/get-consultation/${consultationId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (res.data.success) {
        setConsultation(res.data.data);
        form.setFieldsValue({
          consultationNotes: res.data.data.consultationNotes || "",
          diagnosis: res.data.data.diagnosis || "",
          prescription: res.data.data.prescription || "",
        });
      }
    } catch (error) {
      console.error("Error fetching consultation:", error);
    }
  };

  const handleSaveConsultation = async (values) => {
    try {
      setSaving(true);
      const consultationData = {
        appointmentId,
        consultationNotes: values.consultationNotes,
        diagnosis: values.diagnosis,
        prescription: values.prescription,
      };

      const res = await axios.post(
        "/api/v1/doctor/add-consultation",
        consultationData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      if (res.data.success) {
        message.success("Consultation saved successfully");
        setConsultation(res.data.data);
      } else {
        message.error(res.data.message || "Failed to save consultation");
      }
    } catch (error) {
      console.error(error);
      message.error(
        error.response?.data?.message || "Failed to save consultation",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteConsultation = async () => {
    try {
      setSaving(true);
      const res = await axios.post(
        "/api/v1/doctor/complete-consultation",
        { appointmentId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      if (res.data.success) {
        message.success("Consultation completed successfully");
        navigate("/doctor/appointments");
      } else {
        message.error(res.data.message || "Failed to complete consultation");
      }
    } catch (error) {
      console.error(error);
      message.error(
        error.response?.data?.message || "Failed to complete consultation",
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  if (loading) {
    return (
      <Layout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <Spin size="large" tip="Loading consultation details..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/doctor/appointments")}
            style={{ marginBottom: "16px" }}
          >
            Back to Appointments
          </Button>
          <Title level={2} style={{ margin: "0" }}>
            <VideoCameraOutlined style={{ marginRight: "8px" }} />
            Consultation Session
          </Title>
        </div>

        {appointment && (
          <Row gutter={24}>
            {/* Patient & Appointment Info */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <UserOutlined />
                    Patient Information
                  </Space>
                }
                style={{ marginBottom: "24px" }}
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Text strong>Name:</Text>{" "}
                    {appointment.userInfo?.name || "N/A"}
                  </div>
                  <div>
                    <Text strong>Age:</Text>{" "}
                    {appointment.userInfo?.age || "N/A"}
                  </div>
                  <div>
                    <Text strong>Phone:</Text>{" "}
                    {appointment.userInfo?.phone || "N/A"}
                  </div>
                  <div>
                    <Text strong>Email:</Text>{" "}
                    {appointment.userInfo?.email || "N/A"}
                  </div>
                </Space>
              </Card>

              <Card
                title={
                  <Space>
                    <FileTextOutlined />
                    Appointment Details
                  </Space>
                }
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Text strong>Date:</Text>{" "}
                    {moment(appointment.date).format("DD-MM-YYYY")}
                  </div>
                  <div>
                    <Text strong>Time:</Text> {appointment.time}
                  </div>
                  <div>
                    <Text strong>Type:</Text>{" "}
                    <Tag
                      color={
                        appointment.consultationType === "online"
                          ? "blue"
                          : "green"
                      }
                      icon={
                        appointment.consultationType === "online" ? (
                          <VideoCameraOutlined />
                        ) : (
                          <EnvironmentOutlined />
                        )
                      }
                    >
                      {appointment.consultationType === "online"
                        ? "Online"
                        : "In-Clinic"}
                    </Tag>
                  </div>
                  {appointment.consultationType === "online" &&
                    appointment.meetingLink && (
                      <div>
                        <Text strong>Meeting Link:</Text>{" "}
                        <a
                          href={appointment.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#1890ff" }}
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
                  {appointment.consultationType === "offline" &&
                    appointment.clinicAddress && (
                      <div>
                        <Text strong>Clinic Address:</Text>{" "}
                        {appointment.clinicAddress}
                      </div>
                    )}
                </Space>
              </Card>
            </Col>

            {/* Consultation Form */}
            <Col xs={24} lg={16}>
              <Card
                title="Consultation Notes"
                extra={
                  <Space>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      loading={saving}
                      onClick={() => form.submit()}
                    >
                      Save Notes
                    </Button>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      loading={saving}
                      onClick={handleCompleteConsultation}
                      style={{
                        backgroundColor: "#52c41a",
                        borderColor: "#52c41a",
                      }}
                    >
                      Complete Consultation
                    </Button>
                  </Space>
                }
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSaveConsultation}
                >
                  <Form.Item
                    name="consultationNotes"
                    label="Consultation Notes"
                    rules={[
                      {
                        required: true,
                        message: "Please enter consultation notes",
                      },
                    ]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="Enter detailed consultation notes, symptoms observed, patient concerns, etc."
                    />
                  </Form.Item>

                  <Divider />

                  <Form.Item
                    name="diagnosis"
                    label="Diagnosis"
                    rules={[
                      { required: true, message: "Please enter diagnosis" },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Enter diagnosis and medical findings"
                    />
                  </Form.Item>

                  <Divider />

                  <Form.Item
                    name="prescription"
                    label="Prescription & Treatment Plan"
                    rules={[
                      { required: true, message: "Please enter prescription" },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Enter prescription details, medications, dosage, and treatment recommendations"
                    />
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </Layout>
  );
};

export default DoctorConsultation;
