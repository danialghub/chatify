import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Camera, LoaderIcon } from "lucide-react";
import { ChatIcon, ImageUploader } from '@/components/index'
import { userEditSchema } from '@/lib/validation'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from '@/store/useAuthStore'
import { useNavigate } from 'react-router'
export default function EditProfile() {

  const [image, setImage] = useState('')
  const imageRef = useRef()

  const { authUser, updateProfile, isUpdating } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (formData) => {
    await updateProfile({ ...formData, profilePic: image })
    navigate('/')
  }

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(userEditSchema),
  });

  useEffect(() => {
    if (authUser) {
      reset({
        name: authUser.name || '',
        bio: authUser.bio || '',
      });
    }
  }, [authUser, reset]);



  return (
    <div className="flex items-center justify-center max-sm:mx-2 text-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-zinc-900 backdrop-blur-lg shadow-2xl rounded-3xl  p-6 space-y-5 relative"
      >
        {/* Header */}
        <motion.button
          onClick={() => navigate('/')}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="absolute top-5 right-5 px-4 py-1 bg-blue-600 text-white rounded-md"
        >
          بازگشت
        </motion.button>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center"
        >
          <div className="relative">

            <ChatIcon
              profile={authUser?.profilePic || image}
              name={authUser.name}
              classProps="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md text-5xl font-bold"
            />
            <label className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
              <Camera className="w-4 h-4 text-white" />

              <ImageUploader inputRef={imageRef} setImage={setImage} />
            </label>
          </div>
          <h2 className="text-lg font-semibold my-3 text-gray-200">
            ویرایش پروفایل
          </h2>
        </motion.div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} dir="rtl">
          <div className="flex items-center gap-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}

            >
              <label className="block text-sm text-gray-200  pr-1">نام کاربری</label>
              <input
                type="text"
                value={authUser.userName}
                readOnly
                className="cursor-text select-text w-full mt-1 p-2.5 rounded-md border bg-zinc-900 border-zinc-700 text-sm"
              />
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm text-gray-200  pr-1">نام کامل</label>
              <input
                type="text"
                {...register('name')}
                className="w-full mt-1 p-2.5 rounded-md border bg-zinc-900 border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                placeholder="نام"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-2">{errors.name.message}</p>
              )}
            </motion.div>
          </div>

          <div className="flex items-center gap-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm text-gray-200  pr-1">رمز عبور</label>
              <input
                type="password"
                {...register('password')}
                className="w-full mt-1 p-2.5 rounded-md border bg-zinc-900 border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                placeholder="رمزعبور"
                autoComplete="password"

              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm text-gray-200  pr-1">تکرار رمز عبور</label>
              <input
                type="password"
                {...register('passwordConfirm')}
                className="w-full mt-1 p-2.5 rounded-md border bg-zinc-900 border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                placeholder="تایید رمزعبور"
                autoComplete="passwordConfirm"
              />
              {errors.passwordConfirm && (
                <p className="text-red-500 text-xs mt-2">{errors.passwordConfirm.message}</p>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.3 }}
            dir="rtl"
          >
            <label className="block text-sm text-gray-200">بیوگرافی</label>
            <textarea
              dir="auto"
              {...register('bio')}
              rows="5"
              className="w-full mt-1 [unicode-bidi:plaintext] p-2.5 rounded-md border bg-zinc-900 border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm resize-none"
              placeholder="چند کلمه درباره‌ی خودت..."
            />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            disabled={isUpdating}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-full py-2.5 mt-4 bg-blue-600 text-white text-sm font-semibold rounded-md shadow hover:bg-blue-700 transition"
            type="submit"
          >
            {isUpdating
              ? <div className="flex items-center justify-center">
                <LoaderIcon className=" animate-spin" />
              </div>
              : "ویرایش پروفایل"

            }

          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
