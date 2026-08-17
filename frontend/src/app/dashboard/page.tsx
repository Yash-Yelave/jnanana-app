import type { Metadata } from "next";
import { DashboardPage } from "@/components/student-pages";
export const metadata: Metadata = { title: "Statistics" };
export default function Dashboard(){ return <DashboardPage/>; }
