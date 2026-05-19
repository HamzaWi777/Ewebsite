import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      console.error('Échec du chargement des produits vedettes');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Hommes', icon: '👔', link: '/products?category=men' },
    { name: 'Femmes', icon: '👗', link: '/products?category=women' },
    { name: 'Accessoires', icon: '🕶️', link: '/products?category=accessories' },
    { name: 'Chaussures', icon: '👟', link: '/products?category=shoes' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Bienvenue chez MH</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 max-w-xl mx-auto">
            Découvrez les dernières tendances mode et vêtements premium
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition text-sm sm:text-base"
          >
            Acheter maintenant
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">Parcourir par catégorie</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map(category => (
              <button
                key={category.name}
                onClick={() => navigate(category.link)}
                className="bg-white p-5 md:p-8 rounded-lg shadow hover:shadow-lg transition text-center"
              >
                <div className="text-4xl md:text-5xl mb-3 md:mb-4">{category.icon}</div>
                <h3 className="text-base md:text-xl font-bold">{category.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-10 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Produits vedettes</h2>
          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                      className="w-full h-48 sm:h-64 md:h-[450px] object-cover"
                    />
                  )}
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-sm md:text-lg mb-1 md:mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-gray-600 text-xs md:text-sm line-clamp-2 mb-2 md:mb-4 hidden sm:block">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center gap-1">
                      <span className="text-sm md:text-xl font-bold">
                        TND {product.price.toFixed(2)}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded whitespace-nowrap">
                        {product.stock > 0 ? 'En stock' : 'Rupture'}
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
              className="bg-gray-900 text-white px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition text-sm md:text-base"
            >
              Voir tous les produits
            </button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-10 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">Pourquoi nous choisir</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: '🚚', title: 'Livraison rapide', desc: 'Livraison offerte sur toutes les commandes' },
              { icon: '🔒', title: 'Paiement sécurisé', desc: 'Processus de paiement 100% sécurisé' },
              { icon: '💬', title: 'Support 24/7', desc: 'Service client dédié à votre écoute' },
            ].map(item => (
              <div key={item.title} className="text-center">
                <div className="text-4xl mb-3 md:mb-4">{item.icon}</div>
                <h3 className="text-lg md:text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm md:text-base">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}