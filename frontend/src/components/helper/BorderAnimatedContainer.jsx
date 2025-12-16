// How to make animated gradient border 👇
// https://cruip-tutorials.vercel.app/animated-gradient-border/
function BorderAnimatedContainer({ children }) {
  return (
    <div className="w-full h-full z-40 relative flex overflow-hidden sm:rounded-2xl ">
      {children}
    </div>
  );
}
export default BorderAnimatedContainer;
