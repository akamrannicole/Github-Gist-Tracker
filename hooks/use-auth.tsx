"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // ✅ Use sonner instead of use-toast

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  githubToken?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to check authentication status", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();
      setUser(data.user);
      toast.success("Registration successful", {
        description: "You have been registered successfully",
      });
      router.push("/gists");
    } catch (error) {
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "An error occurred during registration",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      setUser(data.user);
      toast.success("Login successful", {
        description: "You have been logged in successfully",
      });
      router.push("/gists");
    } catch (error) {
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "An error occurred during login",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
      toast.success("Logout successful", {
        description: "You have been logged out successfully",
      });
      router.push("/");
    } catch (error) {
      toast.error("Logout failed", {
        description: "An error occurred during logout",
      });
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Profile update failed");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success("Profile updated", {
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast.error("Profile update failed", {
        description: error instanceof Error ? error.message : "An error occurred during profile update",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Account deletion failed");
      }

      setUser(null);
      toast.success("Account deleted", {
        description: "Your account has been deleted successfully",
      });
      router.push("/");
    } catch (error) {
      toast.error("Account deletion failed", {
        description: error instanceof Error ? error.message : "An error occurred during account deletion",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
