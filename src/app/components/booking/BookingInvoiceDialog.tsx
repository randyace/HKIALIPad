import { Car, ShoppingBag, Mail, FileText, Download, CreditCard, Ticket, Utensils } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';

interface InvoiceBooking {
  bookingNo: string;
  guestName: string;
  accountNo: string;
  accountType?: string;
  suite: string;
  dateTime: string;
  flightNo: string;
  flightTime: string;
  numberOfGuests?: number;
  hasLimousine?: boolean;
  hasShopping?: boolean;
  amount: string;
  paymentMode?: string;
  paymentStatus: string;
  bookingType: string;
}

interface BookingInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  booking: InvoiceBooking;
  bookingId: number;
  voucherCount: number;
  voucherTotal: number;
  voucherUnitValue: number;
  headCountRate: number;
  headCountTotal: number;
  serviceSubtotal: number;
  amountDueAfterVouchers: number;
  getStatusColor: (s: string) => string;
  getPaymentStatusColor: (s: string) => string;
}

export function BookingInvoiceDialog({
  open, onClose, booking, bookingId,
  voucherCount, voucherTotal, voucherUnitValue,
  headCountRate, headCountTotal, serviceSubtotal,
  amountDueAfterVouchers,
  getStatusColor, getPaymentStatusColor,
}: BookingInvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-[650px] max-w-[95vw] w-[1400px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice - {booking.bookingNo}</DialogTitle>
          <DialogDescription>Review and send invoice for this booking</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="bg-[#0f2942] text-white p-6 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl mb-2">HKIA VIP Lounge</h2>
                <p className="text-sm text-gray-300">Hong Kong International Airport</p>
                <p className="text-sm text-gray-300">Terminal 1, Level 6</p>
                <p className="text-sm text-gray-300">Email: vip@hkia-lounge.com</p>
                <p className="text-sm text-gray-300">Tel: +852 2345 6789</p>
              </div>
              <div className="text-right">
                <h3 className="text-xl mb-2">INVOICE</h3>
                <p className="text-sm text-gray-300">Invoice No: INV-{booking.bookingNo}</p>
                <p className="text-sm text-gray-300">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm text-gray-300">Booking: {booking.bookingNo}</p>
              </div>
            </div>
          </div>

          {/* Bill To & Booking Info */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-3">Bill To</h3>
              <div className="space-y-2">
                <p className="font-medium">{booking.guestName}</p>
                <p className="text-sm text-gray-600">Account: {booking.accountNo}</p>
                <p className="text-sm text-gray-600">Type: {booking.accountType}</p>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-3">Booking Information</h3>
              <div className="space-y-2">
                <p className="text-sm"><span className="text-gray-600">Suite:</span> {booking.suite}</p>
                <p className="text-sm"><span className="text-gray-600">Date/Time:</span> {booking.dateTime}</p>
                <p className="text-sm"><span className="text-gray-600">Flight:</span> {booking.flightNo} at {booking.flightTime}</p>
                <p className="text-sm"><span className="text-gray-600">Guests:</span> {booking.numberOfGuests} pax</p>
                {voucherCount > 0 && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-100">
                    <Ticket className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">{voucherCount} Voucher{voucherCount > 1 ? 's' : ''} Applied</span>
                      {' '} — saving HK${voucherTotal.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Invoice Items Table */}
          <Card>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4">
                    <p className="font-medium">{booking.suite} - Lounge Access</p>
                    <p className="text-sm text-gray-600">Date: {booking.dateTime}</p>
                  </td>
                  <td className="px-6 py-4 text-center">{booking.numberOfGuests}</td>
                  <td className="px-6 py-4 text-right">HK${headCountRate.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-medium">HK${headCountTotal.toLocaleString()}</td>
                </tr>
                {/* Food & Beverage — always complimentary */}
                <tr>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-medium">Food &amp; Beverage (incl. Pre-order)</p>
                        <p className="text-sm text-gray-500">Premium selection — all food &amp; drinks included</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">—</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-green-600 font-medium">Complimentary</span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-green-600">HK$0</td>
                </tr>
                {booking.hasLimousine && (
                  <tr>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-purple-600" />
                        <span>Limousine Transfer Service</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">1</td>
                    <td className="px-6 py-4 text-right">HK$800</td>
                    <td className="px-6 py-4 text-right font-medium">HK$800</td>
                  </tr>
                )}
                {booking.hasShopping && (
                  <tr>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-green-600" />
                        <span>In-lounge Shopping Service</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">1</td>
                    <td className="px-6 py-4 text-right">HK$500</td>
                    <td className="px-6 py-4 text-right font-medium">HK$500</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="border-t-2">
                {/* Head Count Row */}
                <tr className="bg-gray-50">
                  <td colSpan={2} className="px-6 py-3 text-right text-sm text-gray-600">
                    Head Count ({booking.numberOfGuests || 1} pax × HK${headCountRate.toLocaleString()}):
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-gray-600">{booking.numberOfGuests || 1} pax</td>
                  <td className="px-6 py-3 text-right font-medium text-gray-800">HK${headCountTotal.toLocaleString()}</td>
                </tr>
                {/* Food note */}
                <tr className="bg-green-50">
                  <td colSpan={3} className="px-6 py-2 text-right text-sm text-green-700">
                    <span className="inline-flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5" />
                      Food &amp; Beverage (incl. pre-order):
                    </span>
                  </td>
                  <td className="px-6 py-2 text-right text-sm font-medium text-green-600">Complimentary</td>
                </tr>
                {serviceSubtotal > 0 && (
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-6 py-2 text-right text-sm text-gray-600">Services Subtotal:</td>
                    <td className="px-6 py-2 text-right font-medium text-gray-800">HK${Math.round(serviceSubtotal).toLocaleString()}</td>
                  </tr>
                )}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-6 py-2 text-right text-sm text-gray-600 font-medium">Subtotal:</td>
                  <td className="px-6 py-2 text-right font-medium text-gray-800">
                    HK${(headCountTotal + Math.round(serviceSubtotal)).toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-6 py-2 text-right text-sm text-gray-600">Tax (0%):</td>
                  <td className="px-6 py-2 text-right text-gray-600">HK$0</td>
                </tr>
                {voucherCount > 0 && (
                  <tr className="bg-amber-50">
                    <td colSpan={3} className="px-6 py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-medium text-amber-800 flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5" />
                          Entry Vouchers Applied ({voucherCount} × HK${voucherUnitValue.toLocaleString()} — Account Owner &amp; Spouse):
                        </span>
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          {Array.from({ length: voucherCount }, (_, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-700 text-xs">
                              <Ticket className="w-3 h-3" />
                              Voucher #{String(bookingId * 10 + i + 1).padStart(4, '0')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-amber-700">
                      − HK${voucherTotal.toLocaleString()}
                    </td>
                  </tr>
                )}
                <tr className="text-lg bg-gray-100">
                  <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-900">
                    {voucherCount > 0 ? 'Total Amount Payable (after entry vouchers):' : 'Total Amount:'}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">
                    HK${amountDueAfterVouchers.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Card>

          {/* Payment Information */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="text-sm uppercase tracking-wide text-blue-900 mb-3">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-900"><span className="font-medium">Payment Mode:</span> {booking.paymentMode}</p>
                <p className="text-sm text-blue-900"><span className="font-medium">Payment Status:</span> <Badge className={getPaymentStatusColor(booking.paymentStatus)}>{booking.paymentStatus}</Badge></p>
              </div>
              <div>
                <p className="text-sm text-blue-900"><span className="font-medium">Booking Type:</span> {booking.bookingType}</p>
                <p className="text-sm text-blue-900"><span className="font-medium">Booking Status:</span> <Badge className={getStatusColor('Confirmed')}>Confirmed</Badge></p>
              </div>
            </div>
          </Card>

          {/* Terms */}
          <Card className="p-4 bg-gray-50">
            <h3 className="text-sm uppercase tracking-wide text-gray-700 mb-2">Terms & Conditions</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Payment is due upon receipt of this invoice</li>
              <li>• Cancellation must be made at least 24 hours in advance for full refund</li>
              <li>• Late cancellation or no-show may result in charges</li>
              <li>• All prices are in Hong Kong Dollars (HKD)</li>
            </ul>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {booking.paymentStatus === 'Pending' && booking.paymentMode === 'Upfront' && (
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => toast.success('Payment link generated successfully!')}>
                <CreditCard className="w-4 h-4 mr-2" />Generate Payment Link
              </Button>
            )}
            {(booking.paymentStatus === 'Pending' || booking.paymentStatus === 'Payment Link Sent') && (
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast.success('Invoice emailed to customer!')}>
                <Mail className="w-4 h-4 mr-2" />Email Invoice to Customer
              </Button>
            )}
            <Button variant="outline" onClick={() => toast.success('Invoice downloaded successfully!')}>
              <Download className="w-4 h-4 mr-2" />Download PDF
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <FileText className="w-4 h-4 mr-2" />Print Invoice
            </Button>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>

          <div className="pt-4 border-t">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg" onClick={() => toast.success('Email sent to client successfully!')}>
              <Mail className="w-5 h-5 mr-2" />Send Email to Client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}