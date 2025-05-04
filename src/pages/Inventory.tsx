import React, { useState, useMemo } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, ShoppingCart, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SellProductForm from "@/components/products/SellProductForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Inventory = () => {
  const { products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProductForSale, setSelectedProductForSale] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"current" | "sold">("current");
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [soldSearchTerm, setSoldSearchTerm] = useState("");

  const totalProducts = products.length;
  const totalInStock = products.filter((p) => p.status === "In Stock").length;
  const totalSold = products.filter((p) => p.status === "Sold").length;
  const lowStockCount = products.filter((p) => p.status === "In Stock" && p.stock <= 2).length;

  const categories = Array.from(new Set(products.map((p) => p.category)));

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

  const productForSale = products.find((p) => p.id === selectedProductForSale);

  const handleSale = (productId: string) => setSelectedProductForSale(productId);
  const closeSaleDialog = () => setSelectedProductForSale(null);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card><CardContent className="p-6"><p className="text-sm font-medium text-gray-500">Total Products</p><p className="text-2xl font-semibold">{totalProducts}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm font-medium text-gray-500">In Stock</p><p className="text-2xl font-semibold">{totalInStock}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm font-medium text-gray-500">Sold</p><p className="text-2xl font-semibold text-blue-600">{totalSold}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm font-medium text-gray-500">Low Stock</p><p className="text-2xl font-semibold text-yellow-600">{lowStockCount}</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "current" | "sold")}>...
        {/* The rest of the tabs content remains unchanged until the "Sold Products" search input */}
        <TabsContent value="sold">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                  <CardTitle>Sold Products</CardTitle>
                  <CardDescription>View your product sales history</CardDescription>
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
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSoldProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No sold products.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSoldProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.productId}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.price.toFixed(2)}</TableCell>
                          <TableCell>{product.seller}</TableCell>
                          <TableCell>{product.buyer}</TableCell>
                          <TableCell><Badge className="bg-blue-100 text-blue-700">Sold</Badge></TableCell>
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

      {productForSale && (
        <Dialog open={true} onOpenChange={closeSaleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sell Product</DialogTitle>
            </DialogHeader>
            <SellProductForm product={productForSale} onClose={closeSaleDialog} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Inventory;
