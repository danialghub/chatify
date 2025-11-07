import { UserCircle, LockIcon, UserIcon } from "lucide-react";


import { userSignUpSchema ,userLoginSchema} from '@/lib/validation'


 const loginFields = [
    {
        type: "text",
        name: "userName",
        lable: "یوزرنیم",
        icon: UserCircle,
        placeholder: "@reza"
    },
    {
        type: "password",
        name: "password",
        lable: "رمزعبور",
        icon: LockIcon,
        placeholder: "رمزعبور"
    },
]
 const signUpFields = [
    {
        type: "text",
        name: "name",
        lable: "نام",
        icon: UserIcon,
        placeholder: "نام"
    },
    {
        type: "text",
        name: "userName",
        lable: "یوزرنیم",
        icon: UserCircle,
        placeholder: "@reza"
    },
    {
        type: "password",
        name: "password",
        lable: "رمزعبور",
        icon: LockIcon,
        placeholder: "رمزعبور"
    },
    {
        type: "password",
        name: "passwordConfirm",
        lable: "تکرار رمزعبور",
        icon: LockIcon,
        placeholder: "تکرار رمزعبور"
    },
]
export const signUpProps = {
    authFields: signUpFields,
    authSchema: userSignUpSchema,
    state: "signup"
}

export const loginProps = {
    authFields: loginFields,
    authSchema: userLoginSchema,
    state: "login"
}