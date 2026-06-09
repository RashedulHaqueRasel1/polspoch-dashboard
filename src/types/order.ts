export interface ServiceSizes {
  A?: number;
  B?: number;
  C?: number;
  D?: number;
}

export interface Service {
  _id: string;
  templateName: string;
  serviceType: string;
  diameter: number;
  sizes: ServiceSizes;
  price: number;
  image?: string;
  material?: string;
}

export interface SelectedFeature {
  _id?: string;
  reference: string;
  size1: number | null;
  size2: number | null;
  thickness: number | null;
  finishQuality: string;
  kgsPerUnit?: number;
  miterPerUnitPrice?: number;
  unitSizes?: number[];
  length?: number[];
  minRange?: number | null;
  maxRange?: number | null;
}

export interface ProductImage {
  _id: string;
  url: string;
  publickey: string;
}

export interface ProductDetails {
  _id: string;
  productId?: {
    _id: string;
    productName: string;
    family: string;
    availabilityNote: string;
    measureUnit: string;
    unitSizeCustomizationNote: string;
    productImage: ProductImage[];
  };
  featuredId: string;
  productName: string;
  family: string;
  availabilityNote: string;
  measureUnit: string;
  minRange: number | null;
  maxRange: number | null;
  range?: number;
  unitSizeCustomizationNote: string;
  unitSize?: number;
  length?: number;
  selectedFeature?: SelectedFeature;
  createdAt: string;
  updatedAt: string;
  productImage: ProductImage[];
}

export interface CartItem {
  _id: string;
  type: "product" | "service";
  quantity: number;
  totalAmount: number;
  unitSize?: number;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
  selectedFeature?: SelectedFeature;
  product?: ProductDetails;
  service?: Service;
  serviceData?: {
    material?: string;
    thickness?: number;
    units?: number;
    serviceType?: string;
    diameter?: number;
    sizeA?: number;
    sizeB?: number;
    length?: number;
    totalLength?: number;
    totalWidth?: number;
    internalCuts?: number;
    totalWeight?: number;
    degrees?: {
      degree1?: number;
      degree2?: number;
      degree3?: number;
      degree4?: number;
      degree5?: number;
      degree6?: number;
    };
  };
  userId?: string;
  cartId?: CartItem;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
}

export interface Order {
  _id: string;
  type?: string;
  userId: User;
  cartItems: CartItem[];
  totalAmount: number;
  status: "pending" | "processing" | "completed" | "cancelled" | "failed";
  paymentStatus: "paid" | "unpaid" | "failed";
  purchaseDate: string;
  createdAt?: string;
  updatedAt?: string;
}
