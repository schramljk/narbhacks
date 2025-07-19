import React from "react";
import Logo from "../common/Logo";
import Menu from "../common/Menu";

const menuItems = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "Daily Journal",
    url: "/notes",
  },
  {
    title: "Habit Tracker",
    url: "/habits",
  },
];

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Logo color="text-white" />
            <p className="mt-4 text-gray-300 max-w-md">
              Take control of your life with MosAIc. Save time and focus on what matters with our journal and habit tracking features.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.title}>
                  <a
                    href={item.url}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-300">
              <li>AI-Powered Journaling</li>
              <li>Smart Habit Tracking</li>
              <li>Cloud Synchronization</li>
              <li>Privacy & Security</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 MosAIc. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Icons by Icons8
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
