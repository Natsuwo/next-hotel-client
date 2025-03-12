import { auth } from "@/auth";
import Footer from "./_components/Footer";
import Navbar from "./_ui/Navbar";
import "./styles.css";
import { getSettings } from "./_lib/supabase/guests";
import { Roboto } from "next/font/google";
import { signOutAction } from "./_lib/actions";

const roboto_font = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  style: "normal",
});

export async function generateMetadata({ params, searchParams }, parent) {
  const settings = await getSettings();

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  const title = settings?.site_name
    ? `${settings.site_name} | ${settings.slogan ? settings.slogan : "Home"}`
    : "Home";

  return {
    title,
    description: settings?.description || "Nextjs Supabase Starter",
    openGraph: {
      images: [...previousImages],
    },
  };
}

export default async function RootLayout({ children }) {
  const session = await auth();
  const settings = await getSettings();
  return (
    <html lang="en">
      <body className={roboto_font.className}>
        <Navbar
          user={session?.user}
          signOutAction={signOutAction}
          siteName={settings?.site_name}
        />
        <main>{children}</main>
        <Footer data={settings} />
      </body>
    </html>
  );
}
