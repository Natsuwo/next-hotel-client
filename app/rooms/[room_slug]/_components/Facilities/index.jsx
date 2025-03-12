import styles from "./styles.module.css";
import Heading from "@/app/_ui/Heading";
import IconMdi from "@/app/_components/IconMdi/IconMdi";

function Facilities({ facilities }) {
  return (
    <div>
      <Heading className="text-center">Facilities</Heading>
      <hr className="decriptionDivider" />
      <table className={styles.facilitiesTable}>
        <tbody>
          {facilities.map(
            (facility, index) =>
              index % 2 === 0 && (
                <tr key={facility.id}>
                  <td>
                    <span>
                      <IconMdi
                        iconClassicClass={facility?.icon}
                        styles={styles.facilitiyIcon}
                        size={1}
                      />
                      <span>{facility.name}</span>
                    </span>
                  </td>
                  {facilities[index + 1] && (
                    <td>
                      <span>
                        <IconMdi
                          iconClassicClass={facilities[index + 1].icon}
                          styles={styles.facilitiyIcon}
                          size={1}
                        />
                        <span>{facilities[index + 1].name}</span>
                      </span>
                    </td>
                  )}
                </tr>
              )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Facilities;
