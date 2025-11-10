import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { PageLoader } from "./components/index";
import Router from './routes'
import { Toaster } from "react-hot-toast";

function App() {
  const {  isCheckingAuth } = useAuthStore();
  const checkAuth = useAuthStore(state => state.checkAuth);
  
  useEffect(() => { checkAuth(); }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="min-h-[100dvh] bg-slate-900 relative flex items-center justify-center p-0.5 overflow-hidden ">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] " />
      <div className="absolute top-0  -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

      <Router />

      <Toaster />
    </div>
  );
}
export default App;
