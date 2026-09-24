import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import logoImage from "@assets/FreizeitEngel_Logo.jpg";
import { 
  Menu, 
  Search,
  User, 
  LogOut, 
  Settings, 
  Compass, 
  ClipboardList,
  Heart,
  ShoppingCart,
  MapPin,
  HelpCircle,
  ChevronDown,
  Gift,
  Cake,
  GlassWater,
  Diamond,
  Sparkles,
  Tag,
  Users,
  Briefcase,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle2,
  Mail,
  CreditCard,
  Flame,
  Waves,
  Trophy,
  Gamepad2,
  Baby,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  TreePine,
  Clapperboard,
  Target,
  Sailboat,
  Mountain,
  MessageCircle,
  BookOpen
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/partner/queryClient";
import { resolveCategoryRoute } from "@/lib/activity-route-resolver";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const { items, isOpen: cartOpen, step, openCart, closeCart, removeFromCart, updateQuantity, totalItems, totalPrice, goToCheckout, goToCart, setStep, clearCart } = useCart();
  const [location, setLocation] = useLocation();
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("14:00");
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [isProcessing, setIsProcessing] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");

  const handleHeaderSearch = (query: string) => {
    if (query.trim()) {
      setLocation(`/search?query=${encodeURIComponent(query.trim())}`);
      setHeaderSearchQuery("");
      setIsOpen(false);
    }
  };
  const [bookingNumber, setBookingNumber] = useState("");

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleCompleteBooking = async () => {
    if (!guestEmail || !guestName || !bookingDate) return;
    
    setIsProcessing(true);
    try {
      const bookingNum = `FE-${Date.now().toString().slice(-6)}`;
      setBookingNumber(bookingNum);
      
      const bookingDateTime = new Date(`${bookingDate}T${bookingTime}:00`).toISOString();
      
      for (const item of items) {
        const response = await apiRequest("POST", "/api/bookings", {
          experienceId: item.experienceId,
          contactName: guestName,
          contactEmail: guestEmail,
          date: bookingDateTime,
          paymentMethod: paymentMethod,
          bookingDetails: {
            parameters: {
              quantity: item.quantity,
              time: bookingTime
            }
          }
        });
        
        if (!response.ok) {
          throw new Error("Booking failed");
        }
      }
      
      setStep('success');
      setGuestEmail("");
      setGuestName("");
      setBookingDate("");
      setBookingTime("14:00");
      setPaymentMethod("paypal");
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top Bar - Purple like Flaschenpost */}
      <div className="bg-[hsl(258,80%,55%)] text-white py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-medium">Deutschland</span>
            </div>
            <span className="text-purple-300">•</span>
            <span className="text-xs">Buchung ab 5€ möglich</span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-xs">
            <Link href="/search" className="hover:text-purple-200 transition flex items-center gap-1">
              <Search className="h-3.5 w-3.5" />
            </Link>
            <Link href="/partner" className="hover:text-purple-200 transition font-medium">
              Partner werden
            </Link>
            <Link href="/about" className="hover:text-purple-200 transition">
              Über uns
            </Link>
            <Link href="/faq" className="hover:text-purple-200 transition">
              Hilfe
            </Link>
            <Link href="/lexikon" className="hover:text-purple-200 transition">
              Ratgeber
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header - Compact like Flaschenpost */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Compact */}
          <Link href="/home" className="flex-shrink-0">
            <div className="flex items-center">
              <img src={logoImage} alt="FreizeitEngel Logo" className="h-20 w-auto object-contain" />
            </div>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1">
            {/* Navigation Links - Compact */}
            <div className="hidden lg:flex items-center space-x-2 mr-4">
              <Link href="/search">
                <Button variant="ghost" size="sm" className="text-xs font-medium text-gray-700 hover:text-[hsl(258,80%,55%)] h-8 px-3">
                  Erlebnisse
                </Button>
              </Link>
              <Link href="/brands">
                <Button variant="ghost" size="sm" className="text-xs font-medium text-gray-700 hover:text-[hsl(258,80%,55%)] h-8 px-3">
                  Partner
                </Button>
              </Link>
            </div>

            <Link href="/favorites">
              <Button variant="ghost" size="sm" className="text-xs font-medium text-gray-700 hover:text-[hsl(258,80%,55%)] h-8 px-3 relative">
                Favoriten
                <Badge className="absolute -top-1 -right-1 bg-[hsl(258,80%,55%)] text-white text-xs px-1 py-0 rounded-full min-w-4 h-4 flex items-center justify-center">
                  0
                </Badge>
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-xs font-medium text-gray-700 hover:text-[hsl(258,80%,55%)] h-8 px-3">
                    <span className="hidden sm:inline">Konto</span>
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="bg-[hsl(258,80%,55%)] text-white text-xs">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Mein Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile?tab=bookings" className="flex items-center">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Meine Buchungen
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      Favoriten
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'partner' && (
                    <DropdownMenuItem asChild>
                      <Link href="/partner/dashboard" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Partner-Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin-Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button size="sm" className="bg-[hsl(258,80%,55%)] hover:bg-[hsl(258,80%,48%)] text-white text-xs h-8 px-3">
                  Anmelden
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Sheet open={cartOpen} onOpenChange={(open) => open ? openCart() : closeCart()}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
                  <ShoppingCart className="h-4 w-4" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-[hsl(258,80%,55%)] text-white text-xs px-1 py-0 rounded-full min-w-4 h-4 flex items-center justify-center">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
                {step === 'cart' && (
                  <>
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Warenkorb ({totalItems})
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto py-4">
                      {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <ShoppingCart className="h-12 w-12 mb-4 opacity-30" />
                          <p>Dein Warenkorb ist leer</p>
                          <p className="text-sm mt-1">Füge Tickets hinzu, um zu buchen</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {items.map((item) => (
                            <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                              {item.imageUrl && (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.title}
                                  className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{item.title}</h4>
                                {item.partnerName && (
                                  <p className="text-xs text-gray-500">{item.partnerName}</p>
                                )}
                                <p className="text-[hsl(258,80%,55%)] font-semibold text-sm mt-1">
                                  {item.price.toFixed(2)}€
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 w-7 p-0"
                                    onClick={() => updateQuantity(item.experienceId, item.quantity - 1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 w-7 p-0"
                                    onClick={() => updateQuantity(item.experienceId, item.quantity + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 w-7 p-0 ml-auto text-red-500 hover:text-red-700"
                                    onClick={() => removeFromCart(item.experienceId)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {items.length > 0 && (
                      <>
                        <Separator />
                        <div className="py-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Gesamt:</span>
                            <span className="text-xl font-bold text-[hsl(258,80%,55%)]">{totalPrice.toFixed(2)}€</span>
                          </div>
                          <Button 
                            className="w-full bg-[hsl(258,80%,55%)] hover:bg-[hsl(258,80%,48%)]"
                            onClick={goToCheckout}
                          >
                            Zur Buchung
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {step === 'checkout' && (
                  <>
                    <SheetHeader>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={goToCart}>
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <SheetTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Checkout
                        </SheetTitle>
                      </div>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto py-4 space-y-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-3">Zusammenfassung</h4>
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm py-1">
                            <span>{item.title} x{item.quantity}</span>
                            <span className="font-medium">{(item.price * item.quantity).toFixed(2)}€</span>
                          </div>
                        ))}
                        <Separator className="my-3" />
                        <div className="flex justify-between font-bold">
                          <span>Gesamt:</span>
                          <span className="text-[hsl(258,80%,55%)]">{totalPrice.toFixed(2)}€</span>
                        </div>
                      </div>

                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="guestName">Name *</Label>
                        <Input 
                          id="guestName"
                          placeholder="Max Mustermann"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          data-testid="input-checkout-name"
                        />
                      </div>

                      {/* E-Mail */}
                      <div className="space-y-2">
                        <Label htmlFor="guestEmail">E-Mail *</Label>
                        <Input 
                          id="guestEmail"
                          type="email"
                          placeholder="max@beispiel.de"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          data-testid="input-checkout-email"
                        />
                      </div>

                      {/* Datum */}
                      <div className="space-y-2">
                        <Label htmlFor="bookingDate">Datum *</Label>
                        <Input 
                          id="bookingDate"
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          data-testid="input-checkout-date"
                        />
                      </div>

                      {/* Uhrzeit */}
                      <div className="space-y-2">
                        <Label htmlFor="bookingTime">Uhrzeit</Label>
                        <Select value={bookingTime} onValueChange={setBookingTime}>
                          <SelectTrigger data-testid="select-checkout-time">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map(time => (
                              <SelectItem key={time} value={time}>{time} Uhr</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Zahlungsart */}
                      <div className="space-y-2">
                        <Label>Zahlungsart</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                            className={paymentMethod === 'paypal' ? 'bg-[hsl(258,80%,55%)] hover:bg-[hsl(258,80%,48%)]' : ''}
                            onClick={() => setPaymentMethod('paypal')}
                            data-testid="btn-payment-paypal"
                          >
                            PayPal
                          </Button>
                          <Button
                            type="button"
                            variant={paymentMethod === 'vor_ort' ? 'default' : 'outline'}
                            className={paymentMethod === 'vor_ort' ? 'bg-[hsl(258,80%,55%)] hover:bg-[hsl(258,80%,48%)]' : ''}
                            onClick={() => setPaymentMethod('vor_ort')}
                            data-testid="btn-payment-vor-ort"
                          >
                            Vor Ort
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">
                        Du erhältst deine Tickets per E-Mail.
                      </p>
                    </div>

                    <Separator />
                    <div className="py-4">
                      <Button 
                        className="w-full bg-[hsl(258,80%,55%)] hover:bg-[hsl(258,80%,48%)]"
                        onClick={handleCompleteBooking}
                        disabled={!guestEmail || !guestName || !bookingDate || isProcessing}
                        data-testid="btn-complete-booking"
                      >
                        {isProcessing ? "Wird bearbeitet..." : `${totalPrice.toFixed(2)}€ - Jetzt buchen`}
                      </Button>
                      <p className="text-xs text-center text-gray-500 mt-2">
                        Mit der Buchung stimmst du unseren AGB zu.
                      </p>
                    </div>
                  </>
                )}

                {step === 'success' && (
                  <>
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        Buchung erfolgreich!
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Vielen Dank!</h3>
                      <p className="text-gray-600 mb-4">
                        Deine Buchung wurde erfolgreich abgeschlossen.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4 w-full max-w-xs">
                        <p className="text-sm text-gray-500">Buchungsnummer</p>
                        <p className="font-bold text-lg">{bookingNumber}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-4">
                        Du erhältst deine Tickets per E-Mail.
                      </p>
                    </div>

                    <div className="py-4">
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={() => {
                          clearCart();
                          closeCart();
                        }}
                      >
                        Schließen
                      </Button>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="!p-0 overflow-hidden">
                  <div className="flex flex-col h-full max-h-screen">
                  <div className="px-6 pt-6 pb-4 border-b shrink-0">
                  <SheetHeader>
                    <SheetTitle className="flex items-center">
                      <img src={logoImage} alt="FreizeitEngel Logo" className="h-20 w-auto object-contain" />
                    </SheetTitle>
                  </SheetHeader>
                  </div>
                  <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div className="flex flex-col space-y-4">
                    {/* Mobile Search */}
                    <form className="relative mb-4" onSubmit={(e) => { e.preventDefault(); handleHeaderSearch(headerSearchQuery); }}>
                      <Input
                        type="text"
                        placeholder="Was suchst Du?"
                        value={headerSearchQuery}
                        onChange={(e) => setHeaderSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border-gray-300 rounded-md focus:ring-[hsl(258,80%,55%)] focus:border-[hsl(258,80%,55%)] bg-gray-50 focus:bg-white"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer" onClick={() => handleHeaderSearch(headerSearchQuery)} />
                    </form>
                    
                    <Link href="/search" 
                      className="flex items-center text-sm font-medium text-gray-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <Compass className="mr-2 h-5 w-5" />
                      Alle Erlebnisse
                    </Link>

                    {/* Mobile Kategorien */}
                    <div className="border-t border-b border-gray-100 py-4 my-2">
                      <p className="text-xs uppercase font-semibold text-gray-500 mb-3">Kategorien</p>
                      <div className="flex flex-col space-y-3">
                        <Link href={resolveCategoryRoute("Abenteuer & Sport")}
                          className="flex items-center text-sm font-medium text-gray-600"
                          onClick={() => setIsOpen(false)}
                        >
                          🏔️ Abenteuer & Sport
                        </Link>
                        <Link href={resolveCategoryRoute("Wellness & Entspannung")}
                          className="flex items-center text-sm font-medium text-gray-600"
                          onClick={() => setIsOpen(false)}
                        >
                          🧘 Wellness & Entspannung
                        </Link>
                        <Link href={resolveCategoryRoute("Kultur & Entertainment")}
                          className="flex items-center text-sm font-medium text-gray-600"
                          onClick={() => setIsOpen(false)}
                        >
                          🎭 Kultur & Entertainment
                        </Link>
                        <Link href={resolveCategoryRoute("Kulinarik")}
                          className="flex items-center text-sm font-medium text-gray-600"
                          onClick={() => setIsOpen(false)}
                        >
                          🍽️ Kulinarik
                        </Link>
                        <Link href={resolveCategoryRoute("Workshops & Kurse")}
                          className="flex items-center text-sm font-medium text-gray-600"
                          onClick={() => setIsOpen(false)}
                        >
                          🎨 Workshops & Kurse
                        </Link>
                      </div>
                    </div>

                    {/* Mobile Anlässe */}
                    <div className="border-b border-gray-100 pb-4 mb-2">
                      <p className="text-xs uppercase font-semibold text-gray-500 mb-3">Besondere Anlässe</p>
                      <div className="flex flex-col space-y-3">
                        <Link href={resolveCategoryRoute("Geburtstag")}
                          className="flex items-center text-sm font-medium text-gray-600"
                          onClick={() => setIsOpen(false)}
                        >
                          <Cake className="mr-2 h-4 w-4" />
                          Geburtstag
                        </Link>
                        <Link href={resolveCategoryRoute("JGA")}
                          className="flex items-center text-sm font-medium text-gray-600"
                          onClick={() => setIsOpen(false)}
                        >
                          <GlassWater className="mr-2 h-4 w-4" />
                          JGA
                        </Link>
                        <Link href={resolveCategoryRoute("Hochzeit")}
                          className="flex items-center text-sm font-medium text-gray-600"
                          onClick={() => setIsOpen(false)}
                        >
                          <Diamond className="mr-2 h-4 w-4" />
                          Hochzeit
                        </Link>
                        <Link href={resolveCategoryRoute("Date Ideas")}
                          className="flex items-center text-sm font-medium text-gray-600"
                          onClick={() => setIsOpen(false)}
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          Date Ideas
                        </Link>
                        <Link href={resolveCategoryRoute("Familienausflug")}
                          className="flex items-center text-sm font-medium text-gray-600"
                          onClick={() => setIsOpen(false)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Familienausflug
                        </Link>
                      </div>
                    </div>

                    <Link href="/about" 
                      className="flex items-center text-sm font-medium text-gray-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <Heart className="mr-2 h-5 w-5" />
                      Über uns
                    </Link>
                    <Link href="/faq" 
                      className="flex items-center text-sm font-medium text-gray-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <HelpCircle className="mr-2 h-5 w-5" />
                      FAQ
                    </Link>
                    <Link href="/community" 
                      className="flex items-center text-sm font-medium text-gray-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Community
                    </Link>
                    <Link href="/lexikon" 
                      className="flex items-center text-sm font-medium text-gray-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <BookOpen className="mr-2 h-5 w-5" />
                      Lexikon & Ratgeber
                    </Link>
                    <Link href="/partner" 
                      className="flex items-center text-sm font-medium text-gray-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="mr-2 h-5 w-5" />
                      Partner werden
                    </Link>

                    {!user ? (
                      <div className="flex flex-col space-y-2 pt-4">
                        <Link href="/auth">
                          <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                            Anmelden
                          </Button>
                        </Link>
                        <Link href="/auth?mode=register">
                          <Button className="w-full bg-[hsl(258,80%,55%)] hover:bg-[hsl(258,80%,48%)]" onClick={() => setIsOpen(false)}>
                            Registrieren
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-2 pt-4">
                        <div className="flex items-center mb-4">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback className="bg-[hsl(258,80%,55%)] text-white">
                              {getInitials(user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        
                        <Link 
                          href="/profile"
                          className="flex items-center text-sm font-medium text-gray-600" 
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="mr-2 h-5 w-5" />
                          Mein Profil
                        </Link>
                        
                        <Link 
                          href="/profile?tab=bookings"
                          className="flex items-center text-sm font-medium text-gray-600"
                          onClick={() => setIsOpen(false)}
                        >
                          <ClipboardList className="mr-2 h-5 w-5" />
                          Meine Buchungen
                        </Link>
                        
                        {user.role === "admin" && (
                          <Link 
                            href="/admin"
                            className="flex items-center text-sm font-medium text-gray-600"
                            onClick={() => setIsOpen(false)}
                          >
                            <Settings className="mr-2 h-5 w-5" />
                            Admin-Bereich
                          </Link>
                        )}
                        
                        <Button 
                          variant="destructive" 
                          className="mt-4 w-full" 
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Abmelden
                        </Button>
                      </div>
                    )}
                  </div>
                  </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <form className="relative" onSubmit={(e) => { e.preventDefault(); handleHeaderSearch(headerSearchQuery); }}>
            <Input
              type="text"
              placeholder="Was suchst Du?"
              value={headerSearchQuery}
              onChange={(e) => setHeaderSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border-gray-300 rounded-md focus:ring-[hsl(258,80%,55%)] focus:border-[hsl(258,80%,55%)] bg-gray-50 focus:bg-white"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer" onClick={() => handleHeaderSearch(headerSearchQuery)} />
          </form>
        </div>
      </div>

      {/* Elegant Category Navigation Bar */}
      <CategoryNav />
    </header>
  );
}

const categories = [
  {
    label: "Bowling & Kegeln",
    icon: Target,
    href: "/search?category=bowling",
    color: "text-orange-500",
    items: [
      { label: "Bowling", href: "/search?category=bowling" },
      { label: "Kegeln", href: "/search?category=kegeln" },
      { label: "Billard & Dart", href: "/search?category=billard" },
    ],
  },
  {
    label: "Schwimmen & Wellness",
    icon: Waves,
    href: "/search?category=wellness",
    color: "text-cyan-500",
    items: [
      { label: "Schwimmbad", href: "/search?category=schwimmbad" },
      { label: "Freibad", href: "/search?category=freibad" },
      { label: "Day Spa", href: "/search?category=dayspa" },
      { label: "Wellness & Spa", href: "/search?category=wellness" },
    ],
  },
  {
    label: "Kino & Kultur",
    icon: Clapperboard,
    href: "/search?category=kultur",
    color: "text-[hsl(258,80%,55%)]",
    items: [
      { label: "Kino", href: "/search?category=kino" },
      { label: "Theater", href: "/search?category=theater" },
      { label: "Museum", href: "/search?category=museum" },
      { label: "Kultur & Events", href: "/search?category=kultur" },
    ],
  },
  {
    label: "Action & Abenteuer",
    icon: Flame,
    href: "/search?category=action",
    color: "text-red-500",
    items: [
      { label: "Escape Room", href: "/search?category=escaperoom" },
      { label: "Lasertag", href: "/search?category=lasertag" },
      { label: "Paintball", href: "/search?category=paintball" },
      { label: "Axtwerfen", href: "/search?category=axtwerfen" },
      { label: "VR Spiele", href: "/search?category=vr" },
    ],
  },
  {
    label: "Sport & Fitness",
    icon: Dumbbell,
    href: "/search?category=sport",
    color: "text-blue-500",
    items: [
      { label: "Kletterhalle", href: "/search?category=kletterhalle" },
      { label: "Trampolinhalle", href: "/search?category=trampolinhalle" },
      { label: "Kartbahn", href: "/search?category=kartbahn" },
      { label: "Soccer", href: "/search?category=soccer" },
      { label: "Fußballgolf", href: "/search?category=fussballgolf" },
      { label: "Padeltennis", href: "/search?category=padeltennis" },
    ],
  },
  {
    label: "Outdoor & Natur",
    icon: TreePine,
    href: "/search?category=outdoor",
    color: "text-emerald-500",
    items: [
      { label: "Kletterpark", href: "/search?category=kletterpark" },
      { label: "Minigolf", href: "/search?category=minigolf" },
      { label: "Swingolf", href: "/search?category=swingolf" },
      { label: "Golf", href: "/search?category=golf" },
      { label: "SKI", href: "/search?category=ski" },
      { label: "Reiten", href: "/search?category=reiten" },
    ],
  },
  {
    label: "Wasser & Boote",
    icon: Sailboat,
    href: "/search?category=wasser",
    color: "text-sky-500",
    items: [
      { label: "Bootstouren", href: "/search?category=bootstouren" },
      { label: "Bootsverleih", href: "/search?category=bootsverleih" },
      { label: "Wasserski", href: "/search?category=wasserski" },
      { label: "Eissporthalle", href: "/search?category=eissporthalle" },
    ],
  },
  {
    label: "Familien & Kinder",
    icon: Baby,
    href: "/search?category=familien",
    color: "text-pink-500",
    items: [
      { label: "Indoorspielplatz", href: "/search?category=indoorspielplatz" },
      { label: "Kinderbauernhof", href: "/search?category=kinderbauernhof" },
      { label: "Kinderpark", href: "/search?category=kinderpark" },
      { label: "Zoo & Tierpark", href: "/search?category=zoo" },
      { label: "Freizeitpark", href: "/search?category=freizeitpark" },
    ],
  },
  {
    label: "Kreativ & Lernen",
    icon: Sparkles,
    href: "/search?category=kreativ",
    color: "text-amber-500",
    items: [
      { label: "Töpfern", href: "/search?category=toepfern" },
      { label: "Gastronomie", href: "/search?category=gastronomie" },
    ],
  },
  {
    label: "Freizeitzentren",
    icon: Gamepad2,
    href: "/search?category=freizeitzentrum",
    color: "text-indigo-500",
    items: [
      { label: "Freizeitzentrum", href: "/search?category=freizeitzentrum" },
      { label: "Games", href: "/search?category=games" },
    ],
  },
];

function CategoryNav() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  return (
    <div className="hidden md:block border-t border-gray-100 bg-white relative group/nav">
      {/* Left fade + arrow */}
      <div className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 flex items-center justify-start pl-1 transition-opacity duration-200 ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <button
          onClick={() => scroll("left")}
          className="w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all"
        >
          <ChevronLeft className="h-3.5 w-3.5 text-gray-600" />
        </button>
      </div>

      {/* Right fade + arrow */}
      <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 flex items-center justify-end pr-1 transition-opacity duration-200 ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <button
          onClick={() => scroll("right")}
          className="w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all"
        >
          <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <nav
          ref={scrollRef}
          className="flex items-center gap-1 py-1.5 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <DropdownMenu key={cat.label}>
                <DropdownMenuTrigger asChild>
                  <button className="group flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-1">
                    <Icon className={`h-3.5 w-3.5 ${cat.color} transition-transform duration-200 group-hover:scale-110`} />
                    <span>{cat.label}</span>
                    <ChevronDown className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={4} className="min-w-[200px] rounded-xl p-1.5 shadow-xl border border-gray-100 bg-white/95 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-150">
                  <div className="px-3 py-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center`}>
                        <Icon className={`h-3.5 w-3.5 ${cat.color}`} />
                      </div>
                      <span className="text-xs font-semibold text-gray-900">{cat.label}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem asChild>
                    <Link href={resolveCategoryRoute(cat.label)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[hsl(258,80%,55%)] font-medium hover:bg-[hsl(258,80%,95%)] cursor-pointer">
                      <Compass className="h-3.5 w-3.5" />
                      Alle anzeigen
                    </Link>
                  </DropdownMenuItem>
                  {cat.items.map((item) => (
                    <DropdownMenuItem key={item.label} asChild>
                      <Link href={resolveCategoryRoute(item.label)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer">
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </nav>
      </div>
    </div>
  );
}