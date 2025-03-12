"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import styles from "./styles.module.css";
import {
  getRoomReservations,
  getRoomReservationsByRoomNumber,
} from "@/app/_lib/supabase/reservations";
import { useEffect, useRef, useState } from "react";
import Loader from "@/app/_ui/Loader";

function FormDayPicker({
  handleDateSelection,
  handleAvailableRooms,
  startDate,
  endDate,
  handleRoomLeft,
  roomId,
  room_number,
}) {
  const [disableddDays, setDisabledDays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const currentYear = new Date().getFullYear();
  const calendarRangeRef = useRef({
    start: new Date(currentYear, 0),
    end: new Date(currentYear + 5, 11),
  });
  const [tempLockDate, setTempLockDate] = useState(null);

  useEffect(() => {
    async function getBusyDays() {
      if (!roomId && !room_number) return;
      if (!firstLoad) {
        setFirstLoad(true);
        setIsLoading(true);
      }
      var reservations = [];
      var rooms_left = 0;
      let busy_days = [];

      if (roomId) {
        // const reservation_target = await getReservationByID(roomId);
        var { reservations, rooms_left, rooms } = await getRoomReservations(
          roomId,
          startDate
            ? { check_in: startDate, check_out: endDate }
            : {
                month,
                year,
              }
        );

        busy_days = reservations?.filter((item) =>
          roomId != item.id
            ? { to: new Date(item.check_out), from: new Date(item.check_in) }
            : false
        );

        if (rooms_left === 0) {
          busy_days = reservations?.map((item) => ({
            from: new Date(item.check_in),
            to: new Date(item.check_out),
          }));

          const nextAvailableDate = new Date(
            new Date(reservations[0]?.check_out).setDate(
              new Date(reservations[0]?.check_out).getDate() + 1
            )
          );
          setTempLockDate(nextAvailableDate);
        }

        if (rooms_left != null) {
          handleRoomLeft(rooms_left);
        }

        if (handleAvailableRooms) {
          handleAvailableRooms(rooms);
        }
      } else if (room_number) {
        reservations = await getRoomReservationsByRoomNumber(room_number, {
          month,
          year,
        });

        busy_days = reservations?.map((item) => ({
          from: new Date(item.check_in),
          to: new Date(item.check_out),
        }));
      }

      // console.log("BLOCKED");
      // console.log(reservations.map((item) => ({ before: item.check_out, after: item.check_in })));
      setDisabledDays(busy_days);

      if (rooms_left === 0) {
      }
      setIsLoading(false);
    }

    getBusyDays();
  }, [month, year, endDate, startDate]);

  if (isLoading)
    return (
      <div className={"section-loader"}>
        <Loader />
      </div>
    );

  return (
    <div className={styles.datepicker}>
      <div>
        <DayPicker
          captionLayout="dropdown"
          min={0}
          onMonthChange={(month) => {
            setYear(month.getFullYear());
            setMonth(month.getMonth() + 1);
          }}
          onSelect={(range) => {
            if (room_number && startDate) {
              handleDateSelection({ from: startDate, to: range.to });
            } else {
              handleDateSelection(range);
            }
          }}
          mode="range"
          selected={
            startDate && endDate ? { from: startDate, to: endDate } : null
          }
          startMonth={calendarRangeRef.current.start}
          endMonth={calendarRangeRef.current.end}
          weekStartsOn={1}
          numberOfMonths={2}
          disabled={[
            {
              before: room_number
                ? startDate
                : tempLockDate
                ? tempLockDate
                : new Date(),
            },
            ...disableddDays,
          ]}
          footer={
            <p>
              <span className={styles.footerIcon}>
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
              <span>Please Pick a Range</span>
            </p>
          }
          classNames={{
            today: styles.datepickerToday,
            selected: styles.datepickerSelected,
            range_start: styles.datepickerRangeControlStart,
            range_end: styles.datepickerRangeControlEnd,
            range_middle: styles.datepickerRangeMiddle,
            chevron: styles.chevron,
            footer: styles.datepickerFooter,
          }}
        />
      </div>
    </div>
  );
}

export default FormDayPicker;
