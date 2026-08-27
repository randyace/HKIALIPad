import { BookingSchedules, BookingSchedulesProps } from './BookingSchedules';

export interface SuiteBookingSchedulesProps {
  onViewDetail?: (bookingId: number) => void;
  onPreOrder?: BookingSchedulesProps['onPreOrder'];
}

export function SuiteBookingSchedules({ onViewDetail, onPreOrder }: SuiteBookingSchedulesProps = {}) {
  return (
    <BookingSchedules
      venueTypeFilter="suites"
      pageTitle="Suite Booking Schedules"
      pageSubtitle="Daily schedule view across all VIP, Executive, Business, Premier and Family suites"
      onViewDetail={onViewDetail}
      onPreOrder={onPreOrder}
    />
  );
}