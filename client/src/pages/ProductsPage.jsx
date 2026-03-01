import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { productService } from '../services';

export function ProductsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  const categories = ['all', 'men', 'women', 'accessories', 'shoes'];

  useEffect(() => {
    fetchProducts();
  }, [filters, searchParams]);

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
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{t('products.allProducts')}</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold"
        >
          {showFilters ? '✕ ' + t('products.closeFilters') : '☰ ' + t('products.showFilters')}
        </button>

        {/* Filters Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-64 flex-shrink-0`}>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow sticky top-20">
            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">{t('products.category')}</h3>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? t('products.all') : t(`products.${cat}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">{t('products.priceRange')}</h3>
              <div className="flex flex-col gap-2">
                <input
                  type="number"
                  placeholder={t('products.minPrice')}
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder={t('products.maxPrice')}
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">{t('products.sortBy')}</h3>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="newest">{t('products.newest')}</option>
                <option value="price_asc">{t('products.priceAsc')}</option>
                <option value="price_desc">{t('products.priceDesc')}</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder={t('products.search')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">{t('home.loading')}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">{t('products.noProducts')}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
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
                        className="w-full h-48 md:h-64 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-base md:text-lg mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg md:text-xl font-bold">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className={`text-xs md:text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock > 0 ? t('home.inStock') : t('home.outOfStock')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 flex-wrap">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 md:px-4 py-2 rounded text-sm md:text-base ${
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
