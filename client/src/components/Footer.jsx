export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">StyleStore</h3>
            <p className="text-gray-400">
              Your destination for premium clothing and fashion.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/products" className="hover:text-white transition">All Products</a></li>
              <li><a href="/products?category=men" className="hover:text-white transition">Men</a></li>
              <li><a href="/products?category=women" className="hover:text-white transition">Women</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition">Returns</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2025 StyleStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
