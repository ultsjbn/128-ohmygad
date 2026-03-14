import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="page-bg relative w-full min-h-screen md:h-screen overflow-hidden flex items-center justify-center p-4 sm:p-8">
      {/* --- BG Design --- */}
      <div className="blob blob-periwinkle hidden md:block"
      style={{ width: 500, height: 500, top: -120, right: -120, opacity: 0.3 }}/>
      <div className="blob blob-pink hidden md:block" 
        style={{ width: 400, height: 400, bottom: 100, left: -100, opacity: 0.3 }}/>

      {/* --- Form Container --- */}
      <div className="z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <SignUpForm/>
      </div>
    </div>
  );
}