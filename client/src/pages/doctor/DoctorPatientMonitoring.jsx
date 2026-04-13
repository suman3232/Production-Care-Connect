import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Spin,
  Empty,
  Progress,
  Badge,
  Avatar,
  Tag,
  Button,
  Modal,
  Form,
  Select,
  message,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import Layout from "../../components/Layout";
import moment from "moment";

const { Option } = Select;

const DoctorPatientMonitoring = () => {
  const [patientPlans, setPatientPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchPatientPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/activity/doctor-patients", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        setPatientPlans(res.data.data);
      }
    } catch (error) {
      console.error(error);
      message.error("Unable to load patient plans");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (plan) => {
    setSelectedPlan(plan);
    try {
      const res = await axios.get(`/api/v1/activity/analytics/${plan._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        setAnalytics(res.data.data);
        setIsModalVisible(true);
      }
    } catch (error) {
      console.error(error);
      message.error("Unable to load plan analytics");
    }
  };

  const handleUpdateStatus = async (planId, status) => {
    try {
      setUpdating(true);
      const res = await axios.put(
        "/api/v1/activity/update-plan-status",
        {
          planId,
          status,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      if (res.data.success) {
        message.success("Plan status updated successfully");
        fetchPatientPlans();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      message.error("Unable to update plan status");
    } finally {
      setUpdating(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedPlan(null);
    setAnalytics(null);
  };

  useEffect(() => {
    fetchPatientPlans();
  }, []);

  const getCompletionColor = (rate) => {
    if (rate >= 80) return "#52c41a";
    if (rate >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const columns = [
    {
      title: "Patient",
      dataIndex: "userId",
      key: "userId",
      render: (user) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar icon={<UserOutlined />} style={{ marginRight: "8px" }} />
          <div>
            <div style={{ fontWeight: "bold" }}>{user?.name}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>{user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Appointment Date",
      dataIndex: "appointmentId",
      key: "appointmentId",
      render: (appointment) => (
        <div>
          <div>{moment(appointment?.date).format("DD MMM, YYYY")}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {appointment?.time}
          </div>
        </div>
      ),
    },
    {
      title: "Plan Duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration, record) => {
        const daysLeft = Math.max(
          0,
          Math.ceil(
            (new Date(record.endDate) - new Date()) / (1000 * 60 * 60 * 24),
          ),
        );
        return (
          <div>
            <div>{duration} days total</div>
            <div
              style={{
                fontSize: "12px",
                color: daysLeft > 0 ? "#52c41a" : "#ff4d4f",
              }}
            >
              {daysLeft} days left
            </div>
          </div>
        );
      },
    },
    {
      title: "Completion Rate",
      dataIndex: "completionRate",
      key: "completionRate",
      render: (rate) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Progress
            type="circle"
            percent={rate}
            size={40}
            strokeColor={getCompletionColor(rate)}
            format={(percent) => `${percent}%`}
          />
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "active"
              ? "green"
              : status === "completed"
                ? "blue"
                : "red"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View Details
          </Button>
          {record.status === "active" && (
            <Select
              size="small"
              style={{ width: "100px" }}
              placeholder="Update"
              onChange={(value) => handleUpdateStatus(record._id, value)}
              loading={updating}
            >
              <Option value="completed">Complete</Option>
              <Option value="cancelled">Cancel</Option>
            </Select>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "20px" }}>
          <BarChartOutlined style={{ marginRight: "10px" }} />
          Patient Health Monitoring
        </h1>

        <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: "12px" }}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#1890ff",
                  }}
                >
                  {patientPlans.length}
                </div>
                <div style={{ color: "#666" }}>Active Health Plans</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: "12px" }}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#52c41a",
                  }}
                >
                  {patientPlans.filter((p) => p.completionRate >= 80).length}
                </div>
                <div style={{ color: "#666" }}>High Performers (≥80%)</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: "12px" }}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#fa8c16",
                  }}
                >
                  {patientPlans.filter((p) => p.completionRate < 60).length}
                </div>
                <div style={{ color: "#666" }}>Need Attention (&lt;60%)</div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card style={{ borderRadius: "12px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h3>Patient Health Plans Overview</h3>
            <p>
              Monitor your patients' progress on their prescribed health plans.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
            </div>
          ) : patientPlans.length > 0 ? (
            <Table
              columns={columns}
              dataSource={patientPlans}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          ) : (
            <Empty description="No patient health plans to monitor" />
          )}
        </Card>

        <Modal
          title={
            <div>
              <UserOutlined style={{ marginRight: "8px" }} />
              Patient Health Plan Details
              {selectedPlan && (
                <div
                  style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}
                >
                  Patient: {selectedPlan.userId?.name}
                </div>
              )}
            </div>
          }
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={800}
        >
          {analytics && selectedPlan ? (
            <div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" title="Plan Overview">
                    <div style={{ marginBottom: "12px" }}>
                      <strong>Duration:</strong> {selectedPlan.duration} days
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <strong>Start Date:</strong>{" "}
                      {moment(selectedPlan.startDate).format("DD MMM, YYYY")}
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <strong>End Date:</strong>{" "}
                      {moment(selectedPlan.endDate).format("DD MMM, YYYY")}
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <strong>Status:</strong>{" "}
                      <Tag
                        color={
                          selectedPlan.status === "active" ? "green" : "blue"
                        }
                      >
                        {selectedPlan.status.toUpperCase()}
                      </Tag>
                    </div>
                    {selectedPlan.notes && (
                      <div>
                        <strong>Doctor's Notes:</strong>
                        <div
                          style={{
                            marginTop: "4px",
                            fontStyle: "italic",
                            color: "#666",
                          }}
                        >
                          {selectedPlan.notes}
                        </div>
                      </div>
                    )}
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card size="small" title="Daily Targets">
                    <div style={{ marginBottom: "12px" }}>
                      <Badge
                        status="processing"
                        text={`Water: ${selectedPlan.water} glasses`}
                      />
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <Badge
                        status="success"
                        text={`Exercise: ${selectedPlan.exercise} minutes`}
                      />
                    </div>
                    <div>
                      <Badge
                        status="warning"
                        text={`Sleep: ${selectedPlan.sleep} hours`}
                      />
                    </div>
                  </Card>
                </Col>

                <Col xs={24}>
                  <Card size="small" title="Performance Analytics">
                    <Row gutter={16}>
                      <Col xs={24} sm={6}>
                        <div
                          style={{ textAlign: "center", marginBottom: "16px" }}
                        >
                          <Progress
                            type="circle"
                            percent={
                              analytics.analytics.targetAchievement.water
                            }
                            strokeColor="#1890ff"
                            size={80}
                          />
                          <div style={{ marginTop: "8px", fontSize: "12px" }}>
                            Water Target Achievement
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={6}>
                        <div
                          style={{ textAlign: "center", marginBottom: "16px" }}
                        >
                          <Progress
                            type="circle"
                            percent={
                              analytics.analytics.targetAchievement.exercise
                            }
                            strokeColor="#52c41a"
                            size={80}
                          />
                          <div style={{ marginTop: "8px", fontSize: "12px" }}>
                            Exercise Target Achievement
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={6}>
                        <div
                          style={{ textAlign: "center", marginBottom: "16px" }}
                        >
                          <Progress
                            type="circle"
                            percent={
                              analytics.analytics.targetAchievement.sleep
                            }
                            strokeColor="#fa8c16"
                            size={80}
                          />
                          <div style={{ marginTop: "8px", fontSize: "12px" }}>
                            Sleep Target Achievement
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={6}>
                        <div
                          style={{ textAlign: "center", marginBottom: "16px" }}
                        >
                          <Progress
                            type="circle"
                            percent={analytics.analytics.healthScore}
                            strokeColor="#722ed1"
                            size={80}
                            format={(percent) => `${percent.toFixed(1)}%`}
                          />
                          <div style={{ marginTop: "8px", fontSize: "12px" }}>
                            Health Score
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <div style={{ marginTop: "16px" }}>
                      <div style={{ marginBottom: "8px" }}>
                        <strong>Overall Completion:</strong>{" "}
                        {analytics.analytics.completedDays} of{" "}
                        {analytics.analytics.totalDays} days
                      </div>
                      <Progress
                        percent={
                          analytics.analytics.totalDays > 0
                            ? (analytics.analytics.completedDays /
                                analytics.analytics.totalDays) *
                              100
                            : 0
                        }
                        status="active"
                        strokeColor="#722ed1"
                      />
                    </div>

                    {selectedPlan.customTasks &&
                      selectedPlan.customTasks.length > 0 && (
                        <div style={{ marginTop: "16px" }}>
                          <div style={{ marginBottom: "8px" }}>
                            <strong>Custom Tasks Completion:</strong>{" "}
                            {analytics.analytics.customTasksCompletion.toFixed(
                              1,
                            )}
                            %
                          </div>
                          <Progress
                            percent={analytics.analytics.customTasksCompletion}
                            status="active"
                            strokeColor="#fa8c16"
                          />
                        </div>
                      )}
                  </Card>
                </Col>

                {analytics.analytics.weeklyProgress.length > 0 && (
                  <Col xs={24}>
                    <Card size="small" title="Weekly Progress Trend">
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={analytics.analytics.weeklyProgress}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="water"
                            stroke="#1890ff"
                            name="Water"
                          />
                          <Line
                            type="monotone"
                            dataKey="exercise"
                            stroke="#52c41a"
                            name="Exercise"
                          />
                          <Line
                            type="monotone"
                            dataKey="sleep"
                            stroke="#fa8c16"
                            name="Sleep"
                          />
                          <Line
                            type="monotone"
                            dataKey="healthScore"
                            stroke="#722ed1"
                            name="Health Score (%)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                )}

                <Col xs={24}>
                  <Card size="small" title="Recent Activity Logs">
                    {analytics.logs && analytics.logs.length > 0 ? (
                      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {analytics.logs.slice(0, 7).map((log) => (
                          <div
                            key={log._id}
                            style={{
                              padding: "12px",
                              border: "1px solid #f0f0f0",
                              borderRadius: "6px",
                              marginBottom: "8px",
                              background: "#fafafa",
                            }}
                          >
                            <Row gutter={16} align="middle">
                              <Col xs={24} sm={6}>
                                <strong>
                                  {moment(log.date).format("DD MMM, YYYY")}
                                </strong>
                              </Col>
                              <Col xs={24} sm={12}>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "12px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <Badge
                                    status="processing"
                                    text={`Water: ${log.water} glasses`}
                                  />
                                  <Badge
                                    status="success"
                                    text={`Exercise: ${log.exercise} min`}
                                  />
                                  <Badge
                                    status="warning"
                                    text={`Sleep: ${log.sleep} hrs`}
                                  />
                                </div>
                              </Col>
                              <Col xs={24} sm={6}>
                                <CheckCircleOutlined
                                  style={{
                                    color: "#52c41a",
                                    marginRight: "4px",
                                  }}
                                />
                                Completed
                              </Col>
                            </Row>
                            {log.notes && (
                              <div
                                style={{
                                  marginTop: "8px",
                                  color: "#666",
                                  fontStyle: "italic",
                                }}
                              >
                                "{log.notes}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty description="No activity logs yet" />
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin />
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default DoctorPatientMonitoring;
