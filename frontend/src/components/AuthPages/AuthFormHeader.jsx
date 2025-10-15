import { MessageCircleIcon } from "lucide-react";

const AuthFormHeader = ({header , para}) => {
    return (
        <div className="text-center mb-8">
            <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h2 className="text-2xl font-bold text-slate-200 mb-2">{header}</h2>
            <p className="text-slate-400">{para}</p>
        </div>
    )

}

export default AuthFormHeader