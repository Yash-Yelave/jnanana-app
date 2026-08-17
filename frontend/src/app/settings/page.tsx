import type { Metadata } from "next";
import { SettingsPage } from "@/components/student-pages";
export const metadata: Metadata = { title: "Settings" };
export default function Settings(){ return <SettingsPage/>; }
