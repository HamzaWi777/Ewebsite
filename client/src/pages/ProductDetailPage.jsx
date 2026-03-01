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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await productService.getById(id);
      setProduct(response.data);
      if (response.data.sizes?.length > 0) {
        setSelectedSize(response.data.sizes[0]);
      }
      if (response.data.colors?.length > 0) {
        setSelectedColor(response.data.colors[0]);
      }
    } catch (error) {
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

    // Check if selected variant is in stock
    const variantKey = `${selectedSize}_${selectedColor}`;
    const variantStock = product.variants?.[variantKey] || 0;
    if (variantStock === 0) {
      toast.error('This size and color combination is out of stock');
      return;
    }

    try {
      if (isAuthenticated) {
        // Add to authenticated user's cart
        await cartService.addToCart({
          product_id: product.id,
          quantity,
          size: selectedSize,
          color: selectedColor,
        });
      } else {
        // Add to guest cart (localStorage)
        // Ensure guest session ID exists
        getOrCreateGuestSessionId();
        addToGuestCart(product, quantity, selectedSize, selectedColor);
      }
      toast.success('Added to cart');
      navigate('/cart');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add to cart');
    }
  };

  // Get stock for selected variant
  const getVariantStock = () => {
    if (!product || !product.variants) return 0;
    const variantKey = `${selectedSize}_${selectedColor}`;
    return product.variants[variantKey] || 0;
  };

  const currentVariantStock = product ? getVariantStock() : 0;

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!product) return <div className="flex items-center justify-center min-h-screen">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/products')}
        className="text-gray-600 hover:text-gray-900 mb-6"
      >
        ← Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          {product.images.length > 0 ? (
            <>
              <img
                src={`http://localhost:5000${product.images[currentImageIndex]}`}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg mb-4"
              />
              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={`http://localhost:5000${img}`}
                      alt={`thumbnail-${idx}`}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                        currentImageIndex === idx ? 'border-gray-900' : 'border-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              No image available
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="mb-6">
            <span className="text-3xl font-bold mr-4">${product.price.toFixed(2)}</span>
            <span className={`text-lg ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} total in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="space-y-4 mb-6">
            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div>
                <label className="block font-semibold mb-2">Size</label>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(size => {
                    const sizeStock = Object.entries(product.variants || {}).reduce((sum, [key, stock]) => {
                      return key.startsWith(size + '_') ? sum + stock : sum;
                    }, 0);
                    const isOutOfStock = sizeStock === 0;
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setQuantity(1);
                        }}
                        disabled={isOutOfStock}
                        className={`px-4 py-2 border rounded transition relative ${
                          selectedSize === size
                            ? 'bg-gray-900 text-white border-gray-900'
                            : isOutOfStock
                            ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 hover:border-gray-900'
                        }`}
                        title={isOutOfStock ? 'Out of stock' : `${sizeStock} in stock`}
                      >
                        {size}
                        {isOutOfStock && <span className="text-xs ml-1">✕</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div>
                <label className="block font-semibold mb-2">Color</label>
                <select
                  value={selectedColor}
                  onChange={(e) => {
                    setSelectedColor(e.target.value);
                    setQuantity(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  {product.colors.map(color => {
                    const colorStock = Object.entries(product.variants || {}).reduce((sum, [key, stock]) => {
                      return key.endsWith('_' + color) ? sum + stock : sum;
                    }, 0);
                    const isOutOfStock = colorStock === 0;
                    return (
                      <option key={color} value={color} disabled={isOutOfStock}>
                        {color} {isOutOfStock ? '(Out of stock)' : `(${colorStock} available)`}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Variant Stock Status */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
              {currentVariantStock > 0 ? (
                `✓ ${currentVariantStock} available for ${selectedSize} in ${selectedColor}`
              ) : (
                '✕ This size and color combination is out of stock'
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block font-semibold mb-2">Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center px-2 py-2 border border-gray-300 rounded"
                  min="1"
                  max={currentVariantStock}
                />
                <button
                  onClick={() => setQuantity(Math.min(currentVariantStock, quantity + 1))}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={currentVariantStock === 0}
            className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-semibold"
          >
            {currentVariantStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {product.is_featured && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
              ⭐ This is a featured product
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
