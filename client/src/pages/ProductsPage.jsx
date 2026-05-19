import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productService } from '../services';

export function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false); // mobile filter drawer
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  const categories = ['all', 'men', 'women', 'accessories', 'shoes'];
  const categoryLabels = {
    all: 'Tous', men: 'Hommes', women: 'Femmes',
    accessories: 'Accessoires', shoes: 'Chaussures',
  };

  useEffect(() => { fetchProducts(); }, [filters, searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: searchParams.get('page') || 1,
        limit: 12,
        category: filters.category !== 'all' ? filters.category : '',
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || '',
        search: filters.search || '',
        sort: filters.sort,
      };
      const response = await productService.getAll(params);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Échec du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    const newParams = new URLSearchParams(searchParams);
    value ? newParams.set(key, value) : newParams.delete(key);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
  };

  const activeFilterCount = [
    filters.category !== 'all',
    filters.minPrice,
    filters.maxPrice,
    filters.sort !== 'newest',
  ].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Catégorie</h3>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{categoryLabels[cat]}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Fourchette de prix</h3>
        <div className="flex flex-col gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mb-2">
        <h3 className="font-semibold mb-3">Trier par</h3>
        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          <option value="newest">Plus récents</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Nos produits</h1>

      {/* Search bar — always visible */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher des produits..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      {/* Mobile: filter toggle button */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <p className="text-sm text-gray-500">{products.length} produit(s)</p>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filtres
          {activeFilterCount > 0 && (
            <span className="bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile: collapsible filter panel */}
      {filtersOpen && (
        <div className="md:hidden mb-4">
          <FilterPanel />
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <FilterPanel />
        </aside>

        {/* Product grid */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">Aucun produit trouvé</div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
                {products.map(product => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition cursor-pointer"
                  >
                    {product.images[0] && (
                      <img
                        src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                        alt={product.name}
                        className="w-full h-44 sm:h-64 md:h-[450px] object-cover"
                      />
                    )}
                    <div className="p-3 md:p-4">
                      <h3 className="font-semibold text-sm md:text-lg mb-1 md:mb-2 line-clamp-1">{product.name}</h3>
                      <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-4 line-clamp-2 hidden sm:block">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center gap-1">
                        <span className="text-sm md:text-xl font-bold">
                          TND {product.price.toFixed(2)}
                        </span>
                        <span className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock > 0 ? 'En stock' : 'Rupture'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center flex-wrap gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded text-sm ${
                        pagination.page === page
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}