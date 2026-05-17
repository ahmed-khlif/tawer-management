import { generateMeta } from "@/lib/utils";
import ProjectTemplatesRender from "./render";

export async function generateMetadata() {
  return generateMeta({
    title: "Project Templates",
    description: "Choose a starter template before creating your next project workspace.",
    canonical: "/dashboard/project-templates",
  });
}

export default function Page() {
  return <ProjectTemplatesRender />;
}
