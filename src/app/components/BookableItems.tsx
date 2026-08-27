import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Edit2, Trash2, Search, Calendar } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';

interface BookableItem {
  id: number;
  nameEn: string;
  nameSimp: string;
  nameTrad: string;
  category: 'Suite' | 'Transfer Services' | 'Food & Beverage' | 'Shopping';
  price: number;
  discountRate: number;
  descriptionEn: string;
  descriptionSimp: string;
  descriptionTrad: string;
  availability: 'available' | 'limited' | 'unavailable';
  stock?: number;
  createdDate: string;
  priceCalEquation: string;
  priority: number;
}

const generateMockItems = (): BookableItem[] => {
  const suiteNames = ['VIP Suite A', 'VIP Suite B', 'VIP Suite C', 'Executive Suite', 'Business Suite', 'Premier Suite', 'Family Suite', 'Deluxe Suite', 'Royal Suite', 'Grand Suite', 'Presidential Suite', 'Luxury Suite'];
  const transferNames = ['Limousine Transfer', 'Airport Limousine Service', 'City Limousine Transfer', 'Premium Chauffeur Service', 'Executive Car Service', 'VIP Transfer', 'Luxury Sedan Transfer', 'Mercedes S-Class Transfer', 'BMW 7-Series Transfer', 'In-town Limousine', 'Cross-border Transfer', 'Hotel Transfer Service'];
  const foodNames = ['Champagne Service', 'Fine Dining Menu', 'Afternoon Tea Set', 'Private Chef Service', 'Wine Tasting Experience', 'Gourmet Breakfast', 'Premium Catering', 'Sake Selection', 'Cocktail Service', 'Premium Coffee & Tea'];
  const shoppingNames = ['In-Lounge Shopping', 'Private Sales Consultation', 'Luxury Goods Shopping', 'Duty-Free Shopping Assistance', 'Personal Shopper Service', 'VIP Shopping Escort'];
  
  const availabilities: ('available' | 'limited' | 'unavailable')[] = ['available', 'available', 'available', 'limited', 'unavailable'];
  
  const items: BookableItem[] = [];
  let id = 1;
  
  // Generate suites (15 items)
  for (let i = 0; i < 15; i++) {
    const date = new Date(2024, 0, 5 + i * 2);
    items.push({
      id: id++,
      nameEn: suiteNames[i % suiteNames.length] + (i >= suiteNames.length ? ` ${Math.floor(i / suiteNames.length) + 1}` : ''),
      nameSimp: suiteNames[i % suiteNames.length] + (i >= suiteNames.length ? ` ${Math.floor(i / suiteNames.length) + 1}` : ''),
      nameTrad: suiteNames[i % suiteNames.length] + (i >= suiteNames.length ? ` ${Math.floor(i / suiteNames.length) + 1}` : ''),
      category: 'Suite',
      price: 2500 + (i * 300),
      discountRate: i % 4 === 0 ? (5 + (i % 3) * 5) : 0,
      descriptionEn: 'Premium VIP suite with private facilities and luxury amenities',
      descriptionSimp: 'Premium VIP suite with private facilities and luxury amenities',
      descriptionTrad: 'Premium VIP suite with private facilities and luxury amenities',
      availability: availabilities[i % availabilities.length],
      stock: availabilities[i % availabilities.length] === 'limited' ? 2 + (i % 5) : undefined,
      createdDate: date.toISOString().split('T')[0],
      priceCalEquation: 'unitPrice',
      priority: i + 1
    });
  }
  
  // Add Extension of stay in VIP Lounge
  items.push({
    id: id++,
    nameEn: 'Extension of stay in VIP Lounge',
    nameSimp: 'Extension of stay in VIP Lounge',
    nameTrad: 'Extension of stay in VIP Lounge',
    category: 'Suite',
    price: 1500,
    discountRate: 0,
    descriptionEn: 'Extended stay package with private rooms and resting zone access',
    descriptionSimp: 'Extended stay package with private rooms and resting zone access',
    descriptionTrad: 'Extended stay package with private rooms and resting zone access',
    availability: 'available',
    createdDate: new Date(2024, 0, 20).toISOString().split('T')[0],
    priceCalEquation: '(qty * unitPrice * noOfPrivateRoom) + (qty * 1000 * totalNoOfPplInRestingZone) - discount',
    priority: 16
  });
  
  // Generate transfer services (15 items)
  for (let i = 0; i < 15; i++) {
    const date = new Date(2024, 1, 1 + i * 2);
    const isAirportLimo = transferNames[i % transferNames.length] === 'Airport Limousine Service';
    items.push({
      id: id++,
      nameEn: transferNames[i % transferNames.length] + (i >= transferNames.length ? ` ${Math.floor(i / transferNames.length) + 1}` : ''),
      nameSimp: transferNames[i % transferNames.length] + (i >= transferNames.length ? ` ${Math.floor(i / transferNames.length) + 1}` : ''),
      nameTrad: transferNames[i % transferNames.length] + (i >= transferNames.length ? ` ${Math.floor(i / transferNames.length) + 1}` : ''),
      category: 'Transfer Services',
      price: 800 + (i * 200),
      discountRate: i % 5 === 0 ? (5 + (i % 2) * 5) : 0,
      descriptionEn: 'Professional transfer service with experienced chauffeur and luxury vehicle',
      descriptionSimp: 'Professional transfer service with experienced chauffeur and luxury vehicle',
      descriptionTrad: 'Professional transfer service with experienced chauffeur and luxury vehicle',
      availability: availabilities[i % availabilities.length],
      stock: availabilities[i % availabilities.length] === 'limited' ? 3 + (i % 4) : undefined,
      createdDate: date.toISOString().split('T')[0],
      priceCalEquation: isAirportLimo ? '(qty * unitPrice) - discount' : 'unitPrice',
      priority: i + 17
    });
  }
  
  // Generate Food & Beverage (12 items)
  for (let i = 0; i < 12; i++) {
    const date = new Date(2024, 2, 1 + i * 3);
    items.push({
      id: id++,
      nameEn: foodNames[i % foodNames.length] + (i >= foodNames.length ? ` Package ${Math.floor(i / foodNames.length) + 1}` : ''),
      nameSimp: foodNames[i % foodNames.length] + (i >= foodNames.length ? ` Package ${Math.floor(i / foodNames.length) + 1}` : ''),
      nameTrad: foodNames[i % foodNames.length] + (i >= foodNames.length ? ` Package ${Math.floor(i / foodNames.length) + 1}` : ''),
      category: 'Food & Beverage',
      price: 300 + (i * 150),
      discountRate: i % 3 === 0 ? (10 + (i % 2) * 5) : 0,
      descriptionEn: 'Premium food and beverage service with finest ingredients',
      descriptionSimp: 'Premium food and beverage service with finest ingredients',
      descriptionTrad: 'Premium food and beverage service with finest ingredients',
      availability: availabilities[i % availabilities.length],
      stock: availabilities[i % availabilities.length] === 'limited' ? 5 + (i % 3) : undefined,
      createdDate: date.toISOString().split('T')[0],
      priceCalEquation: 'unitPrice',
      priority: i + 32
    });
  }
  
  // Generate Shopping (8 items)
  for (let i = 0; i < 8; i++) {
    const date = new Date(2024, 5, 1 + i * 5);
    items.push({
      id: id++,
      nameEn: shoppingNames[i % shoppingNames.length] + (i >= shoppingNames.length ? ` Service ${Math.floor(i / shoppingNames.length) + 1}` : ''),
      nameSimp: shoppingNames[i % shoppingNames.length] + (i >= shoppingNames.length ? ` Service ${Math.floor(i / shoppingNames.length) + 1}` : ''),
      nameTrad: shoppingNames[i % shoppingNames.length] + (i >= shoppingNames.length ? ` Service ${Math.floor(i / shoppingNames.length) + 1}` : ''),
      category: 'Shopping',
      price: 0 + (i * 100),
      discountRate: 0,
      descriptionEn: 'Personal shopping assistance and luxury goods access',
      descriptionSimp: 'Personal shopping assistance and luxury goods access',
      descriptionTrad: 'Personal shopping assistance and luxury goods access',
      availability: availabilities[i % availabilities.length],
      stock: availabilities[i % availabilities.length] === 'limited' ? 2 + (i % 4) : undefined,
      createdDate: date.toISOString().split('T')[0],
      priceCalEquation: 'unitPrice',
      priority: i + 44
    });
  }
  
  return items;
};

const MOCK_ITEMS: BookableItem[] = generateMockItems();

export interface BookableItemsProps {
  items?: BookableItem[];
  isLoading?: boolean;
  onEditItem?: (itemId: number) => void;
  onDeleteItem?: (itemId: number) => void;
  onCreateItem?: () => void;
}

export function BookableItems({ items: itemsProp, onEditItem, onDeleteItem, onCreateItem }: BookableItemsProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const items: BookableItem[] = itemsProp?.length ? itemsProp : MOCK_ITEMS;

  const filteredItems = items.filter(item => {
    const matchesSearch = item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.descriptionEn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStartDate = !startDate || new Date(item.createdDate) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(item.createdDate) <= new Date(endDate);
    return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate;
  }).sort((a, b) => b.id - a.id);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

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

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'limited':
        return 'bg-yellow-100 text-yellow-700';
      case 'unavailable':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Suite':
        return 'bg-blue-100 text-blue-700';
      case 'Transfer Services':
        return 'bg-purple-100 text-purple-700';
      case 'Food & Beverage':
        return 'bg-orange-100 text-orange-700';
      case 'Shopping':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleEdit = (item: BookableItem) => {
    if (onEditItem) {
      onEditItem(item.id);
    }
  };

  const handleCreate = () => {
    if (onCreateItem) {
      onCreateItem();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>All Bookable Items</h1>
          <p className="text-gray-600">Manage services, suites, and add-ons available for booking</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter Buttons */}
          <div>
            <label className="block mb-2">Filter by Category</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('all')}
              >
                All Categories
              </Button>
              <Button
                variant={categoryFilter === 'Suite' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('Suite')}
                className={categoryFilter === 'Suite' ? '' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}
              >
                Suite
              </Button>
              <Button
                variant={categoryFilter === 'Transfer Services' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('Transfer Services')}
                className={categoryFilter === 'Transfer Services' ? '' : 'border-purple-300 text-purple-700 hover:bg-purple-50'}
              >
                Transfer Services
              </Button>
              <Button
                variant={categoryFilter === 'Food & Beverage' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('Food & Beverage')}
                className={categoryFilter === 'Food & Beverage' ? '' : 'border-orange-300 text-orange-700 hover:bg-orange-50'}
              >
                Food & Beverage
              </Button>
              <Button
                variant={categoryFilter === 'Shopping' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('Shopping')}
                className={categoryFilter === 'Shopping' ? '' : 'border-green-300 text-green-700 hover:bg-green-50'}
              >
                Shopping
              </Button>
            </div>
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
                  setCategoryFilter('all');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Items Table */}
      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
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
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Item English Name</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Base Price</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Price Cal Equation</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                      onClick={() => handleEdit(item)}
                    >
                      {item.nameEn}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {item.descriptionEn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    HK${item.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                    {item.priceCalEquation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.discountRate > 0 ? (
                      <span className="text-green-600">{item.discountRate}%</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.stock !== undefined ? item.stock : <span className="text-gray-400">Unlimited</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getAvailabilityColor(item.availability)}>
                      {item.availability}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.createdDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="h-8 w-8 p-0"
                        title="Edit Item"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteItem?.(item.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                        title="Delete Item"
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

        {filteredItems.length > 0 && (
          <div className="p-4 border-t flex justify-end">
            {renderPagination()}
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Items</p>
          <h2 className="mt-1">{filteredItems.length}</h2>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Suites</p>
          <h2 className="mt-1">{filteredItems.filter(i => i.category === 'Suite').length}</h2>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Transfer Services</p>
          <h2 className="mt-1">{filteredItems.filter(i => i.category === 'Transfer Services').length}</h2>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Food & Beverage</p>
          <h2 className="mt-1">{filteredItems.filter(i => i.category === 'Food & Beverage').length}</h2>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Shopping</p>
          <h2 className="mt-1">{filteredItems.filter(i => i.category === 'Shopping').length}</h2>
        </Card>
      </div>
    </div>
  );
}