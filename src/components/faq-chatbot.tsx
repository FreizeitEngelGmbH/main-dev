import { useState } from 'react';
import { MessageCircle, X, Clock, Euro, MapPin, Accessibility, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Partner {
  id: number;
  company_name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  opening_hours?: string;
  category?: string;
}

interface Experience {
  id: number;
  title: string;
  price: number;
  description?: string;
}

interface FAQChatbotProps {
  partner: Partner;
  experiences: Experience[];
}

type FAQCategory = 'main' | 'hours' | 'prices' | 'location' | 'accessibility' | 'contact';

export function FAQChatbot({ partner, experiences }: FAQChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('main');
  const [messages, setMessages] = useState<{ type: 'bot' | 'user'; text: string }[]>([
    { type: 'bot', text: `Hallo! 👋 Ich bin Kiyan, dein Engel für ${partner.company_name}. Wie kann ich dir helfen?` }
  ]);

  const addMessage = (userText: string, botResponse: string) => {
    setMessages(prev => [
      ...prev,
      { type: 'user', text: userText },
      { type: 'bot', text: botResponse }
    ]);
  };

  const handleFAQ = (category: FAQCategory) => {
    setActiveCategory(category);
    
    switch (category) {
      case 'hours':
        const hours = partner.opening_hours || 'Öffnungszeiten findest du auf der Website des Partners.';
        addMessage('Wann habt ihr geöffnet?', `🕐 **Öffnungszeiten:**\n\n${hours}`);
        break;
        
      case 'prices':
        const priceList = experiences.length > 0 
          ? experiences.map(e => `• ${e.title}: ${e.price.toFixed(2)}€`).join('\n')
          : 'Preise findest du in der Ticket-Übersicht oben.';
        addMessage('Was kostet der Eintritt?', `💰 **Preise:**\n\n${priceList}\n\n👆 Scrolle nach oben um direkt zu buchen!`);
        break;
        
      case 'location':
        const address = partner.address || 'Adresse nicht verfügbar';
        const mapsLink = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
        addMessage('Wo seid ihr?', `📍 **Adresse:**\n\n${address}\n\n🗺️ [In Google Maps öffnen](${mapsLink})`);
        break;
        
      case 'accessibility':
        addMessage('Ist es barrierefrei?', `♿ **Barrierefreiheit:**\n\nFür genaue Informationen zur Barrierefreiheit kontaktiere bitte den Partner direkt oder besuche die Website.\n\n${partner.website ? `🌐 ${partner.website}` : ''}`);
        break;
        
      case 'contact':
        let contactInfo = '📞 **Kontakt:**\n\n';
        if (partner.phone) contactInfo += `Telefon: ${partner.phone}\n`;
        if (partner.email) contactInfo += `E-Mail: ${partner.email}\n`;
        if (partner.website) contactInfo += `Website: ${partner.website}`;
        if (!partner.phone && !partner.email && !partner.website) {
          contactInfo += 'Kontaktdaten nicht verfügbar.';
        }
        addMessage('Wie kann ich euch kontaktieren?', contactInfo);
        break;
        
      default:
        setActiveCategory('main');
    }
  };

  const resetChat = () => {
    setActiveCategory('main');
    setMessages([
      { type: 'bot', text: `Hallo! 👋 Ich bin Kiyan, dein Engel für ${partner.company_name}. Wie kann ich dir helfen?` }
    ]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-4 shadow-lg z-50 transition-all hover:scale-110"
        aria-label="Chat öffnen"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Kiyan, dein Engel</h3>
            <p className="text-xs text-cyan-100">Immer für dich da</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-line ${
                msg.type === 'user' 
                  ? 'bg-cyan-500 text-white rounded-br-md' 
                  : 'bg-white text-gray-700 shadow-sm border rounded-bl-md'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-white">
        {activeCategory !== 'main' && (
          <button 
            onClick={resetChat}
            className="text-xs text-cyan-600 hover:text-cyan-700 mb-3 flex items-center gap-1"
          >
            ← Zurück zur Übersicht
          </button>
        )}
        
        <p className="text-xs text-gray-500 mb-3">Wähle eine Frage:</p>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFAQ('hours')}
            className="flex items-center gap-2 justify-start text-left h-auto py-2 px-3"
          >
            <Clock className="w-4 h-4 text-cyan-500 flex-shrink-0" />
            <span className="text-xs">Öffnungszeiten</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFAQ('prices')}
            className="flex items-center gap-2 justify-start text-left h-auto py-2 px-3"
          >
            <Euro className="w-4 h-4 text-cyan-500 flex-shrink-0" />
            <span className="text-xs">Preise</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFAQ('location')}
            className="flex items-center gap-2 justify-start text-left h-auto py-2 px-3"
          >
            <MapPin className="w-4 h-4 text-cyan-500 flex-shrink-0" />
            <span className="text-xs">Anfahrt</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFAQ('accessibility')}
            className="flex items-center gap-2 justify-start text-left h-auto py-2 px-3"
          >
            <Accessibility className="w-4 h-4 text-cyan-500 flex-shrink-0" />
            <span className="text-xs">Barrierefrei</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFAQ('contact')}
            className="flex items-center gap-2 justify-start text-left h-auto py-2 px-3 col-span-2"
          >
            <Phone className="w-4 h-4 text-cyan-500 flex-shrink-0" />
            <span className="text-xs">Kontakt</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
