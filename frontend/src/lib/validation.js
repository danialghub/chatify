import { z } from 'zod'

const passwordSchema = z
    .string()
    .min(10, { message: "رمز باید حداقل 10 کاراکتر باشد." })
    .refine((val) => !/\s/.test(val), { message: "رمز نباید شامل فاصله باشد" })
    .refine((val) => /[a-z]/.test(val), { message: "رمز باید حداقل یک حرف کوچک داشته باشد." })
    .refine((val) => /[A-Z]/.test(val), { message: "رمز باید حداقل یک حرف بزرگ داشته باشد." })
    .refine((val) => /\d/.test(val), { message: "رمز باید حداقل یک عدد داشته باشد." })
    .refine((val) => /[!@#$%^&*()_+\-=\[\]{};:\\|,.<>\/?]/.test(val), { message: "رمز باید حداقل یک نماد ویژه داشته باشد." });



export const imgageSchema = z
    .instanceof(File)
    .refine(file => file.size <= 4 * 1024 * 1024, "حجم عکس بیشتر از 4 مگابایت نباید باشد")
    .refine(file => ["image/jpeg", "image/png", "image/webp"].includes(file.type), "فرمت فایل درسیت نیست")
    
export const fileSchema = z
    .instanceof(File)
    .refine(
        file =>
            [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/jpg",

                // Excel
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",

                // PDF
                "application/pdf",

                // Word
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

                // PowerPoint
                "application/vnd.ms-powerpoint",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",

                // ZIP & RAR
                "application/zip",
                "application/x-zip-compressed",
                "application/octet-stream",
                "application/vnd.rar",
                "application/x-rar-compressed",
                "application/x-compressed",
            ].includes(file.type),
        "این فرمت پشتیبانی نمی‌شود"
    )
    .refine(
        file => file.size <= 4 * 1024 * 1024,
        "حجم فایل نباید بیشتر از 4 مگابایت باشد"
    );




export const userSignUpSchema = z.object({
    name: z
        .string()
        .min(3, "نام باید حداقل ۳ کاراکتر باشد"),


    userName: z
        .string()
        .refine(userName => userName.startsWith('@'), "یوزرنیم حتما باید با @ شروع شود"),

    password: passwordSchema,

    passwordConfirm: z
        .string()



}).refine((data) => data.password === data.passwordConfirm, {
    message: "رمز عبور و تکرار آن یکی نیستند",
    path: ["passwordConfirm"],
});

export const userLoginSchema = z.object({
    userName: z
        .string()
        .refine(userName => userName.startsWith('@'), "یوزرنیم حتما باید با @ شروع شود"),
    password: z
        .string()
        .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),

})

export const userEditSchema = z.object({
    name: z
        .string()
        .min(3, "نام باید حداقل ۳ کاراکتر باشد"),

    bio: z
        .string(),

    password: z.string().optional().refine(val => !val || val.length >= 10, "رمز باید حداقل 10 کاراکتر باشد."),

    passwordConfirm: z
        .string(),


}).refine((data) => data.password === data.passwordConfirm, {
    message: "رمز عبور و تکرار آن یکی نیستند",
    path: ["passwordConfirm"],
})
