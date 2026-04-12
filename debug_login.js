const axios = require("axios");
(async () => {
  try {
    const email = "testuser@example.com";
    const pass = "Test1234!";
    console.log("Registering");
    const reg = await axios.post("http://localhost:8081/api/v1/user/register", {
      name: "Test User",
      email,
      password: pass,
    });
    console.log("Reg", reg.status, JSON.stringify(reg.data));
    const login = await axios.post("http://localhost:8081/api/v1/user/login", {
      email,
      password: pass,
    });
    console.log("Login", login.status, JSON.stringify(login.data));
  } catch (err) {
    if (err.response) {
      console.error("Response error", err.response.status, err.response.data);
    } else {
      console.error("Error", err.message);
    }
  }
})();
