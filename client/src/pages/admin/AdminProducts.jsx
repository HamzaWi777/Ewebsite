import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { productService } from '../../services';

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'men', colors: '' });
  const [variantStock, setVariantStock] = useState({});
  const [images, setImages] = useState([]);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getAll({ limit: 100 });
      setProducts(response.data.products);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleVariantStockChange = (size, color, value) => {
    setVariantStock({ ...variantStock, [`${size}_${color}`]: parseInt(value) || 0 });
  };

  const handleFileChange = (e) => {
    setImages(prev => [...prev, ...Array.from(e.target.files)]);
    e.target.value = '';
  };

  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(variantStock).length === 0) {
      toast.error('Please set stock for at least one size/color combination');
      return;
    }
    const colors = formData.colors.split(',').map(c => c.trim()).filter(c => c);
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('description', formData.description);
    fd.append('price', formData.price);
    fd.append('category', formData.category);
    fd.append('colors', JSON.stringify(colors));
    fd.append('sizes', JSON.stringify(DEFAULT_SIZES));
    fd.append('variantStock', JSON.stringify(variantStock));
    images.forEach(file => fd.append('images', file));
    try {
      if (editingId) {
        await productService.update(editingId, fd);
        toast.success('Product updated');
      } else {
        await productService.create(fd);
        toast.success('Product created');
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({ name: product.name, description: product.description, price: product.price, category: product.category, colors: product.colors.join(', ') });
    setVariantStock(product.variants || {});
    setImages([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await productService.delete(id);
        toast.success('Product deleted');
        fetchProducts();
      } catch {
        toast.error('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', category: 'men', colors: '' });
    setVariantStock({});
    setImages([]);
    setEditingId(null);
    setShowForm(false);
  };

  const colors = formData.colors.split(',').map(c => c.trim()).filter(c => c);
  const displayColors = colors.length > 0 ? colors : ['No Color'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
        <button
          onClick={() => !showForm ? setShowForm(true) : resetForm()}
          className="bg-gray-900 text-white px-4 md:px-6 py-2 rounded hover:bg-gray-800 transition text-sm md:text-base"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-5">
            {editingId ? 'Edit Product' : 'New Product'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm">
                  {['men', 'women', 'accessories', 'shoes'].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm" />
            </div>

            {/* Price + Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (TND)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} step="0.01" required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Colors (comma separated)</label>
                <input type="text" name="colors" value={formData.colors} onChange={handleInputChange} placeholder="Red, Blue, Black"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm" />
              </div>
            </div>

            {/* Variant stock — horizontal scroll on mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock per Size & Color</label>
              <div className="overflow-x-auto border border-gray-300 rounded">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="px-4 py-2 text-left text-sm font-medium sticky left-0 bg-gray-100">Size</th>
                      {displayColors.map(color => (
                        <th key={color} className="px-4 py-2 text-left text-sm font-medium whitespace-nowrap">{color}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_SIZES.map(size => (
                      <tr key={size} className="border-b border-gray-200">
                        <td className="px-4 py-2 font-medium text-sm bg-gray-50 sticky left-0">{size}</td>
                        {displayColors.map(color => (
                          <td key={`${size}-${color}`} className="px-4 py-2">
                            <input type="number" min="0"
                              value={variantStock[`${size}_${color}`] || ''}
                              onChange={(e) => handleVariantStockChange(size, color, e.target.value)}
                              placeholder="0"
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Images (up to 5)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={images.length >= 5}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              {images.length > 0 && (
                <div className="mt-2 space-y-1">
                  {images.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded">
                      <span className="truncate mr-2">{idx + 1}. {file.name}</span>
                      <button type="button" onClick={() => removeImage(idx)} className="text-red-500 hover:text-red-700 flex-shrink-0">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="w-full bg-gray-900 text-white py-2.5 rounded hover:bg-gray-800 transition font-semibold text-sm md:text-base">
              {editingId ? 'Update Product' : 'Create Product'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Stock</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">{product.name}</td>
                    <td className="py-3 px-4 capitalize">{product.category}</td>
                    <td className="py-3 px-4">TND {product.price.toFixed(2)}</td>
                    <td className="py-3 px-4"><span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>{product.stock}</span></td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 mr-4 text-sm">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-semibold truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">{product.category}</p>
                  </div>
                  <span className={`text-xs font-semibold flex-shrink-0 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-bold text-sm">TND {product.price.toFixed(2)}</span>
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}