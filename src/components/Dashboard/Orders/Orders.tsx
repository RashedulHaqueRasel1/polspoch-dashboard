"use client";
import React, { useState, useMemo } from "react";
import { useOrders, useDeleteOrders } from "@/lib/hooks/useOrders";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Trash2, RotateCcw } from "lucide-react";
import OrderDetailsModal from "./OrderDetailsModal";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order } from "@/types/order";
// import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ITEMS_PER_PAGE = 8;

export default function Orders() {
  const { data: orders = [], isLoading, error } = useOrders();
  console.log(orders);
  const deleteMutation = useDeleteOrders();
  const [activeTab, setActiveTab] = useState("services");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Filter orders based on item types in their cart
  const filteredOrders = useMemo(() => {
    if (activeTab === "services") {
      return orders.filter((order: Order) =>
        order.cartItems?.some((item) => {
          const actualItem = item.cartId || item;
          return actualItem.type === "service";
        }),
      );
    } else {
      return orders.filter((order: Order) =>
        order.cartItems?.some((item) => {
          const actualItem = item.cartId || item;
          return actualItem.type === "product";
        }),
      );
    }
  }, [orders, activeTab]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
    setSelectedOrderIds([]);
  };

  /*
    const toggleSelectAll = () => {
      if (selectedOrderIds.length === currentOrders.length) {
        setSelectedOrderIds([]);
      } else {
        setSelectedOrderIds(currentOrders.map((o) => o._id));
      }
    };
  
    const toggleSelectOrder = (id: string) => {
      setSelectedOrderIds((prev) =>
        prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id],
      );
    };
  */

  const handleDelete = async () => {
    if (selectedOrderIds.length === 0) return;
    try {
      await deleteMutation.mutateAsync(selectedOrderIds);
      setSelectedOrderIds([]);
      setIsDeleteDialogOpen(false);
    } catch {
      // Error handled in hook toast
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="border border-gray-300 p-6 rounded-md shadow-sm">
          <Skeleton className="w-48 h-8 mb-4" />
          <Skeleton className="w-64 h-4 mb-8" />
          <Skeleton className="w-full h-12 mb-4" />
          <Skeleton className="w-full h-10 mb-4" />
          <Skeleton className="w-full h-10 mb-4" />
          <Skeleton className="w-full h-10 mb-4" />
          <Skeleton className="w-full h-10 mb-4" />
          <Skeleton className="w-20 h-8" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">Failed to load orders.</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage and view customer orders
          </p>
        </div>
        {selectedOrderIds.length > 0 && (
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2 shadow-sm animate-in fade-in slide-in-from-right-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedOrderIds.length})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete{" "}
                  {selectedOrderIds.length} selected order(s) from the system.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6 cu"
      >
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="services" className="cursor-pointer">
              Services
            </TabsTrigger>
            <TabsTrigger value="products" className="cursor-pointer">
              Products
            </TabsTrigger>
          </TabsList>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedOrderIds([])}
            className={cn(
              "text-muted-foreground",
              selectedOrderIds.length === 0 && "opacity-0 pointer-events-none",
            )}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Selection
          </Button>
        </div>

        <TabsContent value={activeTab} className="space-y-6 border-none p-0 cu">
          <div className="rounded-md border bg-card shadow-sm overflow-hidden">
            <div className="relative w-full overflow-auto">
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No {activeTab} orders found.
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      {/* <th className="h-12 px-4 w-[50px]">
                        <Checkbox
                          checked={
                            selectedOrderIds.length === currentOrders.length &&
                            currentOrders.length > 0
                          }
                          onCheckedChange={toggleSelectAll}
                        />
                      </th> */}
                      <th className="h-12 px-4 text-muted-foreground whitespace-nowrap">
                        Order ID
                      </th>
                      <th className="h-12 px-4 text-muted-foreground whitespace-nowrap">
                        Customer
                      </th>
                      <th className="h-12 px-4 text-muted-foreground whitespace-nowrap">
                        {activeTab === "services"
                          ? "Service Details"
                          : "Product Details"}
                      </th>
                      <th className="h-12 px-4 text-muted-foreground whitespace-nowrap">
                        Date
                      </th>
                      <th className="h-12 px-4 text-right text-muted-foreground whitespace-nowrap">
                        Total
                      </th>
                      <th className="h-12 px-4 text-center text-muted-foreground whitespace-nowrap">
                        Payment Status
                      </th>
                      <th className="h-12 px-4 text-center text-muted-foreground whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentOrders.map((order) => {
                      const { paymentStatus } = order;
                      const isSelected = selectedOrderIds.includes(order._id);
                      let displayTitle = "Unknown Item";
                      const cartItems = order.cartItems || [];

                      // Filter items of the current tab type to show in title
                      const relevantItems = cartItems.filter((item) => {
                        const actualItem = item.cartId || item;
                        return (
                          (activeTab === "services" &&
                            actualItem.type === "service") ||
                          (activeTab === "products" &&
                            actualItem.type === "product")
                        );
                      });

                      if (relevantItems.length > 0) {
                        const firstItemRaw = relevantItems[0];
                        const firstItem = firstItemRaw.cartId || firstItemRaw;

                        const itemName =
                          firstItem?.type === "product"
                            ? // Handle potential nested productId structure
                            firstItem.product?.productId?.productName ||
                            firstItem.product?.productName
                            : firstItem?.service?.templateName;

                        if (relevantItems.length === 1) {
                          displayTitle = itemName || "Order Item";
                        } else {
                          displayTitle = `${itemName || "Item"} + ${relevantItems.length - 1} more`;
                        }
                      }

                      return (
                        <tr
                          key={order._id}
                          className={cn(
                            "border-b transition-colors",
                            isSelected
                              ? "bg-primary/5 hover:bg-primary/10"
                              : "hover:bg-muted/50",
                          )}
                        >
                          {/* <td className="p-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggleSelectOrder(order._id)
                              }
                            />
                          </td> */}
                          <td className="p-4 font-mono font-medium whitespace-nowrap">
                            #{order._id.slice(-6).toUpperCase()}
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-[10px]">
                                  {(order.userId?.firstName?.slice(0, 1) ||
                                    "") +
                                    (
                                      order.userId?.lastName?.slice(0, 1) || ""
                                    ).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="font-medium truncate max-w-[150px]">
                                  {order.userId?.firstName}{" "}
                                  {order.userId?.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {order.userId?.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 max-w-[200px]">
                            <div className="truncate font-medium">
                              {displayTitle}
                            </div>
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            {format(
                              new Date(order.purchaseDate),
                              "dd MMM yyyy",
                            )}
                          </td>

                          <td className="p-4 text-right font-medium whitespace-nowrap">
                            €{order.totalAmount.toLocaleString()}
                          </td>

                          <td className="p-4 text-center">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "capitalize shadow-none border-none text-[10px] h-5",
                                paymentStatus === "paid" &&
                                "bg-green-100 text-green-700 hover:bg-green-100",
                                paymentStatus === "unpaid" &&
                                "bg-red-100 text-red-700 hover:bg-red-100",
                                paymentStatus === "failed" &&
                                "bg-red-100 text-red-700 hover:bg-red-100",
                              )}
                            >
                              {paymentStatus}
                            </Badge>
                          </td>

                          <td className="p-4 text-center">
                            <OrderDetailsModal
                              order={order}
                              filterType={activeTab as "services" | "products"}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
