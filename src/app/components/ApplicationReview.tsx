import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { CheckCircle, XCircle, Clock, Mail, Phone, FileText } from 'lucide-react';

interface Application {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  regionCode: string;
  nationality: string;
  passportNumber: string;
  status: 'pending' | 'email-verified' | 'approved' | 'rejected';
  submittedDate: string;
  emailVerified: boolean;
}

const mockApplications: Application[] = [
  {
    id: 'APP-2025-001',
    title: 'Mr.',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '98765432',
    regionCode: '852',
    nationality: 'United Kingdom',
    passportNumber: 'UK123456789',
    status: 'email-verified',
    submittedDate: '2025-10-20',
    emailVerified: true
  },
  {
    id: 'APP-2025-002',
    title: 'Ms.',
    firstName: 'Emily',
    lastName: 'Chen',
    email: 'emily.chen@email.com',
    phone: '91234567',
    regionCode: '852',
    nationality: 'Hong Kong',
    passportNumber: 'HK987654321',
    status: 'email-verified',
    submittedDate: '2025-10-21',
    emailVerified: true
  },
  {
    id: 'APP-2025-003',
    title: 'Dr.',
    firstName: 'Michael',
    lastName: 'Wong',
    email: 'michael.wong@email.com',
    phone: '92345678',
    regionCode: '852',
    nationality: 'Hong Kong',
    passportNumber: 'HK456789123',
    status: 'pending',
    submittedDate: '2025-10-22',
    emailVerified: false
  }
];

// ── MOCK constant (isolated — container replaces via props) ───────────────────
const MOCK_APPLICATIONS = mockApplications;

// ── Props interface ───────────────────────────────────────────────────────────
export interface ApplicationReviewProps {
  /** Pass populated array from CI4; falls back to MOCK_APPLICATIONS when empty */
  applications?: Application[];
  onApprove?: (id: string, data?: { accountNumber: string; internalGrouping: string; companyCode?: string; paymentMethod?: string; bulkPurchaseCode?: string; remarks?: string }) => void;
  onReject?: (id: string, reason: string) => void;
  onViewDetail?: (id: string) => void;
  isLoading?: boolean;
}

export function ApplicationReview({
  applications: applicationsProp = [],
  onApprove,
  onReject,
  onViewDetail,
  isLoading = false,
}: ApplicationReviewProps) {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    setApplications(applicationsProp);
  }, [applicationsProp]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [internalGrouping, setInternalGrouping] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upfront');
  const [bulkPurchaseCode, setBulkPurchaseCode] = useState('');
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleReview = (app: Application) => {
    setSelectedApp(app);
    // Generate account number
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setAccountNumber(`ACC-${date}-${random}`);
  };

  const handleApprove = () => {
    if (!selectedApp || !internalGrouping) {
      toast.error('Please fill in all required fields');
      return;
    }

    setApplications(applications.map(app => 
      app.id === selectedApp.id ? { ...app, status: 'approved' as const } : app
    ));

    toast.success('Application Approved', {
      description: `Account ${accountNumber} created. Welcome email sent to ${selectedApp.email}`
    });

    setIsApprovalDialogOpen(false);
    setSelectedApp(null);
    resetForm();
    onApprove?.(selectedApp.id, {
      accountNumber,
      internalGrouping,
      companyCode,
      paymentMethod,
      bulkPurchaseCode,
      remarks,
    });
  };

  const handleReject = () => {
    if (!selectedApp || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setApplications(applications.map(app => 
      app.id === selectedApp.id ? { ...app, status: 'rejected' as const } : app
    ));

    toast.success('Application Rejected', {
      description: `Rejection email sent to ${selectedApp.email}`
    });

    setIsRejectionDialogOpen(false);
    setSelectedApp(null);
    setRejectionReason('');
    onReject?.(selectedApp.id, rejectionReason);
  };

  const resetForm = () => {
    setAccountNumber('');
    setInternalGrouping('');
    setCompanyCode('');
    setPaymentMethod('upfront');
    setBulkPurchaseCode('');
    setRemarks('');
  };

  const getStatusBadge = (status: string, emailVerified: boolean) => {
    if (status === 'approved') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
    }
    if (status === 'rejected') {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
    }
    if (status === 'email-verified') {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Email Verified</Badge>;
    }
    if (!emailVerified) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Verification</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Pending</Badge>;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-1">Application Review</h1>
        <p className="text-sm text-gray-500">Review and approve individual customer applications</p>
      </div>

      <Card className="p-4 md:p-6">
        <div className="mb-6">
          <h3 className="text-gray-900 mb-1">Pending Applications</h3>
          <p className="text-sm text-gray-500">Applications awaiting review</p>
        </div>

        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="p-4 md:p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                    <h4 className="text-gray-900">
                      {app.title} {app.firstName} {app.lastName}
                    </h4>
                    {getStatusBadge(app.status, app.emailVerified)}
                    {app.emailVerified && (
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Application ID</p>
                      <p className="text-gray-900">{app.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Email</p>
                      <p className="text-gray-900 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {app.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Phone</p>
                      <p className="text-gray-900 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        +{app.regionCode} {app.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Submitted Date</p>
                      <p className="text-gray-900">{app.submittedDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Nationality</p>
                      <p className="text-gray-900">{app.nationality}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">First 4 digits of Passport Number</p>
                      <p className="text-gray-900">{app.passportNumber}</p>
                    </div>
                  </div>
                </div>

                {app.status === 'email-verified' && (
                  <div className="flex flex-wrap gap-2 md:ml-4">
                    <Button
                      onClick={() => {
                        handleReview(app);
                        setIsApprovalDialogOpen(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedApp(app);
                        setIsRejectionDialogOpen(true);
                      }}
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50 flex-1 md:flex-none"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
            <DialogDescription>
              Review and complete the account creation details for this approved applicant
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded">
                <h4 className="text-gray-900 mb-2">Applicant Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2">{selectedApp.title} {selectedApp.firstName} {selectedApp.lastName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2">{selectedApp.email}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input 
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="System generated"
                  />
                  <p className="text-xs text-gray-500 mt-1">Can be manually amended</p>
                </div>

                <div>
                  <Label htmlFor="internalGrouping">Internal Grouping *</Label>
                  <Select value={internalGrouping} onValueChange={setInternalGrouping}>
                    <SelectTrigger id="internalGrouping">
                      <SelectValue placeholder="Select grouping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="companyCode">Company Code</Label>
                  <Input 
                    id="companyCode"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value)}
                    placeholder="Enter company code"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="paymentMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upfront">Upfront</SelectItem>
                      <SelectItem value="net-upfront">Net Upfront</SelectItem>
                      <SelectItem value="on-credit">On-Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bulkPurchaseCode">Bulk Purchase Code</Label>
                  <Input 
                    id="bulkPurchaseCode"
                    value={bulkPurchaseCode}
                    onChange={(e) => setBulkPurchaseCode(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea 
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter any additional remarks"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              Approve & Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Provide a detailed reason for rejecting this application
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded border border-red-200">
                <p className="text-sm text-gray-700">
                  You are about to reject the application for:
                </p>
                <p className="text-gray-900 mt-1">
                  {selectedApp.title} {selectedApp.firstName} {selectedApp.lastName}
                </p>
                <p className="text-sm text-gray-600">{selectedApp.email}</p>
              </div>

              <div>
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea 
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection"
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This reason will be sent to the applicant via email
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReject} 
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}