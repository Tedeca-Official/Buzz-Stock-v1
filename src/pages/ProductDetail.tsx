import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts, Product, ProductHistory } from "@/contexts/ProductContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, ShoppingBag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditProductForm from "@/components/products/EditProductForm";
import SellProductForm from "@/components/products/SellProductForm";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, getHistoryForProduct, isLoading } = useProducts();
  const { isAdmin } = useAuth();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);

  const product = getProductById(id || "");
  const productHistory = getHistoryForProduct(id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
        <p className="mt-2 text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
        <Button 
          onClick={() => navigate("/products")}
          variant="outline"
          className="mt-4 rounded-full"
        >
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/products")}
            className="mr-2 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{product.name}</h1>
        </div>
        <div className="flex space-x-2 mt-2 sm:mt-0">
          {product.status === "In Stock" && (
            <Button 
              onClick={() => setIsSellDialogOpen(true)} 
              variant="outline"
              className="flex items-center rounded-full"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Sell Product
            </Button>
          )}
          {isAdmin && (
            <Button 
              onClick={() => setIsEditDialogOpen(true)} 
              className="bg-savvy-primary rounded-full"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Button>
          )}
        </div>
      </div>

      {/* Product info cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <InfoCard 
          title="Status" 
          value={
            <ProductStatusBadge status={product.status} stock={product.stock} />
          } 
        />
        <InfoCard 
          title="Stock" 
          value={`${product.stock} units`} 
        />
        <InfoCard 
          title="Price" 
          value={product.price ? `$${product.price.toFixed(2)}` : "N/A"} 
        />
      </div>

      {/* Tabs for product details and history */}
      <Tabs defaultValue="details" className="mb-6">
        <TabsList className="mb-4 rounded-full bg-gray-100 p-1">
          <TabsTrigger value="details" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Details</TabsTrigger>
          <TabsTrigger value="history" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">History</TabsTrigger>
        </TabsList>
        
        {/* Details Tab Content */}
        <TabsContent value="details">
          <Card className="border border-gray-100 rounded-xl shadow-sm">
            <CardHeader className="bg-gray-50 rounded-t-xl">
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Comprehensive information about this product</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem label="Product ID" value={product.productId} />
                <DetailItem label="Category" value={product.category} />
                <DetailItem label="Purchase Date" value={formatDate(product.purchaseDate)} />
                {product.status === "Sold" && product.saleDate && (
                  <DetailItem label="Sale Date" value={formatDate(product.saleDate)} />
                )}
                {product.status === "Sold" && product.saleQuantity && (
                  <DetailItem label="Quantity Sold" value={product.saleQuantity.toString()} />
                )}
                {product.seller && (
                  <DetailItem label="Seller" value={product.seller} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* History Tab Content */}
        <TabsContent value="history">
          <Card className="border border-gray-100 rounded-xl shadow-sm">
            <CardHeader className="bg-gray-50 rounded-t-xl">
              <CardTitle>Product History</CardTitle>
              <CardDescription>Transaction history for this product</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {productHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No history available for this product.</p>
              ) : (
                <div className="space-y-4">
                  {productHistory.map((entry) => (
                    <HistoryEntry key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white rounded-xl border border-gray-200 shadow-xl p-0 overflow-hidden sm:max-w-[600px]">
          <DialogHeader className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details for {product.name}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6">
            <EditProductForm 
              product={product} 
              onComplete={() => setIsEditDialogOpen(false)} 
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Sell Product Dialog */}
      <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
        <DialogContent className="bg-white rounded-xl border border-gray-200 shadow-xl p-0 overflow-hidden sm:max-w-[600px]">
          <DialogHeader className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
            <DialogTitle>Sell Product</DialogTitle>
            <DialogDescription>
              Mark {product.name} as sold or update quantity
            </DialogDescription>
          </DialogHeader>
          <div className="px-6">
            <SellProductForm 
              product={product} 
              onComplete={() => setIsSellDialogOpen(false)} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface InfoCardProps {
  title: string;
  value: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
};

interface DetailItemProps {
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {
  return (
    <div className="py-2">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
};

interface HistoryEntryProps {
  entry: ProductHistory;
}

const HistoryEntry: React.FC<HistoryEntryProps> = ({ entry }) => {
  // Adapting for the new ProductHistory structure
  const timestamp = entry.timestamp ? new Date(entry.timestamp.seconds * 1000) : new Date();
  
  return (
    <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
      <div>
        <p className="text-sm font-medium">
          {entry.change || "Product update"}
        </p>
        <div className="flex flex-col text-xs text-gray-500">
          <span>{formatDate(timestamp.toISOString())}</span>
          {entry.seller && <span className="font-semibold text-blue-600">By: {entry.seller}</span>}
        </div>
      </div>
    </div>
  );
};

interface ProductStatusBadgeProps {
  status: string;
  stock: number;
}

const ProductStatusBadge: React.FC<ProductStatusBadgeProps> = ({ status, stock }) => {
  if (status === "Sold") {
    return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Sold</Badge>;
  }
  
  if (stock <= 2) {
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Low Stock</Badge>;
  }
  
  return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">In Stock</Badge>;
};

// Helper function to format dates
function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

export default ProductDetail;
