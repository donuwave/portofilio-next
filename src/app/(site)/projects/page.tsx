import type { Metadata } from "next";
import { ProjectsView } from "@/views/projects/ui/projects-view";

export const metadata: Metadata = { title: "Избранные работы" };

export default function ProjectsPage() {
  return <ProjectsView />;
}
