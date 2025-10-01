"use client";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        // Wait for auth state to be determined
        const user = await new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
          });
        });
        console.log("Logging out user:", user);
        if (user) {
          const token = await user.accessToken;
          console.log("User token:", token);
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
            firebase_token: token
          });
        }
        
        await signOut(auth);
      } catch (err) {
        console.error("Logout failed", err);
      } finally {
        router.push("/login");
      }
    };
    
    logout();
  }, [router]);

  return <div>Logging out...</div>;
}