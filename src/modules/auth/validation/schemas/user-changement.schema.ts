import { validatePhoneNumber } from "@/lib/phone-number";
import { CountryCode } from "libphonenumber-js";
import { z } from "zod";

/**
 * Zod validation schema for user creation form
 * Validates fullName, email, password, and role fields
 */
interface Params {
  t: (key: string) => string;
}

export const getUserChangementFormSchema = ({ t }: Params) =>
  z.object({
    fullName: z.string().min(1, t("fullName.required")),
    phone: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          value.trim() === "" ||
          validatePhoneNumber(value, process.env.COUNTRY_CODE as CountryCode),
        {
          message: t("phone.invalid"),
        },
      ),
    image: z
      .instanceof(File)
      .refine(
        (file) =>
          file.type.startsWith("image/") &&
          ["image/jpeg", "image/png", "image/webp"].includes(file.type),
        { message: t("image.invalid") },
      )
      .optional(),
    imageUrl: z.string().optional(),
  });

export type UserChangementFormSchema = z.infer<ReturnType<typeof getUserChangementFormSchema>>;
