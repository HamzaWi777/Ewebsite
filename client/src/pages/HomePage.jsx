import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productService } from '../services';

export function HomePage() {
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
    { name: 'Men', icon: '👔', link: '/products?category=men' },
    { name: 'Women', icon: '👗', link: '/products?category=women' },
    { name: 'Accessories', icon: '🕶️', link: '/products?category=accessories' },
    { name: 'Shoes', icon: '👟', link: '/products?category=shoes' },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to MH</h1>
          <p className="text-xl text-gray-300 mb-8">
            Discover the latest fashion trends and premium clothing
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-white text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(category => (
              <button
                key={category.name}
                onClick={() => navigate(category.link)}
                className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition text-center"
              >
                <div className="text-5xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold">{category.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-sm px-3 py-1 bg-gray-100 rounded">
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
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
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on all orders</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
              <p className="text-gray-600">100% secure payment process</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Dedicated customer support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
