import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Calendar, Heart, Image, User, MapPin, Mail, Globe, Phone, ChevronRight, QrCode, LogOut, Settings, CreditCard, Bell, HelpCircle, Shield, Languages, Sliders, MessageCircle, Lock, UserCircle, Eye, EyeOff, Check, Sparkles, Users, Clock, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Booking, Experience } from "@shared/schema";

interface BookingWithExperience extends Booking {
  experience: Experience;
}

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showQRTicket, setShowQRTicket] = useState<BookingWithExperience | null>(null);
  
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    phone: '',
    address: '',
    bio: ''
  });
  
  const [settingsSection, setSettingsSection] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailPromotions: false,
    emailNewsletter: true,
    pushBookings: true,
    pushReminders: true,
    pushPromotions: false
  });
  
  const [preferences, setPreferences] = useState({
    language: 'de',
    currency: 'EUR',
    theme: 'light',
    showRecommendations: true,
    showNearbyActivities: true
  });
  
  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.fullName?.split(' ')[0] || '',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    birthDate: '',
    gender: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  
  const { 
    data: bookings, 
    isLoading: isLoadingBookings,
  } = useQuery<BookingWithExperience[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  const { data: favorites } = useQuery<any[]>({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  const { data: groupMemberships, isLoading: loadingGroups } = useQuery<any[]>({
    queryKey: ["/api/my-group-memberships"],
    enabled: !!user,
  });
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'd. MMM yyyy', { locale: de });
  };

  const formatTime = (date: Date | string) => {
    return format(new Date(date), 'HH:mm', { locale: de }) + ' Uhr';
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

  const activeBookings = bookings?.filter(b => 
    b.status === 'confirmed' || b.status === 'pending'
  ) || [];

  const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
  
  if (!user) {
    navigate("/auth?redirect=/profile");
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        <div 
          className="h-48 md:h-56 w-full bg-gradient-to-r from-violet-300 via-purple-200 to-indigo-300"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23c4b5fd' fill-opacity='0.5' d='M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,186.7C672,192,768,160,864,154.7C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundSize: 'cover',
            backgroundPosition: 'bottom'
          }}
        />
        
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-16">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-3xl font-semibold border-4 border-white shadow-xl">
            {getInitials(user.fullName)}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="pt-20 pb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="flex items-center gap-8 text-center md:text-left order-2 md:order-1">
            <div>
              <p className="text-2xl font-bold text-gray-900">{bookings?.length || 0}</p>
              <p className="text-sm text-gray-500">Buchungen</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{favorites?.length || 0}</p>
              <p className="text-sm text-gray-500">Favoriten</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeBookings.length}</p>
              <p className="text-sm text-gray-500">Aktiv</p>
            </div>
          </div>
          
          <div className="flex-1 text-center order-1 md:order-2">
            <h1 className="text-2xl font-bold text-gray-900">{user.fullName || user.username}</h1>
            <p className="text-gray-500">FreizeitEngel Mitglied</p>
          </div>
          
          <div className="flex items-center gap-3 order-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowEditProfile(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Bearbeiten
            </Button>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
              onClick={() => navigate("/")}
            >
              Entdecken
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200 mb-6">
            <TabsList className="bg-transparent h-auto p-0 gap-8">
              <TabsTrigger 
                value="profile" 
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-violet-500 rounded-none pb-3 px-0"
              >
                <User className="w-4 h-4 mr-2" />
                Profil
              </TabsTrigger>
              <TabsTrigger 
                value="bookings"
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-violet-500 rounded-none pb-3 px-0"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Buchungen
              </TabsTrigger>
              <TabsTrigger 
                value="favorites"
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-violet-500 rounded-none pb-3 px-0"
              >
                <Heart className="w-4 h-4 mr-2" />
                Favoriten
              </TabsTrigger>
              <TabsTrigger 
                value="tickets"
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-violet-500 rounded-none pb-3 px-0"
              >
                <Image className="w-4 h-4 mr-2" />
                Tickets
              </TabsTrigger>
              <TabsTrigger 
                value="groups"
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-violet-500 rounded-none pb-3 px-0"
                data-testid="tab-meine-gruppen"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Meine Gruppen
                {groupMemberships && groupMemberships.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full">{groupMemberships.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-violet-500 rounded-none pb-3 px-0"
              >
                <Settings className="w-4 h-4 mr-2" />
                Einstellungen
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="mt-0">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Über mich</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {editForm.bio || "Hallo! Ich bin begeisterter FreizeitEngel Nutzer und liebe es, neue Erlebnisse zu entdecken."}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-violet-500" />
                    <span className="text-gray-600">{editForm.address || "Deutschland"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-violet-500" />
                    <span className="text-gray-600">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-violet-500" />
                    <span className="text-gray-600">{editForm.phone || "Nicht angegeben"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-4 h-4 text-violet-500" />
                    <span className="text-gray-600">freizeitplus.de</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(user.fullName)}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text" 
                        placeholder="Teile deine Gedanken..." 
                        className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pl-14">
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-500">
                      <Image className="w-4 h-4" />
                      Foto / Video
                    </button>
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-500">
                      <Calendar className="w-4 h-4" />
                      Erlebnis
                    </button>
                    <Button size="sm" className="ml-auto bg-violet-500 hover:bg-violet-600">
                      Post
                    </Button>
                  </div>
                </div>

                {activeBookings.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                        {getInitials(user.fullName)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{user.fullName || user.username}</span>
                          <span className="text-sm text-gray-400">· vor kurzem</span>
                        </div>
                        <p className="text-gray-600 mt-2">
                          Hat ein neues Erlebnis gebucht: <strong>{activeBookings[0].experience?.title || 'Erlebnis'}</strong> am {formatDate(activeBookings[0].date)}. Das wird super! 🎉
                        </p>
                        <div className="mt-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 flex items-center gap-4">
                          <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(activeBookings[0].qrCode || `booking-${activeBookings[0].id}`)}`}
                              alt="QR"
                              className="w-12 h-12"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activeBookings[0].experience?.title || 'Erlebnis'}</p>
                            <p className="text-sm text-gray-500">{formatDate(activeBookings[0].date)} · {activeBookings[0].participants} Person(en)</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowQRTicket(activeBookings[0])}
                          >
                            QR-Code
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="mt-0">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Alle Buchungen</h3>
              </div>
              {isLoadingBookings ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-500" />
                </div>
              ) : bookings && bookings.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={booking.experience?.imageUrl || "https://via.placeholder.com/56"} 
                          alt={booking.experience?.title || 'Erlebnis'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{booking.experience?.title || 'Erlebnis'}</p>
                        <p className="text-sm text-gray-500">{formatDate(booking.date)} · {booking.participants} Person(en)</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{booking.totalPrice.toFixed(2)}€</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {booking.status === 'confirmed' ? 'Bestätigt' :
                           booking.status === 'pending' ? 'Ausstehend' :
                           booking.status === 'cancelled' ? 'Storniert' : 'Abgeschlossen'}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowQRTicket(booking)}
                        disabled={booking.status === 'cancelled'}
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Noch keine Buchungen</p>
                  <Button className="mt-4" onClick={() => navigate("/")}>
                    Erlebnisse entdecken
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Heart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 mb-4">{favorites?.length || 0} Favoriten gespeichert</p>
              <Button onClick={() => navigate("/favorites")}>
                Favoriten anzeigen
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="groups" className="mt-0">
            {loadingGroups ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-500" />
              </div>
            ) : !groupMemberships || groupMemberships.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <Sparkles className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Du bist noch in keiner Mach-mit-Gruppe</h3>
                <p className="text-gray-500 mb-4 text-sm">Tritt offenen Gruppen bei oder starte deine eigene – perfekt für unter der Woche.</p>
                <Button onClick={() => navigate("/gruppen")} className="bg-purple-600 hover:bg-purple-700">
                  <Sparkles className="w-4 h-4 mr-2" /> Gruppen entdecken
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {groupMemberships.map((m: any) => {
                  const dt = new Date(m.group.activityDate);
                  const isPast = dt < new Date();
                  const isPaid = m.paymentStatus === "paid" || m.paymentStatus === "covered";
                  const needsPayment = m.group.status === "confirmed" && !isPaid && !isPast && m.status !== "cancelled";
                  return (
                    <div key={m.id} className="bg-white rounded-2xl shadow-sm overflow-hidden" data-testid={`my-group-${m.group.id}`}>
                      <div className="flex flex-col md:flex-row">
                        {m.group.imageUrl && (
                          <div className="md:w-48 h-32 md:h-auto bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${m.group.imageUrl})` }} />
                        )}
                        <div className="p-5 flex-1">
                          <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                            <div>
                              <Badge variant="outline" className="text-[10px] capitalize mb-1">{m.group.category}</Badge>
                              <h3 className="font-bold text-lg text-gray-900">{m.group.title}</h3>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {m.group.status === "cancelled" || m.status === "cancelled" ? (
                                <Badge variant="destructive">Abgesagt</Badge>
                              ) : m.group.status === "confirmed" ? (
                                <Badge className="bg-emerald-600">Bestätigt</Badge>
                              ) : (
                                <Badge className="bg-amber-500">Offen ({m.group.currentParticipants}/{m.group.maxParticipants})</Badge>
                              )}
                              {isPaid && (
                                <Badge className={m.paymentStatus === "covered" ? "bg-pink-500" : "bg-emerald-700"}>
                                  <Check className="h-3 w-3 mr-1" />
                                  {m.paymentStatus === "covered" ? "Anteil übernommen" : "Bezahlt"}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 mt-3">
                            <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-gray-400" /> {dt.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" })}</div>
                            <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-gray-400" /> {dt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr</div>
                            <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-gray-400" /> {m.group.city}</div>
                            <div className="flex items-center gap-1.5"><Users className="h-3 w-3 text-gray-400" /> {m.membersPaid || 0}/{m.memberCount || 0} bezahlt</div>
                          </div>

                          {needsPayment && m.paymentToken && (
                            <div className="mt-4 p-3 rounded-lg bg-purple-50 border-l-4 border-purple-600 flex items-center justify-between gap-3 flex-wrap">
                              <div className="text-sm text-purple-900">
                                <strong>Zahlung offen:</strong> {m.group.pricePerPerson} € – die Gruppe ist bestätigt.
                              </div>
                              <Link href={`/gruppen/zahlen/${m.paymentToken}`}>
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 gap-1" data-testid={`button-pay-${m.id}`}>
                                  <CreditCard className="h-4 w-4" /> Jetzt zahlen
                                </Button>
                              </Link>
                            </div>
                          )}

                          {m.group.status === "open" && !isPast && (
                            <div className="mt-4 p-3 rounded-lg bg-amber-50 border-l-4 border-amber-400 flex items-center gap-2 text-xs text-amber-900">
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                              Noch {m.group.maxParticipants - (m.group.currentParticipants || 0)} Plätze offen – Zahlungslink kommt automatisch, sobald die Gruppe komplett ist.
                            </div>
                          )}

                          <div className="flex justify-end mt-3">
                            <Link href={`/gruppen/${m.group.id}`}>
                              <Button variant="outline" size="sm" className="gap-1">Details <ChevronRight className="h-3 w-3" /></Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tickets" className="mt-0">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeBookings.length > 0 ? activeBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-4">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(booking.qrCode || `booking-${booking.id}`)}`}
                      alt="QR Code"
                      className="w-36 h-36"
                    />
                  </div>
                  <h4 className="font-medium text-gray-900 truncate">{booking.experience?.title || 'Erlebnis'}</h4>
                  <p className="text-sm text-gray-500">{formatDate(booking.date)}</p>
                  <Button 
                    className="w-full mt-3 bg-violet-500 hover:bg-violet-600"
                    onClick={() => setShowQRTicket(booking)}
                  >
                    Vollbild
                  </Button>
                </div>
              )) : (
                <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-sm">
                  <QrCode className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Keine aktiven Tickets</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <div className="grid md:grid-cols-4 gap-6">
              {/* Sidebar Navigation */}
              <div className="bg-white rounded-2xl shadow-sm p-4 h-fit">
                <nav className="space-y-1">
                  {[
                    { id: 'personal', label: 'Personenbezogene Angaben', icon: UserCircle },
                    { id: 'security', label: 'Passwort & Sicherheit', icon: Shield },
                    { id: 'payment', label: 'Zahlungsmethoden', icon: CreditCard },
                    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
                    { id: 'preferences', label: 'Präferenzen', icon: Sliders },
                    { id: 'language', label: 'Spracheinstellungen', icon: Languages },
                    { id: 'help', label: 'Hilfe', icon: HelpCircle },
                    { id: 'faq', label: 'Fragen & Antworten', icon: MessageCircle },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSettingsSection(settingsSection === item.id ? null : item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        settingsSection === item.id 
                          ? 'bg-violet-100 text-violet-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                      <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${settingsSection === item.id ? 'rotate-90' : ''}`} />
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content Area */}
              <div className="md:col-span-3">
                {!settingsSection && (
                  <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                    <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Einstellungen</h3>
                    <p className="text-gray-500">Wähle einen Bereich aus der Liste, um deine Einstellungen anzupassen.</p>
                  </div>
                )}

                {/* Personal Information */}
                {settingsSection === 'personal' && (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-violet-500" />
                      Personenbezogene Angaben
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Vorname</Label>
                        <Input 
                          id="firstName"
                          value={personalInfo.firstName}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nachname</Label>
                        <Input 
                          id="lastName"
                          value={personalInfo.lastName}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">E-Mail</Label>
                        <Input 
                          id="email"
                          value={user.email}
                          disabled
                          className="mt-1.5 bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="settingsPhone">Telefon</Label>
                        <Input 
                          id="settingsPhone"
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+49 172 1234567"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="birthDate">Geburtsdatum</Label>
                        <Input 
                          id="birthDate"
                          type="date"
                          value={personalInfo.birthDate}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, birthDate: e.target.value }))}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Geschlecht</Label>
                        <Select value={personalInfo.gender} onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, gender: value }))}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Männlich</SelectItem>
                            <SelectItem value="female">Weiblich</SelectItem>
                            <SelectItem value="diverse">Divers</SelectItem>
                            <SelectItem value="none">Keine Angabe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="settingsAddress">Adresse</Label>
                        <Input 
                          id="settingsAddress"
                          value={personalInfo.address}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Straße und Hausnummer"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postleitzahl</Label>
                        <Input 
                          id="postalCode"
                          value={personalInfo.postalCode}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                          placeholder="12345"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">Stadt</Label>
                        <Input 
                          id="city"
                          value={personalInfo.city}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Musterstadt"
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button className="bg-violet-500 hover:bg-violet-600" onClick={() => toast({ title: "Gespeichert", description: "Deine Angaben wurden aktualisiert." })}>
                        Änderungen speichern
                      </Button>
                    </div>
                  </div>
                )}

                {/* Password & Security */}
                {settingsSection === 'security' && (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-violet-500" />
                      Passwort & Sicherheit
                    </h3>
                    <div className="space-y-6">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-medium text-gray-900 mb-4">Passwort ändern</h4>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                            <div className="relative mt-1.5">
                              <Input 
                                id="currentPassword"
                                type={showPassword ? "text" : "password"}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                              />
                              <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="newPassword">Neues Passwort</Label>
                            <Input 
                              id="newPassword"
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                            <Input 
                              id="confirmPassword"
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="mt-1.5"
                            />
                          </div>
                          <Button className="bg-violet-500 hover:bg-violet-600" onClick={() => toast({ title: "Passwort geändert", description: "Dein neues Passwort wurde gespeichert." })}>
                            Passwort ändern
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-medium text-gray-900 mb-2">Zwei-Faktor-Authentifizierung</h4>
                        <p className="text-sm text-gray-500 mb-4">Erhöhe die Sicherheit deines Kontos mit 2FA</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">2FA aktivieren</span>
                          <Switch />
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-medium text-gray-900 mb-2">Aktive Sitzungen</h4>
                        <p className="text-sm text-gray-500 mb-4">Verwalte deine angemeldeten Geräte</p>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                            <Globe className="w-5 h-5 text-violet-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">Aktuelles Gerät</p>
                            <p className="text-xs text-gray-500">Angemeldet seit heute</p>
                          </div>
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Aktiv</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Methods */}
                {settingsSection === 'payment' && (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-violet-500" />
                      Zahlungsmethoden
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-xl flex items-center gap-4">
                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                          VISA
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">**** **** **** 4242</p>
                          <p className="text-sm text-gray-500">Gültig bis 12/26</p>
                        </div>
                        <span className="text-xs text-violet-600 bg-violet-100 px-2 py-1 rounded-full">Standard</span>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-xl flex items-center gap-4">
                        <div className="w-12 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded flex items-center justify-center">
                          <span className="text-blue-900 text-xs font-bold">PP</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">PayPal</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-500">Entfernen</Button>
                      </div>
                      
                      <Button variant="outline" className="w-full mt-4">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Neue Zahlungsmethode hinzufügen
                      </Button>
                    </div>
                  </div>
                )}

                {/* Notifications */}
                {settingsSection === 'notifications' && (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-violet-500" />
                      Benachrichtigungen
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">E-Mail Benachrichtigungen</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Buchungsbestätigungen</p>
                              <p className="text-xs text-gray-500">E-Mails zu deinen Buchungen</p>
                            </div>
                            <Switch checked={notifications.emailBookings} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailBookings: checked }))} />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Aktionen & Angebote</p>
                              <p className="text-xs text-gray-500">Rabatte und Sonderangebote</p>
                            </div>
                            <Switch checked={notifications.emailPromotions} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailPromotions: checked }))} />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Newsletter</p>
                              <p className="text-xs text-gray-500">Wöchentliche Updates und Tipps</p>
                            </div>
                            <Switch checked={notifications.emailNewsletter} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNewsletter: checked }))} />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Push-Benachrichtigungen</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Buchungsupdates</p>
                              <p className="text-xs text-gray-500">Status deiner Buchungen</p>
                            </div>
                            <Switch checked={notifications.pushBookings} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushBookings: checked }))} />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Erinnerungen</p>
                              <p className="text-xs text-gray-500">Vor deinen gebuchten Erlebnissen</p>
                            </div>
                            <Switch checked={notifications.pushReminders} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushReminders: checked }))} />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Empfehlungen</p>
                              <p className="text-xs text-gray-500">Personalisierte Erlebnisvorschläge</p>
                            </div>
                            <Switch checked={notifications.pushPromotions} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushPromotions: checked }))} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button className="bg-violet-500 hover:bg-violet-600" onClick={() => toast({ title: "Gespeichert", description: "Deine Benachrichtigungseinstellungen wurden aktualisiert." })}>
                        Änderungen speichern
                      </Button>
                    </div>
                  </div>
                )}

                {/* Preferences */}
                {settingsSection === 'preferences' && (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-violet-500" />
                      Präferenzen
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">Design</p>
                          <p className="text-sm text-gray-500">Wähle das Erscheinungsbild der App</p>
                        </div>
                        <Select value={preferences.theme} onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}>
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Hell</SelectItem>
                            <SelectItem value="dark">Dunkel</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">Personalisierte Empfehlungen</p>
                          <p className="text-sm text-gray-500">Erlebnisvorschläge basierend auf deinen Interessen</p>
                        </div>
                        <Switch checked={preferences.showRecommendations} onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showRecommendations: checked }))} />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">Aktivitäten in der Nähe</p>
                          <p className="text-sm text-gray-500">Zeige Erlebnisse basierend auf deinem Standort</p>
                        </div>
                        <Switch checked={preferences.showNearbyActivities} onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showNearbyActivities: checked }))} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Language Settings */}
                {settingsSection === 'language' && (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Languages className="w-5 h-5 text-violet-500" />
                      Spracheinstellungen
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">Sprache</p>
                          <p className="text-sm text-gray-500">Wähle die Anzeigesprache</p>
                        </div>
                        <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">Währung</p>
                          <p className="text-sm text-gray-500">Wähle die Anzeigewährung</p>
                        </div>
                        <Select value={preferences.currency} onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EUR">Euro (€)</SelectItem>
                            <SelectItem value="CHF">Schweizer Franken (CHF)</SelectItem>
                            <SelectItem value="USD">US Dollar ($)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Help */}
                {settingsSection === 'help' && (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-violet-500" />
                      Hilfe
                    </h3>
                    <div className="space-y-4">
                      <button className="w-full p-4 bg-gray-50 rounded-xl flex items-center gap-4 hover:bg-gray-100 transition-colors text-left">
                        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-violet-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Kontaktiere uns</p>
                          <p className="text-sm text-gray-500">Schreibe uns eine Nachricht</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                      
                      <button className="w-full p-4 bg-gray-50 rounded-xl flex items-center gap-4 hover:bg-gray-100 transition-colors text-left">
                        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-violet-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">E-Mail Support</p>
                          <p className="text-sm text-gray-500">support@freizeitplus.de</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                      
                      <button className="w-full p-4 bg-gray-50 rounded-xl flex items-center gap-4 hover:bg-gray-100 transition-colors text-left">
                        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-violet-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Telefon Support</p>
                          <p className="text-sm text-gray-500">+49 800 1234567 (Mo-Fr 9-18 Uhr)</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}

                {/* FAQ */}
                {settingsSection === 'faq' && (
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-violet-500" />
                      Häufig gestellte Fragen
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>Wie kann ich eine Buchung stornieren?</AccordionTrigger>
                        <AccordionContent>
                          Du kannst deine Buchung bis zu 24 Stunden vor dem Termin kostenlos stornieren. Gehe dazu in dein Profil unter "Buchungen" und wähle die entsprechende Buchung aus. Klicke dann auf "Stornieren".
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>Wie funktioniert das QR-Code Ticket?</AccordionTrigger>
                        <AccordionContent>
                          Nach deiner Buchung erhältst du ein digitales Ticket mit einem QR-Code. Zeige diesen Code einfach beim Einlass vor, um Zugang zu erhalten. Der Code wird von unserem Partner gescannt und deine Buchung wird bestätigt.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger>Kann ich meine Buchung auf jemand anderen übertragen?</AccordionTrigger>
                        <AccordionContent>
                          Ja, du kannst deine Buchung auf eine andere Person übertragen. Kontaktiere dazu unseren Support mit der Buchungsnummer und den Daten der neuen Person. Die Übertragung ist kostenlos.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-4">
                        <AccordionTrigger>Welche Zahlungsmethoden werden akzeptiert?</AccordionTrigger>
                        <AccordionContent>
                          Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay und SEPA-Lastschrift. Die Zahlung erfolgt sicher über verschlüsselte Verbindungen.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-5">
                        <AccordionTrigger>Was passiert, wenn der Partner absagt?</AccordionTrigger>
                        <AccordionContent>
                          Sollte ein Partner ein Erlebnis absagen, erhältst du automatisch eine vollständige Rückerstattung. Wir informieren dich per E-Mail und helfen dir gerne, ein alternatives Erlebnis zu finden.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 mb-8">
          <button 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full p-4 flex items-center justify-center gap-2 text-red-500 font-medium hover:bg-red-50 rounded-2xl transition-colors bg-white shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            {logoutMutation.isPending ? "Wird abgemeldet..." : "Abmelden"}
          </button>
        </div>
      </div>
      
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profil bearbeiten</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="fullName">Name</Label>
              <Input 
                id="fullName"
                value={editForm.fullName}
                onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="bio">Über mich</Label>
              <Input 
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Erzähle etwas über dich..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input 
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+49 172 1234567"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="address">Ort</Label>
              <Input 
                id="address"
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Musterstadt, Deutschland"
                className="mt-1.5"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowEditProfile(false)} className="flex-1">
              Abbrechen
            </Button>
            <Button 
              className="flex-1 bg-violet-500 hover:bg-violet-600"
              onClick={() => {
                toast({ title: "Gespeichert", description: "Dein Profil wurde aktualisiert." });
                setShowEditProfile(false);
              }}
            >
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {showQRTicket && (
        <Dialog open={!!showQRTicket} onOpenChange={() => setShowQRTicket(null)}>
          <DialogContent className="sm:max-w-sm">
            <div className="text-center pt-4">
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-2xl inline-block mb-4">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(showQRTicket.qrCode || `booking-${showQRTicket.id}`)}`}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
              
              <h3 className="font-semibold text-lg text-gray-900 mb-1">{showQRTicket.experience?.title || 'Erlebnis'}</h3>
              <p className="text-gray-600 mb-1">{formatDate(showQRTicket.date)}</p>
              <p className="text-gray-500 text-sm mb-4">{formatTime(showQRTicket.date)} · {showQRTicket.participants} Person(en)</p>
              
              <p className="text-xs text-gray-400 font-mono bg-gray-100 py-2 px-3 rounded-lg inline-block">
                {showQRTicket.qrCode || `booking-${showQRTicket.id}`}
              </p>
            </div>
            
            <Button 
              className="w-full mt-4 bg-violet-500 hover:bg-violet-600"
              onClick={() => setShowQRTicket(null)}
            >
              Fertig
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
