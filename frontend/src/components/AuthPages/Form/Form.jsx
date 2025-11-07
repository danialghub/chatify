import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from '@/components/index'

const Form = ({ schema, fields, onSubmit, children }) => {

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });


    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-3">
            {
                fields.map((field, idx) => (

                    field.type === "textarea"
                        ?
                        <textarea>{field.lable}</textarea>
                        :
                        <Input
                            key={idx}
                            type={field.type}
                            placeholder={field.placeholder}
                            title={field.lable}
                            Icon={field.icon}
                            error={errors[field.name]?.message}
                            {...register(field.name)}
                        />

                ))
            }


            {children}
        </form>
    )
}

export default Form