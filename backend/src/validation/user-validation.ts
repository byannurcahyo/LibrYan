import { z, ZodType } from "zod";

export class UserValidation {
    static readonly REGISTER: ZodType = z.object({
        username: z.string().min(4).max(20),
        password: z.string().min(8).max(20),
        name: z.string().min(4).max(30),
    });
    static readonly LOGIN: ZodType = z.object({
        username: z.string().min(4).max(20),
        password: z.string().min(8).max(20),
    });

    static readonly TOKEN: ZodType = z.string().min(1);

    static readonly UPDATE: ZodType = z.object({
        password: z.string().min(8).max(20).optional(),
        name: z.string().min(4).max(30).optional(),
    });
}
