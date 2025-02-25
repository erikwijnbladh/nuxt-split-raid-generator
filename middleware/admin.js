export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log("Admin middleware executing");
  const user = useSupabaseUser();
  const supabase = useSupabaseClient();
  const toast = useToast();

  // If user is not logged in, redirect to login
  if (!user.value) {
    return navigateTo("/auth/login");
  }

  try {
    // Check if user is admin
    const { data, error } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("id", user.value.id)
      .single();

    // Explicitly check if the user is not an admin
    if (error || !data || data.is_admin === false || data.is_admin === null) {
      toast.add({
        title: "Access Denied",
        description: "You need administrator privileges to access this area.",
        color: "red",
        icon: "i-heroicons-shield-exclamation",
        timeout: 5000,
      });

      return navigateTo("/splits");
    }

    // Add explicit return to allow access
    return;
  } catch (error) {
    return navigateTo("/splits");
  }
});
