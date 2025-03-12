import styles from "./styles.module.css";
import Heading from "@/app/_ui/Heading";
import { auth } from "@/auth";
import { getGuestById, updateGuestWithPwd } from "@/app/_lib/supabase/guests";
// import { confirmPassword as zConfirmPassword } from "@/app/_lib/zodSchemas";
import { redirect } from "next/navigation";
import SecurityForm from "./_components/SecurityForm";

export const metadata = {
  title: "Security Settings",
  description: "Update your password and other security settings",
};

async function Security() {
  const session = await auth();
  if (!session?.user?.email) redirect("/signin");

  const accessToken = session?.accessToken;
  const user = await getGuestById(accessToken);

  if (!user) redirect("/signin");

  async function guestUpdateAction(prevState, formData) {
    "use server";

    prevState = {};
    const current_password = formData.get("current_password");
    const password = formData.get("password");
    const confirm_password = formData.get("confirm_password");

    if (password.trim() || confirm_password.trim()) {
      if (password.length < 6)
        return {
          ...prevState,
          password: "Password must be at least 6 characters",
        };
      if (password != confirm_password)
        return {
          ...prevState,
          password: "Password doesn't match confirmation",
          confirm_password: "Password doesn't match confirmation",
        };

      await updateGuestWithPwd(
        accessToken,
        current_password,
        password,
        confirm_password
      );
    }

    // REVALIDATE THE DATA FOR THE CACHE
    redirect("/account/profile");
  }

  return (
    <>
      <Heading textClassName={styles.heading}>Secirity Settings</Heading>
      <SecurityForm
        guestUpdateAction={guestUpdateAction}
        guest={user}
        accessToken={accessToken}
      />
    </>
  );
}

export default Security;
