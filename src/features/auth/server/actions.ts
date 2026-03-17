"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { signInSchema } from "@/features/auth/validation/auth-schemas";

export async function signInAction(formData: FormData) {
  const parsedInput = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedInput.success) {
    redirect("/sign-in?error=validation");
  }

  try {
    await signIn("credentials", {
      email: parsedInput.data.email,
      password: parsedInput.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/sign-in?error=credentials");
    }

    throw error;
  }
}

export async function signOutAction() {
  await signOut({
    redirectTo: "/sign-in",
  });
}
