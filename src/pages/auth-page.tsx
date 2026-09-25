import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { resolvePostLoginPath } from "@/auth/redirects";
import { useFirebaseGoogleAuth } from "@/hooks/use-firebase-google-auth";
import { FirebaseGoogleAccountCard } from "@/components/auth/FirebaseGoogleAccountCard";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/image_1775051923875.png";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { env } from "@/config/env";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "Benutzername wird benötigt" }),
  password: z.string().min(1, { message: "Passwort wird benötigt" }),
  rememberMe: z.boolean().optional(),
});

// Registration schema
const registerSchema = z.object({
  username: z.string().min(3, { message: "Benutzername muss mindestens 3 Zeichen haben" }),
  email: z.string().email({ message: "Ungültige E-Mail-Adresse" }),
  fullName: z.string().min(1, { message: "Name wird benötigt" }),
  password: z.string().min(6, { message: "Passwort muss mindestens 6 Zeichen haben" }),
  confirmPassword: z.string().min(1, { message: "Bitte bestätige das Passwort" }),
  terms: z.boolean().refine((val) => val === true, { message: "Du musst den AGB zustimmen" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  // wouter's location is the path only; the query string (?next=, ?mode=) comes from useSearch().
  const searchParams = new URLSearchParams(useSearch());
  const initialMode = searchParams.get("mode") as "login" | "register" | null;
  const requestedPath = searchParams.get("next");
  // Firebase Google account selection preview; separate from the FreizeitEngel server session.
  const googlePreview = useFirebaseGoogleAuth();
  
  useEffect(() => {
    // Initialize mode from URL parameter if available
    if (initialMode && (initialMode === "login" || initialMode === "register")) {
      setMode(initialMode);
    }
  }, [initialMode]);
  
  // Once signed in, open the safe `next` route if this role may use it, else the role's dashboard.
  useEffect(() => {
    if (user) {
      navigate(resolvePostLoginPath(user.role, requestedPath), { replace: true });
    }
  }, [user, navigate, requestedPath]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <div className="flex justify-center items-center">
            <img src={logoImage} alt="FreizeitEngel Logo" className="h-12 mr-2" />
            <span className="text-2xl font-bold"><span className="text-purple-600">Freizeit</span><span className="text-cyan-500">Engel</span></span>
          </div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {mode === "login" ? "Anmelden" : "Registrieren"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {mode === "login" ? (
            <>
              Oder{" "}
              <button
                onClick={() => setMode("register")}
                className="font-medium text-primary hover:text-primary/80"
              >
                erstelle ein kostenloses Konto
              </button>
            </>
          ) : (
            <>
              Bereits registriert?{" "}
              <button
                onClick={() => setMode("login")}
                className="font-medium text-primary hover:text-primary/80"
              >
                Hier anmelden
              </button>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Tabs value={mode} onValueChange={(value) => setMode(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Anmelden</TabsTrigger>
              <TabsTrigger value="register">Registrieren</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Benutzername oder E-Mail</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            autoComplete="username"
                            disabled={loginMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passwort</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="current-password"
                            disabled={loginMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={loginMutation.isPending}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            Angemeldet bleiben
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <a
                      href="#"
                      className="text-sm font-medium text-primary hover:text-primary/80"
                    >
                      Passwort vergessen?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Wird angemeldet..." : "Anmelden"}
                  </Button>

                  {env.useMockApi && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loginMutation.isPending}
                        onClick={() => loginMutation.mutate({
                          username: "local-admin",
                          password: "local-admin-access",
                        })}
                      >
                        Admin
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loginMutation.isPending}
                        onClick={() => loginMutation.mutate({
                          username: "local-partner",
                          password: "local-partner-access",
                        })}
                      >
                        Partner
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Benutzername</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            autoComplete="username"
                            disabled={registerMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-Mail</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            autoComplete="email"
                            disabled={registerMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vollständiger Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            autoComplete="name"
                            disabled={registerMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passwort</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="new-password"
                            disabled={registerMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passwort bestätigen</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="new-password"
                            disabled={registerMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={registerMutation.isPending}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            Ich stimme den{" "}
                            <a
                              href="#"
                              className="text-primary hover:underline"
                            >
                              AGB
                            </a>{" "}
                            und{" "}
                            <a
                              href="#"
                              className="text-primary hover:underline"
                            >
                              Datenschutzbestimmungen
                            </a>{" "}
                            zu
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Wird registriert..." : "Registrieren"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Oder mit</span>
              </div>
            </div>

            <div className="mt-6">
              {googlePreview.user ? (
                <FirebaseGoogleAccountCard user={googlePreview.user} onSignOut={googlePreview.signOut} />
              ) : (
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={googlePreview.signIn}
                disabled={googlePreview.pending}
                aria-busy={googlePreview.pending}
                aria-describedby={googlePreview.notice ? "google-auth-notice" : undefined}
                data-testid="button-google-auth"
              >
                {googlePreview.pending ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" aria-hidden="true" />
                ) : (
                  <svg className="h-5 w-5 mr-2" aria-hidden="true" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                  </svg>
                )}
                {googlePreview.pending ? "Google-Konto wird ausgewählt …" : "Mit Google fortfahren"}
              </Button>
              )}
              {googlePreview.notice && (
                <p
                  id="google-auth-notice"
                  data-error-code={googlePreview.notice.code}
                  role={googlePreview.notice.severity === "error" ? "alert" : "status"}
                  className={`mt-2 text-sm text-center ${googlePreview.notice.severity === "error" ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {googlePreview.notice.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
