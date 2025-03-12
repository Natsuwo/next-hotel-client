import supabase, { supabaseWithToken } from "./db";
// import { riskySupabaseClient } from "./supabaseRiskyClient";
import api from "./api";
export async function getGuestById(accessToken) {
  const guests = await api.get(`/guest/me`, {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });

  if (!guests || !guests.id) {
    return false;
  }

  // await new Promise((resolve) => setTimeout(resolve, 2000));

  return guests;
}

export async function getSettings(fields) {
  let { data: settings, success } = await api.get(
    `/settings${fields ? "?fields=" + fields : ""}`,
    {
      next: {
        revalidate: 3600,
      },
    }
  );

  if (!success) {
    throw new Error("Error getting settings");
  }

  if (settings.length === 0) {
    throw new Error("Settings not found");
  }

  // await new Promise((resolve) => setTimeout(resolve, 2000));

  settings = settings.reduce((acc, setting) => {
    acc[setting.name] = setting.value;
    return acc;
  }, {});

  return settings;
}

export async function getGuestByEmail(email) {
  // let request = await fetch(
  //   `${process.env.NEXT_PUBLIC_APP_URL}/api/guests?email=${email}`,
  //   {
  //     headers: {
  //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_KEY}`,
  //     },
  //   }
  // );

  // const response = await request.json();

  const { data: guests, success } = await api.get(`/guests?email=${email}`);

  // await new Promise((resolve) => setTimeout(resolve, 2000));

  if (!success) {
    throw new Error(error?.message);
  }

  return guests;
}

export async function getFullGuestByEmail(email) {
  // THIS REQUEST WILL GET THE USER INCLUDING THE PASSWORD FOR SIGN IN PUROSES
  // let { data: guests, error } = await riskySupabaseClient
  //   .from("guests")
  //   .select("*")
  //   .eq("email", email)
  //   .single();

  // await new Promise((resolve) => setTimeout(resolve, 2000));

  return guests;
}

export async function updateGuest(
  accessToken,
  id,
  name,
  nationality,
  phone,
  dob,
  address,
  passport,
  gender
) {
  const { success, message } = await api.put(
    `/guest/update/${id}`,
    {
      name,
      phone,
      nationality,
      dob,
      address,
      passport,
      gender,
    },
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }
  );
  // await new Promise((resolve) => setTimeout(resolve, 2000));

  if (!success) {
    return false;
  }

  return success;
}

export async function confirmPassword(accessToken, email, confirm_password) {
  const { success, message } = await api.post(
    `/guest/confirm_password`,
    {
      email: email,
      password: confirm_password,
    },
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }
  );
  // await new Promise((resolve) => setTimeout(resolve, 2000));

  if (!success) {
    return {
      success: false,
      message: message ? message : "Error confirming password",
    };
  }

  return {
    success,
    message,
  };
}

export async function updateGuestWithPwd(
  accessToken,
  current_password,
  password,
  password_confirmation
) {
  const { success, message } = await api.put(
    `/guest/update-password`,
    {
      current_password,
      password,
      password_confirmation,
    },
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }
  );
  // await new Promise((resolve) => setTimeout(resolve, 2000));

  if (!success) {
    return false;
  }

  return success;
}

export async function createGuest(
  fullname,
  email,
  avatar = "",
  password = "",
  phone = "",
  nationality = "",
  countryFlag = "",
  nationalID = ""
) {
  // const { data, error } = await riskySupabaseClient
  //   .from("guests")
  //   .insert([
  //     {
  //       fullname,
  //       email,
  //       phone,
  //       avatar,
  //       nationality,
  //       countryFlag,
  //       nationalID,
  //       password,
  //     },
  //   ])
  //   .select();

  const { success, message } = await api.post(
    "/guest/register",
    {
      name: fullname,
      email,
      phone,
      password,
      avatar,
    },
    {
      "Content-Type": "application/json",
    }
  );

  if (!success) {
    return {
      success: false,
      message: message ? message : "Error creating guest",
    };
  }

  return { success };
}
