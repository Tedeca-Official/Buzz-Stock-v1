import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose
} from "@/components/ui/drawer";
import { NavLink } from "react-router-dom";

const Header: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const closeDrawer = () => {
    setIsOpen(false);
  };

  // Display user's name (from Firebase) or email if name is not available
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DrawerTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu size={24} />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-[80vh]">
                <div className="flex flex-col h-full bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-semibold">Menu</h2>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="icon">
                        <X size={24} />
                      </Button>
                    </DrawerClose>
                  </div>
                  <nav className="flex-1 p-4">
                    <ul className="space-y-4">
                      <MobileNavItem to="/dashboard" onClick={closeDrawer}>Dashboard</MobileNavItem>
                      <MobileNavItem to="/products" onClick={closeDrawer}>Products</MobileNavItem>
                      <MobileNavItem to="/inventory" onClick={closeDrawer}>Inventory</MobileNavItem>
                      
                      {isAdmin && (
                        <>
                          <div className="pt-4 border-t dark:border-gray-700 mt-4">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              Admin
                            </h3>
                          </div>
                          <MobileNavItem to="/analytics" onClick={closeDrawer}>Analytics</MobileNavItem>
                          <MobileNavItem to="/users" onClick={closeDrawer}>Users</MobileNavItem>
                          <MobileNavItem to="/settings" onClick={closeDrawer}>Settings</MobileNavItem>
                        </>
                      )}
                    </ul>
                  </nav>
                  <div className="p-4 border-t dark:border-gray-700">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        closeDrawer();
                        logout();
                      }}
                      className="w-full"
                    >
                      Log out
                    </Button>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
            <h1 className="text-2xl font-semibold text-savvy-primary dark:text-savvy-accent">Stock Savvy</h1>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="mr-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </Button>
                <div className="mr-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {displayName} ({isAdmin ? "Admin" : "Worker"})
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="text-sm px-3 py-1 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Log out
                </Button>
              </div>
            </div>
            
            {/* Mobile user menu */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-gray-500 dark:text-gray-300"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

interface MobileNavItemProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ to, children, onClick }) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center p-3 text-base rounded-lg transition-colors ${
            isActive
              ? "bg-savvy-primary text-white"
              : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          }`
        }
        onClick={onClick}
      >
        {children}
      </NavLink>
    </li>
  );
};

export default Header;
