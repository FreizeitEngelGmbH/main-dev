import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  id: number;
  experienceId: number;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  partnerName?: string;
  partnerId?: number;
}

export type CartStep = 'cart' | 'checkout' | 'success';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  step: CartStep;
  addToCart: (item: Omit<CartItem, "id" | "quantity">) => void;
  removeFromCart: (experienceId: number) => void;
  updateQuantity: (experienceId: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setStep: (step: CartStep) => void;
  goToCheckout: () => void;
  goToCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<CartStep>('cart');

  const addToCart = (item: Omit<CartItem, "id" | "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.experienceId === item.experienceId);
      if (existing) {
        return prev.map((i) =>
          i.experienceId === item.experienceId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, id: Date.now(), quantity: 1 }];
    });
    setStep('cart');
    setIsOpen(true);
  };

  const removeFromCart = (experienceId: number) => {
    setItems((prev) => prev.filter((i) => i.experienceId !== experienceId));
  };

  const updateQuantity = (experienceId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(experienceId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.experienceId === experienceId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setStep('cart');
  };
  const openCart = () => setIsOpen(true);
  const closeCart = () => {
    setIsOpen(false);
    if (step === 'success') {
      setStep('cart');
      setItems([]);
    }
  };
  const toggleCart = () => setIsOpen((prev) => !prev);
  const goToCheckout = () => setStep('checkout');
  const goToCart = () => setStep('cart');

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        step,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        setStep,
        goToCheckout,
        goToCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
