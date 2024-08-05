"use server";

export async function log(message: string) {
  await fetch(process.env.AUDIT_LOG_WEBHOOK ?? "", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: message,
    }),
  })
}