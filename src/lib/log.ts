"use server";

export async function log(message: string) {
  fetch(process.env.DEBUG_DISCORD_WEBHOOK ?? "", {
    method: "POST",
    body: JSON.stringify({
      content: message,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}