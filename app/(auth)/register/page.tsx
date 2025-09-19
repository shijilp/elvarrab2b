"use client";
import { useMemo, useState } from "react";
import axios from "axios";
import GoogleButton from "@/components/GoogleButton";
import { useRouter } from "next/navigation";

type ThemeMode = "dark" | "light";

type Palette = {
  bg: string;
  fg: string;
  subfg: string;
  card: string;
  border: string;
  button: string;
  ring: string;
  chip: string;
};

function paletteForTheme(theme: ThemeMode): Palette {
  return theme === "dark"
    ? {
        bg: "bg-neutral-950",
        fg: "text-neutral-50",
        subfg: "text-neutral-300",
        card: "bg-neutral-900/70",
        border: "border-neutral-800",
        button:
          "bg-gradient-to-r from-yellow-500 to-amber-500 text-neutral-900 hover:brightness-110",
        ring: "ring-1 ring-neutral-800",
        chip: "bg-yellow-500 text-neutral-900",
      }
    : {
        bg: "bg-neutral-50",
        fg: "text-neutral-900",
        subfg: "text-neutral-600",
        card: "bg-white/90",
        border: "border-neutral-200",
        button:
          "bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:brightness-110",
        ring: "ring-1 ring-neutral-200",
        chip: "bg-neutral-900 text-neutral-50",
      };
}

// ---------------------------
// Register Page
// ---------------------------
export default function RegisterPage() {
  const theme: ThemeMode = "dark";
  const palette = useMemo(() => paletteForTheme(theme), [theme]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register/`,
        {
          username: email,
          password: password,
          email: email || undefined,
        }
      );

      const user = {
        username: res.data.username,
        isAdmin: res.data.isAdmin,
        token: res.data.access,
      };
      localStorage.setItem("user", JSON.stringify(user));
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.access}`;
      router.push("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Registration failed"
      );
    }
  }

  return (
    <main
      className={`${palette.bg} ${palette.fg} min-h-[83svh] flex items-center justify-center`}
    >
      <script src="https://accounts.google.com/gsi/client" async defer />

      <form
        onSubmit={handleRegister}
        className={`w-full max-w-md rounded-2xl ${palette.ring} ${palette.card} p-6 space-y-4`}
      >
        <div className=" inset-0 -z-10 opacity-30 blur-3xl">
          <div className="pointer-events-none absolute -inset-5 rounded-[100px] gradient-accent" />
        </div>
        <h1 className="text-2xl font-semibold">Register</h1>
        {/* <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
          />
        </div> */}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
          />
        </div>
        <button
          type="submit"
          className={`w-full rounded-xl px-4 py-2 font-medium ${palette.button}`}
        >
          Register
        </button>
        <p>{error}</p>
        <GoogleButton />
        <p className={`text-sm ${palette.subfg}`}>
          Already have an account?{" "}
          <a href="/login" className="underline">
            Login
          </a>
        </p>
      </form>
    </main>
  );
}

/*
------------------------------------------------------------
TESTS (snippets)

// tests/auth-pages.test.tsx
// it("login form renders", () => {
//   render(<LoginPage />);
//   expect(screen.getByText(/Login/)).toBeInTheDocument();
// });
// it("register form renders", () => {
//   render(<RegisterPage />);
//   expect(screen.getByText(/Register/)).toBeInTheDocument();
// });
// it("google button present", () => {
//   render(<LoginPage />);
//   expect(screen.getByText(/Google/)).toBeInTheDocument();
// });
//------------------------------------------------------------
*/
