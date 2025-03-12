"use client";

import { getCountries } from "@/app/_lib/services";
import { useEffect, useState } from "react";

// Let's imagine your colleague already built this component 😃

function SelectCountry({ defaultCountry, name, id, className, handleFlag }) {
  const [countries, setContries] = useState([]);
  const [flag, setFlag] = useState("");

  useEffect(() => {
    (async () => {
      const countriesRes = await getCountries();
      setFlag(
        countriesRes.find((c) => c.name === defaultCountry)?.flag ??
          "https://flagcdn.com/us.svg"
      );
      setContries(countriesRes);
    })();
  }, []);

  useEffect(() => {
    if (flag && handleFlag) handleFlag(flag);
  }, [flag]);
  if (!flag) return <p>Loading...</p>;
  return (
    <select
      name={name}
      id={id}
      // Here we use a trick to encode BOTH the country name and the flag into the value. Then we split them up again later in the server action
      defaultValue={`${defaultCountry}%${flag}`}
      className={className}
      onChange={(e) => handleFlag(e.target.value.split("%")[1])}
    >
      <option value="">Select country...</option>
      {countries.map((c) => (
        <option key={c.name} value={`${c.name}%${c.flag}`}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

export default SelectCountry;
