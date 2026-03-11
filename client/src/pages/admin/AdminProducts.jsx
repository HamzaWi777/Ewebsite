import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { productService } from '../../services';

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'men',
    colors: '',
  });
  const [variantStock, setVariantStock] = useState({});
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getAll({ limit: 100 });
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVariantStockChange = (size, color, value) => {
    const key = `${size}_${color}`;
    setVariantStock({
      ...variantStock,
      [key]: parseInt(value) || 0,
    });
  };

  const handleFileChange = (e) => {
  const newFiles = Array.from(e.target.files);
  setImages(prev => [...prev, ...newFiles]);
  e.target.value = ''; // reset so same file can be re-added
};
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(variantStock).length === 0) {
      toast.error('Please set stock for at least one size/color combination');
      return;
    }

    const colors = formData.colors.split(',').map(c => c.trim()).filter(c => c);
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('colors', JSON.stringify(colors));
    formDataToSend.append('sizes', JSON.stringify(DEFAULT_SIZES));
    formDataToSend.append('variantStock', JSON.stringify(variantStock));

    images.forEach(file => {
      formDataToSend.append('images', file);
    });

    try {
      if (editingId) {
        await productService.update(editingId, formDataToSend);
        toast.success('Product updated');
      } else {
        await productService.create(formDataToSend);
        toast.success('Product created');
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Submit error details:', error.response?.data);
      console.error('Full error:', error);
      const errorMsg = error.response?.data?.error || 
                      (error.response?.data?.errors?.[0]?.msg) ||
                      'Failed to save product';
      toast.error(errorMsg);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      colors: product.colors.join(', '),
    });
    setVariantStock(product.variants || {});
    setShowForm(true);
    setImages([]);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await productService.delete(id);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'men',
      colors: '',
    });
    setVariantStock({});
    setImages([]);
    setEditingId(null);
    setShowForm(false);
  };

  const colors = formData.colors.split(',').map(c => c.trim()).filter(c => c);
  const displayColors = colors.length > 0 ? colors : ['No Color'];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <button
          onClick={() => !showForm ? setShowForm(true) : resetForm()}
          className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition"
        >
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="accessories">Accessories</option>
                  <option value="shoes">Shoes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colors (comma separated)
                </label>
                <input
                  type="text"
                  name="colors"
                  value={formData.colors}
                  onChange={handleInputChange}
                  placeholder="Red, Blue, Black"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            {/* Variant Stock Grid */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Stock per Size & Color
              </label>
              <div className="overflow-x-auto border border-gray-300 rounded">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="px-4 py-2 text-left text-sm font-medium">Size</th>
                      {displayColors.map(color => (
                        <th key={color} className="px-4 py-2 text-left text-sm font-medium">
                          {color}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_SIZES.map(size => (
                      <tr key={size} className="border-b border-gray-200">
                        <td className="px-4 py-2 font-medium text-sm bg-gray-50">{size}</td>
                        {displayColors.map(color => (
                          <td key={`${size}-${color}`} className="px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              value={variantStock[`${size}_${color}`] || ''}
                              onChange={(e) => handleVariantStockChange(size, color, e.target.value)}
                              placeholder="0"
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Images (click to add in order, up to 5)
  </label>
  <input
    type="file"
    accept="image/*"
    onChange={handleFileChange}
    disabled={images.length >= 5}
    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
  />
  {images.length > 0 && (
    <div className="mt-2 space-y-1">
      {images.map((file, idx) => (
        <div key={idx} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded">
          <span>{idx + 1}. {file.name}</span>
          <button
            type="button"
            onClick={() => removeImage(idx)}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}
</div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800 transition font-semibold"
            >
              {editingId ? 'Update Product' : 'Create Product'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Total Stock</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">{product.name}</td>
                  <td className="py-3 px-4">{product.category}</td>
                  <td className="py-3 px-4">TND {product.price.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
