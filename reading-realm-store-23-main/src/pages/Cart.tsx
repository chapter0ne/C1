
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, ShoppingCart, CreditCard, ArrowLeft, BookOpen, CheckCircle } from "lucide-react";
import UniversalHeader from "@/components/UniversalHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import BookCard from "@/components/BookCard";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Cart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { cart, isLoading, removeFromCart, updateCartItemQuantity, checkout } = useCart(user?.id || '');
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Debug cart data
  console.log('Cart data received:', cart);
  console.log('Cart items:', cart?.items);
  console.log('Cart items type:', typeof cart?.items);
  console.log('Is cart.items array?', Array.isArray(cart?.items));

  // Safety check for cart data
  if (!cart || !Array.isArray(cart.items)) {
    console.warn('Cart data is malformed:', cart);
    // Return early with error state if cart is malformed
    return (
      <div className="min-h-screen bg-white">
        <UniversalHeader currentPage="cart" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Cart Error</h3>
            <p className="text-gray-600 mb-6">
              There was an issue loading your cart. Please refresh the page.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-[#D01E1E] hover:bg-[#B01818]"
            >
              Refresh Page
            </Button>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  // Calculate totals
  const cartItems = cart?.items || [];
  const selectedBooks = cartItems.filter((item: any) => selectedItems.includes(item.book._id || item.book.id));
  const totalAmount = selectedBooks.reduce((sum: number, item: any) => {
    const book = item.book;
    return sum + (book.price * item.quantity);
  }, 0);

  const handleSelectItem = (itemId: string, selected: boolean) => {
    if (selected) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedItems(cartItems.map((item: any) => item.book._id || item.book.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleRemoveItem = async (bookId: string) => {
    try {
      await removeFromCart.mutateAsync(bookId);
      setSelectedItems(selectedItems.filter(id => id !== bookId));
      toast({
        title: "Removed from Cart",
        description: "Book has been removed from your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove book from cart.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateQuantity = async (bookId: string, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      await updateCartItemQuantity.mutateAsync({ bookId, quantity });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity.",
        variant: "destructive"
      });
    }
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one book to purchase.",
        variant: "destructive"
      });
      return;
    }

    setIsCheckingOut(true);
    try {
      // Initialize Paystack checkout
      const paystackResponse = await checkout.mutateAsync({
        selectedItems,
        userEmail: user?.email || '',
        totalAmount
      });
      
      if (paystackResponse?.data?.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = paystackResponse.data.authorization_url;
      } else {
        throw new Error('Payment initialization failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "There was an error processing your purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <UniversalHeader currentPage="cart" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D01E1E] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UniversalHeader currentPage="cart" />
      
      <div className="flex-1 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/explore" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            </div>
            <p className="text-gray-600">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">
                Start adding books to your cart to continue shopping
              </p>
              <Link to="/explore">
                <Button className="bg-[#D01E1E] hover:bg-[#B01818]">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Books
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                {/* Select All */}
                <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
                  <Checkbox
                    checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">
                    Select All ({cartItems.length} items)
                  </span>
                </div>

                {/* Cart Items List */}
                <div className="space-y-4">
                  {cartItems.map((item: any) => {
                    const book = item.book;
                    const isSelected = selectedItems.includes(book._id || book.id);
                    
                    return (
                      <Card key={item._id || item.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {/* Selection Checkbox */}
                            <div className="flex items-start pt-2">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => 
                                  handleSelectItem(book._id || book.id, checked as boolean)
                                }
                              />
                            </div>

                            {/* Book Info */}
                            <div className="flex-1">
                              <div className="flex gap-4">
                                {/* Book Cover */}
                                <div className="w-16 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {book.coverImageUrl ? (
                                    <img 
                                      src={book.coverImageUrl} 
                                      alt={book.title}
                                      className="w-full h-full object-cover rounded"
                                    />
                                  ) : (
                                    book.title.charAt(0)
                                  )}
                                </div>

                                {/* Book Details */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                    {book.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-2 truncate">by {book.author}</p>
                                  <p className="text-lg font-bold text-[#D01E1E]">
                                    ₦{book.price?.toLocaleString() || '0'}
                                  </p>
                                </div>
                              </div>

                              {/* Quantity and Actions */}
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">Quantity:</span>
                                  <div className="flex items-center border rounded">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleUpdateQuantity(book._id || book.id, item.quantity - 1)}
                                      disabled={item.quantity <= 1}
                                      className="px-2"
                                    >
                                      -
                                    </Button>
                                    <span className="px-3 py-1 text-sm font-medium">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleUpdateQuantity(book._id || book.id, item.quantity + 1)}
                                      className="px-2"
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveItem(book._id || book.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span>Selected Items:</span>
                        <span>{selectedItems.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>₦{totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Processing Fee:</span>
                        <span>₦0</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>₦{totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      disabled={selectedItems.length === 0 || isCheckingOut}
                      className="w-full bg-[#D01E1E] hover:bg-[#B01818]"
                      size="lg"
                    >
                      {isCheckingOut ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Checkout ({selectedItems.length} items)
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Secure payment powered by Paystack
                    </p>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm font-medium">Payment Methods</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Credit/Debit Cards, Bank Transfer, USSD, Mobile Money
                      </p>
                    </div>
                    
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Lifetime Access</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Once purchased, you have permanent access to these books
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Cart;
