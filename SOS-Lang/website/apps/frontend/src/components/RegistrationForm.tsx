import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import bullImage from '../../assets/icon.png'


import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
})
type RegistrationFormProps = {
  onSuccess: () => void;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const RegistrationForm = ({ onSuccess, open, onClose, children }: RegistrationFormProps) => {
  if (!open) return null;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast("Login attempt:", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    })
    onSuccess()
  }

  return (
<div
  className={`fixed inset-0 flex items-center justify-center transition-all duration-300 ${
    open ? "bg-black/20 opacity-100" : "opacity-0 pointer-events-none"
  }`}
>      
    <Card className={`bg-white rounded-lg shadow p-7 transition-all max-w-xl ${ open ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}>
        <Button className="absolute top-2 right-2 py-1 px-2 border berder-neutral-200 rounded-md text-gray-400 bg-white hover:bg-gray-50 hover:text-gray-600" onClick={onClose}>
        X
        </Button>
        {children}
      <CardHeader>
        <div class=" flex items-center justify-center space-x-8">
        <div className="bg-[#004d73] w-12 h-12 rounded-full flex items-center justify-center"><img src={bullImage} className="w-9 h-10 "/></div>
        </div>
        <CardTitle className="text-2xl mb-5 text-[#004d73]">SOS-Lang</CardTitle>

        <CardTitle>Sign-Up</CardTitle>
        <CardDescription>
          Enter your credentials to create your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="login-form"  onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-email" className="text-sm ">
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id="login-email"
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="w-full px-4 border border-[#c1c4c7] focus:ring-2 focus:ring-[#dc6505] h-12 bg-white border-[#c1c4c7]"

                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel
                    htmlFor="login-password"
                    className="text-sm"
                  >
                    Password
                  </FieldLabel>

                  <Input
                    {...field}
                    id="login-password"
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full px-4 border border-[#c1c4c7] focus:ring-2 focus:ring-[#dc6505] h-12"
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-red-500 text-sm"
                    />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex w-full">

        <Button
          type="submit"
          form="login-form"
          className="w-full px-6 py-6 text-base bg-[#004d73] hover:bg-[#36718f]"
        >
          Sign-Up
        </Button>
      </CardFooter>
    </Card>
    </div>
  )
}

