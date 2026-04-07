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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabaseClient"

const formSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
})

type LoginFormProps = {
  onSuccess: () => void;
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export const LoginForm = ({ onSuccess, open, onClose, children }: LoginFormProps) => {
  if (!open) return null;

  const [loading, setLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast("Login failed", {
        description: error.message,
        position: "bottom-right",
      });
      setLoading(false);
      return;
    }

    toast("Login successful!", {
      description: "Welcome back!",
      position: "bottom-right",
    });

    setLoading(false);
    onSuccess();
  }

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-all duration-300 ${
        open ? "bg-black/20 opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <Card className={`bg-white rounded-lg shadow p-7 transition-all max-w-xl ${ open ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}>
        
        <Button
          className="absolute top-2 right-2 py-1 px-2 text-gray-600 border border-neutral-200 rounded-md text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-600"
          onClick={onClose}
          disabled={loading}
        >
          X
        </Button>

        {children}

        <CardHeader>
          <div className="flex items-center justify-center space-x-8">
            <div className="bg-[#004d73] w-12 h-12 rounded-full flex items-center justify-center">
              <img src={bullImage} className="w-9 h-10" />
            </div>
          </div>

          <CardTitle className="text-2xl mb-5 text-[#004d73]">
            SOS-Lang
          </CardTitle>

          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      className="w-full px-4 border border-[#c1c4c7] focus:ring-2 focus:ring-[#dc6505] h-12"
                      disabled={loading}
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
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Password</FieldLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full px-4 border border-[#c1c4c7] focus:ring-2 focus:ring-[#dc6505] h-12"
                      disabled={loading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

            </FieldGroup>
          </form>

          <Button
            type="submit"
            form="login-form"
            className="w-full px-6 py-6 text-base bg-[#004d73] hover:bg-[#36718f] mt-4"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </CardContent>

        <CardFooter />
      </Card>
    </div>
  )
}