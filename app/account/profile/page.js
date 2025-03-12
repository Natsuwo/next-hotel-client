import styles from "./styles.module.css";
import Heading from "@/app/_ui/Heading";
import ProfileForm from "./_components/ProfileForm";
import { auth } from "@/auth";
import { getGuestById, updateGuest } from "@/app/_lib/supabase/guests";
import { revalidatePath } from "next/cache";
import { profileSchema } from "@/app/_lib/zodSchemas";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Profile",
  description: "View and Edit your profile details",
};

async function Profile() {
  const session = await auth();
  if (!session?.user?.email) redirect("/signin");

  const accessToken = session?.accessToken;
  const user = await getGuestById(accessToken);

  if (!user) redirect("/signin");

  async function guestUpdateAction(prevState, formData) {
    "use server";

    prevState = {};
    const guestID = user.id;
    const fullname = formData.get("name");
    const nationalityWithFlag = formData.get("nationality");
    const phone = formData.get("phone");
    const dob = formData.get("dob");
    const address = formData.get("address");
    const passport = formData.get("passport");
    const gender = formData.get("gender");

    // if (fullname.length < 3) {
    //   return { ...prevState, fullnameErr: "Fullname must be at least 3 characters" };
    // }

    try {
      const z_validation = profileSchema.parse({
        name: fullname,
        phone,
        nationality: nationalityWithFlag,
      });
    } catch (err) {
      console.log("Caugth Validation");
      console.log(err.errors);
      err.errors.forEach((element) => {
        prevState[element?.path[0] ?? "unknown"] = element.message;
      });
      return { ...prevState };
    }

    const [nationality] = nationalityWithFlag.split("%");

    await updateGuest(
      accessToken,
      guestID,
      fullname,
      nationality,
      phone,
      dob,
      address,
      passport,
      gender
    );

    // REVALIDATE THE DATA FOR THE CACHE
    revalidatePath("/account/profile");
  }

  return (
    <>
      <Heading textClassName={styles.heading}>Edit Profile</Heading>
      <ProfileForm guestUpdateAction={guestUpdateAction} guest={user} />
    </>
  );
}

export default Profile;
