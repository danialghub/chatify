
const LoginIllustration = ({title , image}) => {

  return (
    <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
      <div>
        <img
          src={image}
          alt="People using mobile devices"
          className="w-full h-auto object-contain"
        />
        <div className="mt-6 text-center">
          <h3 className="text-xl font-medium text-cyan-400">{title}</h3>

          <div className="mt-4 flex justify-center gap-4">
            <span className="auth-badge">رایگان</span>
            <span className="auth-badge">راه اندازی آسان</span>
            <span className="auth-badge">خصوصی</span>
          </div>
        </div>
      </div>
    </div>
  )

}

export default LoginIllustration