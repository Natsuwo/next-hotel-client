import styles from "./styles.module.css";
import Heading from "@/app/_ui/Heading";
import IconMdi from "@/app/_components/IconMdi/IconMdi";

function Amenities({ data, title }) {
  return (
    <div className={styles.marginTop}>
      <Heading className="text-center">{title}</Heading>
      <hr className="decriptionDivider" />
      <table className={styles.amenitiesTable}>
        <tbody>
          {data.map(
            (item, index) =>
              index % 2 === 0 && (
                <tr key={item.id}>
                  <td>
                    <span className={styles.amenity}>
                      <IconMdi
                        iconClassicClass={"mdi mdi-check"}
                        styles={styles.amenityIcon}
                        size={1}
                      />
                      <span
                        dangerouslySetInnerHTML={{ __html: item.name }}
                      ></span>
                    </span>
                  </td>
                  {data[index + 1] && (
                    <td>
                      <span className={styles.amenity}>
                        <IconMdi
                          iconClassicClass={"mdi mdi-check"}
                          styles={styles.amenityIcon}
                          size={1}
                        />
                        <span
                          dangerouslySetInnerHTML={{
                            __html: data[index + 1]?.name,
                          }}
                        ></span>
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

export default Amenities;
