import { z } from 'zod'

const passwordSchema = z
    .string()
    .min(10, { message: "رمز باید حداقل 10 کاراکتر باشد." })
    .refine((val) => !/\s/.test(val), { message: "رمز نباید شامل فاصله باشد" })
    .refine((val) => /[a-z]/.test(val), { message: "رمز باید حداقل یک حرف کوچک داشته باشد." })
    .refine((val) => /[A-Z]/.test(val), { message: "رمز باید حداقل یک حرف بزرگ داشته باشد." })
    .refine((val) => /\d/.test(val), { message: "رمز باید حداقل یک عدد داشته باشد." })
    .refine((val) => /[!@#$%^&*()_+\-=\[\]{};:\\|,.<>\/?]/.test(val), { message: "رمز باید حداقل یک نماد ویژه داشته باشد." });


export const userSignUpSchema = z.object({
    name: z
        .string()
        .min(3, "نام باید حداقل ۳ کاراکتر باشد"),


    email: z
        .string()
        .email("ایمیل معتبر نیست"),

    password: passwordSchema,

    passwordConfirm: z
        .string()



}).refine((data) => data.password === data.passwordConfirm, {
    message: "رمز عبور و تکرار آن یکی نیستند",
    path: ["passwordConfirm"],
});

export const userLoginSchema = z.object({
    email: z
        .string()
        .email("ایمیل معتبر نیست"),

    password: z
        .string()
        .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),

})