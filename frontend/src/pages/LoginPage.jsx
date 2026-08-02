import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../layouts/AuthLayout.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuthStore } from "../store/authStore.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
  };

  const validate = () => {
    const errors = {};
    if (!form.email.trim()) errors.email = "Email is required";
    if (!form.password) errors.password = "Password is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await login(form);
    if (result.success) {
      toast.success("Welcome back.");
      navigate("/dashboard");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <AuthLayout
      title="Log in to your account"
      subtitle="Pick up where you left off."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
          autoComplete="email"
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="accent"
          loading={isLoading}
          className="mt-2 w-full"
        >
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-ink-2)]">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-medium text-[var(--color-accent)] hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
