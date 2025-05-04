import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  getProducts,
  getProductHistory,
  saveProduct, 
  saveProductHistory,
  getHistoryForProduct as getHistoryForProductDb,
  deleteProductFromDb,
  cleanupOldSoldProducts
} from "@/utils/firebaseDatabase";
import { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  productId: string;
  name: string;
  purchaseDate: string;
  status: "In Stock" | "Sold";
  stock: number;
  price: number | null; // This represents the purchase price
  category: string;
  saleDate?: string;
  saleQuantity?: number;
  salePrice?: number; // This represents the selling price
  seller?: string;
  buyer?: string;
}

export interface ProductHistory {
  id: string;
  productId: string;
  change: string;
  timestamp: Timestamp;
  price?: number;
  seller?: string;
  buyer?: string;
}

interface ProductContextType {
  products: Product[];
  productHistory: ProductHistory[];
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  markAsSold: (id: string, saleDate: string, quantity: number, salePrice?: number, seller?: string, buyer?: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getHistoryForProduct: (productId: string) => ProductHistory[];
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType>({
  products: [],
  productHistory: [],
  addProduct: async () => {},
  updateProduct: async () => {},
  markAsSold: async () => {},
  deleteProduct: async () => {},
  getProductById: () => undefined,
  getHistoryForProduct: () => [],
  isLoading: true,
});

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productHistory, setProductHistory] = useState<ProductHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load data from Firebase on initial render and clean up old sold products
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Clean up old sold products first
        await cleanupOldSoldProducts();
        
        // Then fetch the current products (which will exclude the old sold ones)
        const fetchedProducts = await getProducts();
        const fetchedHistory = await getProductHistory();
        
        setProducts(fetchedProducts);
        setProductHistory(fetchedHistory);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up a daily cleanup interval for old sold products
    const cleanupInterval = setInterval(() => {
      cleanupOldSoldProducts().then(() => {
        // Refresh the products list after cleanup
        getProducts().then(freshProducts => {
          setProducts(freshProducts);
        });
      });
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  // Add new product
  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      const newProduct = {
        ...product,
        id: "", // This ID will be replaced by Firestore's ID
      };

      const productId = await saveProduct(newProduct as Product);
      
      // Update the product with the correct Firestore ID
      const savedProduct = { ...newProduct, id: productId };
      setProducts([...products, savedProduct]);

      // Add purchase to history with price - making it clear this is purchase price
      await saveProductHistory(
        productId, 
        "Product added with purchase price", 
        product.price || undefined
      );
      
      // Fetch the updated history to refresh the state
      const updatedHistory = await getProductHistory();
      setProductHistory(updatedHistory);
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  // Update product
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;
      
      const updatedProduct = { ...product, ...updates };
      await saveProduct(updatedProduct);
      
      // If stock is being updated, add to history with price
      if (updates.stock !== undefined && product.stock !== updates.stock) {
        await saveProductHistory(
          id, 
          "Stock updated", 
          updates.price !== undefined ? updates.price : product.price || undefined
        );
      } else if (updates.price !== undefined && product.price !== updates.price) {
        await saveProductHistory(
          id, 
          "Price updated", 
          updates.price
        );
      } else {
        await saveProductHistory(
          id, 
          "Product updated",
          product.price || undefined
        );
      }
      
      // Fetch the updated history to refresh the state
      const updatedHistory = await getProductHistory();
      setProductHistory(updatedHistory);
      
      setProducts(products.map(p => p.id === id ? updatedProduct : p));
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  // Mark product as sold
  const markAsSold = async (id: string, saleDate: string, quantity: number, salePrice?: number, seller?: string, buyer?: string) => {
    try {
      const product = products.find((p) => p.id === id);
      if (!product) return;

      // Default seller name if none provided
      const sellerName = seller || "Unknown";
      
      // Calculate remaining stock
      const remainingStock = Math.max(0, product.stock - quantity);
      const status = remainingStock > 0 ? "In Stock" : "Sold";

      // Update product
      await updateProduct(id, {
        status,
        stock: remainingStock,
        saleDate,
        saleQuantity: quantity,
        salePrice: salePrice || product.price || undefined,
        seller: sellerName,
        buyer: buyer || undefined,
      });

      // Add sale to history with seller, buyer and sale price info
      await saveProductHistory(
        id, 
        `${quantity} units sold by ${sellerName}${buyer ? ` to ${buyer}` : ''}`, 
        salePrice || product.price || undefined,
        sellerName,
        buyer
      );
      
      // Fetch the updated history to refresh the state
      const updatedHistory = await getProductHistory();
      setProductHistory(updatedHistory);
    } catch (error) {
      console.error("Error marking product as sold:", error);
      throw error;
    }
  };

  // Delete product - updated to only archive, not delete
  const deleteProduct = async (id: string) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;
      
      // Instead of deleting, mark as archived
      await updateProduct(id, {
        status: "Sold",
        stock: 0
      });
      
      await saveProductHistory(id, "product archived");
      
      // Fetch the updated history to refresh the state
      const updatedHistory = await getProductHistory();
      setProductHistory(updatedHistory);
      
      // Update local state to remove from active view
      setProducts(products.map(p => p.id === id ? {...p, status: "Sold", stock: 0} : p));
    } catch (error) {
      console.error("Error archiving product:", error);
      throw error;
    }
  };

  // Get product by ID
  const getProductById = (id: string) => {
    return products.find((product) => product.id === id);
  };

  // Get history for a product
  const getHistoryForProduct = (productId: string) => {
    return productHistory.filter((history) => history.productId === productId);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        productHistory,
        addProduct,
        updateProduct,
        markAsSold,
        deleteProduct,
        getProductById,
        getHistoryForProduct,
        isLoading,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
