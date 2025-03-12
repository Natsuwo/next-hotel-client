import React from "react";
import Icon from "@mdi/react";
import {
  mdiAccount,
  mdiCheck,
  mdiPaw,
  mdiAirConditioner,
  mdiFridge,
  mdiHairDryer,
  mdiDesk,
  mdiCoffee,
  mdiPhone,
  mdiShower,
  mdiBathtub,
  mdiWaves,
  mdiBalcony,
  mdiBedKing,
  mdiBedDouble,
  mdiSpa,
  mdiPool,
  mdiParking,
  mdiSmokingOff,
  mdiClockOutline,
} from "@mdi/js";
const IconMdi = ({ iconClassicClass, styles, size }) => {
  function getIconPath(iconClass) {
    switch (iconClass) {
      case "mdi mdi-paw":
        return mdiPaw;
      case "mdi mdi-air-conditioner":
        return mdiAirConditioner;
      case "mdi mdi-fridge":
        return mdiFridge;
      case "mdi mdi-hair-dryer":
        return mdiHairDryer;
      case "mdi mdi-desk":
        return mdiDesk;
      case "mdi mdi-coffee":
        return mdiCoffee;
      case "mdi mdi-phone":
        return mdiPhone;
      case "mdi mdi-shower":
        return mdiShower;
      case "mdi mdi-bathtub":
        return mdiBathtub;
      case "mdi mdi-waves":
        return mdiWaves;
      case "mdi mdi-balcony":
        return mdiBalcony;
      case "mdi mdi-bed-king":
        return mdiBedKing;
      case "mdi mdi-bed-double":
        return mdiBedDouble;
      case "mdi mdi-spa":
        return mdiSpa;
      case "mdi mdi-pool":
        return mdiPool;
      case "mdi mdi-parking":
        return mdiParking;
      case "mdi mdi-smoking-off":
        return mdiSmokingOff;
      case "mdi mdi-clock-outline":
        return mdiClockOutline;
      case "mdi mdi-check":
        return mdiCheck;
      default:
        return mdiAccount; // Default icon if no match is found
    }
  }
  return (
    <Icon path={getIconPath(iconClassicClass)} size={size} className={styles} />
  );
};

export default IconMdi;
