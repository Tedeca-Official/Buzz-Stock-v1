
/**
 * Local storage database for product inventory
 */

import { Product, ProductHistory } from "@/contexts/ProductContext";

// Local storage keys
const PRODUCTS_KEY = "stocksavvy_products";
const HISTORY_KEY = "stocksavvy_product_history";

// Helper function to get data from local storage
const getFromLocalStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error retrieving from local storage (${key}):`, error);
    return [];
  }
};

// Helper function to save data to local storage
const saveToLocalStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to local storage (${key}):`, error);
  }
};

// Get data from local storage
export const getProducts = async (): Promise<Product[]> => {
  return getFromLocalStorage<Product>(PRODUCTS_KEY);
};

export const getProductHistory = async (): Promise<ProductHistory[]> => {
  return getFromLocalStorage<ProductHistory>(HISTORY_KEY);
};

// Save data to local storage
export const saveProduct = async (product: Product): Promise<string> => {
  try {
    const products = getFromLocalStorage<Product>(PRODUCTS_KEY);
    
    if (product.id) {
      // Update existing product
      const index = products.findIndex(p => p.id === product.id);
      if (index !== -1) {
        products[index] = { ...product };
      }
    } else {
      // Add new product with generated ID
      product.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      products.push(product);
    }
    
    saveToLocalStorage(PRODUCTS_KEY, products);
    return product.id;
  } catch (error) {
    console.error("Error saving product to local storage:", error);
    throw error;
  }
};

export const saveProducts = async (products: Product[]): Promise<void> => {
  try {
    saveToLocalStorage(PRODUCTS_KEY, products);
  } catch (error) {
    console.error("Error saving products to local storage:", error);
  }
};

export const saveProductHistory = async (history: ProductHistory): Promise<string> => {
  try {
    const historyItems = getFromLocalStorage<ProductHistory>(HISTORY_KEY);
    
    if (history.id) {
      // Update existing history
      const index = historyItems.findIndex(h => h.id === history.id);
      if (index !== -1) {
        historyItems[index] = { ...history };
      }
    } else {
      // Add new history with generated ID
      history.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      historyItems.push(history);
    }
    
    saveToLocalStorage(HISTORY_KEY, historyItems);
    return history.id;
  } catch (error) {
    console.error("Error saving history to local storage:", error);
    throw error;
  }
};

export const saveProductHistoryBatch = async (historyItems: ProductHistory[]): Promise<void> => {
  try {
    const existingItems = getFromLocalStorage<ProductHistory>(HISTORY_KEY);
    const newItems = [...existingItems];
    
    for (const item of historyItems) {
      if (item.id) {
        const index = newItems.findIndex(h => h.id === item.id);
        if (index !== -1) {
          newItems[index] = { ...item };
        } else {
          newItems.push(item);
        }
      } else {
        item.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
        newItems.push(item);
      }
    }
    
    saveToLocalStorage(HISTORY_KEY, newItems);
  } catch (error) {
    console.error("Error saving product history to local storage:", error);
  }
};

// Delete product
export const deleteProductFromDb = async (id: string): Promise<void> => {
  try {
    const products = getFromLocalStorage<Product>(PRODUCTS_KEY);
    const updatedProducts = products.filter(product => product.id !== id);
    saveToLocalStorage(PRODUCTS_KEY, updatedProducts);
  } catch (error) {
    console.error("Error deleting product from local storage:", error);
    throw error;
  }
};

// Get history for a specific product
export const getHistoryForProduct = async (productId: string): Promise<ProductHistory[]> => {
  try {
    const historyItems = getFromLocalStorage<ProductHistory>(HISTORY_KEY);
    return historyItems.filter(item => item.productId === productId);
  } catch (error) {
    console.error("Error retrieving product history from local storage:", error);
    return [];
  }
};

// Clear all data (for testing/reset)
export const clearDatabase = async (): Promise<void> => {
  try {
    localStorage.removeItem(PRODUCTS_KEY);
    localStorage.removeItem(HISTORY_KEY);
    console.log("Local storage database cleared");
  } catch (error) {
    console.error("Error clearing local storage:", error);
  }
};
