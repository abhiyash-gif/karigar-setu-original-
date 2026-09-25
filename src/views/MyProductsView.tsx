import React, { useState } from 'react';
import { Product, ViewTab } from '../types';
import { getTranslation } from '../i18n/translations';
import {
  Search,
  Plus,
  Filter,
  Eye,
  ShoppingBag,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Tag,
  Clock,
  Sparkles,
  Volume2,
  X,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { aiService } from '../services/aiService';

interface MyProductsViewProps {
  products: Product[];
  currentLang: string;
  onStartAddProduct: () => void;
  onDeleteProduct: (id: string) => void;
  onDuplicateProduct: (product: Product) => void;
}

export const MyProductsView: React.FC<MyProductsViewProps> = ({
  products,
  currentLang,
  onStartAddProduct,
  onDeleteProduct,
  onDuplicateProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Published' | 'Draft' | 'Under Review'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.hindiName && p.hindiName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div id="my-products-view" className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-[#E8DFC8] shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C241E] font-craft">
            {getTranslation(currentLang, 'products')}
          </h2>
          <p className="text-xs text-[#7A6E65]">
            Manage your digital craft catalog, track buyer views, and update inventory.
          </p>
        </div>

        <button
          onClick={onStartAddProduct}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#E07A5F] to-terracotta hover:brightness-105 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{getTranslation(currentLang, 'addNewProduct')}</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          {/* Search Bar */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C8E84]" />
            <input
              type="text"
              placeholder={getTranslation(currentLang, 'searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E8DFC8] text-xs sm:text-sm text-[#2C241E] focus:outline-none focus:border-[#E07A5F]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white border border-[#E8DFC8] w-full sm:w-auto overflow-x-auto">
            {(['All', 'Published', 'Draft', 'Under Review'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-[#E07A5F] text-white shadow-xs'
                    : 'text-[#7A6E65] hover:text-[#2C241E]'
                }`}
              >
                {st === 'All' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#3D405B] text-white border-[#3D405B]'
                  : 'bg-white hover:bg-ivory text-brown border-[#E8DFC8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E8DFC8] p-6 space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#E07A5F]/15 text-[#E07A5F] flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#2C241E]">No crafts found</h3>
          <p className="text-xs text-[#7A6E65] max-w-sm mx-auto">
            Try adjusting your search keywords or add a new handmade product to your digital store.
          </p>
          <button
            onClick={onStartAddProduct}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#E07A5F] text-white font-bold text-xs shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredProducts.map((prod) => {
            const getStatusBadge = () => {
              switch (prod.status) {
                case 'Published':
                  return (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#81B29A]/20 text-[#2D6A4F] border border-[#81B29A]/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
                      Published
                    </span>
                  );
                case 'Draft':
                  return (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F4A261]/20 text-[#D97706] border border-[#F4A261]/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                      Draft
                    </span>
                  );
                default:
                  return (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D405B]/15 text-[#3D405B] border border-[#3D405B]/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3D405B]" />
                      Under Review
                    </span>
                  );
              }
            };

            return (
              <div
                key={prod.id}
                className="group rounded-2xl bg-white border border-[#D9C3B0] overflow-hidden craft-shadow-sm hover:craft-shadow-md hover:border-terracotta/60 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo with Overlay Badges */}
                  <div className="relative aspect-square sm:aspect-4/3 w-full bg-[#F4EFEA] overflow-hidden">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      {getStatusBadge()}
                    </div>
                    
                    {/* Handmade Indicator */}
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-sm text-[9px] font-bold bg-[#2C241E]/80 backdrop-blur-xs text-ivory uppercase tracking-widest flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5 text-[#F2CC8F]" /> 100% Handmade
                    </div>

                    {prod.giTagged && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#2D6A4F] text-white flex items-center gap-0.5 shadow-sm uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3" /> GI Tag
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 space-y-3 bg-craft-mandala">
                    <div>
                      <span className="text-[10px] font-bold text-[#7A6E65] uppercase tracking-wider block">
                        {prod.category}
                      </span>
                      <h3 className="font-craft text-base sm:text-lg font-bold text-[#2C241E] line-clamp-1 group-hover:text-terracotta transition-colors">
                        {currentLang === 'hi' && prod.hindiName ? prod.hindiName : prod.name}
                      </h3>
                      <p className="text-xs text-[#7A6E65] mt-1 line-clamp-2 leading-relaxed">
                        {prod.shortDescription}
                      </p>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-lg font-extrabold text-terracotta font-craft">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#81B29A] font-bold uppercase tracking-widest">
                        Stock: {prod.stock}
                      </span>
                    </div>

                    {/* Stats strip */}
                    <div className="flex items-center gap-3 pt-3 border-t border-[#E8DFC8]/60 text-[11px] text-[#7A6E65]">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-terracotta" />
                        <strong>{prod.views}</strong> views
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-terracotta" />
                        <strong>{prod.enquiries}</strong> enquiries
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Toolbar */}
                <div className="p-3 bg-[#F4EFEA] border-t border-[#D9C3B0] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedProductDetail(prod)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-terracotta hover:bg-[#E07A5F] hover:text-white border border-[#D9C3B0] transition-colors cursor-pointer craft-shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Detail</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicateProduct(prod)}
                      className="p-2 rounded-xl bg-white hover:bg-[#E07A5F] text-[#7A6E65] hover:text-white border border-[#D9C3B0] transition-colors cursor-pointer craft-shadow-sm"
                      title="Duplicate Listing"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(prod.id)}
                      className="p-2 rounded-xl bg-white hover:bg-red-500 text-[#7A6E65] hover:text-white border border-[#D9C3B0] hover:border-red-600 transition-colors cursor-pointer craft-shadow-sm"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PRODUCT DETAIL MODAL */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-ivory border border-[#E8DFC8] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-white border-b border-[#E8DFC8] flex items-center justify-between">
              <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-wider">
                Listing Details
              </span>
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="p-1.5 rounded-full hover:bg-[#F4EFEA] text-[#7A6E65] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-white border border-[#E8DFC8]">
                <img
                  src={selectedProductDetail.image}
                  alt={selectedProductDetail.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[#2C241E]">
                  {selectedProductDetail.name}
                </h3>
                {selectedProductDetail.hindiName && (
                  <p className="text-sm font-semibold text-[#E07A5F] font-devanagari">
                    {selectedProductDetail.hindiName}
                  </p>
                )}
              </div>

              <div className="flex items-baseline gap-2 py-2 border-y border-[#E8DFC8]">
                <span className="text-2xl font-extrabold text-terracotta">
                  ₹{selectedProductDetail.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#7A6E65]">
                  (Fair Market Benchmark: ₹{selectedProductDetail.priceRange.min} - ₹{selectedProductDetail.priceRange.max})
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#7A6E65]">Description:</h4>
                <p className="text-xs sm:text-sm text-brown leading-relaxed">
                  {selectedProductDetail.description}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#7A6E65]">Craft Story & Heritage:</h4>
                <p className="text-xs sm:text-sm text-brown leading-relaxed italic bg-white p-3 rounded-2xl border border-[#E8DFC8]">
                  "{selectedProductDetail.story}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-[#E8DFC8]">
                  <span className="text-[10px] text-[#7A6E65] block">Material</span>
                  <span className="font-bold text-[#2C241E]">{selectedProductDetail.material}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E8DFC8]">
                  <span className="text-[10px] text-[#7A6E65] block">Craft Technique</span>
                  <span className="font-bold text-[#2C241E]">{selectedProductDetail.craftType}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-[#E8DFC8] flex items-center justify-end gap-2">
              <button
                onClick={() => aiService.speakText(selectedProductDetail.description, currentLang)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#E07A5F]/10 text-terracotta text-xs font-bold hover:bg-[#E07A5F]/20 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Read Aloud</span>
              </button>
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="px-5 py-2 rounded-xl bg-[#E07A5F] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
