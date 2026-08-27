import { BookingSchedules, BookingSchedulesProps } from './BookingSchedules';

export interface TableBookingSchedulesProps {
  onViewDetail?: (bookingId: number) => void;
  onPreOrder?: BookingSchedulesProps['onPreOrder'];
}

export function TableBookingSchedules({ onViewDetail, onPreOrder }: TableBookingSchedulesProps = {}) {
  return (
    <BookingSchedules
      venueTypeFilter="tables"
      pageTitle="Table Booking Schedules"
      pageSubtitle="Daily schedule view across all lounge tables (Table 1–5)"
      onViewDetail={onViewDetail}
      onPreOrder={onPreOrder}
    />
  );
}