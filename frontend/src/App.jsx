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
     
      <Router />

      <Toaster />
    </div>
  );
}
export default App;
