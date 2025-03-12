import { NextResponse, NextRequest } from "next/server";

export async function GET(req, res) {
  let countries = [];
  try {
    const response = await fetch(
      "https://restcountries.com/v2/all?fields=name,flag"
    );
    countries = await response.json();
    return NextResponse.json(countries);
  } catch (error) {
    return NextResponse.error(new Error("Could not fetch countries data"));
  }
}
