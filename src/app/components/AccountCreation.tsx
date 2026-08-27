import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner';
import { Building2, Plane, Shuffle, X, UserPlus } from 'lucide-react';

interface CorporateSubForm {
  id: number;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  regionCode: string;
  contactNumber: string;
  paymentMethod: string;
  remarks: string;
}

const emptySubForm = (id: number): CorporateSubForm => ({
  id,
  title: '',
  firstName: '',
  lastName: '',
  email: '',
  regionCode: '852',
  contactNumber: '',
  paymentMethod: 'upfront',
  remarks: '',
});

export interface AccountCreationProps {
  type?: 'individual' | 'corporate' | 'travel-agency';
  countries?: { code: string; name: string }[];
  regionCodes?: { code: string; name: string }[];
  companySearchResults?: { id: number; account_id: number; company_name: string; company_registration: string }[];
  agencySearchResults?: { id: number; account_id: number; agency_name: string; agency_code: string }[];
  onCompanySearchChange?: (value: string) => void;
  onAgencySearchChange?: (value: string) => void;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  /** Field-level validation errors keyed by snake_case field name, e.g. { email: "The email has already been taken." } */
  fieldErrors?: Record<string, string>;
}

export function AccountCreation({
  type,
  countries,
  regionCodes: regionCodesProp,
  companySearchResults = [],
  agencySearchResults = [],
  onCompanySearchChange,
  onAgencySearchChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
  fieldErrors = {},
}: AccountCreationProps = {}) {
  const displayRegionCodes = regionCodesProp && regionCodesProp.length > 0 ? regionCodesProp : null;
  const displayCountries = countries && countries.length > 0 ? countries : null;
  const [accountType, setAccountType] = useState<'individual' | 'corporate' | 'travel-agency'>(
    type === 'corporate' ? 'corporate' : type === 'travel-agency' ? 'travel-agency' : 'individual'
  );

  // Corporate: selected company id + search state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  // Agency: selected agency id + search state
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('');
  const [agencySearch, setAgencySearch] = useState('');
  const [showAgencyDropdown, setShowAgencyDropdown] = useState(false);

  // ── Corporate bulk sub-forms ─────────────────────────────────────────────
  const [corporateForms, setCorporateForms] = useState<CorporateSubForm[]>([emptySubForm(Date.now())]);

  const addCorporateForm = () =>
    setCorporateForms(prev => [...prev, emptySubForm(Date.now())]);

  const removeCorporateForm = (id: number) =>
    setCorporateForms(prev => prev.length > 1 ? prev.filter(f => f.id !== id) : prev);

  const updateCorporateForm = (id: number, field: keyof Omit<CorporateSubForm, 'id'>, value: string) =>
    setCorporateForms(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));

  // ── Individual / Travel Agency form data ─────────────────────────────────
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    lastName: '',
    regionCode: '852',
    contactNumber: '',
    email: '',
    nationality: '',
    passportNumber: '',
    paymentMethod: 'upfront',
    remarks: '',
  });

  // ── Quick Fill ────────────────────────────────────────────────────────────
  const handleQuickFill = () => {
    if (accountType === 'individual') {
      setFormData({
        ...formData,
        title: 'mr', firstName: 'James', lastName: 'Wong',
        regionCode: '852', contactNumber: '91234567',
        email: 'james.wong@gmail.com', nationality: 'hk',
        passportNumber: 'H123', remarks: '',
      });
    } else if (accountType === 'corporate') {
      setCorporateForms([{
        id: Date.now(),
        title: 'mrs', firstName: 'Alice', lastName: 'Lam',
        email: 'alice.lam@cathaypacific.com',
        regionCode: '852', contactNumber: '98765432',
        paymentMethod: 'on-credit', remarks: 'VIP corporate client',
      }]);
    } else {
      setFormData({
        ...formData,
        title: 'ms', firstName: 'Fiona', lastName: 'Cheung',
        regionCode: '852', contactNumber: '95556789',
        email: 'fiona@pacificworld.hk', nationality: '', passportNumber: '',
      });
    }
  };

  // ── Company search handler ───────────────────────────────────────────────
  const handleCompanySearchChange = (value: string) => {
    setCompanySearch(value);
    onCompanySearchChange?.(value);
    setShowCompanyDropdown(value.length > 0);
  };

  const handleSelectCompany = (id: string, name: string) => {
    setSelectedCompanyId(id);
    setCompanySearch(name);
    setShowCompanyDropdown(false);
    onCompanySearchChange?.('');
  };

  // ── Agency search handler ────────────────────────────────────────────────
  const handleAgencySearchChange = (value: string) => {
    setAgencySearch(value);
    onAgencySearchChange?.(value);
    setShowAgencyDropdown(value.length > 0);
  };

  const handleSelectAgency = (id: string, name: string) => {
    setSelectedAgencyId(id);
    setAgencySearch(name);
    setShowAgencyDropdown(false);
    onAgencySearchChange?.('');
  };

  // ── Form submission ─────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (accountType === 'corporate' && !selectedCompanyId) {
      toast.error('Please select a company');
      return;
    }
    if (accountType === 'travel-agency' && !selectedAgencyId) {
      toast.error('Please select a travel agency');
      return;
    }

    const payload = {
      type: accountType,
      ...(accountType === 'corporate'
        ? {
            companyId: selectedCompanyId,
            contacts: corporateForms.map(f => ({
              title: f.title,
              firstName: f.firstName,
              lastName: f.lastName,
              email: f.email,
              regionCode: f.regionCode,
              contactNumber: f.contactNumber,
              paymentMethod: f.paymentMethod,
              remarks: f.remarks,
            })),
          }
        : {
            ...formData,
            agencyId: selectedAgencyId,
          }),
    };

    onSubmit?.(payload);
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Account</h2>
          <p className="text-gray-600">Fill in the details below to create a new account</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleQuickFill}>
          <Shuffle className="w-4 h-4 mr-2" />
          Quick Fill
        </Button>
      </div>

      {/* Account Type Toggle */}
      <div className="mb-6">
        <Label style={{ marginBottom: 10 }}>Account Type *</Label>
        <div className="flex flex-wrap gap-4">
          {(['individual', 'corporate', 'travel-agency'] as const).map(typeOption => (
            <div key={typeOption} className="flex items-center space-x-2">
              <input
                type="radio"
                id={typeOption}
                checked={accountType === typeOption}
                onChange={() => setAccountType(typeOption)}
                className="w-4 h-4"
              />
              <Label htmlFor={typeOption} className="cursor-pointer flex items-center gap-1">
                {typeOption === 'individual' && <><UserPlus className="w-4 h-4" /> Individual</>}
                {typeOption === 'corporate' && <><Building2 className="w-4 h-4" /> Corporate</>}
                {typeOption === 'travel-agency' && <><Plane className="w-4 h-4" /> Agency</>}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Corporate Account Form */}
        {accountType === 'corporate' && (
          <>
            {/* Company Search */}
            <div className="mb-6">
              <Label style={{ marginBottom: 10 }}>Select Company *</Label>
              <div className="relative">
                <Input
                  placeholder="Search company by name..."
                  value={companySearch}
                  onChange={(e) => handleCompanySearchChange(e.target.value)}
                  onFocus={() => companySearch.length > 0 && setShowCompanyDropdown(true)}
                />
                {showCompanyDropdown && (
                  <div className="absolute z-50 mt-1 w-full border rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
                    {companySearchResults.length === 0 ? (
                      <div className="p-3 text-gray-500 text-sm">No matching companies found</div>
                    ) : (
                      companySearchResults.map(company => (
                        <div
                          key={company.id}
                          className={`p-3 cursor-pointer hover:bg-blue-50 border-b last:border-b-0 ${
                            selectedCompanyId === String(company.id) ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleSelectCompany(String(company.id), company.company_name)}
                        >
                          <div className="font-medium">{company.company_name}</div>
                          {company.company_registration && (
                            <div className="text-xs text-gray-500">{company.company_registration}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {selectedCompanyId && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex items-center justify-between">
                  <span className="text-sm text-green-700">
                    Selected: <span className="font-medium">{companySearch}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => { setSelectedCompanyId(''); setCompanySearch(''); }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-gray-800">Corporate Contacts ({corporateForms.length})</h4>
                <Button type="button" variant="outline" size="sm" onClick={addCorporateForm}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>

              {corporateForms.map((subForm, index) => (
                <div key={subForm.id} className="mb-6 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-gray-700">Contact #{index + 1}</h5>
                    {corporateForms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCorporateForm(subForm.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div>
                      <Label htmlFor={`title-${subForm.id}`} style={{ marginBottom: 10 }}>Title *</Label>
                      <Select value={subForm.title} onValueChange={v => updateCorporateForm(subForm.id, 'title', v)}>
                        <SelectTrigger id={`title-${subForm.id}`}><SelectValue placeholder="Select title" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mr">Mr.</SelectItem>
                          <SelectItem value="mrs">Mrs.</SelectItem>
                          <SelectItem value="ms">Ms.</SelectItem>
                          <SelectItem value="dr">Dr.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* First Name */}
                    <div>
                      <Label htmlFor={`fn-${subForm.id}`} style={{ marginBottom: 10 }}>First Name *</Label>
                      <Input id={`fn-${subForm.id}`} value={subForm.firstName}
                        onChange={e => updateCorporateForm(subForm.id, 'firstName', e.target.value)}
                        placeholder="Enter first name" required />
                    </div>

                    {/* Last Name */}
                    <div>
                      <Label htmlFor={`ln-${subForm.id}`} style={{ marginBottom: 10 }}>Last Name *</Label>
                      <Input id={`ln-${subForm.id}`} value={subForm.lastName}
                        onChange={e => updateCorporateForm(subForm.id, 'lastName', e.target.value)}
                        placeholder="Enter last name" required />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor={`em-${subForm.id}`} style={{ marginBottom: 10 }}>Email *</Label>
                      <Input id={`em-${subForm.id}`} type="email" value={subForm.email}
                        onChange={e => updateCorporateForm(subForm.id, 'email', e.target.value)}
                        placeholder="Enter email address" required />
                    </div>

                    {/* Region Code + Contact Number */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`rc-${subForm.id}`} style={{ marginBottom: 10 }}>Region Code *</Label>
                        {displayRegionCodes ? (
                          <Select value={subForm.regionCode} onValueChange={v => updateCorporateForm(subForm.id, 'regionCode', v)}>
                            <SelectTrigger id={`rc-${subForm.id}`}><SelectValue placeholder="Select region code" /></SelectTrigger>
                            <SelectContent>
                              {displayRegionCodes.map(rc => (
                                <SelectItem key={rc.code} value={rc.code}>{rc.code} - {rc.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input id={`rc-${subForm.id}`} value={subForm.regionCode}
                            onChange={e => updateCorporateForm(subForm.id, 'regionCode', e.target.value)}
                            placeholder="852" required />
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor={`cn-${subForm.id}`} style={{ marginBottom: 10 }}>Contact Number *</Label>
                        <Input id={`cn-${subForm.id}`} value={subForm.contactNumber}
                          onChange={e => updateCorporateForm(subForm.id, 'contactNumber', e.target.value)}
                          placeholder="Enter contact number" required />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <Label style={{ marginBottom: 10 }}>Payment Method *</Label>
                      <RadioGroup value={subForm.paymentMethod}
                        onValueChange={v => updateCorporateForm(subForm.id, 'paymentMethod', v)}
                        className="flex flex-wrap gap-4 mt-2">
                        {([['upfront', 'Upfront'], ['net-upfront', 'Net Upfront'], ['on-credit', 'On-Credit']] as const).map(([val, lbl]) => (
                          <div key={val} className="flex items-center space-x-2">
                            <RadioGroupItem value={val} id={`pm-${subForm.id}-${val}`} />
                            <Label htmlFor={`pm-${subForm.id}-${val}`} className="cursor-pointer">{lbl}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Remarks */}
                    <div>
                      <Label htmlFor={`rm-${subForm.id}`} style={{ marginBottom: 10 }}>Remarks</Label>
                      <Input id={`rm-${subForm.id}`} value={subForm.remarks}
                        onChange={e => updateCorporateForm(subForm.id, 'remarks', e.target.value)}
                        placeholder="Optional remarks" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Individual / Travel Agency Form */}
        {accountType !== 'corporate' && (
          <>
            {accountType === 'travel-agency' && (
              <>
                {/* Agency Search */}
                <div className="mb-6">
                  <Label style={{ marginBottom: 10 }}>Select Travel Agency *</Label>
                  <div className="relative">
                    <Input
                      placeholder="Search agency by name or code..."
                      value={agencySearch}
                      onChange={(e) => handleAgencySearchChange(e.target.value)}
                      onFocus={() => agencySearch.length > 0 && setShowAgencyDropdown(true)}
                    />
                    {showAgencyDropdown && (
                      <div className="absolute z-50 mt-1 w-full border rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
                        {agencySearchResults.length === 0 ? (
                          <div className="p-3 text-gray-500 text-sm">No matching agencies found</div>
                        ) : (
                          agencySearchResults.map(agency => (
                            <div
                              key={agency.id}
                              className={`p-3 cursor-pointer hover:bg-blue-50 border-b last:border-b-0 ${
                                selectedAgencyId === String(agency.id) ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => handleSelectAgency(String(agency.id), `${agency.agency_name} (${agency.agency_code})`)}
                            >
                              <div className="font-medium">{agency.agency_name}</div>
                              {agency.agency_code && (
                                <div className="text-xs text-gray-500">{agency.agency_code}</div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {selectedAgencyId && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex items-center justify-between">
                      <span className="text-sm text-green-700">
                        Selected: <span className="font-medium">{agencySearch}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => { setSelectedAgencyId(''); setAgencySearch(''); }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-gray-800 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title" style={{ marginBottom: 10 }}>Title *</Label>
                      <Select value={formData.title} onValueChange={v => setFormData({...formData, title: v})}>
                        <SelectTrigger id="title"><SelectValue placeholder="Select title" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mr">Mr.</SelectItem>
                          <SelectItem value="mrs">Mrs.</SelectItem>
                          <SelectItem value="ms">Ms.</SelectItem>
                          <SelectItem value="dr">Dr.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="firstName" style={{ marginBottom: 10 }}>First Name *</Label>
                      <Input id="firstName" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Enter first name" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName" style={{ marginBottom: 10 }}>Last Name *</Label>
                      <Input id="lastName" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Enter last name" required />
                    </div>
                    <div>
                      <Label htmlFor="email" style={{ marginBottom: 10 }}>Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="Enter email address"
                        required
                        style={fieldErrors.email ? { borderColor: '#dc2626', borderWidth: 2 } : undefined}
                      />
                      {fieldErrors.email && (
                        <p style={{ margin: '4px 0 0', color: '#dc2626', fontSize: '13px' }}>
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="regionCode" style={{ marginBottom: 10 }}>Region Code *</Label>
                        {displayRegionCodes ? (
                          <Select value={formData.regionCode} onValueChange={v => setFormData({...formData, regionCode: v})}>
                            <SelectTrigger id="regionCode"><SelectValue placeholder="Select region code" /></SelectTrigger>
                            <SelectContent>
                              {displayRegionCodes.map(rc => (
                                <SelectItem key={rc.code} value={rc.code}>{rc.code} - {rc.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input id="regionCode" value={formData.regionCode} onChange={e => setFormData({...formData, regionCode: e.target.value})} placeholder="852" required />
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="contactNumber" style={{ marginBottom: 10 }}>Contact Number *</Label>
                        <Input id="contactNumber" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} placeholder="Enter contact number" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="nationality" style={{ marginBottom: 10 }}>Nationality (optional)</Label>
                      {displayCountries ? (
                        <Select value={formData.nationality} onValueChange={v => setFormData({...formData, nationality: v})}>
                          <SelectTrigger id="nationality"><SelectValue placeholder="Select nationality" /></SelectTrigger>
                          <SelectContent>
                            {displayCountries.map(c => (
                              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Select value={formData.nationality} onValueChange={v => setFormData({...formData, nationality: v})}>
                          <SelectTrigger id="nationality"><SelectValue placeholder="Select nationality" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hk">Hong Kong</SelectItem>
                            <SelectItem value="cn">China</SelectItem>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="jp">Japan</SelectItem>
                            <SelectItem value="kr">South Korea</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="passportNumber" style={{ marginBottom: 10 }}>First 4 digits of Passport Number (optional)</Label>
                      <Input id="passportNumber" value={formData.passportNumber} onChange={e => setFormData({...formData, passportNumber: e.target.value})} placeholder="Enter first 4 digits" maxLength={4} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {accountType === 'individual' && (
              <>
                <div>
                  <h4 className="text-gray-800 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title" style={{ marginBottom: 10 }}>Title *</Label>
                      <Select value={formData.title} onValueChange={v => setFormData({...formData, title: v})}>
                        <SelectTrigger id="title"><SelectValue placeholder="Select title" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mr">Mr.</SelectItem>
                          <SelectItem value="mrs">Mrs.</SelectItem>
                          <SelectItem value="ms">Ms.</SelectItem>
                          <SelectItem value="dr">Dr.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="firstName" style={{ marginBottom: 10 }}>First Name *</Label>
                      <Input id="firstName" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Enter first name" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName" style={{ marginBottom: 10 }}>Last Name *</Label>
                      <Input id="lastName" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Enter last name" required />
                    </div>
                    <div>
                      <Label htmlFor="email" style={{ marginBottom: 10 }}>Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="Enter email address"
                        required
                        style={fieldErrors.email ? { borderColor: '#dc2626', borderWidth: 2 } : undefined}
                      />
                      {fieldErrors.email && (
                        <p style={{ margin: '4px 0 0', color: '#dc2626', fontSize: '13px' }}>
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="regionCode" style={{ marginBottom: 10 }}>Region Code *</Label>
                        {displayRegionCodes ? (
                          <Select value={formData.regionCode} onValueChange={v => setFormData({...formData, regionCode: v})}>
                            <SelectTrigger id="regionCode"><SelectValue placeholder="Select region code" /></SelectTrigger>
                            <SelectContent>
                              {displayRegionCodes.map(rc => (
                                <SelectItem key={rc.code} value={rc.code}>{rc.code} - {rc.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input id="regionCode" value={formData.regionCode} onChange={e => setFormData({...formData, regionCode: e.target.value})} placeholder="852" required />
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="contactNumber" style={{ marginBottom: 10 }}>Contact Number *</Label>
                        <Input id="contactNumber" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} placeholder="Enter contact number" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="nationality" style={{ marginBottom: 10 }}>Nationality (optional)</Label>
                      {displayCountries ? (
                        <Select value={formData.nationality} onValueChange={v => setFormData({...formData, nationality: v})}>
                          <SelectTrigger id="nationality"><SelectValue placeholder="Select nationality" /></SelectTrigger>
                          <SelectContent>
                            {displayCountries.map(c => (
                              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Select value={formData.nationality} onValueChange={v => setFormData({...formData, nationality: v})}>
                          <SelectTrigger id="nationality"><SelectValue placeholder="Select nationality" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hk">Hong Kong</SelectItem>
                            <SelectItem value="cn">China</SelectItem>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="jp">Japan</SelectItem>
                            <SelectItem value="kr">South Korea</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="passportNumber" style={{ marginBottom: 10 }}>First 4 digits of Passport Number (optional)</Label>
                      <Input id="passportNumber" value={formData.passportNumber} onChange={e => setFormData({...formData, passportNumber: e.target.value})} placeholder="Enter first 4 digits" maxLength={4} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Common fields for Individual/Agency */}
        {accountType !== 'corporate' && (
          <>
            <div>
              <Label htmlFor="remarks" style={{ marginBottom: 10 }}>Remarks (optional)</Label>
              <Textarea id="remarks" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} placeholder="Enter any additional remarks" />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </Button>
        </div>

      </form>
    </Card>
  );
}
