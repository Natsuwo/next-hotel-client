import styles from "./style.module.css";
import Heading from "@/app/_ui/Heading";
import ReservationCard from "./_components/ReservationCard";
import { getGuestReservations } from "@/app/_lib/supabase/reservations";
import { auth } from "@/auth";
import Link from "next/link";

export const metadata = {
  title: "Booking History",
  description: "Reservations history at the Hotel Booking App ",
};

async function History({ searchParams }) {
  let session = {};
  let reservations = [];
  let total_pages = 0;
  const page = parseInt(searchParams?.page ?? 1);
  try {
    session = await auth();
    console.log({ HISTORY_SESSION: session });
    const response =
      (await getGuestReservations(
        session?.accessToken,
        session?.user?.id,
        "?page=" + page + "&limit=10"
      )) ?? [];
    if (!response) throw new Error("Failed fetching!");
    reservations = response.reservations;
    total_pages = response.total_page;
  } catch (err) {
    console.log(err);
  }

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(total_pages, startPage + maxPagesToShow - 1);

    if (startPage > 1) {
      pages.push(
        <Link href={`/account/history?page=1`} key="first">
          1
        </Link>
      );
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Link href={`/account/history?page=${i}`} key={i}>
          {i}
        </Link>
      );
    }

    if (endPage < total_pages) {
      if (endPage < total_pages - 1) {
        pages.push(<span key="end-ellipsis">...</span>);
      }
      pages.push(
        <Link href={`/account/history?page=${total_pages}`} key="last">
          {total_pages}
        </Link>
      );
    }

    return pages;
  };

  return (
    <>
      <Heading textClassName={styles.heading}>Your History</Heading>
      <div>
        {reservations.length ? (
          reservations.map((item) => (
            <ReservationCard key={item.id} reservation={item} />
          ))
        ) : (
          <div>
            <p>You have no booked room.</p>
            <Link href={"/rooms"}>View Rooms</Link>
          </div>
        )}
        <div className={styles.pagination}>
          {page > 1 && (
            <Link href={`/account/history?page=${page - 1}`} key="prev">
              Prev
            </Link>
          )}
          {renderPagination()}
          {page < total_pages && (
            <Link href={`/account/history?page=${page + 1}`} key="next">
              Next
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default History;
