import api from "./api";

export async function createMessage({ fullname, email, phone, message }) {
  const { success } = await api.post(
    "/message/create",
    {
      name: fullname,
      email,
      phone,
      message,
    },
    {
      "Content-Type": "application/json",
    }
  );
  if (!success) {
    throw new Error("Failed to create message");
  }
  // await new Promise((resolve) => setTimeout(resolve, 2000));
  return success;
}
