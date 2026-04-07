import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import bullImage from '../../assets/icon.png'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import { supabase } from "@/lib/supabaseClient"
import { da } from "zod/v4/locales"

const formSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
  language: z
  .string()
  .min(2, "Please select a language."),
})
type RegistrationFormProps = {
  onSuccess: () => void;
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export const RegistrationForm = ({ onSuccess, open, onClose, children }: RegistrationFormProps) => {
  if (!open) return null;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      language: "",
    },
  })

async function onSubmit(data: z.infer<typeof formSchema>) {
  console.log("Running onSubmit with data:", data);
  // Convert language string → numeric code
  const languageMap: Record<string, number> = {
    english: 0,
    spanish: 1,
    russian: 2,
  };

  const selectedLanguage = languageMap[data.language];

  const { data: signupData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        language: selectedLanguage,
      },
    },
  });
  console.log("Form errors:", form.formState.errors);
  if (error) {
    toast("Signup failed", {
      description: error.message,
      position: "bottom-right",
    });
    return;
  }

  toast("Signup successful!", {
    description: "Check your email to confirm your account.",
    position: "bottom-right",
  });

  onSuccess();
}
  
  return (
<div
  className={`fixed inset-0 flex items-center justify-center transition-all duration-300 ${
    open ? "bg-black/20 opacity-100" : "opacity-0 pointer-events-none"
  }`}
>      
    <Card className={`bg-white rounded-lg shadow p-7 transition-all max-w-xl ${ open ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}>
        <Button className="absolute top-2 right-2 py-1 px-2 text-gray-600 border border-neutral-200 rounded-md text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-600" onClick={onClose}>
        X
        </Button>
        {children}
      <CardHeader>
        <div className=" flex items-center justify-center space-x-8">
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
            <Controller
              name="language"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-sm">
                    Language you are learning:
                  </FieldLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full mb-5 h-10 border border-[#c1c4c7] focus:ring-2 focus:ring-[#dc6505]">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="russian">Russian {/* language code 2 */}</SelectItem>
                      <SelectItem value="spanish">Spanish {/* language code 1 */}</SelectItem>
                      <SelectItem value="english">English {/* language code 0 */}</SelectItem>
                    </SelectContent>
                  </Select>

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
          className="w-full px-6 py-3 text-base bg-[#004d73] hover:bg-[#36718f]"
        >
          Sign-Up
        </Button>
      </CardContent>
      <CardFooter className="flex w-full">


      </CardFooter>
    </Card>
    </div>
  )
}

