import {
  DatePicker,
  message,
  TimePicker,
  Button,
  Card,
  Spin,
  Space,
  Tag,
  Divider,
  Radio,
} from "antd";
import Layout from "../components/Layout";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const BookingPage = () => {
  const { user } = useSelector((state) => state.user);
  const Params = useParams();
  const dispatch = useDispatch();
  const [doctors, setDoctors] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [consultationType, setConsultationType] = useState("online");

  const availableModes =
    doctors &&
    Array.isArray(doctors.consultationModes) &&
    doctors.consultationModes.length
      ? doctors.consultationModes
      : ["online", "offline"];
  const onlineAvailable = availableModes.includes("online");
  const offlineAvailable = availableModes.includes("offline");

  const fetchAvailableSlots = async (selectedDate) => {
    if (!selectedDate) return;
    try {
      setCheckingSlots(true);
      const res = await axios.post(
        "/api/v1/availability/slots",
        { doctorId: Params.doctorId, date: selectedDate },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      );
      if (res.data.success) {
        setAvailableSlots(res.data.data.availableSlots || []);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Slot fetch error:", error);
      setAvailableSlots([]);
    } finally {
      setCheckingSlots(false);
    }
  };

  // Fetch doctor details
  const getUserData = async () => {
    try {
      const res = await axios.post(
        "/api/v1/doctor/getDoctorById",
        { doctorId: Params.doctorId },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      );

      if (res.data.success) {
        setDoctors(res.data.data);
        const preferredType = res.data.data.consultationModes?.[0];
        if (preferredType && preferredType !== consultationType) {
          setConsultationType(preferredType);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Check availability function
  const handleAvailablity = async () => {
    if (!date || !time) {
      return alert("Please select both date and time");
    }
    if (!availableModes.includes(consultationType)) {
      return alert(
        "Selected consultation type is not available for this doctor",
      );
    }
    if (consultationType === "offline" && !doctors?.clinicAddress) {
      return alert(
        "Doctor's clinic address is required for offline consultations",
      );
    }

    try {
      dispatch(showLoading());

      const res = await axios.post(
        "/api/v1/user/booking-availbility", // Verify this route on the backend
        { doctorId: Params.doctorId, date, time }, // Passing the correct data
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      );

      dispatch(hideLoading());

      if (res.data.success) {
        setIsAvailable(true);
        message.success(res.data.message);
      } else {
        message.warning(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error in availability check:", error);
      message.error("Error while checking availability");
    }
  };

  // Booking function
  const handleBooking = async () => {
    if (!date || !time) {
      return alert("Date & Time Required");
    }

    try {
      dispatch(showLoading());

      // Initiate booking and get Razorpay order
      const res = await axios.post(
        "/api/v1/user/initiate-booking",
        {
          doctorId: Params.doctorId,
          userId: user._id,
          doctorInfo: doctors,
          date: date,
          userInfo: user,
          time: time,
          consultationType: consultationType,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      );

      dispatch(hideLoading());

      if (res.data.success) {
        const { data: order, key } = res.data;

        // Open Razorpay checkout
        const options = {
          key,
          amount: order.amount,
          currency: order.currency,
          name: "Doctor Appointment",
          description: `Appointment with Dr. ${doctors.firstName} ${doctors.lastName}`,
          order_id: order.id,
          handler: async function (response) {
            // Verify payment
            try {
              const verifyRes = await axios.post(
                "/api/v1/user/verify-payment",
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                },
                {
                  headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                  },
                },
              );

              if (verifyRes.data.success) {
                message.success("Appointment booked successfully!");
                // Redirect or update UI
                window.location.href = "/appointments";
              } else {
                message.error(verifyRes.data.message);
              }
            } catch (error) {
              message.error("Payment verification failed");
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error in booking:", error);
      message.error("Error while initiating booking");
    }
  };

  useEffect(() => {
    getUserData();
    //eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Page Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 8px 0",
            }}
          >
            <CalendarOutlined
              style={{ marginRight: "8px", color: "#1e88e5" }}
            />
            Book an Appointment
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px", margin: "0" }}>
            Select your preferred date and time
          </p>
        </div>

        {doctors ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "24px",
            }}
          >
            {/* Doctor Info Card */}
            <Card
              style={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ marginBottom: "20px" }}>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#1f2937",
                    margin: "0 0 12px 0",
                  }}
                >
                  Dr. {doctors.firstName} {doctors.lastName}
                </h2>
                <Tag
                  color="blue"
                  style={{ fontSize: "14px", padding: "4px 12px" }}
                >
                  {doctors.specialization || "General Physician"}
                </Tag>
              </div>

              <Divider />

              {/* Doctor Details */}
              <div style={{ marginBottom: "20px" }}>
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {(doctors.consultationModes || ["online", "offline"]).map(
                      (mode) => (
                        <Tag
                          key={mode}
                          color={mode === "online" ? "blue" : "green"}
                          style={{ fontSize: "12px", padding: "4px 10px" }}
                        >
                          {mode === "online"
                            ? "Online Consultation"
                            : "Offline Consultation"}
                        </Tag>
                      ),
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <DollarOutlined
                      style={{ fontSize: "20px", color: "#1e88e5" }}
                    />
                    <span>
                      <strong>Consultation Fee:</strong> $
                      {doctors.feesperConsultation}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <ClockCircleOutlined
                      style={{ fontSize: "20px", color: "#1e88e5" }}
                    />
                    <span>
                      <strong>Available Timings:</strong>{" "}
                      {doctors.timings && doctors.timings.length > 0
                        ? `${doctors.timings[0]} - ${doctors.timings[1]}`
                        : "Not specified"}
                    </span>
                  </div>
                  {doctors.clinicAddress && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <EnvironmentOutlined
                        style={{ fontSize: "20px", color: "#1e88e5" }}
                      />
                      <span>
                        <strong>Clinic Address:</strong> {doctors.clinicAddress}
                      </span>
                    </div>
                  )}
                </Space>
              </div>
            </Card>

            {/* Booking Form Card */}
            <Card
              style={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "20px",
                }}
              >
                Select Date & Time
              </h3>

              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Consultation Type
                  </label>
                  <Radio.Group
                    value={consultationType}
                    onChange={(e) => setConsultationType(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {onlineAvailable && (
                        <Radio value="online" style={{ fontSize: "16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <PhoneOutlined style={{ color: "#1e88e5" }} />
                            <div>
                              <div style={{ fontWeight: "500" }}>
                                Online Consultation
                              </div>
                              <div
                                style={{ fontSize: "12px", color: "#6b7280" }}
                              >
                                Video call with doctor from home
                              </div>
                            </div>
                          </div>
                        </Radio>
                      )}
                      {offlineAvailable && (
                        <Radio value="offline" style={{ fontSize: "16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <CalendarOutlined style={{ color: "#26a69a" }} />
                            <div>
                              <div style={{ fontWeight: "500" }}>
                                In-Clinic Visit
                              </div>
                              <div
                                style={{ fontSize: "12px", color: "#6b7280" }}
                              >
                                Visit doctor's clinic for consultation
                              </div>
                            </div>
                          </div>
                        </Radio>
                      )}
                    </Space>
                  </Radio.Group>
                  {!onlineAvailable && !offlineAvailable && (
                    <div style={{ color: "#b91c1c", marginTop: "8px" }}>
                      This doctor has not configured consultation modes yet.
                    </div>
                  )}
                  {consultationType === "offline" &&
                    !doctors?.clinicAddress && (
                      <div style={{ color: "#b91c1c", marginTop: "8px" }}>
                        Clinic address is required for offline consultations.
                      </div>
                    )}
                  {consultationType === "offline" && doctors?.clinicAddress && (
                    <div style={{ color: "#16a34a", marginTop: "8px" }}>
                      Clinic Address: {doctors.clinicAddress}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Date
                  </label>
                  <DatePicker
                    format="DD-MM-YYYY"
                    onChange={(value) => {
                      const formatted = value
                        ? moment(value).format("DD-MM-YYYY")
                        : null;
                      setDate(formatted);
                      setTime(null);
                      setIsAvailable(false);
                      setAvailableSlots([]);
                      if (formatted) {
                        fetchAvailableSlots(formatted);
                      }
                    }}
                    style={{
                      width: "100%",
                      height: "40px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                    }}
                    placeholder="Select appointment date"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Time
                  </label>
                  <TimePicker
                    format="HH:mm"
                    value={time ? moment(time, "HH:mm") : null}
                    onChange={(value) => {
                      setTime(value ? moment(value).format("HH:mm") : null);
                      setIsAvailable(false);
                    }}
                    style={{
                      width: "100%",
                      height: "40px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                    }}
                    placeholder="Select appointment time"
                  />
                  {date && (
                    <div
                      style={{
                        marginTop: "16px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "#374151", fontWeight: 600 }}>
                        Available slots:
                      </span>
                      {checkingSlots ? (
                        <Spin size="small" />
                      ) : availableSlots.length ? (
                        availableSlots.map((slot) => (
                          <Button
                            key={slot}
                            type={time === slot ? "primary" : "default"}
                            onClick={() => {
                              setTime(slot);
                              setIsAvailable(true);
                            }}
                          >
                            {slot}
                          </Button>
                        ))
                      ) : (
                        <span style={{ color: "#6b7280" }}>
                          No available slots found for selected date.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <Divider />

                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={() => handleAvailablity()}
                    style={{
                      height: "42px",
                      fontSize: "16px",
                      fontWeight: "600",
                      borderRadius: "6px",
                      backgroundColor: "#1e88e5",
                      border: "none",
                    }}
                  >
                    Check Availability
                  </Button>
                  {isAvailable && (
                    <Button
                      type="primary"
                      size="large"
                      block
                      onClick={() => handleBooking()}
                      style={{
                        height: "42px",
                        fontSize: "16px",
                        fontWeight: "600",
                        borderRadius: "6px",
                        backgroundColor: "#26a69a",
                        border: "none",
                      }}
                    >
                      Confirm Booking
                    </Button>
                  )}
                </Space>
              </Space>
            </Card>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <Spin size="large" tip="Loading doctor details..." />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookingPage;
