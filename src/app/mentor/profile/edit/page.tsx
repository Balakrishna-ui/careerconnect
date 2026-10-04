import { redirect } from "next/navigation";

export default function EditMentorProfileRedirect() {
  redirect("/dashboard/profile/edit");
}
