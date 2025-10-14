import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaPinterestP,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-[#2b2b2f] text-gray-400 text-center py-10 mt-10">
      {/* Logo */}
      <div className="flex justify-center items-center mb-4 relative">
        <div className="flex-1 border-t border-gray-500 mx-8"></div>
        <h1 className="text-2xl font-bold text-white">
          book<span className="text-red-600">my</span>ticket
        </h1>
        <div className="flex-1 border-t border-gray-500 mx-8"></div>
      </div>

      {/* Social Icons */}
      <div className="flex justify-center space-x-6 my-6">
        <a
          href="#"
          className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition"
        >
          <FaFacebookF className="text-white text-md md:text-xl" />
        </a>
        <a
          href="#"
          className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition"
        >
          <FaXTwitter className="text-white text-md md:text-xl" />
        </a>
        <a
          href="#"
          className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition"
        >
          <FaInstagram className="text-white text-md md:text-xl" />
        </a>
        <a
          href="#"
          className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition"
        >
          <FaYoutube className="text-white text-md md:text-xl" />
        </a>
        <a
          href="#"
          className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition"
        >
          <FaPinterestP className="text-white text-md md:text-xl" />
        </a>
        <a
          href="#"
          className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition"
        >
          <FaLinkedinIn className="text-white text-md md:text-xl" />
        </a>
      </div>

      {/* Copyright */}
      <div className="text-sm text-gray-400 max-w-3xl mx-auto px-4">
        <p className="mb-2">
          Copyright © 2025 © Bigtree Entertainment Pvt. Ltd. All Rights
          Reserved.
        </p>
        <p>
          The content and images used on this site are copyright protected and
          copyrights vest with the respective owners. The usage of the content
          and images on this website is intended to promote the works and no
          endorsement of the artist shall be implied. Unauthorized use is
          prohibited and punishable by law.
        </p>
      </div>
    </footer>
  );
}
