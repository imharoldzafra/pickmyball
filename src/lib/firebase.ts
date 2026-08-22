// Firebase has been removed in preparation for Supabase.
// These are just stubs to prevent the app from breaking.

export const db = null as any;
export const auth = null as any;
export const provider = null as any;

export const loginWithGoogle = async () => {
  console.log("Mock loginWithGoogle");
};

export const logout = async () => {
  console.log("Mock logout");
  window.location.reload();
};
