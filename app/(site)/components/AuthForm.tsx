"use client";

import Button, { ButtonProps } from "@/app/components/Button";
import Input, { InputProps } from "@/app/components/inputs/Input";
import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import AuthSocialButton, { AuthSocialButtonProps } from "./AuthSocialButton";
import { BsGithub, BsGoogle } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Variant = "LOGIN" | "REGISTER";

const AuthForm = () => {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/users");
    }
  }, [session?.status, router]);

  const toggleVariant = useCallback(() => {
    setVariant(variant === "LOGIN" ? "REGISTER" : "LOGIN");
  }, [variant]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    variant === "REGISTER"
      ? axios
          .post("/api/register", data)
          .then(() => signIn("credentials", data))
          .catch(() => toast.error("Something went wrong"))
          .finally(() => setIsLoading(false))
      : signIn("credentials", { ...data, redirect: false })
          .then((callback) => {
            if (callback?.error) {
              toast.error("Invalid credentials");
            }
            if (callback?.ok && !callback?.error) {
              toast.success("Logged in!");
              router.push("/users");
            }
          })
          .finally(() => setIsLoading(false));
  };

  const socialAction = (action: string) => {
    setIsLoading(true);
    //NextAuth Signin
    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error("Invalid credentials");
        }
        if (callback?.ok && !callback?.error) {
          toast.success("Logged in!");
        }
      })
      .finally(() => setIsLoading(false));
  };

  const nameInput: InputProps = {
    id: "name",
    label: "Name",
    register,
    errors,
    disabled: isLoading,
  };

  const emailInput: InputProps = {
    id: "email",
    label: "Email",
    type: "email",
    required: true,
    register,
    errors,
    disabled: isLoading,
  };

  const passwordInput: InputProps = {
    id: "password",
    label: "Password",
    type: "password",
    required: true,
    register,
    errors,
    disabled: isLoading,
  };

  const registerVariant: InputProps[] = [nameInput, emailInput, passwordInput];
  const loginVariant: InputProps[] = [emailInput, passwordInput];

  const formInputs: InputProps[] =
    variant === "LOGIN" ? loginVariant : registerVariant;

  const buttonProps: ButtonProps = {
    disabled: isLoading,
    type: "submit",
    children: variant === "LOGIN" ? "Sign in" : "Register",
    fullWidth: true,
  };

  const googleButton: AuthSocialButtonProps = {
    id: "google",
    icon: BsGoogle,
    onClick: () => socialAction("google"),
  };

  const githubButton: AuthSocialButtonProps = {
    id: "github",
    icon: BsGithub,
    onClick: () => socialAction("github"),
  };

  const socialButtons: AuthSocialButtonProps[] = [googleButton, githubButton];

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div
        className="
        bg-white
          px-4
          py-8
          shadow
          sm:rounded-lg
          sm:px-10
        "
      >
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {formInputs.map((input) => {
            const { id, label, errors, register, disabled, required, type } =
              input;
            return (
              <Input
                disabled={disabled}
                register={register}
                errors={errors}
                id={id}
                label={label}
                type={type}
                required={required}
                key={id}
              />
            );
          })}
          <Button {...buttonProps} />
        </form>

        <div className="mt-6">
          <div className="relative">
            <div
              className="
                absolute 
                inset-0 
                flex 
                items-center
              "
            >
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            {socialButtons.map((socialButton) => {
              const { id, icon, onClick } = socialButton;
              return (
                <AuthSocialButton
                  icon={icon}
                  onClick={onClick}
                  key={id}
                  id={id}
                />
              );
            })}
          </div>
        </div>

        <div
          className="
            flex 
            gap-2 
            justify-center 
            text-sm 
            mt-6 
            px-2 
            text-gray-500
          "
        >
          <div>
            {variant === "LOGIN"
              ? "New to Messenger?"
              : "Already have an account?"}
          </div>
          <div onClick={toggleVariant} className="underline cursor-pointer">
            {variant === "LOGIN" ? "Create an account" : "Login"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
