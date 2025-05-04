
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { db } from './firebase';
import { Product, ProductHistory } from "@/contexts/ProductContext";

// Collections
const PRODUCTS_COLLECTION = "products";
const PRODUCT_HISTORY_COLLECTION = "productHistory";

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const productsCol = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error("Error getting products:", error);
    return [];
  }
};

// Get product history
export const getProductHistory = async (): Promise<ProductHistory[]> => {
  try {
    const historyCol = collection(db, PRODUCT_HISTORY_COLLECTION);
    const snapshot = await getDocs(historyCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductHistory));
  } catch (error) {
    console.error("Error getting product history:", error);
    return [];
  }
};

// Save product
export const saveProduct = async (product: Product): Promise<string> => {
  try {
    if (product.id) {
      // Update existing product
      const productRef = doc(db, PRODUCTS_COLLECTION, product.id);
      await updateDoc(productRef, { ...product });
      return product.id;
    } else {
      // Add new product
      const { id, ...productWithoutId } = product;
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productWithoutId);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving product:", error);
    throw error;
  }
};

// Alias functions for backward compatibility
export const addProductToDb = saveProduct;
export const updateProductInDb = saveProduct;

// Save multiple products
export const saveProducts = async (products: Product[]): Promise<void> => {
  try {
    const batch = products.map(product => saveProduct(product));
    await Promise.all(batch);
  } catch (error) {
    console.error("Error saving products batch:", error);
    throw error;
  }
};

// Save product history - updated to include price, seller and buyer info
export const saveProductHistory = async (
  productId: string, 
  change: string, 
  price?: number,
  seller?: string, 
  buyer?: string
): Promise<string> => {
  try {
    const historyData: any = {
      productId,
      change,
      timestamp: serverTimestamp()
    };
    
    // Add price if provided
    if (price !== undefined) {
      historyData.price = price;
    }
    
    // Add seller if provided
    if (seller) {
      historyData.seller = seller;
    }
    
    // Add buyer if provided
    if (buyer) {
      historyData.buyer = buyer;
    }
    
    const docRef = await addDoc(collection(db, PRODUCT_HISTORY_COLLECTION), historyData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving product history:", error);
    throw error;
  }
};

// Delete product - but actually mark as archived
export const deleteProductFromDb = async (id: string): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(productRef, { archived: true, status: "Sold", stock: 0 });
  } catch (error) {
    console.error("Error archiving product:", error);
    throw error;
  }
};

// Cleanup old sold products - modified to archive instead of delete
export const cleanupOldSoldProducts = async (): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const productsCol = collection(db, PRODUCTS_COLLECTION);
    const q = query(
      productsCol, 
      where("status", "==", "Sold"),
      where("saleDate", "<=", thirtyDaysAgo.toISOString().split('T')[0])
    );
    
    const snapshot = await getDocs(q);
    
    // Instead of deleting, mark as archived by updating status
    const archiveOperations = snapshot.docs.map(docSnap => {
      const productRef = doc(db, PRODUCTS_COLLECTION, docSnap.id);
      return updateDoc(productRef, { archived: true });
    });
    
    await Promise.all(archiveOperations);
    
    console.log(`Archived ${snapshot.docs.length} old sold products`);
  } catch (error) {
    console.error("Error archiving old sold products:", error);
  }
};

// Get history for a specific product
export const getHistoryForProduct = async (productId?: string): Promise<ProductHistory[]> => {
  try {
    const historyCol = collection(db, PRODUCT_HISTORY_COLLECTION);
    
    // If productId is provided, filter by it, otherwise get all history
    let q = productId 
      ? query(historyCol, where("productId", "==", productId))
      : historyCol;
      
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductHistory));
  } catch (error) {
    console.error("Error getting product history:", error);
    return [];
  }
};
