import { useAuthStore } from "@/store/useAuthStore";
import { loginProps } from '@/constants/formsFields'

import {
  BorderAnimatedContainer, AuthIllustration, AuthLeftForm
} from '../components/index'

const LoginPage = () => {
  const { login, isLoggingIn } = useAuthStore();


  return (
    <div className="w-full flex items-center justify-center h-[85dvh] sm:h-[100dvh]   bg-slate-900 max-sm:mx-2 text-white">
      <div className="relative w-full max-w-6xl ">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">
            {/* سمت چپ */}
            <AuthLeftForm 
              auth={login}
              isAuth={isLoggingIn}
              {...loginProps}
            />
            {/* سمت راست */}
            <AuthIllustration
              title="در هر زمان و هر مکان، در ارتباط باشید"
              image="/login.png"
            />
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}
export default LoginPage;
