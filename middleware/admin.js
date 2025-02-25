export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log("Admin middleware executing");
  const user = useSupabaseUser();
  const supabase = useSupabaseClient();
  const toast = useToast();

  // If user is not logged in, redirect to login
  if (!user.value) {
    console.log("No user found, redirecting to login");
    return navigateTo("/auth/login");
  }
  console.log("User found:", user.value);

  try {
    // Check if user is admin
    console.log("Checking admin status for user:", user.value.id);
    const { data, error } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("id", user.value.id)
      .single();

    console.log("Admin check result:", { data, error });

    // Explicitly check if the user is not an admin
    if (error || !data || data.is_admin === false || data.is_admin === null) {
      console.log("User is not admin, redirecting to dashboard");
      toast.add({
        title: "Access Denied",
        description: "You need administrator privileges to access this area.",
        color: "red",
        icon: "i-heroicons-shield-exclamation",
        timeout: 5000,
      });

      return navigateTo("/dashboard");
    }

    // Add explicit return to allow access
    return;
  } catch (error) {
    console.error("Error in admin middleware:", error);
    return navigateTo("/dashboard");
  }
});
