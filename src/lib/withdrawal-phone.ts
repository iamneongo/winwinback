import { z } from "zod";

export const contactPhoneSchema = z.string().trim().transform((value) => value.replace(/[\s.()-]/g, ""))
  .pipe(z.string().regex(/^(?:\+84|0)[35789]\d{8}$/, "Nhập số điện thoại Việt Nam hợp lệ"));
