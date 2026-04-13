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
  DatePicker,
  Select,
  Progress,
  Alert,
  Tabs,
  Statistic,
  Badge,
} from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import Layout from "../components/Layout";
import moment from "moment";
import {
  TrophyOutlined,
  AimOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;
const { Option } = Select;

const UserActivity = () => {
  const [healthPlans, setHealthPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [customTasksCompleted, setCustomTasksCompleted] = useState([]);

  const fetchHealthPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/activity/patient-plans", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        setHealthPlans(res.data.data);
        if (res.data.data.length > 0 && !selectedPlan) {
          setSelectedPlan(res.data.data[0]);
          fetchAnalytics(res.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error(error);
      message.error("Unable to load health plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (planId) => {
    try {
      const res = await axios.get(`/api/v1/activity/analytics/${planId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        setAnalytics(res.data.data);
        setLogs(res.data.data.logs);
      }
    } catch (error) {
      console.error(error);
      message.error("Unable to load analytics");
    }
  };

  const handlePlanChange = (planId) => {
    const plan = healthPlans.find((p) => p._id === planId);
    setSelectedPlan(plan);
    fetchAnalytics(planId);
  };

  const handleSubmit = async (values) => {
    if (!selectedPlan) {
      message.error("Please select a health plan");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        planId: selectedPlan._id,
        date: values.date
          ? values.date.format("YYYY-MM-DD")
          : moment().format("YYYY-MM-DD"),
        water: values.waterIntake,
        exercise: values.exerciseMinutes,
        sleep: values.sleepHours,
        customTasksCompleted,
        notes: values.notes,
      };

      const res = await axios.post("/api/v1/activity/log-activity", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) {
        message.success(res.data.message);
        fetchAnalytics(selectedPlan._id);
        setCustomTasksCompleted([]); // Reset custom tasks
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      message.error("Unable to save activity");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchHealthPlans();
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "20px" }}>
          <AimOutlined style={{ marginRight: "10px" }} />
          Doctor-Prescribed Health Tracking
        </h1>

        {healthPlans.length === 0 ? (
          <Alert
            message="No Active Health Plans"
            description="You don't have any active health plans from your doctor. Health plans are assigned after appointments."
            type="info"
            showIcon
          />
        ) : (
          <>
            <Card style={{ marginBottom: "24px", borderRadius: "12px" }}>
              <Row gutter={16} align="middle">
                <Col xs={24} md={8}>
                  <label
                    style={{
                      fontWeight: "bold",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Select Health Plan:
                  </label>
                  <Select
                    style={{ width: "100%" }}
                    value={selectedPlan?._id}
                    onChange={handlePlanChange}
                  >
                    {healthPlans.map((plan) => (
                      <Option key={plan._id} value={plan._id}>
                        Plan by Dr. {plan.doctorId?.name} (
                        {plan.doctorId?.specialization})
                      </Option>
                    ))}
                  </Select>
                </Col>
                {selectedPlan && (
                  <>
                    <Col xs={24} md={6}>
                      <Statistic
                        title="Duration"
                        value={`${selectedPlan.duration} days`}
                        valueStyle={{ color: "#3f8600" }}
                      />
                    </Col>
                    <Col xs={24} md={5}>
                      <Statistic
                        title="Days Left"
                        value={Math.max(
                          0,
                          Math.ceil(
                            (new Date(selectedPlan.endDate) - new Date()) /
                              (1000 * 60 * 60 * 24),
                          ),
                        )}
                        valueStyle={{ color: "#cf1322" }}
                      />
                    </Col>
                    <Col xs={24} md={5}>
                      <Statistic
                        title="Status"
                        value={selectedPlan.status}
                        valueStyle={{
                          color:
                            selectedPlan.status === "active"
                              ? "#3f8600"
                              : "#cf1322",
                        }}
                      />
                    </Col>
                  </>
                )}
              </Row>
            </Card>

            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Log Activity" key="1">
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <Card
                      title="Log Today's Activity"
                      style={{ borderRadius: "12px" }}
                    >
                      {selectedPlan && (
                        <div style={{ marginBottom: "20px" }}>
                          <h4>Your Daily Targets:</h4>
                          <Row gutter={16}>
                            <Col span={8}>
                              <div
                                style={{
                                  textAlign: "center",
                                  padding: "10px",
                                  background: "#f0f8ff",
                                  borderRadius: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    color: "#1890ff",
                                  }}
                                >
                                  {selectedPlan.water}
                                </div>
                                <div
                                  style={{ fontSize: "12px", color: "#666" }}
                                >
                                  Water (glasses)
                                </div>
                              </div>
                            </Col>
                            <Col span={8}>
                              <div
                                style={{
                                  textAlign: "center",
                                  padding: "10px",
                                  background: "#f6ffed",
                                  borderRadius: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    color: "#52c41a",
                                  }}
                                >
                                  {selectedPlan.exercise}
                                </div>
                                <div
                                  style={{ fontSize: "12px", color: "#666" }}
                                >
                                  Exercise (min)
                                </div>
                              </div>
                            </Col>
                            <Col span={8}>
                              <div
                                style={{
                                  textAlign: "center",
                                  padding: "10px",
                                  background: "#fff7e6",
                                  borderRadius: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    color: "#fa8c16",
                                  }}
                                >
                                  {selectedPlan.sleep}
                                </div>
                                <div
                                  style={{ fontSize: "12px", color: "#666" }}
                                >
                                  Sleep (hrs)
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}

                      <Form
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                          date: moment(),
                          waterIntake: 0,
                          exerciseMinutes: 0,
                          sleepHours: 0,
                        }}
                      >
                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Date"
                              name="date"
                              rules={[{ required: true }]}
                            >
                              <DatePicker style={{ width: "100%" }} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              label="Water Intake (glasses)"
                              name="waterIntake"
                              rules={[{ required: true }]}
                            >
                              <InputNumber
                                min={0}
                                max={20}
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              label="Exercise (minutes)"
                              name="exerciseMinutes"
                              rules={[{ required: true }]}
                            >
                              <InputNumber
                                min={0}
                                max={300}
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              label="Sleep Hours"
                              name="sleepHours"
                              rules={[{ required: true }]}
                            >
                              <InputNumber
                                min={0}
                                max={12}
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        {selectedPlan &&
                          selectedPlan.customTasks &&
                          selectedPlan.customTasks.length > 0 && (
                            <div style={{ marginBottom: "24px" }}>
                              <h4 style={{ marginBottom: "12px" }}>
                                Custom Tasks
                              </h4>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "8px",
                                }}
                              >
                                {selectedPlan.customTasks.map((task, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "12px",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={customTasksCompleted.some(
                                        (ct) =>
                                          ct.taskId === task._id &&
                                          ct.completed,
                                      )}
                                      onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        setCustomTasksCompleted((prev) => {
                                          const existing = prev.find(
                                            (ct) => ct.taskId === task._id,
                                          );
                                          if (existing) {
                                            return prev.map((ct) =>
                                              ct.taskId === task._id
                                                ? {
                                                    ...ct,
                                                    completed: isChecked,
                                                  }
                                                : ct,
                                            );
                                          } else {
                                            return [
                                              ...prev,
                                              {
                                                taskId: task._id,
                                                title: task.title,
                                                completed: isChecked,
                                              },
                                            ];
                                          }
                                        });
                                      }}
                                    />
                                    <span style={{ flex: 1 }}>
                                      <strong>{task.title}</strong> -{" "}
                                      {task.target}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        <Form.Item label="Notes" name="notes">
                          <Input.TextArea
                            rows={3}
                            placeholder="How did you feel today?"
                          />
                        </Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={submitting}
                          block
                        >
                          Save Activity
                        </Button>
                      </Form>
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card
                      title="Today's Progress"
                      style={{ borderRadius: "12px" }}
                    >
                      {selectedPlan && analytics ? (
                        <div>
                          <Row gutter={16} style={{ marginBottom: "20px" }}>
                            <Col span={8}>
                              <Progress
                                type="circle"
                                percent={Math.min(
                                  100,
                                  (analytics.analytics.averageWaterIntake /
                                    selectedPlan.water) *
                                    100,
                                )}
                                format={() =>
                                  `${analytics.analytics.averageWaterIntake.toFixed(1)}/${selectedPlan.water}`
                                }
                                strokeColor="#1890ff"
                                size={80}
                              />
                              <div
                                style={{
                                  textAlign: "center",
                                  marginTop: "8px",
                                  fontSize: "12px",
                                }}
                              >
                                Water
                              </div>
                            </Col>
                            <Col span={8}>
                              <Progress
                                type="circle"
                                percent={Math.min(
                                  100,
                                  (analytics.analytics.averageExerciseMinutes /
                                    selectedPlan.exercise) *
                                    100,
                                )}
                                format={() =>
                                  `${analytics.analytics.averageExerciseMinutes.toFixed(0)}/${selectedPlan.exercise}`
                                }
                                strokeColor="#52c41a"
                                size={80}
                              />
                              <div
                                style={{
                                  textAlign: "center",
                                  marginTop: "8px",
                                  fontSize: "12px",
                                }}
                              >
                                Exercise
                              </div>
                            </Col>
                            <Col span={8}>
                              <Progress
                                type="circle"
                                percent={Math.min(
                                  100,
                                  (analytics.analytics.averageSleepHours /
                                    selectedPlan.sleep) *
                                    100,
                                )}
                                format={() =>
                                  `${analytics.analytics.averageSleepHours.toFixed(1)}/${selectedPlan.sleep}`
                                }
                                strokeColor="#fa8c16"
                                size={80}
                              />
                              <div
                                style={{
                                  textAlign: "center",
                                  marginTop: "8px",
                                  fontSize: "12px",
                                }}
                              >
                                Sleep
                              </div>
                            </Col>
                          </Row>

                          <div style={{ textAlign: "center" }}>
                            <h4>Completion Rate</h4>
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
                            <div
                              style={{
                                marginTop: "8px",
                                fontSize: "14px",
                                color: "#666",
                              }}
                            >
                              {analytics.analytics.completedDays} of{" "}
                              {analytics.analytics.totalDays} days completed
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Empty description="Select a health plan to view progress" />
                      )}
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Analytics & Progress" key="2">
                {analytics ? (
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={8}>
                      <Card
                        title="Target Achievement"
                        style={{ borderRadius: "12px" }}
                      >
                        <div style={{ marginBottom: "20px" }}>
                          <h4>Water Intake</h4>
                          <Progress
                            percent={
                              analytics.analytics.targetAchievement.water
                            }
                            status="active"
                            strokeColor="#1890ff"
                          />
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                          <h4>Exercise</h4>
                          <Progress
                            percent={
                              analytics.analytics.targetAchievement.exercise
                            }
                            status="active"
                            strokeColor="#52c41a"
                          />
                        </div>
                        <div>
                          <h4>Sleep</h4>
                          <Progress
                            percent={
                              analytics.analytics.targetAchievement.sleep
                            }
                            status="active"
                            strokeColor="#fa8c16"
                          />
                        </div>
                        <div style={{ marginTop: "20px" }}>
                          <h4>Custom Tasks Completion</h4>
                          <Progress
                            percent={analytics.analytics.customTasksCompletion}
                            status="active"
                            strokeColor="#722ed1"
                          />
                        </div>
                        <div style={{ marginTop: "20px" }}>
                          <h4>Overall Health Score</h4>
                          <Progress
                            type="circle"
                            percent={analytics.analytics.healthScore}
                            format={(percent) => `${percent.toFixed(1)}%`}
                            strokeColor="#52c41a"
                            size={100}
                          />
                        </div>
                      </Card>
                    </Col>

                    <Col xs={24} lg={16}>
                      <Card
                        title="Weekly Progress Trends"
                        style={{ borderRadius: "12px" }}
                      >
                        {analytics.analytics.weeklyProgress.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                              data={analytics.analytics.weeklyProgress}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="week" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="water"
                                stroke="#1890ff"
                                name="Water (glasses)"
                              />
                              <Line
                                type="monotone"
                                dataKey="exercise"
                                stroke="#52c41a"
                                name="Exercise (min)"
                              />
                              <Line
                                type="monotone"
                                dataKey="sleep"
                                stroke="#fa8c16"
                                name="Sleep (hrs)"
                              />
                              <Line
                                type="monotone"
                                dataKey="healthScore"
                                stroke="#722ed1"
                                name="Health Score (%)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <Empty description="No weekly data available" />
                        )}
                      </Card>
                    </Col>

                    <Col xs={24}>
                      <Card
                        title="Recent Activity Logs"
                        style={{ borderRadius: "12px" }}
                      >
                        {logs.length > 0 ? (
                          <div className="activity-list">
                            {logs.slice(0, 10).map((log) => (
                              <div
                                key={log._id}
                                className="activity-item"
                                style={{
                                  padding: "16px",
                                  border: "1px solid #f0f0f0",
                                  borderRadius: "8px",
                                  marginBottom: "12px",
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
                                        gap: "16px",
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
                                    <div style={{ textAlign: "right" }}>
                                      <CheckCircleOutlined
                                        style={{
                                          color: "#52c41a",
                                          marginRight: "4px",
                                        }}
                                      />
                                      Completed
                                    </div>
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
                ) : (
                  <Empty description="No analytics available" />
                )}
              </TabPane>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
};

export default UserActivity;
