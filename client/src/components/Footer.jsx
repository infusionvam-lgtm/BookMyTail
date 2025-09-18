import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-text-dark/90 text-white mt-16 border-t border-gold-primary">
      <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row md:justify-between gap-8">

        {/* Logo / Brand */}
        <div className="flex flex-col items-start">
          <h1 className="text-2xl font-bold text-gold-primary mb-2">Opulent Hotel</h1>
          <p className="text-sm text-gray-300 max-w-xs mb-4">
            Experience luxury and comfort in the heart of the city. Book your stay with us today!
          </p>

          {/* Social Media Icons */}
          <div className="flex gap-4 mt-2">
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-gold-primary hover:text-gray-300 transition">
              <FaInstagram size={20} />
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gold-primary hover:text-gray-300 transition">
              <FaFacebookF size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gold-primary hover:text-gray-300 transition">
              <FaTwitter size={20} />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gold-primary hover:text-gray-300 transition">
              <FaLinkedinIn size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col md:items-start">
          <h2 className="font-semibold mb-3">Quick Links</h2>
          <ul className="flex flex-col gap-2">
            <li><Link to="/" className="hover:text-gold-primary transition">Home</Link></li>
            <li><Link to="/rooms" className="hover:text-gold-primary transition">Rooms</Link></li>
            <li><Link to="/mybookings" className="hover:text-gold-primary transition">My Booking</Link></li>
            <li><Link to="/cart" className="hover:text-gold-primary transition">Cart</Link></li>
          </ul>
        </div>

        {/* Support Links */}
        <div className="flex flex-col md:items-start">
          <h2 className="font-semibold mb-3">Support</h2>
          <ul className="flex flex-col gap-2">
            <li><Link to="/help-center" className="hover:text-gold-primary transition">Help Center</Link></li>
            <li><Link to="/safety" className="hover:text-gold-primary transition">Safety Information</Link></li>
            <li><Link to="/cancellation" className="hover:text-gold-primary transition">Cancellation Options</Link></li>
            <li><Link to="/contact" className="hover:text-gold-primary transition">Contact Us</Link></li>
            <li><Link to="/accessibility" className="hover:text-gold-primary transition">Accessibility</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col md:items-start">
          <h2 className="font-semibold mb-3">Contact Us</h2>
          <p className="text-sm text-gray-300">Sindhubhavan, Ahmedabad, India</p>
          <p className="text-sm text-gray-300">Email: info@opulenthotel.com</p>
          <p className="text-sm text-gray-300">Phone: +91 1234567890</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gold-primary mt-4 py-4 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Opulent Hotel. All rights reserved.
      </div>
    </footer>
  );
}
