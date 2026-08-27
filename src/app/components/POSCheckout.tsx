import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, CreditCard, DollarSign, Receipt, Printer, Mail, Check } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface OrderItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

interface BookingData {
  bookingNo: string;
  guestName: string;
  accountNo: string;
  membershipTier: string;
  suiteName: string;
  checkInTime: string;
  checkOutTime: string;
  duration: string;
  loungeAccess: number;
  creditBalance: number;
}

const MOCK_BOOKING_DATA: BookingData = {
  bookingNo: 'A-202602-000001',
  guestName: 'John Smith',
  accountNo: 'ACC-2024-001',
  membershipTier: 'Platinum',
  suiteName: 'VIP Suite A1',
  checkInTime: '14:30',
  checkOutTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
  duration: '3 hours 15 minutes',
  loungeAccess: 450,
  creditBalance: 25000,
};

const MOCK_ORDER_ITEMS: OrderItem[] = [
  { id: 1, name: 'Espresso',             category: 'Beverage', quantity: 2, unitPrice: 45 },
  { id: 2, name: 'Club Sandwich',        category: 'Food',     quantity: 1, unitPrice: 180 },
  { id: 3, name: 'Glass of Champagne',   category: 'Beverage', quantity: 2, unitPrice: 250 },
  { id: 4, name: 'Chocolate Soufflé',    category: 'Dessert',  quantity: 1, unitPrice: 120 },
  { id: 5, name: 'Airport Limousine',    category: 'Transfer', quantity: 1, unitPrice: 800 },
];

export interface POSCheckoutProps {
  bookingNo?: string;
  bookingData?: BookingData;
  orderItems?: OrderItem[];
  onBack?: () => void;
  onComplete?: (paymentData: { method: string; total: number }) => void;
}

export function POSCheckout({
  bookingNo: bookingNoProp,
  bookingData: bookingDataProp,
  orderItems: orderItemsProp,
  onBack = () => {},
  onComplete,
}: POSCheckoutProps = {}) {
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'account-credit'>('credit-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const bookingData: BookingData = bookingDataProp ?? {
    ...MOCK_BOOKING_DATA,
    bookingNo: bookingNoProp ?? MOCK_BOOKING_DATA.bookingNo,
  };
  const orderItems: OrderItem[] = orderItemsProp?.length ? orderItemsProp : MOCK_ORDER_ITEMS;

  const subtotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const serviceCharge = subtotal * 0.1;
  const totalOrderAmount = subtotal + serviceCharge;
  const totalAmount = bookingData.loungeAccess + totalOrderAmount;
  
  const handleCompleteCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      if (onComplete) {
        onComplete({ method: paymentMethod, total: totalAmount });
      }
    }, 1500);
  };

  if (isComplete) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Floor Plan
            </Button>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          
          <div>
            <h2 className="text-2xl mb-2">Checkout Complete!</h2>
            <p className="text-gray-600">Payment has been processed successfully</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking Number:</span>
              <span className="font-semibold">{bookingData.bookingNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guest Name:</span>
              <span className="font-semibold">{bookingData.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold">HKD {totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold capitalize">{paymentMethod.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
            <Button className="flex-1" variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Email Receipt
            </Button>
          </div>

          <Button className="w-full" onClick={onBack}>
            Return to Floor Plan
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Floor Plan
          </Button>
          <div>
            <h1>Checkout - {bookingNoProp}</h1>
            <p className="text-gray-600">Complete payment and checkout</p>
          </div>
        </div>
        <Badge className="bg-green-600 text-white text-lg px-4 py-2">
          Total: HKD {totalAmount.toFixed(2)}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Booking Summary */}
        <div className="col-span-2 space-y-6">
          {/* Guest Information */}
          <Card className="p-6">
            <h3 className="text-lg mb-4">Guest Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Guest Name</Label>
                <p className="font-semibold">{bookingData.guestName}</p>
              </div>
              <div>
                <Label className="mb-2">Account Number</Label>
                <p className="font-semibold">{bookingData.accountNo}</p>
              </div>
              <div>
                <Label className="mb-2">Membership Tier</Label>
                <Badge variant="default">{bookingData.membershipTier}</Badge>
              </div>
              <div>
                <Label className="mb-2">Suite</Label>
                <p className="font-semibold">{bookingData.suiteName}</p>
              </div>
            </div>
          </Card>

          {/* Time Summary */}
          <Card className="p-6">
            <h3 className="text-lg mb-4">Time Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="mb-2">Check-in Time</Label>
                <p className="font-semibold">{bookingData.checkInTime}</p>
              </div>
              <div>
                <Label className="mb-2">Check-out Time</Label>
                <p className="font-semibold">{bookingData.checkOutTime}</p>
              </div>
              <div>
                <Label className="mb-2">Duration</Label>
                <p className="font-semibold">{bookingData.duration}</p>
              </div>
            </div>
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h3 className="text-lg mb-4">Order Summary</h3>
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b">
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">x{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-6">
            <h3 className="text-lg mb-4">Payment Method</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('credit-card')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'credit-card' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className={`w-8 h-8 ${paymentMethod === 'credit-card' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={paymentMethod === 'credit-card' ? 'font-semibold text-blue-600' : ''}>Credit Card</span>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('account-credit')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'account-credit' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <DollarSign className={`w-8 h-8 ${paymentMethod === 'account-credit' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={paymentMethod === 'account-credit' ? 'font-semibold text-blue-600' : ''}>Account Credit</span>
                </button>
              </div>

              {paymentMethod === 'credit-card' && (
                <div className="space-y-3">
                  <div>
                    <Label className="mb-2">Card Number</Label>
                    <Input placeholder="**** **** **** ****" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="mb-2">Expiry Date</Label>
                      <Input placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label className="mb-2">CVV</Label>
                      <Input placeholder="***" type="password" maxLength={3} />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'account-credit' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Available Credit Balance</p>
                      <p className="text-2xl font-semibold text-blue-600">HKD {bookingData.creditBalance.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">After Payment</p>
                      <p className="text-xl font-semibold">HKD {(bookingData.creditBalance - totalAmount).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label className="mb-2">Remarks / Notes</Label>
                <Textarea placeholder="Optional payment notes..." rows={2} />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-6">
            <h3 className="text-lg mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Lounge Access Fee</span>
                <span className="font-semibold">HKD {bookingData.loungeAccess.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600 mb-2">Food & Beverage</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>HKD {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Service Charge (10%)</span>
                  <span>HKD {serviceCharge.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">F&B Total</span>
                  <span className="font-semibold">HKD {totalOrderAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-blue-600">HKD {totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCompleteCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Receipt className="w-4 h-4 mr-2" />
                    Complete Checkout
                  </>
                )}
              </Button>
              
              <Button 
                className="w-full" 
                variant="outline"
                onClick={onBack}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </Card>

          <Card className="p-4 bg-gray-50">
            <h4 className="text-sm mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Printer className="w-3 h-3 mr-2" />
                Print Pre-bill
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Mail className="w-3 h-3 mr-2" />
                Email Summary
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}