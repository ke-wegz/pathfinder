const userService = require('./modules/users/user.service');

async function testRegister() {
  try {
    const res = await userService.registerUser({ name: "Test User", email: "test@example.com" }, "dummy_uid_123");
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e);
  }
}

testRegister();
