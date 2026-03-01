import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { productService } from '../services';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getAll({ limit: 6 });
      setFeaturedProducts(response.data.products.slice(0, 6));
    } catch (error) {
      console.error('Failed to load featured products');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: t('home.menCategory'), icon: '👔', link: '/products?category=men' },
    { name: t('home.womenCategory'), icon: '👗', link: '/products?category=women' },
    { name: t('home.accessoriesCategory'), icon: '🕶️', link: '/products?category=accessories' },
    { name: t('home.shoesCategory'), icon: '👟', link: '/products?category=shoes' },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('home.welcome')}</h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            {t('home.subtitle')}
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-white text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            {t('home.shopNow')}
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{t('home.browseCategory')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {categories.map(category => (
              <button
                key={category.name}
                onClick={() => navigate(category.link)}
                className="bg-white p-6 md:p-8 rounded-lg shadow hover:shadow-lg transition text-center"
              >
                <div className="text-4xl md:text-5xl mb-4">{category.icon}</div>
                <h3 className="text-base md:text-xl font-bold">{category.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">{t('home.featured')}</h2>
          {loading ? (
            <div className="text-center py-12">{t('home.loading')}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {featuredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition text-left"
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
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg md:text-xl font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-xs md:text-sm px-3 py-1 bg-gray-100 rounded">
                        {product.stock > 0 ? t('home.inStock') : t('home.outOfStock')}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/products')}
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              {t('home.viewAll')}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{t('home.why')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-lg md:text-xl font-bold mb-2">{t('home.freeShipping')}</h3>
              <p className="text-gray-600 text-sm md:text-base">{t('home.freeShippingDesc')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg md:text-xl font-bold mb-2">{t('home.securePayment')}</h3>
              <p className="text-gray-600 text-sm md:text-base">{t('home.securePaymentDesc')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg md:text-xl font-bold mb-2">{t('home.support')}</h3>
              <p className="text-gray-600 text-sm md:text-base">{t('home.supportDesc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
