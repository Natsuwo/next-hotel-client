export async function getCountries() {
  let countries = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/countries`,
      {
        method: "GET",
      },
      {
        next: {
          cache: "force-cache",
        },
      }
    );
    countries = await res.json();
  } catch {
    console.log("Could not fetch countries");
  }

  return countries;
}
