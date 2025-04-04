import { Facebook, Twitter, Instagram, Youtube, Apple, Play } from 'lucide-react';
import { Link } from 'wouter';

const Footer = () => {
  return (
    <footer className="px-4 md:px-8 py-8 mt-8 border-t border-[#564D4D]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-gray-400 font-semibold mb-4">StreamSync</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <a className="text-gray-400 hover:text-white text-sm">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/careers">
                  <a className="text-gray-400 hover:text-white text-sm">Join Our Team</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-gray-400 hover:text-white text-sm">Contact Us</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-400 font-semibold mb-4">Help</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq">
                  <a className="text-gray-400 hover:text-white text-sm">FAQ</a>
                </Link>
              </li>
              <li>
                <Link href="/support">
                  <a className="text-gray-400 hover:text-white text-sm">Support Center</a>
                </Link>
              </li>
              <li>
                <Link href="/devices">
                  <a className="text-gray-400 hover:text-white text-sm">Device Compatibility</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-400 font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms">
                  <a className="text-gray-400 hover:text-white text-sm">Terms of Use</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/cookies">
                  <a className="text-gray-400 hover:text-white text-sm">Cookie Preferences</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-400 font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <p className="text-gray-400 text-sm">Download our app:</p>
            <div className="flex space-x-2 mt-2">
              <a href="#" className="bg-[#221F1F] hover:bg-[#564D4D] transition px-3 py-2 rounded text-xs flex items-center">
                <Apple className="h-3 w-3 mr-1" /> App Store
              </a>
              <a href="#" className="bg-[#221F1F] hover:bg-[#564D4D] transition px-3 py-2 rounded text-xs flex items-center">
                <Play className="h-3 w-3 mr-1" /> Google Play
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[#564D4D] text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} StreamSync. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
