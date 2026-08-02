import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../layouts/AuthLayout.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuthStore } from "../store/authStore.js";

const RISK_OPTIONS = [
  { value: "conservative", label: "Conservative" },
  { value: "moderate", label: "Moderate" },
  { value: "aggressive", label: "Aggressive" },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const signup = useAuthStore((s) => s.signup);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    riskTolerance: "moderate",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
  };

  const validate = () => {
    const errors = {};
    if (form.name.trim().length < 2)
      errors.name = "Name must be at least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Enter a valid email address";
    if (form.password.length < 8)
      errors.password = "Password must be at least 8 characters";
    else if (!/\d/.test(form.password))
      errors.password = "Password must contain at least one number";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await signup(form);
    if (result.success) {
      toast.success("Account created.");
      navigate("/dashboard");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your portfolio with AI-backed insights."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="name"
          name="name"
          label="Full name"
          placeholder="Jordan Lee"
          value={form.name}
          onChange={handleChange}
          error={fieldErrors.name}
          autoComplete="name"
        />
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
          placeholder="At least 8 characters"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          autoComplete="new-password"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-2)]">
            Risk tolerance
          </label>
          <div className="grid grid-cols-3 gap-2">
            {RISK_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setForm({ ...form, riskTolerance: opt.value })
                }
                className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                  form.riskTolerance === opt.value
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "border-[var(--color-line)] text-[var(--color-ink-2)] hover:bg-[var(--color-surface-2)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          variant="accent"
          loading={isLoading}
          className="mt-2 w-full"
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-ink-2)]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-[var(--color-accent)] hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
