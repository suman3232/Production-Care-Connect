import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  InputNumber,
  Input,
  Button,
  message,
  Spin,
  Empty,
  Select,
  Modal,
  Table,
  Tag,
  Space,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Layout from "../../components/Layout";
import moment from "moment";

const { Option } = Select;
const { TextArea } = Input;

const DoctorPlanAssignment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [customTasks, setCustomTasks] = useState([]);
  const [form] = Form.useForm();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/doctor/doctor-appointments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        // Filter for approved appointments that don't have health plans yet
        const approvedAppointments = res.data.data.filter(
          (appointment) =>
            appointment.status === "approved" && !appointment.healthPlanId,
        );
        setAppointments(approvedAppointments);
      }
    } catch (error) {
      console.error(error);
      message.error("Unable to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPlan = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        appointmentId: selectedAppointment._id,
        water: values.waterIntake,
        exercise: values.exerciseMinutes,
        sleep: values.sleepHours,
        duration: values.duration,
        customTasks: customTasks.filter(
          (task) => task.title.trim() && task.target.trim(),
        ),
        notes: values.notes,
      };

      const res = await axios.post("/api/v1/doctor/assign-plan", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) {
        message.success("Health plan assigned successfully!");
        setIsModalVisible(false);
        setSelectedAppointment(null);
        setCustomTasks([]);
        fetchAppointments(); // Refresh the list
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      message.error("Unable to assign health plan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedAppointment(null);
    setCustomTasks([]);
    form.resetFields();
  };

  const addCustomTask = () => {
    setCustomTasks([...customTasks, { title: "", target: "" }]);
  };

  const removeCustomTask = (index) => {
    const newTasks = customTasks.filter((_, i) => i !== index);
    setCustomTasks(newTasks);
  };

  const updateCustomTask = (index, field, value) => {
    const newTasks = [...customTasks];
    newTasks[index][field] = value;
    setCustomTasks(newTasks);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const columns = [
    {
      title: "Patient",
      dataIndex: "userInfo",
      key: "userInfo",
      render: (userInfo) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{userInfo?.name}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {userInfo?.email}
          </div>
        </div>
      ),
    },
    {
      title: "Date & Time",
      dataIndex: "date",
      key: "date",
      render: (date, record) => (
        <div>
          <div>{moment(date).format("DD MMM, YYYY")}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{record.time}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "completed" ? "green" : "blue"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleAssignPlan(record)}
          size="small"
        >
          Assign Plan
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "20px" }}>
          <UserOutlined style={{ marginRight: "10px" }} />
          Health Plan Assignment
        </h1>

        <Card style={{ borderRadius: "12px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h3>Completed Appointments</h3>
            <p>
              Assign personalized health plans to patients after their
              appointments.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
            </div>
          ) : appointments.length > 0 ? (
            <Table
              columns={columns}
              dataSource={appointments}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          ) : (
            <Empty description="No completed appointments available for health plan assignment" />
          )}
        </Card>

        <Modal
          title={
            <div>
              <CheckCircleOutlined
                style={{ marginRight: "8px", color: "#52c41a" }}
              />
              Assign Health Plan
              {selectedAppointment && (
                <div
                  style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}
                >
                  Patient: {selectedAppointment.userInfo?.name}
                </div>
              )}
            </div>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              waterIntake: 8,
              exerciseMinutes: 30,
              sleepHours: 8,
              duration: 30,
            }}
          >
            <div
              style={{
                marginBottom: "20px",
                padding: "16px",
                background: "#f6ffed",
                borderRadius: "8px",
              }}
            >
              <h4 style={{ marginBottom: "12px", color: "#52c41a" }}>
                Set Daily Health Targets
              </h4>
              <p style={{ marginBottom: "0", fontSize: "14px", color: "#666" }}>
                These targets will help your patient maintain a healthy
                lifestyle. Adjust based on their current health condition and
                capabilities.
              </p>
            </div>

            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Water Intake (glasses/day)"
                  name="waterIntake"
                  rules={[
                    {
                      required: true,
                      message: "Please set water intake target",
                    },
                    {
                      min: 1,
                      max: 20,
                      type: "number",
                      message: "Must be between 1-20",
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={20}
                    style={{ width: "100%" }}
                    placeholder="e.g., 8"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Exercise (minutes/day)"
                  name="exerciseMinutes"
                  rules={[
                    { required: true, message: "Please set exercise target" },
                    {
                      min: 0,
                      max: 300,
                      type: "number",
                      message: "Must be between 0-300",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={300}
                    style={{ width: "100%" }}
                    placeholder="e.g., 30"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Sleep Hours (per night)"
                  name="sleepHours"
                  rules={[
                    { required: true, message: "Please set sleep target" },
                    {
                      min: 1,
                      max: 12,
                      type: "number",
                      message: "Must be between 1-12",
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={12}
                    style={{ width: "100%" }}
                    placeholder="e.g., 8"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Plan Duration (days)"
              name="duration"
              rules={[
                { required: true, message: "Please set plan duration" },
                {
                  min: 1,
                  max: 365,
                  type: "number",
                  message: "Must be between 1-365 days",
                },
              ]}
            >
              <InputNumber
                min={1}
                max={365}
                style={{ width: "100%" }}
                placeholder="e.g., 30"
              />
            </Form.Item>

            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <h4 style={{ margin: 0 }}>Custom Tasks (Optional)</h4>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addCustomTask}
                  size="small"
                >
                  Add Task
                </Button>
              </div>
              <p
                style={{
                  marginBottom: "16px",
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                Add personalized tasks like "Take medicine", "Walk after
                dinner", etc.
              </p>

              {customTasks.map((task, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "12px",
                    alignItems: "center",
                  }}
                >
                  <Input
                    placeholder="Task title (e.g., Take medicine)"
                    value={task.title}
                    onChange={(e) =>
                      updateCustomTask(index, "title", e.target.value)
                    }
                    style={{ flex: 2 }}
                  />
                  <Input
                    placeholder="Target (e.g., 2 times/day)"
                    value={task.target}
                    onChange={(e) =>
                      updateCustomTask(index, "target", e.target.value)
                    }
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<span>×</span>}
                    onClick={() => removeCustomTask(index)}
                    style={{ fontSize: "18px", padding: "4px 8px" }}
                  />
                </div>
              ))}
            </div>

            <Form.Item
              label="Doctor's Notes & Recommendations"
              name="notes"
              rules={[
                { required: true, message: "Please provide recommendations" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Provide personalized recommendations, precautions, or additional instructions for the patient..."
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  icon={<CheckCircleOutlined />}
                >
                  Assign Health Plan
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default DoctorPlanAssignment;
