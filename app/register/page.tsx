"use client";

import { useActionState } from "react";
import { registerUser } from "../actions/users";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerUser, { message: "" });
  return (
    <div>
      <h2>Register</h2>
      <form action={formAction}>
        <div>
          <label>
            Username
            <input type="text" name="username" required />
          </label>
        </div>
        <div>
          <label>
            Name
            <input type="text" name="name" required />
          </label>
        </div>
        <div>
          <label>
            Password
            <input type="password" name="password" required />
          </label>
        </div>
        <p aria-live="polite">{state.message}</p>
        <button type="submit" disabled={pending}>
          {pending ? "Registering…" : "Register"}
        </button>
      </form>
    </div>
  );
}
