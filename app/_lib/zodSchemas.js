import { z } from "zod";

export const confirmPassword = z.object({
  confirm_password: z.string().min(1, "the password is required.").max(64),
});
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Fullname must contains at least 3 characters" })
    .max(64, { message: "Fullname cannot exceed 64 characters" }),

  nationality: z.string(),
  phone: z
    .string()
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      "Invalid phone number."
    ),
  gender: z.string().optional(),
  dob: z.date().optional(),
  address: z.string().optional(),
  passport: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email("invalid email format."),
  password: z.string().min(1, "the password is required.").max(64),
});

export const bookingSchema = z.object({
  adults: z.number({ message: "guests number is invalid" }).gt(0),
  check_in: z
    .string({ message: "date is invalid" })
    .date({ message: "date is invalid" }),
  check_out: z
    .string({ message: "date is invalid" })
    .date({ message: "date is invalid" }),
});

export const reservationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Fullname must contains at least 3 characters" })
    .max(64, { message: "Fullname cannot exceed 64 characters" }),
  nationality: z.string({ message: "Nationality is required" }),
  phone: z
    .string()
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      "Invalid phone number."
    ),
  address: z.string(),
  nationalID: z
    .string()
    .regex(/^[a-zA-Z0-9]{6,12}$/, "Invalid national ID format"),
  notes: z
    .string()
    .max(255, { message: "Message cannot exceed 255 characters" })
    .optional(),
});

export const signupSchema = z
  .object({
    name: z
      .string({ required_error: "Required" })
      .min(3, { message: "Name must be at least 3 characters" })
      .max(64, "Name cannot exceed 64 charcters"),
    email: z.string().email(),
    phone: z
      .string()
      .regex(
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        "Invalid phone number."
      ),
    password: z.string(6).min(6, { message: "Password is required" }),
    confirm_password: z
      .string()
      .min(6, { message: "Password confirmation is required" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Password doesn't match confirmation",
    path: ["confirm_password"],
  });

export const contactSchema = z.object({
  fullname: z
    .string({ required_error: "Fullname is required" })
    .min(3, { message: "Name must be at least 3 characters" })
    .max(64, "Name cannot exceed 64 charcters"),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{1,4}?[-.\s]?(\(?\d{1,3}?\)?[-.\s]?){1,4}\d{1,4}$/, {
      message: "Invalid phone number",
    }),
  message: z
    .string()
    .min(20, { message: "Message must contain at least 20 characters" })
    .max(500, { message: "Message cannot exceed 500 characters" }),
});
