import React, { useEffect, useState } from "react";
import { Card, Form, TimePicker, InputNumber, Button, message, Spin, Row, Col } from "antd";
import Layout from "../components/Layout";
import axios from "axios";
import { useSelector } from "react-redux";
import { ClockCircleOutlined } from "@ant-design/icons";
import moment from "moment";

const DoctorAvailability = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();
  const { user } = useSelector((state) => state.user);

  const getDoctorInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/v1/doctor/getDoctorInfo",
        { userId: user?._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (res.data.success) {
        setDoctor(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (values) => {
    try {
      setSubmitLoading(true);
      const res = await axios.post(
        "/api/v1/availability/update",
        {
          timings: [
            moment(values.startTime).format("HH:mm"),
            moment(values.endTime).format("HH:mm"),
          ],
          slotDuration: values.slotDuration,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (res.data.success) {
        message.success(res.data.message);
        setDoctor(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      message.error("Unable to update availability");
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getDoctorInfo();
    }
  }, [user]);

  useEffect(() => {
    if (doctor) {
      form.setFieldsValue({
        startTime: doctor?.timings?.[0]
          ? moment(doctor.timings[0], "HH:mm")
          : null,
        endTime: doctor?.timings?.[1]
          ? moment(doctor.timings[1], "HH:mm")
          : null,
        slotDuration: doctor?.slotDuration || 30,
      });
    }
  }, [doctor, form]);

  return (
    <Layout>
      <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "20px" }}>
          <ClockCircleOutlined
            style={{ marginRight: "8px", color: "#1e88e5" }}
          />
          Manage Availability
        </h1>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin />
          </div>
        ) : (
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Start Time"
                    name="startTime"
                    rules={[{ required: true }]}
                  >
                    <TimePicker
                      format="HH:mm"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="End Time"
                    name="endTime"
                    rules={[{ required: true }]}
                  >
                    <TimePicker format="HH:mm" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Slot Duration (minutes)"
                    name="slotDuration"
                    rules={[{ required: true }]}
                  >
                    <InputNumber style={{ width: "100%" }} min={10} max={120} />
                  </Form.Item>
                </Col>
              </Row>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitLoading}
                style={{ marginTop: "16px" }}
              >
                Save Availability
              </Button>
            </Form>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default DoctorAvailability;
