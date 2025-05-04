
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag,
  BarChart,
  Users,
  Settings
} from "lucide-react";

const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-savvy-dark text-white">
        <div className="h-16 flex items-center px-4 bg-savvy-dark">
          <div className="flex-shrink-0 flex items-center">
            <PackageIcon />
            <span className="ml-2 text-lg font-medium">Stock Savvy</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            <NavItem to="/dashboard" label="Dashboard" icon={<LayoutDashboard size={20} />} />
            <NavItem to="/products" label="Products" icon={<Package size={20} />} />
            <NavItem to="/inventory" label="Inventory" icon={<ShoppingBag size={20} />} />
            
            {isAdmin && (
              <>
                <div className="pt-5 border-t border-gray-700 mt-5">
                  <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-3 mb-2">
                    Admin
                  </h3>
                </div>
                <NavItem to="/analytics" label="Analytics" icon={<BarChart size={20} />} />
                <NavItem to="/users" label="Users" icon={<Users size={20} />} />
                <NavItem to="/settings" label="Settings" icon={<Settings size={20} />} />
              </>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
          isActive
            ? "bg-savvy-primary text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        }`
      }
    >
      <div className="mr-3">{icon}</div>
      {label}
    </NavLink>
  );
};

const PackageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-savvy-primary"
  >
    <path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.29 7 12 12 20.71 7"></polyline>
    <line x1="12" x2="12" y1="22" y2="12"></line>
  </svg>
);

export default Sidebar;
