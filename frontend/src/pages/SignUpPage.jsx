import { signUpProps } from '@/constants/formsFields'
import { useAuthStore } from '@/store/useAuthStore';

import {
  BorderAnimatedContainer, AuthIllustration, AuthLeftForm
} from '../components/index'

const SignUpPage = () => {

  const { signup, isSigningUp } = useAuthStore();

  return (
    <div className="w-full flex items-center justify-center h-[85dvh] sm:h-[90vh] bg-slate-900 max-sm:mx-2 text-white">
      <div className="relative w-full max-w-6xl ">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">
            {/* سمت چپ */}
            <AuthLeftForm
              auth={signup}
              isAuth={isSigningUp}
              {...signUpProps}
            />
            {/* سمت راست */}
            <AuthIllustration
              title=" از همین امروز مسیرت را شروع کن"
              image="/signup.webp"
            />
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}
export default SignUpPage;
