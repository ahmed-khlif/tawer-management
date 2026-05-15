import { generateMeta } from "@/lib/utils";
import AcceptInvitationPageRender from "./render";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata() {
  return generateMeta({
    title: "Accept invitation",
    description: "Accept a project invitation and join the team.",
    canonical: "/dashboard/invitations",
  });
}

export default async function Page({ params }: Props) {
  const { token } = await params;
  return <AcceptInvitationPageRender token={token} />;
}
