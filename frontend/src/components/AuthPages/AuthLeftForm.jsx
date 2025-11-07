import { Link } from "react-router";
import { AuthForm, AuthFormHeader } from '@/components/index'

const AuthLeftForm = ({ state, ...props }) => {

    let isLogin = state === "login"

    return (
        <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
            <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <AuthFormHeader
                    header={isLogin ? "خوش برگشتید" : "ایجاد حساب"}
                    para=
                    {isLogin
                        ? "وارد شوید تا به حسابتان دسترسی پیدا کنید"
                        : "قدم اول را بردارید و حساب خود را بسازید"
                    }
                />

                {/* FORM */}
                <AuthForm
                    title={state === "login" ? "ورود" : "ایجاد حساب"}
                    {...props}
                />

                <div className="mt-6 text-center">
                    {isLogin
                        ?
                        <Link to="/signup" className="auth-link">
                            حسابی ندارید؟  <span className='text-cyan-200'>ساخت حساب</span>
                        </Link>
                        :
                        <Link to="/login" className="auth-link">
                            آیا از قبل آکانت دارید؟ <span className='text-cyan-200'> ورود</span>
                        </Link>

                    }
                </div>
            </div>
        </div>
    )
}

export default AuthLeftForm