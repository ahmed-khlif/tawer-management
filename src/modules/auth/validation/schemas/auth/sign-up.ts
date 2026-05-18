import { validatePhoneNumber } from "@/lib/phone-number";
import { TranslateFunction } from "@/types";
import { CountryCode } from "libphonenumber-js";
import { z } from "zod";

export function getSignUpFormSchema(t?: TranslateFunction) {
  return z.object({
    name: z.string().min(1, {
      message: t ? t("fullName.required") : "Full name is required.",
    }),
    image: z
      .instanceof(File)
      .refine(
        (file) =>
          file.type.startsWith("image/") &&
          ["image/jpeg", "image/png", "image/webp"].includes(file.type),
        {
          message: t ? t("image.invalidFormat") : "Invalid image format.",
        },
      )
      .optional(),
    email: z
      .string()
      .email(t ? t("email.invalid") : "Invalid email format.")
      .min(1, {
        message: t ? t("email.required") : "Email is required.",
      }),
    phone: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          value.trim() === "" ||
          validatePhoneNumber(
            value,
            process.env.COUNTRY_CODE as CountryCode,
          ),
        {
          message: t ? t("phone.invalid") : "Invalid phone number.",
        },
      ),
    password: z.string().min(8, {
      message: t
        ? t("password.passwordTooShort", { min: 8 })
        : "Password must contain at least 8 characters.",
    }),
  });
}

export type SignUpFormSchemaType = z.infer<
  ReturnType<typeof getSignUpFormSchema>
>;
