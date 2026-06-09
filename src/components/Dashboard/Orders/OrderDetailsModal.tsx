"use client";

import { Order, CartItem } from "@/types/order";
import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, ChevronLeft, Package, Settings, MapPin } from "lucide-react";
import { useGetShippingSingle } from "@/lib/hooks/useShippingSingleGet";

import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface OrderDetailsModalProps {
  order: Order;
  filterType?: "services" | "products";
}

export default function OrderDetailsModal({
  order,
  filterType,
}: OrderDetailsModalProps) {
  const { data: shippingData, isLoading: shippingLoading } =
    useGetShippingSingle(order._id);
  const allCartItems = order.cartItems || [];

  // Filter items based on the tab type
  const cartItems = filterType
    ? allCartItems.filter((item) => {
      const actualItem = item.cartId || item;
      const itemType = actualItem.type;
      if (filterType === "services") return itemType === "service";
      if (filterType === "products") return itemType === "product";
      return true;
    })
    : allCartItems;

  const cartItemCount = cartItems.length;

  // Calculate total for filtered items
  const filteredTotal = cartItems.reduce((sum, item) => {
    const actualItem = item.cartId || item;
    return sum + (actualItem.totalAmount || 0);
  }, 0);

  // Gather all images from filtered cart items
  const itemImages: string[] = [];
  cartItems.forEach((item) => {
    const actualItem = item.cartId || item;
    if (actualItem.product?.productId?.productImage) {
      actualItem.product.productId.productImage.forEach(
        (img: { url: string }) => itemImages.push(img.url),
      );
    } else if (actualItem.product?.productImage) {
      actualItem.product.productImage.forEach((img: { url: string }) =>
        itemImages.push(img.url),
      );
    } else if (actualItem.service?.image) {
      itemImages.push(actualItem.service.image);
    }
  });

  const displayImages =
    itemImages.length > 0 ? itemImages : ["/placeholder.svg"];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const activeImage = selectedImage || displayImages[0];

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => console.log("Selected Order Data:", order)}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View Details</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden max-h-[95vh] flex flex-col">
          <DialogHeader className="px-6 pt-6 border-b pb-4 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <ChevronLeft className="h-5 w-5 cursor-pointer" />
                {filterType === "services" ? "Service" : "Product"} Order
                Details
                <span className="text-sm font-mono text-muted-foreground ml-2">
                  #{order._id.slice(-6).toUpperCase()}
                </span>
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Image & Dates */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="aspect-square relative overflow-hidden rounded-lg border bg-muted">
                    <Image
                      height={600}
                      width={600}
                      src={activeImage}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {displayImages.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {displayImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(img)}
                          className={cn(
                            "relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                            activeImage === img
                              ? "border-primary opacity-100"
                              : "border-transparent opacity-60 hover:opacity-100",
                          )}
                        >
                          <Image
                            height={80}
                            width={80}
                            src={img}
                            alt={`View ${index + 1}`}
                            className="h-full w-full object-cover cursor-pointer"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <span className="text-xs text-muted-foreground block mb-1">
                      Purchase Date
                    </span>
                    <span className="text-sm font-medium">
                      {format(
                        new Date(order.purchaseDate),
                        "dd MMM yyyy, HH:mm",
                      )}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <span className="text-xs text-muted-foreground block mb-1">
                      Last Updated
                    </span>
                    <span className="text-sm font-medium">
                      {order.updatedAt
                        ? format(
                          new Date(order.updatedAt),
                          "dd MMM yyyy, HH:mm",
                        )
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                    <Settings className="h-4 w-4" /> Customer Information
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Name
                      </span>
                      <span className="text-sm font-medium">
                        {order.userId?.firstName} {order.userId?.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Email
                      </span>
                      <span className="text-sm font-medium">
                        {order.userId?.email}
                      </span>
                    </div>
                    {order.userId?.companyName && (
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Company
                        </span>
                        <span className="text-sm font-medium">
                          {order.userId.companyName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> Shipping Information
                  </h3>
                  {shippingLoading ? (
                    <div className="text-sm text-muted-foreground animate-pulse">
                      Loading shipping details...
                    </div>
                  ) : shippingData ? (
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Receiver
                        </span>
                        <span className="text-sm font-medium">
                          {shippingData.fullName}
                        </span>
                      </div>
                      {shippingData.company && (
                        <div>
                          <span className="text-xs text-muted-foreground block">
                            Company
                          </span>
                          <span className="text-sm font-medium">
                            {shippingData.company}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Address
                        </span>
                        <span className="text-sm font-medium">
                          {shippingData.street}, {shippingData.city},{" "}
                          {shippingData.province} {shippingData.postalCode},{" "}
                          {shippingData.country}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs text-muted-foreground block">
                            Phone
                          </span>
                          <span className="text-sm font-medium">
                            {shippingData.phone}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">
                            Email
                          </span>
                          <span className="text-sm font-medium">
                            {shippingData.email}
                          </span>
                        </div>
                      </div>
                      {shippingData.deliveryInstructions && (
                        <div>
                          <span className="text-xs text-muted-foreground block">
                            Instructions
                          </span>
                          <p className="text-xs mt-1 text-muted-foreground bg-muted/50 p-2 rounded">
                            {shippingData.deliveryInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      No shipping information available
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Order Items */}
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Package className="h-4 w-4" /> {filterType || "Order"} Items
                  ({cartItemCount})
                </h3>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                  {cartItems.map((item: CartItem) => {
                    const actualItem = item.cartId || item;
                    const isProduct = actualItem.type === "product";
                    const itemName = isProduct
                      ? actualItem.product?.productId?.productName ||
                      actualItem.product?.productName
                      : actualItem.serviceData?.serviceType ||
                      actualItem.service?.templateName;

                    const itemData: Record<
                      string,
                      string | number | undefined
                    > = isProduct
                        ? {
                          ...(actualItem.product?.productId?.family ||
                            actualItem.product?.family
                            ? {
                              Family:
                                actualItem.product?.productId?.family ||
                                actualItem.product?.family,
                            }
                            : {}),
                          "Product Name":
                            actualItem.product?.productId?.productName ||
                            actualItem.product?.productName ||
                            "Custom Product",
                          ...(actualItem.product?.unitSize !== null &&
                            actualItem.product?.unitSize !== undefined
                            ? {
                              "Unit Size": `${actualItem.product?.unitSize} ${actualItem.product?.productId?.measureUnit ||
                                actualItem.product?.measureUnit ||
                                ""
                                }`,
                            }
                            : {}),

                          ...(actualItem.product?.productId
                            ?.unitSizeCustomizationNote ||
                            actualItem.product?.unitSizeCustomizationNote
                            ? {
                              "Customization Note":
                                actualItem.product?.productId
                                  ?.unitSizeCustomizationNote ||
                                actualItem.product?.unitSizeCustomizationNote,
                            }
                            : {}),
                          ...(actualItem.product?.productId?.availabilityNote
                            ? {
                              Availability:
                                actualItem.product.productId.availabilityNote,
                            }
                            : {}),
                          ...(actualItem.product?.selectedFeature?.reference
                            ? {
                              Reference:
                                actualItem.product.selectedFeature.reference,
                            }
                            : {}),
                          ...(actualItem.product?.selectedFeature?.size1 !==
                            null &&
                            actualItem.product?.selectedFeature?.size1 !==
                            undefined
                            ? {
                              Dimensions: `${actualItem.product.selectedFeature.size1}${actualItem.product.selectedFeature.size2 !==
                                null &&
                                actualItem.product.selectedFeature.size2 !==
                                undefined
                                ? ` x ${actualItem.product.selectedFeature.size2}`
                                : ""
                                }mm`,
                            }
                            : {}),
                          ...(actualItem.product?.selectedFeature?.thickness !==
                            null &&
                            actualItem.product?.selectedFeature?.thickness !==
                            undefined
                            ? {
                              Thickness: `${actualItem.product.selectedFeature.thickness}mm`,
                            }
                            : {}),
                          ...(actualItem.product?.selectedFeature?.finishQuality
                            ? {
                              "Finish Quality":
                                actualItem.product.selectedFeature
                                  .finishQuality,
                            }
                            : {}),
                          ...(actualItem.product?.selectedFeature?.unitSizes &&
                            actualItem.product?.selectedFeature?.unitSizes
                              .length > 0
                            ? {
                              "Unit Sizes":
                                actualItem.product.selectedFeature.unitSizes.join(
                                  ", ",
                                ),
                            }
                            : {}),
                          ...(actualItem.product?.selectedFeature
                            ?.kgsPerUnit !== null &&
                            actualItem.product?.selectedFeature?.kgsPerUnit !==
                            undefined
                            ? {
                              "Kgs per Unit": `${actualItem.product.selectedFeature.kgsPerUnit}kg`,
                            }
                            : {}),

                          ...(actualItem.product?.length !== null &&
                            actualItem.product?.length !== undefined
                            ? {
                              "Length": `${actualItem.product?.length} ${actualItem.product?.productId?.measureUnit ||
                                actualItem.product?.measureUnit ||
                                ""
                                }`,
                            }
                            : {}),

                          ...(actualItem.product?.selectedFeature
                            ?.miterPerUnitPrice !== null &&
                            actualItem.product?.selectedFeature
                              ?.miterPerUnitPrice !== undefined
                            ? {
                              "Miter Per Unit Price": `€${actualItem.product.selectedFeature.miterPerUnitPrice}`,
                            }
                            : {}),
                          ...(actualItem.product?.selectedFeature?.minRange !==
                            null &&
                            actualItem.product?.selectedFeature?.minRange !==
                            undefined &&
                            actualItem.product?.selectedFeature?.maxRange !==
                            null &&
                            actualItem.product?.selectedFeature?.maxRange !==
                            undefined
                            ? {
                              Range: `${actualItem.product.selectedFeature.minRange} - ${actualItem.product.selectedFeature.maxRange}mm`,
                            }
                            : actualItem.product?.selectedFeature?.maxRange !==
                              null &&
                              actualItem.product?.selectedFeature
                                ?.maxRange !== undefined
                              ? {
                                Range: `Up to ${actualItem.product.selectedFeature.maxRange}mm`,
                              }
                              : actualItem.product?.range
                                ? { Range: actualItem.product.range }
                                : {}),
                          Quantity: actualItem.quantity || 1,
                          "Total Amount": actualItem.totalAmount
                            ? `€${actualItem.totalAmount.toLocaleString()}`
                            : "Pending Calculation",
                        }
                        : actualItem.serviceData
                          ? // New serviceData structure
                          {
                            "Service Type":
                              actualItem.serviceData.serviceType ||
                              "Custom Service",
                            Material:
                              actualItem.serviceData.material ||
                              "Standard Material",
                            ...(actualItem.serviceData.thickness !==
                              undefined && {
                              "Thickness (mm)":
                                actualItem.serviceData.thickness,
                            }),
                            ...(actualItem.serviceData.diameter !==
                              undefined && {
                              "Diameter (mm)": actualItem.serviceData.diameter,
                            }),
                            Units: actualItem.serviceData.units || "As Ordered",
                            ...(actualItem.serviceData.sizeA !== undefined && {
                              "Size A": actualItem.serviceData.sizeA,
                            }),
                            ...(actualItem.serviceData.sizeB !== undefined && {
                              "Size B": actualItem.serviceData.sizeB,
                            }),
                            ...(actualItem.serviceData.length !== undefined && {
                              Length: actualItem.serviceData.length,
                            }),
                            ...(actualItem.serviceData.totalLength !==
                              undefined && {
                              "Total Length":
                                actualItem.serviceData.totalLength,
                            }),
                            ...(actualItem.serviceData.totalWidth !==
                              undefined && {
                              "Total Width": actualItem.serviceData.totalWidth,
                            }),
                            ...(actualItem.serviceData.internalCuts !==
                              undefined && {
                              "Internal Cuts":
                                actualItem.serviceData.internalCuts,
                            }),
                            ...(actualItem.serviceData.totalWeight !==
                              undefined && {
                              "Total Weight (kg)":
                                actualItem.serviceData.totalWeight.toFixed(2),
                            }),
                            ...(actualItem.serviceData.degrees && {
                              Degrees:
                                Object.entries(actualItem.serviceData.degrees)
                                  .filter(
                                    ([, v]) =>
                                      v !== 0 && v !== undefined && v !== null,
                                  )
                                  .map(([k, v]) => `${k}: ${v}°`)
                                  .join(", ") || "Standard Angle",
                            }),
                            Quantity: actualItem.quantity || 1,
                            "Total Amount": actualItem.totalAmount
                              ? `€${actualItem.totalAmount.toLocaleString()}`
                              : "Pending Calculation",
                          }
                          : // Old service structure (fallback)
                          {
                            "Service Name": itemName || "Custom Service",
                            "Service Type":
                              actualItem.service?.serviceType ||
                              "General Service",
                            Diameter:
                              actualItem.service?.diameter || "Standard Size",
                            Material:
                              actualItem.service?.material ||
                              "Standard Material",
                            "Price per Unit": actualItem.service?.price
                              ? `€${actualItem.service.price}`
                              : "Contact for Quote",
                            "Dimension Sizes": actualItem.service?.sizes
                              ? Object.entries(actualItem.service.sizes)
                                .filter(
                                  ([, v]) =>
                                    v !== 0 && v !== undefined && v !== null,
                                )
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ")
                              : "Custom Dimensions",
                            Quantity: actualItem.quantity || 1,
                            "Total Amount": actualItem.totalAmount
                              ? `€${actualItem.totalAmount.toLocaleString()}`
                              : "Pending Calculation",
                          };

                    return (
                      <div
                        key={actualItem._id}
                        className="rounded-lg border bg-muted/30 overflow-hidden p-3"
                      >
                        <div className="mb-2 font-bold text-sm flex justify-between items-center">
                          <span>{itemName || "Item"}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                            {actualItem.type}
                          </span>
                        </div>
                        <table className="w-full text-[12px] border-collapse">
                          <tbody>
                            {Object.entries(itemData).map(([key, value]) => (
                              <tr
                                key={key}
                                className="border-b border-muted last:border-b-0"
                              >
                                <td className="py-1 px-2 font-medium text-muted-foreground w-1/2">
                                  {key}
                                </td>
                                <td className="py-1 px-2 font-semibold">
                                  {value}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 p-6 border-t bg-muted/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                {filterType ? `${filterType.slice(0, -1)}s` : "Order"} Total:
              </span>
              <span className="text-3xl font-bold text-primary">
                €{filteredTotal.toLocaleString()}
              </span>
            </div>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Close Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
