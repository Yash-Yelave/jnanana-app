import type { Metadata } from "next";
import { ProfileView } from "@/components/student-pages";
export const metadata: Metadata = { title: "Profile" };
export default function ProfilePage(){ return <ProfileView/>; }
