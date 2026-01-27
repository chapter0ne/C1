
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, ShoppingCart, ArrowLeft, BookOpen } from "lucide-react";
import UniversalHeader from "@/components/UniversalHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import BookCard from "@/components/BookCard";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Cart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { cart, isLoading, removeFromCart, checkout } = useCart(user?.id || '');
  
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
    return sum + book.price; // Remove quantity multiplication since users can only buy one copy
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


  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one book to purchase.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.email) {
      toast({
        title: "Email Required",
        description: "Please ensure your account has a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsCheckingOut(true);
    try {
      // Initialize Nomba checkout - this will redirect to Nomba payment page
      await checkout.mutateAsync({
        selectedItems,
        userEmail: user.email,
        totalAmount
      });
      
      // Note: User will be redirected to Nomba payment page
      // Success notification will be shown after payment verification on return
      // Don't show success toast here - payment hasn't been completed yet
      
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : "There was an error processing your purchase. Please try again.";
      
      if (errorMessage.includes('cancelled')) {
        toast({
          title: "Payment Cancelled",
          description: "You cancelled the payment process.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
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
            <div className="flex flex-col h-full">
              {/* Cart Items - Scrollable */}
              <div className="flex-1 overflow-y-auto pb-4">
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
                                {/* Book Cover - Clickable */}
                                <Link 
                                  to={`/book/${book._id || book.id}`}
                                  className="w-16 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                  {book.coverImageUrl ? (
                                    <img 
                                      src={book.coverImageUrl} 
                                      alt={book.title}
                                      className="w-full h-full object-cover rounded"
                                    />
                                  ) : (
                                    book.title.charAt(0)
                                  )}
                                </Link>

                                {/* Book Details */}
                                <div className="flex-1 min-w-0">
                                  <Link 
                                    to={`/book/${book._id || book.id}`}
                                    className="block cursor-pointer hover:text-[#D01E1E] transition-colors"
                                  >
                                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                      {book.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2 truncate">by {book.author}</p>
                                  </Link>
                                  <p className="text-lg font-bold text-[#D01E1E]">
                                    ₦{book.price?.toLocaleString() || '0'}
                                  </p>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center justify-end mt-4">
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

              {/* Order Summary - Fixed at Bottom */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Selected Items:</span>
                        <span>{selectedItems.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>₦{totalAmount.toLocaleString()}</span>
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
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Checkout ({selectedItems.length} items)
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Secure payment powered by Nomba
                    </p>
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
