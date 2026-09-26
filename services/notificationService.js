const { getMessaging } = require("../utils/firebaseAdmin");

const sendToToken = async ({ token, title, body, data = {} }) => {
  const startTime = Date.now();
  console.log("🔔 [notificationService] sendToToken called");
  console.log("🔔 [notificationService] Token:", token ? `${token.substring(0, 20)}...` : "NULL");

  try {
    if (!token) {
      console.log("⚠️ [notificationService] No token — aborting");
      return { success: false, message: "No token" };
    }

    const message = {
      token,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: {
        priority: "high",
        notification: { sound: "default", channelId: "default" },
      },
      apns: { payload: { aps: { sound: "default", badge: 1 } } },
    };

    console.log("📦 [notificationService] Message payload:", JSON.stringify(message, null, 2));

    const id = await getMessaging().send(message);

    console.log(
      `✅ [notificationService] Push sent in ${Date.now() - startTime}ms. MessageId: ${id}`
    );
    return { success: true, messageId: id };
  } catch (err) {
    console.error("❌ [notificationService] FCM error");
    console.error("❌ Code:", err.code);
    console.error("❌ Message:", err.message);
    return { success: false, error: err.message, code: err.code };
  }
};

const sendToTokens = async ({ tokens = [], title, body, data = {} }) => {
  console.log("🔔 [notificationService] sendToTokens called with", tokens.length, "tokens");
  try {
    const valid = tokens.filter(Boolean);
    if (!valid.length) {
      console.log("⚠️ [notificationService] No valid tokens");
      return { success: false, message: "No tokens" };
    }

    const res = await getMessaging().sendEachForMulticast({
      tokens: valid,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: {
        priority: "high",
        notification: { sound: "default", channelId: "default" },
      },
      apns: { payload: { aps: { sound: "default", badge: 1 } } },
    });

    console.log(
      `✅ [notificationService] Multicast done. Success: ${res.successCount}, Failure: ${res.failureCount}`
    );

    return {
      success: true,
      successCount: res.successCount,
      failureCount: res.failureCount,
      responses: res.responses,
    };
  } catch (err) {
    console.error("❌ [notificationService] Multicast error:", err);
    return { success: false, error: err.message };
  }
};

module.exports = { sendToToken, sendToTokens };