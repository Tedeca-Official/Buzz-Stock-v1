import React, { useMemo, useState } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart as BarChartIcon, PieChart, ChartBar, List } from "lucide-react";
import { format } from "date-fns";

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const Analytics = () => {
  const { products, productHistory } = useProducts();
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate total product value
  const totalValue = useMemo(() => {
    return products.reduce((sum, product) => {
      if (product.price && product.stock) {
        return sum + (product.price * product.stock);
      }
      return sum;
    }, 0);
  }, [products]);

  // Calculate total purchase cost - including all products (even sold ones)
  const totalPurchaseCost = useMemo(() => {
    return products
      .reduce((sum, p) => {
        // Include original purchase cost regardless of current status
        const originalStock = p.stock + (p.saleQuantity || 0);
        return sum + ((p.price || 0) * originalStock);
      }, 0);
  }, [products]);

  // Calculate total sales value (simplified since we don't have type/price/quantity in ProductHistory)
  const totalSales = useMemo(() => {
    // We'll estimate based on sold products instead
    return products
      .filter(p => p.status === "Sold" && p.salePrice)
      .reduce((sum, p) => sum + ((p.salePrice || 0) * (p.saleQuantity || 1)), 0);
  }, [products]);

  // Calculate total products purchased
  const totalPurchased = useMemo(() => {
    // Count both current stock and sold items
    return products.reduce((sum, p) => sum + p.stock + (p.saleQuantity || 0), 0);
  }, [products]);

  // Calculate total products sold
  const totalSold = useMemo(() => {
    return products
      .filter(p => p.status === "Sold")
      .reduce((sum, p) => sum + (p.saleQuantity || 1), 0);
  }, [products]);

  // Calculate average purchase price per item
  const averagePurchasePrice = useMemo(() => {
    const totalItems = products.reduce((sum, p) => sum + p.stock + (p.saleQuantity || 0), 0);
    return totalItems > 0 ? totalPurchaseCost / totalItems : 0;
  }, [products, totalPurchaseCost]);

  // Prepare monthly sales data (simplified)
  const monthlySalesData = useMemo(() => {
    const salesByMonth: Record<string, number> = {};
    
    products
      .filter(p => p.status === "Sold" && p.saleDate && p.salePrice)
      .forEach(sale => {
        const date = new Date(sale.saleDate!);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        
        if (salesByMonth[monthYear]) {
          salesByMonth[monthYear] += (sale.salePrice || 0) * (sale.saleQuantity || 1);
        } else {
          salesByMonth[monthYear] = (sale.salePrice || 0) * (sale.saleQuantity || 1);
        }
      });
    
    return Object.entries(salesByMonth).map(([month, amount]) => ({
      month,
      amount,
    }));
  }, [products]);

  // Prepare monthly purchase data (simplified)
  const monthlyPurchaseData = useMemo(() => {
    const purchasesByMonth: Record<string, number> = {};
    
    products
      .filter(p => p.price)
      .forEach(purchase => {
        const date = new Date(purchase.purchaseDate);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        
        if (purchasesByMonth[monthYear]) {
          purchasesByMonth[monthYear] += (purchase.price || 0) * purchase.stock;
        } else {
          purchasesByMonth[monthYear] = (purchase.price || 0) * purchase.stock;
        }
      });
    
    return Object.entries(purchasesByMonth).map(([month, amount]) => ({
      month,
      amount,
    }));
  }, [products]);

  // Process product history to show purchase prices
  const purchaseHistory = useMemo(() => {
    return productHistory
      .filter(h => h.price !== undefined)
      .sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return b.timestamp.seconds - a.timestamp.seconds;
      })
      .map(history => {
        const product = products.find(p => p.id === history.productId);
        return {
          id: history.id,
          productId: history.productId,
          productName: product?.name || "Unknown Product",
          change: history.change,
          price: history.price || 0,
          date: history.timestamp ? new Date(history.timestamp.seconds * 1000) : new Date(),
        };
      });
  }, [productHistory, products]);

  // Bar chart component for reuse
  const BarChartComponent = ({ data, dataKey, fill }: { data: any[]; dataKey: string; fill: string }) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => formatCurrency(value as number)} />
        <Legend />
        <Bar dataKey={dataKey} fill={fill} />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Inventory Value</div>
            <div className="text-2xl font-bold mt-1 text-savvy-primary dark:text-savvy-accent">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales</div>
            <div className="text-2xl font-bold mt-1 text-savvy-primary dark:text-savvy-accent">{formatCurrency(totalSales)}</div>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Items Purchased</div>
            <div className="text-2xl font-bold mt-1 text-savvy-primary dark:text-savvy-accent">{totalPurchased}</div>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Items Sold</div>
            <div className="text-2xl font-bold mt-1 text-savvy-primary dark:text-savvy-accent">{totalSold}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="dark:bg-gray-800 dark:border-gray-700 rounded-full overflow-hidden">
          <TabsTrigger value="overview" className="data-[state=active]:dark:bg-gray-700 rounded-full">
            <BarChartIcon className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sales" className="data-[state=active]:dark:bg-gray-700 rounded-full">
            <ChartBar className="h-4 w-4 mr-2" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="purchases" className="data-[state=active]:dark:bg-gray-700 rounded-full">
            <PieChart className="h-4 w-4 mr-2" />
            Purchases
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:dark:bg-gray-700 rounded-full">
            <List className="h-4 w-4 mr-2" />
            Price History
          </TabsTrigger>
        </TabsList>
        
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <TabsContent value="overview" className="mt-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold dark:text-white">Inventory Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Inventory Value</div>
                <div className="text-xl font-bold mt-1 dark:text-white">{formatCurrency(totalValue)}</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Purchase Cost</div>
                <div className="text-xl font-bold mt-1 dark:text-white">
                  {formatCurrency(totalPurchaseCost)} <span className="text-sm font-normal">(includes sold products)</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Sales Revenue</div>
                <div className="text-xl font-bold mt-1 dark:text-white">{formatCurrency(totalSales)}</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Profit</div>
                <div className="text-xl font-bold mt-1 dark:text-white">{formatCurrency(totalSales - totalPurchaseCost)}</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Items Purchased</div>
                <div className="text-xl font-bold mt-1 dark:text-white">{totalPurchased}</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Items Sold</div>
                <div className="text-xl font-bold mt-1 dark:text-white">{totalSold}</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Average Bought Price</div>
                <div className="text-xl font-bold mt-1 dark:text-white">{formatCurrency(averagePurchasePrice)}</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Profit Margin</div>
                <div className="text-xl font-bold mt-1 dark:text-white">
                  {totalPurchaseCost > 0 ? 
                    `${((totalSales - totalPurchaseCost) / totalPurchaseCost * 100).toFixed(1)}%` : 
                    "N/A"}
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Current Stock Value</div>
                <div className="text-xl font-bold mt-1 dark:text-white">{formatCurrency(
                  products
                    .filter(p => p.status === "In Stock")
                    .reduce((sum, p) => sum + (p.price || 0) * p.stock, 0)
                )}</div>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="sales" className="mt-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold dark:text-white">Sales Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Sales Revenue</div>
                <div className="text-xl font-bold mt-1 dark:text-white">{formatCurrency(totalSales)}</div>
              </div>
              {monthlySalesData.length > 0 ? (
                <BarChartComponent data={monthlySalesData} dataKey="amount" fill="#10B981" />
              ) : (
                <div className="flex justify-center items-center h-60 text-gray-500 dark:text-gray-400">
                  No sales data available
                </div>
              )}
            </CardContent>
          </TabsContent>
          
          <TabsContent value="purchases" className="mt-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold dark:text-white">Purchase Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Purchase Cost</div>
                <div className="text-xl font-bold mt-1 dark:text-white">{formatCurrency(totalPurchaseCost)}</div>
              </div>
              {monthlyPurchaseData.length > 0 ? (
                <BarChartComponent data={monthlyPurchaseData} dataKey="amount" fill="#3B82F6" />
              ) : (
                <div className="flex justify-center items-center h-60 text-gray-500 dark:text-gray-400">
                  No purchase data available
                </div>
              )}
            </CardContent>
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold dark:text-white">Price History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-left">Event</th>
                      <th className="px-4 py-2 text-left">Price</th>
                      <th className="px-4 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseHistory.length > 0 ? (
                      purchaseHistory.map((item) => (
                        <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="px-4 py-2">{item.productName}</td>
                          <td className="px-4 py-2">{item.change}</td>
                          <td className="px-4 py-2">{formatCurrency(item.price)}</td>
                          <td className="px-4 py-2">{format(item.date, 'PPP')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                          No price history available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default Analytics;
