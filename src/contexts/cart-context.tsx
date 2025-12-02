import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import type { CartItem, Product, ProductVariant } from "@/types"

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => Promise<void>
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  getTotal: (shippingCost?: number) => number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "techno_experience_cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        const parsed = JSON.parse(savedCart)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }
  }, [items, isLoading])

  const addItem = useCallback(async (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    if (!product.is_active) {
      toast.error("Este producto no está disponible")
      return
    }

    // Check stock
    const stock = variant?.stock_quantity ?? product.stock_quantity
    if (product.track_inventory && stock < quantity) {
      toast.error(`Solo hay ${stock} unidades disponibles`)
      return
    }

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product_id === product.id && item.variant_id === (variant?.id || undefined)
      )

      if (existingIndex >= 0) {
        // Update existing item
        const newItems = [...prevItems]
        const newQuantity = newItems[existingIndex].quantity + quantity
        if (product.track_inventory && stock < newQuantity) {
          toast.error(`Solo hay ${stock} unidades disponibles`)
          return prevItems
        }
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newQuantity,
        }
        toast.success("Producto actualizado en el carrito")
        return newItems
      } else {
        // Add new item with price snapshot
        const newItem: CartItem = {
          product_id: product.id,
          variant_id: variant?.id,
          quantity,
          attributes: variant?.attributes || {},
          price: variant?.price ?? product.price,
          name: product.name,
          image: product.main_image || product.images?.[0],
        }
        toast.success("Producto añadido al carrito")
        return [...prevItems, newItem]
      }
    })
  }, [])

  const removeItem = useCallback((productId: string, variantId?: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product_id === productId && item.variant_id === (variantId || undefined))
      )
    )
    toast.success("Producto eliminado del carrito")
  }, [])

  const updateQuantity = useCallback((productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product_id === productId && item.variant_id === variantId
          ? { ...item, quantity }
          : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
    toast.success("Carrito vaciado")
  }, [])

  // Memoizar cálculos para evitar recálculos innecesarios
  const getItemCount = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }, [items])

  const getSubtotal = useCallback(() => {
    // Calculate from items with stored prices
    return items.reduce((total, item) => {
      const price = item.price || 0
      return total + (price * item.quantity)
    }, 0)
  }, [items])

  const getTotal = useCallback((shippingCost: number = 4.99) => {
    // Use getSubtotal to ensure we're using the memoized calculation
    const subtotal = getSubtotal()
    const taxRate = 0.21 // 21% IVA
    const taxAmount = subtotal * taxRate
    return subtotal + taxAmount + shippingCost
  }, [getSubtotal])

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(
    () => ({
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        getTotal,
        isLoading,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, getItemCount, getSubtotal, getTotal, isLoading]
  )

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

