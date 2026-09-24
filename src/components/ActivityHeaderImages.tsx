export const ActivityHeaderImages = {
  bowling: (
    <svg viewBox="0 0 1200 400" className="w-full h-full object-cover">
      <defs>
        <radialGradient id="bowlingGradient" cx="0.5" cy="0.5" r="0.8">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#16213e" />
        </radialGradient>
        <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff006e" />
          <stop offset="50%" stopColor="#8338ec" />
          <stop offset="100%" stopColor="#3a86ff" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect width="1200" height="400" fill="url(#bowlingGradient)" />
      
      {/* Bowling lane lines */}
      <g opacity="0.3">
        <line x1="0" y1="350" x2="1200" y2="350" stroke="#444" strokeWidth="2" />
        <line x1="0" y1="320" x2="1200" y2="320" stroke="#444" strokeWidth="1" />
        <line x1="0" y1="380" x2="1200" y2="380" stroke="#444" strokeWidth="1" />
      </g>
      
      {/* Bowling pins */}
      <g transform="translate(900, 250)">
        <ellipse cx="0" cy="50" rx="8" ry="25" fill="#f8f9fa" />
        <ellipse cx="-20" cy="60" rx="8" ry="25" fill="#f8f9fa" />
        <ellipse cx="20" cy="60" rx="8" ry="25" fill="#f8f9fa" />
        <ellipse cx="-40" cy="70" rx="8" ry="25" fill="#f8f9fa" />
        <ellipse cx="0" cy="70" rx="8" ry="25" fill="#f8f9fa" />
        <ellipse cx="40" cy="70" rx="8" ry="25" fill="#f8f9fa" />
      </g>
      
      {/* Bowling ball */}
      <circle cx="200" cy="320" r="25" fill="#2d3748" />
      <circle cx="195" cy="315" r="3" fill="#1a1a2e" />
      <circle cx="205" cy="315" r="3" fill="#1a1a2e" />
      <circle cx="200" cy="325" r="3" fill="#1a1a2e" />
      
      {/* Neon accent lines */}
      <line x1="0" y1="100" x2="400" y2="100" stroke="url(#neonGlow)" strokeWidth="3" opacity="0.8" />
      <line x1="800" y1="120" x2="1200" y2="120" stroke="url(#neonGlow)" strokeWidth="3" opacity="0.8" />
      
      {/* Abstract geometric shapes */}
      <polygon points="50,50 100,30 100,80" fill="#ff006e" opacity="0.6" />
      <polygon points="1100,30 1150,50 1120,90" fill="#8338ec" opacity="0.6" />
      
      {/* Motion blur effect on ball */}
      <ellipse cx="150" cy="320" rx="40" ry="8" fill="#2d3748" opacity="0.3" />
    </svg>
  ),

  cinema: (() => {
    // Zufällige Auswahl eines der 5 Kinobilder
    const cinemaImages = [
      'image_1751828514571.png', // Menschen von hinten im Kino, bläuliche Beleuchtung
      'image_1751828521734.png', // Kino von hinten mit roten Sitzen
      'image_1751828534606.png', // Nahaufnahme von Menschen im Kino
      'image_1751828547739.png', // Glückliche Menschen im Kino
      'image_1751828549631.png'  // Lächelnde Menschen im Kino
    ];
    
    const randomIndex = Math.floor(Math.random() * cinemaImages.length);
    const selectedImage = cinemaImages[randomIndex];
    
    return (
      <div className="relative w-full h-full overflow-hidden">
        <img 
          src={`/attached_assets/${selectedImage}`}
          alt="Menschen im Kino"
          className="w-full h-full object-cover"
        />
        {/* Dunkler Overlay für bessere Textlesbarkeit */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
    );
  })(),

  swimming: (
    <svg viewBox="0 0 1200 400" className="w-full h-full object-cover">
      <defs>
        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#87ceeb" />
          <stop offset="50%" stopColor="#4682b4" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <radialGradient id="sunGradient" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#ff8c00" />
        </radialGradient>
      </defs>
      
      {/* Background water */}
      <rect width="1200" height="400" fill="url(#waterGradient)" />
      
      {/* Sun */}
      <circle cx="1000" cy="80" r="50" fill="url(#sunGradient)" />
      
      {/* Pool lanes */}
      <g opacity="0.3">
        <line x1="0" y1="150" x2="1200" y2="150" stroke="#ffffff" strokeWidth="2" strokeDasharray="10,5" />
        <line x1="0" y1="200" x2="1200" y2="200" stroke="#ffffff" strokeWidth="2" strokeDasharray="10,5" />
        <line x1="0" y1="250" x2="1200" y2="250" stroke="#ffffff" strokeWidth="2" strokeDasharray="10,5" />
        <line x1="0" y1="300" x2="1200" y2="300" stroke="#ffffff" strokeWidth="2" strokeDasharray="10,5" />
      </g>
      
      {/* Swimmer silhouette */}
      <g transform="translate(300, 175)" opacity="0.8">
        <ellipse cx="0" cy="0" rx="40" ry="15" fill="#1e3a8a" />
        <ellipse cx="-20" cy="-5" rx="15" ry="8" fill="#1e3a8a" />
        <ellipse cx="25" cy="5" rx="20" ry="10" fill="#1e3a8a" />
        <ellipse cx="20" cy="-8" rx="18" ry="8" fill="#1e3a8a" />
      </g>
      
      {/* Water ripples */}
      <g opacity="0.4">
        <ellipse cx="300" cy="175" rx="80" ry="20" fill="none" stroke="#ffffff" strokeWidth="2" />
        <ellipse cx="300" cy="175" rx="120" ry="30" fill="none" stroke="#ffffff" strokeWidth="1" />
        <ellipse cx="600" cy="220" rx="60" ry="15" fill="none" stroke="#ffffff" strokeWidth="1" />
        <ellipse cx="900" cy="280" rx="100" ry="25" fill="none" stroke="#ffffff" strokeWidth="1" />
      </g>
      
      {/* Water droplets */}
      <circle cx="350" cy="120" r="3" fill="#87ceeb" opacity="0.8" />
      <circle cx="380" cy="110" r="2" fill="#87ceeb" opacity="0.8" />
      <circle cx="420" cy="125" r="4" fill="#87ceeb" opacity="0.8" />
      
      {/* Pool edge */}
      <rect x="0" y="350" width="1200" height="50" fill="#e2e8f0" />
      <rect x="0" y="350" width="1200" height="10" fill="#cbd5e0" />
      
      {/* Starting blocks */}
      <rect x="50" y="320" width="30" height="30" fill="#4a5568" />
      <rect x="150" y="320" width="30" height="30" fill="#4a5568" />
      <rect x="250" y="320" width="30" height="30" fill="#4a5568" />
    </svg>
  ),

  zoo: (
    <svg viewBox="0 0 1200 400" className="w-full h-full object-cover">
      <defs>
        <linearGradient id="safariGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f4a261" />
          <stop offset="50%" stopColor="#e76f51" />
          <stop offset="100%" stopColor="#2a9d8f" />
        </linearGradient>
        <radialGradient id="sunsetGradient" cx="0.8" cy="0.2" r="0.6">
          <stop offset="0%" stopColor="#ff9500" />
          <stop offset="100%" stopColor="#ff6b35" />
        </radialGradient>
      </defs>
      
      {/* Background */}
      <rect width="1200" height="400" fill="url(#safariGradient)" />
      
      {/* Sun */}
      <circle cx="1000" cy="100" r="60" fill="url(#sunsetGradient)" opacity="0.9" />
      
      {/* Trees/Savanna landscape */}
      <ellipse cx="200" cy="350" rx="80" ry="120" fill="#2a9d8f" opacity="0.8" />
      <ellipse cx="400" cy="370" rx="60" ry="100" fill="#2a9d8f" opacity="0.8" />
      <ellipse cx="800" cy="360" rx="90" ry="110" fill="#2a9d8f" opacity="0.8" />
      
      {/* Lion silhouette */}
      <g transform="translate(500, 250)" opacity="0.9">
        <ellipse cx="0" cy="20" rx="50" ry="25" fill="#8b4513" />
        <circle cx="-30" cy="10" r="20" fill="#8b4513" />
        <circle cx="-35" cy="5" r="15" fill="#daa520" />
        <polygon points="-45,0 -55,-5 -50,-10 -40,-5" fill="#8b4513" />
        <polygon points="-25,0 -15,-5 -20,-10 -30,-5" fill="#8b4513" />
        <ellipse cx="30" cy="35" rx="8" ry="15" fill="#8b4513" />
        <ellipse cx="10" cy="38" rx="8" ry="15" fill="#8b4513" />
        <ellipse cx="-10" cy="38" rx="8" ry="15" fill="#8b4513" />
        <ellipse cx="-30" cy="35" rx="8" ry="15" fill="#8b4513" />
      </g>
      
      {/* Giraffe silhouette */}
      <g transform="translate(700, 150)" opacity="0.8">
        <ellipse cx="0" cy="120" rx="30" ry="40" fill="#daa520" />
        <rect x="-5" y="60" width="10" height="60" fill="#daa520" />
        <ellipse cx="0" cy="40" rx="15" ry="20" fill="#daa520" />
        <ellipse cx="5" cy="25" rx="8" ry="15" fill="#daa520" />
        <ellipse cx="15" cy="160" rx="6" ry="12" fill="#daa520" />
        <ellipse cx="-15" cy="160" rx="6" ry="12" fill="#daa520" />
      </g>
      
      {/* Birds in sky */}
      <g opacity="0.6">
        <path d="M 300 80 Q 305 75 310 80 Q 315 75 320 80" stroke="#264653" strokeWidth="2" fill="none" />
        <path d="M 350 90 Q 355 85 360 90 Q 365 85 370 90" stroke="#264653" strokeWidth="2" fill="none" />
        <path d="M 250 70 Q 255 65 260 70 Q 265 65 270 70" stroke="#264653" strokeWidth="2" fill="none" />
      </g>
      
      {/* Grass/vegetation */}
      <g opacity="0.7">
        <rect x="0" y="380" width="1200" height="20" fill="#2a9d8f" />
        <polygon points="100,380 105,370 110,380" fill="#264653" />
        <polygon points="300,380 308,365 315,380" fill="#264653" />
        <polygon points="600,380 605,375 610,380" fill="#264653" />
        <polygon points="900,380 910,360 920,380" fill="#264653" />
      </g>
      
      {/* Abstract animal footprints */}
      <g opacity="0.4">
        <ellipse cx="150" cy="320" rx="8" ry="12" fill="#8b4513" transform="rotate(30)" />
        <ellipse cx="170" cy="330" rx="8" ry="12" fill="#8b4513" transform="rotate(30)" />
        <ellipse cx="190" cy="340" rx="8" ry="12" fill="#8b4513" transform="rotate(30)" />
      </g>
    </svg>
  ),

  minigolf: (
    <svg viewBox="0 0 1200 400" className="w-full h-full object-cover">
      <defs>
        <linearGradient id="golfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <radialGradient id="holeShadow" cx="0.5" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      
      {/* Background grass */}
      <rect width="1200" height="400" fill="url(#golfGradient)" />
      
      {/* Golf course features */}
      <ellipse cx="300" cy="200" rx="150" ry="80" fill="#10b981" opacity="0.8" />
      <ellipse cx="800" cy="250" rx="120" ry="60" fill="#10b981" opacity="0.8" />
      
      {/* Sand trap */}
      <ellipse cx="600" cy="180" rx="60" ry="30" fill="#f4a261" />
      <ellipse cx="600" cy="180" rx="50" ry="25" fill="#e76f51" />
      
      {/* Windmill obstacle */}
      <g transform="translate(900, 150)">
        <rect x="-8" y="80" width="16" height="60" fill="#8b4513" />
        <polygon points="0,80 -30,20 30,20" fill="#dc2626" />
        <rect x="-35" y="15" width="70" height="10" fill="#7c2d12" />
        
        {/* Windmill blades */}
        <g transform="rotate(45)">
          <ellipse cx="0" cy="-40" rx="6" ry="35" fill="#f8f9fa" />
          <ellipse cx="40" cy="0" rx="35" ry="6" fill="#f8f9fa" />
          <ellipse cx="0" cy="40" rx="6" ry="35" fill="#f8f9fa" />
          <ellipse cx="-40" cy="0" rx="35" ry="6" fill="#f8f9fa" />
        </g>
        <circle cx="0" cy="0" r="8" fill="#374151" />
      </g>
      
      {/* Golf hole */}
      <circle cx="200" cy="300" r="12" fill="#000000" />
      <ellipse cx="200" cy="295" rx="12" ry="4" fill="url(#holeShadow)" opacity="0.5" />
      
      {/* Flag */}
      <line x1="200" y1="280" x2="200" y2="250" stroke="#374151" strokeWidth="2" />
      <polygon points="200,250 200,265 230,257" fill="#dc2626" />
      
      {/* Golf ball */}
      <circle cx="350" cy="320" r="5" fill="#f8f9fa" />
      <circle cx="352" cy="318" r="1" fill="#e5e7eb" opacity="0.5" />
      
      {/* Golf club/putter */}
      <g transform="translate(380, 310) rotate(45)">
        <rect x="0" y="-2" width="60" height="4" fill="#6b7280" />
        <rect x="58" y="-8" width="8" height="16" fill="#374151" />
      </g>
      
      {/* Decorative flowers */}
      <g opacity="0.8">
        <circle cx="100" cy="150" r="4" fill="#f472b6" />
        <circle cx="98" cy="148" r="2" fill="#ec4899" />
        <circle cx="102" cy="148" r="2" fill="#ec4899" />
        <circle cx="100" cy="152" r="2" fill="#ec4899" />
        <circle cx="100" cy="144" r="2" fill="#ec4899" />
        
        <circle cx="1000" cy="320" r="4" fill="#fbbf24" />
        <circle cx="998" cy="318" r="2" fill="#f59e0b" />
        <circle cx="1002" cy="318" r="2" fill="#f59e0b" />
        <circle cx="1000" cy="322" r="2" fill="#f59e0b" />
        <circle cx="1000" cy="314" r="2" fill="#f59e0b" />
      </g>
      
      {/* Course boundary */}
      <rect x="0" y="0" width="1200" height="10" fill="#065f46" />
      <rect x="0" y="390" width="1200" height="10" fill="#065f46" />
    </svg>
  )
};

export function getActivityHeaderImage(activityType: string) {
  const type = activityType.toLowerCase();
  
  if (type.includes('bowling')) return ActivityHeaderImages.bowling;
  if (type.includes('kino') || type.includes('cinema')) return ActivityHeaderImages.cinema;
  if (type.includes('schwimm') || type.includes('swimming')) return ActivityHeaderImages.swimming;
  if (type.includes('zoo') || type.includes('tier')) return ActivityHeaderImages.zoo;
  if (type.includes('minigolf') || type.includes('golf')) return ActivityHeaderImages.minigolf;
  
  // Default fallback - generic abstract pattern
  return (
    <svg viewBox="0 0 1200 400" className="w-full h-full object-cover">
      <defs>
        <linearGradient id="defaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      <rect width="1200" height="400" fill="url(#defaultGradient)" />
      <circle cx="300" cy="200" r="50" fill="#ffffff" opacity="0.2" />
      <circle cx="900" cy="150" r="70" fill="#ffffff" opacity="0.1" />
    </svg>
  );
}