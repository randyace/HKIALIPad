import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Edit2, Trash2, Search, Building2, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';

interface Company {
  id: number;
  companyName: string;
  companyCode: string;
  contactPerson: string;
  email: string;
  phone: string;
  paymentMethod: 'Upfront' | 'Net Upfront' | 'On-Credit' | 'Bulk Purchase';
  discountRate: number;
  customerCount: number;
  status: 'active' | 'inactive';
  createdDate: string;
}

const generateMockCompanies = (): Company[] => {
  const companyNames = [
    'Cathay Pacific Airways', 'HSBC Hong Kong', 'Ernst & Young', 'Swire Properties', 'PwC Hong Kong',
    'Bank of China', 'Standard Chartered', 'Deloitte', 'KPMG', 'AIA Group',
    'Hong Kong Land', 'MTR Corporation', 'CLP Holdings', 'Jardine Matheson', 'Wheelock and Company',
    'Sun Hung Kai Properties', 'Henderson Land', 'New World Development', 'Sino Group', 'Kerry Properties',
    'DBS Bank', 'Manulife Financial', 'Prudential Hong Kong', 'AXA Insurance', 'Zurich Insurance',
    'Morgan Stanley', 'Goldman Sachs', 'JP Morgan', 'Citibank', 'UBS',
    'Credit Suisse', 'Deutsche Bank', 'Barclays', 'BNP Paribas', 'Societe Generale',
    'ING Bank', 'Nomura Securities', 'Mizuho Bank', 'Sumitomo Mitsui', 'Bank of Tokyo',
    'China Construction Bank', 'ICBC', 'Agricultural Bank', 'China Merchants Bank', 'Ping An Insurance'
  ];
  
  const contactNames = ['Sarah Wong', 'John Chen', 'Michael Lee', 'Emily Tam', 'David Cheng', 'Lisa Wang', 'Peter Chan', 'Jennifer Lam', 'Raymond Ho', 'Angela Ng'];
  const paymentMethods: ('Upfront' | 'Net Upfront' | 'On-Credit' | 'Bulk Purchase')[] = ['Upfront', 'Net Upfront', 'On-Credit', 'Bulk Purchase'];
  const statuses: ('active' | 'inactive')[] = ['active', 'active', 'active', 'active', 'inactive'];
  
  const companies: Company[] = [];
  for (let i = 1; i <= 45; i++) {
    const date = new Date(2024, Math.floor(i / 10), (i % 28) + 1);
    companies.push({
      id: i,
      companyName: companyNames[i % companyNames.length],
      companyCode: `CORP-${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i * 2) % 26))}-${String(i).padStart(3, '0')}`,
      contactPerson: contactNames[i % contactNames.length],
      email: `${contactNames[i % contactNames.length].toLowerCase().replace(' ', '.')}@${companyNames[i % companyNames.length].toLowerCase().replace(/ /g, '').replace(/&/g, '')}${i > 20 ? i : ''}.com`,
      phone: `+852 ${2000 + (i * 123) % 9000} ${1000 + (i * 456) % 9000}`,
      paymentMethod: paymentMethods[i % paymentMethods.length],
      discountRate: 5 + (i % 4) * 5,
      customerCount: 15 + (i * 7) % 80,
      status: statuses[i % statuses.length],
      createdDate: date.toISOString().split('T')[0]
    });
  }
  return companies;
};

const MOCK_COMPANIES: Company[] = generateMockCompanies();

export interface MemberCompanyProps {
  companies?: Company[];
  isLoading?: boolean;
  onEditCompany?: (companyId: number) => void;
  onCreateCompany?: () => void;
  onDeleteCompany?: (companyId: number) => void;
}

export function MemberCompany({ companies: companiesProp, onEditCompany, onCreateCompany, onDeleteCompany }: MemberCompanyProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const companies: Company[] = companiesProp?.length ? companiesProp : MOCK_COMPANIES;

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.companyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    const matchesStartDate = !startDate || new Date(company.createdDate) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(company.createdDate) <= new Date(endDate);
    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  }).sort((a, b) => b.id - a.id);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, -1, totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, -1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, -1, currentPage - 1, currentPage, currentPage + 1, -2, totalPages);
      }
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          {pages.map((page, index) => {
            if (page === -1 || page === -2) {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
  };

  const getPaymentColor = (method: string) => {
    switch (method) {
      case 'Upfront':
        return 'bg-blue-100 text-blue-700';
      case 'Net Upfront':
        return 'bg-cyan-100 text-cyan-700';
      case 'On-Credit':
        return 'bg-purple-100 text-purple-700';
      case 'Bulk Purchase':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleEdit = (company: Company) => {
    if (onEditCompany) {
      onEditCompany(company.id);
    }
  };

  const handleCreate = () => {
    if (onCreateCompany) {
      onCreateCompany();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Customer Company Management</h1>
          <p className="text-gray-600">Manage corporate and agency accounts</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Company
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company name, code, or contact person..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label>Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <Calendar className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex-1">
              <label>End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <Calendar className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setStatusFilter('all');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Companies Table */}
      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredCompanies.length)} of {filteredCompanies.length} companies
          </div>
          <div>
            {renderPagination()}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Company Name</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Company Code</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Customers</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{company.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <button 
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        onClick={() => handleEdit(company)}
                      >
                        {company.companyName}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{company.companyCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{company.contactPerson}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>{company.email}</div>
                    <div className="text-gray-600">{company.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getPaymentColor(company.paymentMethod)}>
                      {company.paymentMethod}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {company.discountRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{company.customerCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(company.status)}>
                      {company.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(company)}
                        className="h-8 w-8 p-0"
                        title="Edit Company"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteCompany?.(company.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                        title="Delete Company"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCompanies.length > 0 && (
          <div className="p-4 border-t flex justify-end">
            {renderPagination()}
          </div>
        )}
      </Card>
    </div>
  );
}