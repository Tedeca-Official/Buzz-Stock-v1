
import React, { useState, useMemo } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, ShoppingCart, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SellProductForm from "@/components/products/SellProductForm";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Inventory = () => {
  const { products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProductForSale, setSelectedProductForSale] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"current" | "sold">("current");
  
  // Search terms
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [soldSearchTerm, setSoldSearchTerm] = useState("");
  
  // Calculate inventory stats
  const totalProducts = products.length;
  const totalInStock = products.filter((p) => p.status === "In Stock").length;
  const totalSold = products.filter((p) => p.status === "Sold").length;
  const lowStockCount = products.filter(
    (p) => p.status === "In Stock" && p.stock <= 2
  ).length;

  // Get unique categories
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Filter products by category and search term for current inventory
  const filteredCurrentProducts = useMemo(() => {
    return products.filter(
      (product) => 
        (selectedCategory === null || product.category === selectedCategory) &&
        product.status === "In Stock" &&
        (currentSearchTerm === "" || 
         product.name.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
         product.productId.toLowerCase().includes(currentSearchTerm.toLowerCase()))
    );
  }, [products, selectedCategory, currentSearchTerm]);

  // Filter sold products by search term
  const filteredSoldProducts = useMemo(() => {
    return products.filter(
      (product) => 
        product.status === "Sold" &&
        (soldSearchTerm === "" || 
         product.name.toLowerCase().includes(soldSearchTerm.toLowerCase()) ||
         product.productId.toLowerCase().includes(soldSearchTerm.toLowerCase()) ||
         (product.seller && product.seller.toLowerCase().includes(soldSearchTerm.toLowerCase())) ||
         (product.buyer && product.buyer.toLowerCase().includes(soldSearchTerm.toLowerCase())))
    );
  }, [products, soldSearchTerm]);

  // Find the selected product for sale
  const productForSale = products.find(p => p.id === selectedProductForSale);

  const handleSale = (productId: string) => {
    setSelectedProductForSale(productId);
  };

  const closeSaleDialog = () => {
    setSelectedProductForSale(null);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <p className="text-2xl font-semibold">{totalProducts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">In Stock</p>
            <p className="text-2xl font-semibold">{totalInStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">Sold</p>
            <p className="text-2xl font-semibold text-blue-600">{totalSold}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">Low Stock</p>
            <p className="text-2xl font-semibold text-yellow-600">{lowStockCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "current" | "sold")} className="w-full">
        <TabsList className="mb-4 rounded-full bg-gray-100 p-1 w-full sm:w-auto">
          <TabsTrigger value="current" className="flex-1 sm:flex-initial rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Current Inventory
          </TabsTrigger>
          <TabsTrigger value="sold" className="flex-1 sm:flex-initial rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Sold Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                  <CardTitle>Current Inventory</CardTitle>
                  <CardDescription>
                    View and manage your product inventory
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search products..."
                      className="pl-8 w-full sm:w-[200px]"
                      value={currentSearchTerm}
                      onChange={(e) => setCurrentSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select 
                    value={selectedCategory || "all-categories"} 
                    onValueChange={(value) => setSelectedCategory(value === "all-categories" ? null : value)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-categories">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCurrentProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No products in inventory.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCurrentProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.productId}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md flex items-center">
                                <DollarSign className="h-3.5 w-3.5 mr-1" />
                                {product.price ? product.price.toFixed(2) : '0.00'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {product.stock <= 2 ? (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Low Stock</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Stock</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleSale(product.id)}
                              className="bg-savvy-primary text-white hover:bg-savvy-primary/90"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Sell
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sold">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                  <CardTitle>Sold Products</CardTitle>
                  <CardDescription>
                    View your product sales history
                  </CardDescription>
                </div>
                <div className="relative mt-4 sm:mt-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by name, ID, seller or buyer..."
                    className="pl-8 w-full sm:w-[280px]"
                    value={soldSearchTerm}
                    onChange={(e) => setSoldSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Sale Date</TableHead>
                      <TableHead>Sold Quantity</TableHead>
                      <TableHead>Sale Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSoldProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No sold products found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSoldProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.productId}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.seller || "Unknown"}</TableCell>
                          <TableCell>{product.buyer || "Unknown"}</TableCell>
                          <TableCell>{product.saleDate ? formatDate(product.saleDate) : "N/A"}</TableCell>
                          <TableCell>{product.saleQuantity || "All"}</TableCell>
                          <TableCell>
                            {product.salePrice ? `$${product.salePrice.toFixed(2)}` : 
                             product.price ? `$${product.price.toFixed(2)}` : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sell Product Dialog */}
      <Dialog open={!!selectedProductForSale} onOpenChange={(open) => !open && closeSaleDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Product as Sold</DialogTitle>
          </DialogHeader>
          {productForSale && (
            <SellProductForm 
              product={productForSale} 
              onComplete={closeSaleDialog} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper function to format dates
function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

export default Inventory;
