export function failedPaymentReason(payment) {
  const log = [...(payment.logs || [])].reverse().find((entry) => entry.action === "rejected");

  return log?.payload_json?.reason || "";
}

export function providerLabel(payment) {
  if (payment.provider === "bakong_khqr") return "Bakong KHQR";
  if (payment.provider === "manual") return "Manual";

  return payment.provider || "Manual";
}
