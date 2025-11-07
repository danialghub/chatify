import { LoaderIcon } from "lucide-react";
import {Form} from '@/components/index'

const LoginForm = ({auth , isAuth ,authFields , authSchema ,title}) => {

  const handleSubmit = (formData) => {
    auth(formData);
  };

  return (

    <Form
      onSubmit={handleSubmit}
      fields={authFields}
      schema={authSchema}>

      <button className="auth-btn" type="submit" disabled={isAuth}>
        {isAuth ? (
          <LoaderIcon className="w-full h-5 animate-spin text-center" />
        ) : (
          title
        )}
      </button>

    </Form>

  )
}

export default LoginForm