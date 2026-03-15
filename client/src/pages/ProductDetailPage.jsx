import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productService, cartService } from '../services';
import { useAuth } from '../context/AuthContext';
import { addToGuestCart, getOrCreateGuestSessionId } from '../utils/guestCart';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => { fetchProduct(); }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await productService.getById(id);
      setProduct(response.data);
      if (response.data.sizes?.length > 0) setSelectedSize(response.data.sizes[0]);
      if (response.data.colors?.length > 0) setSelectedColor(response.data.colors[0]);
    } catch {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }
    const variantKey = `${selectedSize}_${selectedColor}`;
    if ((product.variants?.[variantKey] || 0) === 0) {
      toast.error('This size and color combination is out of stock');
      return;
    }
    try {
      if (isAuthenticated) {
        await cartService.addToCart({ product_id: product.id, quantity, size: selectedSize, color: selectedColor });
      } else {
        getOrCreateGuestSessionId();
        addToGuestCart(product, quantity, selectedSize, selectedColor);
      }
      toast.success('Added to cart');
      navigate('/cart');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add to cart');
    }
  };

  const getVariantStock = () => {
    if (!product?.variants) return 0;
    return product.variants[`${selectedSize}_${selectedColor}`] || 0;
  };

  const currentVariantStock = product ? getVariantStock() : 0;
  const imgSrc = (img) => img.startsWith('http') ? img : `http://localhost:5000${img}`;

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!product) return <div className="flex items-center justify-center min-h-screen">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <button
        onClick={() => navigate('/products')}
        className="text-gray-600 hover:text-gray-900 mb-4 md:mb-6 flex items-center gap-1 text-sm md:text-base"
      >
        ← Retour aux produits
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

        {/* ── Image Gallery ── */}
        <div>
          {product.images.length > 0 ? (
            <>
              {/* Main image */}
              <img
                src={imgSrc(product.images[currentImageIndex])}
                alt={product.name}
                className="w-full h-72 sm:h-[480px] md:h-[800px] object-cover rounded-lg mb-3 md:mb-4"
              />

              {/* Thumbnails — horizontal scroll on mobile */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {product.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={imgSrc(img)}
                      alt={`thumbnail-${idx}`}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-16 h-20 md:w-20 md:h-28 object-cover rounded cursor-pointer border-2 flex-shrink-0 transition ${
                        currentImageIndex === idx ? 'border-gray-900' : 'border-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-72 md:h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-4 text-gray-500">
              No image available
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4 md:mb-6 whitespace-pre-wrap text-sm md:text-base">
            {product.description}
          </p>

          {/* Price + stock */}
          <div className="flex flex-wrap items-baseline gap-3 mb-5 md:mb-6">
            <span className="text-2xl md:text-3xl font-bold">TND {product.price.toFixed(2)}</span>
            <span className={`text-sm md:text-lg ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
            </span>
          </div>

          <div className="space-y-4 mb-6">

            {/* Size */}
            {product.sizes?.length > 0 && (
              <div>
                <label className="block font-semibold mb-2 text-sm md:text-base">Taille</label>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(size => {
                    const sizeStock = Object.entries(product.variants || {}).reduce(
                      (sum, [key, stock]) => key.startsWith(size + '_') ? sum + stock : sum, 0
                    );
                    const oos = sizeStock === 0;
                    return (
                      <button
                        key={size}
                        onClick={() => { setSelectedSize(size); setQuantity(1); }}
                        disabled={oos}
                        title={oos ? 'Out of stock' : `${sizeStock} in stock`}
                        className={`px-3 py-2 border rounded transition text-sm md:text-base ${
                          selectedSize === size
                            ? 'bg-gray-900 text-white border-gray-900'
                            : oos
                            ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 hover:border-gray-900'
                        }`}
                      >
                        {size}{oos && <span className="text-xs ml-1">✕</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color */}
            {product.colors?.length > 0 && (
              <div>
                <label className="block font-semibold mb-2 text-sm md:text-base">Couleur</label>
                <select
                  value={selectedColor}
                  onChange={(e) => { setSelectedColor(e.target.value); setQuantity(1); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm md:text-base"
                >
                  {product.colors.map(color => {
                    const colorStock = Object.entries(product.variants || {}).reduce(
                      (sum, [key, stock]) => key.endsWith('_' + color) ? sum + stock : sum, 0
                    );
                    return (
                      <option key={color} value={color} disabled={colorStock === 0}>
                        {color} {colorStock === 0 ? '(Rupture)' : `(${colorStock} disponibles)`}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Variant stock status */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-xs md:text-sm">
              {currentVariantStock > 0
                ? `✓ ${currentVariantStock} disponible(s) — taille ${selectedSize}, couleur ${selectedColor}`
                : '✕ Cette combinaison taille/couleur est en rupture de stock'}
            </div>

            {/* Quantity */}
            <div>
              <label className="block font-semibold mb-2 text-sm md:text-base">Quantité</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded hover:bg-gray-100 text-lg font-medium flex items-center justify-center"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 text-center px-2 py-2 border border-gray-300 rounded text-sm md:text-base"
                  min="1"
                  max={currentVariantStock}
                />
                <button
                  onClick={() => setQuantity(Math.min(currentVariantStock, quantity + 1))}
                  className="w-10 h-10 border border-gray-300 rounded hover:bg-gray-100 text-lg font-medium flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Sticky CTA on mobile */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:static md:p-0 md:border-0 md:bg-transparent z-40">
            <button
              onClick={handleAddToCart}
              disabled={currentVariantStock === 0}
              className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-semibold text-sm md:text-base"
            >
              {currentVariantStock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
            </button>
          </div>

          {/* Spacer so content isn't hidden behind the sticky bar on mobile */}
          <div className="h-20 md:h-0" />
        </div>
      </div>
    </div>
  );
}