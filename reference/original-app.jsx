import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Image as ImageIcon, 
  Sparkles,
  Shirt,
  Home,
  Smartphone,
  Sparkle,
  Utensils,
  Download,
  RotateCcw,
  AlertCircle,
  Loader2,
  X,
  Type,
  Layout,
  MessageCircle,
  Instagram,
  Globe,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Scissors,
  Watch,
  Lightbulb,
  User,
  Users,
  Grid as GridIcon,
  Palette,
  ShoppingBag,
  Store,
  Ghost,
  Anchor,
  Sun,
  Moon,
  Camera,
  Box,
  Trees,
  Armchair,
  Wallpaper,
  Wand2,
  Truck,
  Bike,
  Plus,
  Trash2,
  AlertTriangle,
  Share2,
  Clock,
  Settings,
  Car,
  Dumbbell,
  FileText,
  Copy,
  Terminal,
  Bot,
  ExternalLink,
  Zap,
  Layers,
  Monitor,
  Activity,
  Coffee,
  Film,
  Hand,
  BookOpen,
  Calendar,
  Bookmark,
  PenTool,
  Feather,
  Landmark,
  Circle,
  Award,
  Crown,
  Star,
  ArrowUpLeft,
  ArrowUp,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDown,
  ArrowDownRight
} from 'lucide-react';

const CATEGORIES = [
  { id: 'fashion', name: 'Fashion', icon: Shirt, color: 'bg-rose-100 text-rose-600', prompt: "high-end fashion editorial style, luxury studio lighting, sharp focus on fabric textures" },
  { id: 'accessories', name: 'Aksesoris & Koleksi', icon: Watch, color: 'bg-amber-100 text-amber-600', prompt: "luxury accessory and jewelry photography, focus on fine materials, macro details, premium studio lighting" },
  { id: 'home', name: 'Produk Rumah & Dekorasi', icon: Home, color: 'bg-emerald-100 text-emerald-600', prompt: "cozy interior design, warm natural sunlight, aesthetic home arrangement, cinematic depth of field" },
  { id: 'tech', name: 'Elektronik & Gadget', icon: Smartphone, color: 'bg-blue-100 text-blue-600', prompt: "sleek tech product photography, neon accents, futuristic clean background, professional product lighting" },
  { id: 'beauty', name: 'Kecantikan & Kesehatan', icon: Sparkle, color: 'bg-purple-100 text-purple-600', prompt: "soft beauty lighting, clean minimalist aesthetic, high-end skincare commercial look, fresh and glowing" },
  { id: 'food', name: 'Makanan & Minuman', icon: Utensils, color: 'bg-orange-100 text-orange-600', prompt: "appetizing food photography, vibrant colors, rustic or modern plating, steam or water droplets for freshness" },
  { id: 'automotive', name: 'Otomotif', icon: Car, color: 'bg-zinc-100 text-zinc-600', prompt: "professional automotive product photography, showroom lighting, sleek metallic reflections, high contrast, commercial car part aesthetic" },
  { id: 'sports', name: 'Olahraga & Outdoor', icon: Dumbbell, color: 'bg-teal-100 text-teal-600', prompt: "dynamic sports and outdoor equipment photography, energetic atmosphere, high shutter speed look, rugged textures, adventure vibe" }
];

const FONT_OPTIONS = [
  { id: 'Default', name: 'Default High-End', desc: 'Gaya estetis komersial standar' },
  { id: 'Zen Type', name: 'Zen Type', desc: 'Minimalis, huruf sederhana, jarak lega, tenang & elegan' },
  { id: 'Brush Vibes', name: 'Brush Vibes', desc: 'Efek sapuan kuas, dinamis, tekstur organik, ekspresif' },
  { id: 'Velocity Wave', name: 'Velocity Wave', desc: 'Efek gelombang cepat, garis mengalir, energi modern' },
  { id: 'Chunk Style', name: 'Chunk Style', desc: 'Huruf tebal & besar, bentuk solid, kuat & berani' },
  { id: 'Flow Script', name: 'Flow Script', desc: 'Tulisan tangan mengalir, lekukan halus, elegan & personal' },
  { id: 'Power Block', name: 'Power Block', desc: 'Bentuk blok tegas, kontras tinggi, kokoh & profesional' },
  { id: 'Rhythm Groove', name: 'Rhythm Groove', desc: 'Ritme visual dinamis, variasi bentuk, fun & musikal' },
  { id: 'Bounce Letters', name: 'Bounce Letters', desc: 'Huruf melompat playful, ceria & energik' },
  { id: 'Sketch Notes', name: 'Sketch Notes', desc: 'Gaya coretan sketsa, kasual, spontan & kreatif' },
  { id: 'Luxe Serif', name: 'Luxe Serif', desc: 'Font serif mewah, detail elegan, premium & klasik' },
  { id: 'Curve Flow', name: 'Curve Flow', desc: 'Alur lengkung halus, komposisi fleksibel, modern & smooth' },
  { id: 'Cinematic Glow Text', name: 'Cinematic Glow Text', desc: 'Efek cahaya sinematik, glow lembut, dramatis & premium' },
  { id: 'Pastel 3D Puff', name: 'Pastel 3D Puff', desc: '3D lembut warna pastel, efek empuk, playful' },
  { id: 'Digital Glitch Title', name: 'Digital Glitch Title', desc: 'Efek glitch digital, distorsi halus, futuristik & edgy' }
];

const STYLE_GROUPS = {
  "Fashion Layout": ["Creative Flatlay", "Ghost 3D Fit", "Pro Model Look", "Boutique Hanger"],
  "Profesional": [],
  "Interactive": [],
  "Amazing": []
};

// --- Fashion Specific Config ---
const FASHION_STYLE_DETAILS = {
  "Creative Flatlay": { icon: Layers, desc: "Tatanan Artistik" },
  "Ghost 3D Fit": { icon: Ghost, desc: "Efek Invisible 3D" },
  "Pro Model Look": { icon: Crown, desc: "Pose Model Pro" },
  "Boutique Hanger": { icon: Scissors, desc: "Display Butik" }
};

const STYLE_PREVIEWS = {
  "Creative Flatlay": "https://i.ibb.co.com/JwcqLmMP/image.png",
  "Ghost 3D Fit": "https://i.ibb.co.com/ZR2s3Nrd/Transparant-Mannequin-Poster.png",
  "Pro Model Look": "https://i.ibb.co.com/zhkG05nd/Mannequin-Poster-1.png",
  "Boutique Hanger": "https://i.ibb.co.com/WNnLtxMj/image.png"
};

const STYLE_DESCRIPTORS = {
  // Fashion
  "Creative Flatlay": "Fashion flat lay photography taken from directly above (overhead), neat and organized composition, clean minimalist background, soft and even diffused lighting, extreme focus on product shape and fabric textures.",
  "Ghost 3D Fit": "Fashion garment worn on a headless, full body **crystal-clear transparent glass mannequin**. The mannequin must be completely see-through, showcasing the 3D fit of the clothes. The mannequin is **posing dynamically like a professional fashion model** in a high-end photoshoot. **Styled with perfectly matching outfit pieces** (shoes, bottoms, accessories) to create an ideal look. Commercial fashion photography, studio lighting.",
  "Pro Model Look": "Fashion apparel worn on a **realistic high-end studio mannequin**. The mannequin is **striking a professional model pose**, simulating a real fashion photoshoot. **Paired with the most ideal and matching outfit elements** (shoes, pants, accessories) to complement the main product. Professional studio lighting, sharp details, premium catalog style.",
  "Boutique Hanger": "Fashion garment hanging realistically on a boutique hanger against a solid studio wall or clothing rack. Natural fabric draping affected by gravity, clearly attached to support (not floating), soft natural studio lighting with realistic shadows.",
};

// --- Non-Fashion Specific Config ---
const NON_FASHION_THEMES = [
  { id: 'Terang', name: 'Terang', icon: Sun, prompt: "Light theme, high key lighting, bright, airy, clean white or pastel background, cheerful atmosphere." },
  { id: 'Gelap', name: 'Gelap', icon: Moon, prompt: "Dark theme, low key lighting, moody, elegant black or dark gray background, dramatic shadows, premium luxury feel." }
];

// --- Context-Aware Poster Styles ---
const CATEGORY_POSTER_STYLES = {
  accessories: [
    "Luxury Showcase Style: Velvet textures, gold accents, dramatic spotlight, bokeh sparkles, premium jewelry store vibe.",
    "Minimalist Geometric: Clean hard shadows, pastel colored geometric props, modern art gallery aesthetic.",
    "Nature Infused: Stone surfaces, water ripples, moss elements, organic and raw luxury impression.",
    "Urban Chic: Concrete textures, sharp daylight, street style context, edgy and modern fashion accessory look."
  ],
  home: [
    "Cozy Scandi Morning: Soft morning sunlight, light wood textures, cozy textile elements, airy and inviting home atmosphere.",
    "Modern Industrial: Concrete walls, metal accents, dramatic artificial lighting, sleek architectural vibe.",
    "Biophilic Zen: Surrounded by indoor plants, natural wood, soft ambient light, peaceful and organic living.",
    "Architectural Digest: Wide angle composition, perfectly styled room, high-end furniture context, editorial magazine look."
  ],
  tech: [
    "Cyber Neon: Dark background with blue/purple neon rim lights, futuristic circuit patterns, high-tech cyberpunk vibe.",
    "Clean Desk Setup: Organized workspace, soft white lighting, productivity vibe, apple-style aesthetic.",
    "Exploded Abstract: Floating components, abstract geometry, dynamic motion, tech innovation feel.",
    "Matte Black: Dark monochrome, subtle texture variations, premium sleek gadget look."
  ],
  beauty: [
    "Splash of Freshness: Water splashes, floating bubbles, fresh fruit elements, hydrating and revitalizing feel.",
    "Scientific Lab: Clean glass surfaces, white/blue clinical lighting, dermatological trust, pure ingredients.",
    "Pastel Dreamy: Soft focus, clouds or silk textures, pastel gradient background, ethereal and gentle.",
    "Luxury Spa: Warm candlelight, wood textures, towels and orchid flowers, relaxing and premium skincare."
  ],
  food: [
    "Rustic Farm Table: Dark wood surface, scattered ingredients, natural window light, appetizing homemade vibe.",
    "Dark Moody Gourmet: Black slate background, chiaroscuro lighting, steam rising, high-end restaurant look.",
    "Pop Art Color Block: Solid bright background, hard flash lighting, trendy and fun, fast food commercial style.",
    "Fresh Action: Water droplets, flying ingredients, freeze motion, emphasizing freshness and flavor burst."
  ],
  automotive: [
    "Dark Garage: Gritty concrete floor, dim moody lighting, oil stains texture, mechanical rugged feel.",
    "Neon City Drive: Motion blur street lights background, wet asphalt, night city vibe, fast and furious aesthetic.",
    "Clean Showroom: Pristine white floor, soft box lighting overhead, reflection on surfaces, ultra-clean commercial look.",
    "Off-Road Adventure: Dirt, mud, rocks context, dramatic sunlight, tough and durable impression."
  ],
  sports: [
    "High Energy Gym: Dark gym background, dramatic rim lighting, sweat and chalk textures, intense workout vibe.",
    "Mountain Peak: Stunning landscape background, bright natural sunlight, adventurous and conquering feel.",
    "Action Motion: Motion blur streaks, dynamic composition, freeze frame of action, emphasizing speed and power.",
    "Stadium Night: Floodlights, stadium crowd background (blurred), competitive and professional atmosphere."
  ]
};

// Fallback generic poster styles
const GENERIC_POSTER_STYLES = [
  "Cinematic Frame, product photo with cinematic framing, dramatic lighting, composition like a film scene",
  "Midnight Mood, product photo with dark night atmosphere, deep tone colors, soft focused lighting, calm and exclusive impression",
  "Asphalt Neon Grid, product photo with dark asphalt background with neon grid pattern, contrast lighting, urban and futuristic look",
  "Kinetic Freeze, product photo with frozen motion effect, sharp details, dynamic and energetic impression"
];

// --- NON-FASHION NEW PRESETS (30 Styles) ---
const NON_FASHION_PRESETS = {
  "Commercial": [
    { 
        id: 'std_catalog', 
        name: 'Produk Katalog', 
        icon: Box, 
        desc: 'Background Putih Polos', 
        prompt: 'Studio product catalog photography, completely pure white background (#FFFFFF), perfectly isolated product, soft and even studio lighting, high fidelity, standard e-commerce marketplace ready.',
        typography: "Modern Sans-Serif, Black or Dark Grey color, Medium weight, Clean and legible. No effects."
    },
    { id: 'clean_white', name: 'Clean White Hero', icon: Box, desc: 'Profesional, Aman, Trusted', prompt: "Product on pure white background, soft even lighting, very subtle shadow, super sharp details, professional marketplace catalog style.", typography: "Minimalist Sans-Serif, Dark Blue or Charcoal, Bold Headline, clean layout, corporate feel." },
    { id: 'high_key', name: 'High-Key Bright', icon: Sun, desc: 'Modern, Bersih, Fresh', prompt: "High-key photography, bright layered lighting, minimal shadows, vibrant and fresh product colors, white or very light grey background.", typography: "Thin Modern Sans-Serif, Bright colors (Cyan or Orange) or Black, Spacious kerning, Fresh and airy." },
    { id: 'premium_spotlight', name: 'Premium Spotlight', icon: Zap, desc: 'Eksklusif, Mahal, Fokus', prompt: "Single spotlight source on product, dark or neutral background, high contrast, dramatic shadows, exclusive luxury feel.", typography: "Elegant Serif (Bodoni/Didot), White or Gold, Centered alignment, High contrast." },
    { id: 'flat_lay', name: 'Flat Lay Commercial', icon: Layers, desc: 'Informatif, Estetik', prompt: "Top-down view (flat lay), neat composition, minimal props, soft lighting, clean and aesthetic arrangement.", typography: "Geometric Sans-Serif, Pastel or Neutral colors, Small font size, Grid-based layout." },
    { id: 'sharp_shadow', name: 'Sharp Shadow', icon: Activity, desc: 'Bold, Kuat Secara Visual', prompt: "Hard lighting creating sharp and defined shadows, bold and confident visual style, solid color background.", typography: "Bold/Black weight Sans-Serif, High contrast color (White on color or Black on color), Impactful." },
    { id: 'gradient_bg', name: 'Gradient Ads', icon: Layout, desc: 'Modern, Digital Friendly', prompt: "Soft color gradient background, smooth lighting on product, modern digital advertisement aesthetic.", typography: "Rounded Sans-Serif, White or complementary gradient color, Modern app-style typography." },
    { id: 'reflective', name: 'Reflective Surface', icon: Monitor, desc: 'Premium, Futuristik', prompt: "Product placed on a glossy reflective surface, elegant reflections, clean studio lighting, premium look.", typography: "Sleek Thin Sans-Serif, Metallic Silver or White, Futuristic spacing." },
    { id: 'macro_detail', name: 'Macro Detail', icon: Camera, desc: 'Quality, Craftsmanship', prompt: "Close-up macro photography focus on texture and material details, shallow depth of field, high quality craftsmanship feel.", typography: "Small, unobtrusive Sans-Serif, White with shadow, placed in corner to not hide details." },
    { id: 'dynamic_angle', name: 'Dynamic Angle', icon: RotateCcw, desc: 'Aktif, Energik', prompt: "Tilted or dynamic camera angle, dramatic perspective, sense of motion and energy, eye-catching sales shot.", typography: "Italicized Bold Sans-Serif, Slanted orientation matching the product angle, Energetic colors (Red/Yellow)." },
    { id: 'shadowless', name: 'Shadowless Catalog', icon: FileText, desc: 'Netral, Jelas, Spesifikasi', prompt: "Super even lighting, absolutely no shadows, neutral look, pure focus on product specifications and clarity.", typography: "Standard Roboto/Arial style, Black, Very organized list style." }
  ],
  "Lifestyle": [
    { id: 'natural_life', name: 'Natural Lifestyle', icon: Coffee, desc: 'Real, Dekat, Relatable', prompt: "Product in a natural home environment (table, kitchen, or living room), soft natural daylight, authentic lifestyle vibe." },
    { id: 'cinematic_mood', name: 'Cinematic Moody', icon: Film, desc: 'Emosional, Story-driven', prompt: "Cinematic film still look, moody dark tones, soft contrast, emotional storytelling atmosphere." },
    { id: 'human_touch', name: 'Human Interaction', icon: Hand, desc: 'Hidup, Autentik', prompt: "Lifestyle shot featuring a human hand holding or interacting with the product naturally, blurred background." },
    { id: 'morning_light', name: 'Morning Light', icon: Sun, desc: 'Fresh, Calm, Positif', prompt: "Soft morning sunlight streaming through a window, warm highlights, long soft shadows, fresh and calm mood." },
    { id: 'everyday_use', name: 'Everyday Use', icon: Home, desc: 'Fungsional, "Butuh Ini"', prompt: "Product shown in active use in a daily life context, realistic setting, demonstrating functionality." },
    { id: 'outdoor_light', name: 'Outdoor Natural', icon: Trees, desc: 'Fresh, Bebas, Natural', prompt: "Product photographed outdoors, bright natural sunlight, nature background (park, sky, or garden), fresh air feel." },
    { id: 'cozy_warm', name: 'Cozy Warm', icon: Armchair, desc: 'Nyaman, Homey', prompt: "Warm indoor lighting, cozy textures (blankets, wood), inviting and comfortable home atmosphere." },
    { id: 'editorial_mag', name: 'Editorial Mag', icon: BookOpen, desc: 'Stylish, Aspirational', prompt: "Fashion magazine editorial style, artistic composition, trendy props, aspirational visual storytelling." },
    { id: 'seasonal', name: 'Seasonal Theme', icon: Calendar, desc: 'Relevan, Timely', prompt: "Seasonal atmosphere (e.g., festive, summer, or rainy mood), relevant props and lighting tone." },
    { id: 'brand_story', name: 'Brand Story', icon: Bookmark, desc: 'Naratif, Kuat', prompt: "Visual storytelling composition, props that tell the brand's origin or values, meaningful arrangement." }
  ],
  "Premium": [
    { id: 'dark_luxury', name: 'Dark Luxury', icon: Moon, desc: 'Mahal, Eksklusif', prompt: "Deep black background, subtle rim lighting (sculpting light), product emerging from shadows, elegant and expensive look." },
    { id: 'artistic', name: 'Artistic Concept', icon: PenTool, desc: 'Berkelas, Simbolik', prompt: "Abstract and artistic composition, minimalist props, focus on mood and concept rather than literal context." },
    { id: 'sculpting', name: 'Sculpting Light', icon: Zap, desc: 'Powerful, Iconic', prompt: "High contrast lighting that sculpts the volume of the product, dramatic interplay of light and shadow, statuesque look." },
    { id: 'editorial_fash', name: 'Editorial Fashion', icon: Camera, desc: 'Trendy, Premium', prompt: "High-end fashion shoot lighting, sophisticated and edgy look, sharp and clean." },
    { id: 'minimal_zen', name: 'Minimal Luxury', icon: Feather, desc: 'Calm, Expensive Silence', prompt: "Ultra minimalist composition, lots of negative space, soft neutral colors, zen and peaceful luxury." },
    { id: 'glass_art', name: 'Glass Art', icon: Layers, desc: 'Futuristik, High-Class', prompt: "Product placed on or behind glass/acrylic elements, artistic reflections and refractions, modern high-class vibe." },
    { id: 'gold_accent', name: 'Gold Accent', icon: AlertCircle, desc: 'Royal, Prestige', prompt: "Warm lighting with golden accents in the background or props, rich and prestigious atmosphere." },
    { id: 'museum', name: 'Museum Display', icon: Landmark, desc: 'Bernilai, Timeless', prompt: "Product displayed like a museum artifact, spotlight on pedestal, neutral elegant background, timeless value." },
    { id: 'monochrome', name: 'Monochrome Lux', icon: Circle, desc: 'Elegan, Sophisticated', prompt: "Monochromatic color palette (shades of one color), strong texture details, sophisticated and unified look." },
    { id: 'iconic_hero', name: 'Iconic Hero', icon: Award, desc: 'Legendary, Top-Tier', prompt: "Epic hero shot, low angle, imposing presence, perfect lighting, representing the brand's top-tier status." }
  ]
};

const VISUAL_EFFECT_OPTIONS = [
  { id: 'Bersih', name: 'Bersih', desc: 'Fokus Produk aja, Polos', prompt: "Minimalist, plain studio background, maximum product focus, zero distractions, professional product shot." },
  { id: 'Natural', name: 'Natural', desc: 'Ada Sedikit Hiasan, Pas', prompt: "Subtle natural ornaments, aesthetic background details, balanced props, soft environment." },
  { id: 'Rame', name: 'Rame', desc: 'Full Dekorasi, Meriah', prompt: "Rich and dense decorations, full ornamental details, festive and vibrant background composition, high energy." }
];

const CTA_OPTIONS = ["Buy Now", "Get Now", "Order Now", "Spesial Price", "Limited Stock"];

// 6 LOGO OPTIONS
const LOGO_OPTIONS = [
  { id: 'tl', name: 'Top Left', icon: ArrowUpLeft, desc: 'Kiri Atas', class: 'top-3 left-3 md:top-4 md:left-4' },
  { id: 'tc', name: 'Top Center', icon: ArrowUp, desc: 'Tengah Atas', class: 'top-3 left-1/2 -translate-x-1/2 md:top-4' },
  { id: 'tr', name: 'Top Right', icon: ArrowUpRight, desc: 'Kanan Atas', class: 'top-3 right-3 md:top-4 md:right-4' },
  { id: 'bl', name: 'Bottom Left', icon: ArrowDownLeft, desc: 'Kiri Bawah', class: 'bottom-3 left-3 md:bottom-4 md:left-4' },
  { id: 'bc', name: 'Bottom Center', icon: ArrowDown, desc: 'Tengah Bawah', class: 'bottom-3 left-1/2 -translate-x-1/2 md:bottom-4' },
  { id: 'br', name: 'Bottom Right', icon: ArrowDownRight, desc: 'Kanan Bawah', class: 'bottom-3 right-3 md:bottom-4 md:right-4' }
];

const RATIOS = [
  { id: '1:1', name: '1:1 Square', class: 'aspect-square' },
  { id: '9:16', name: '9:16 Portrait', class: 'aspect-[9/16]' },
  { id: '16:9', name: '16:9 Landscape', class: 'aspect-video' },
  { id: '3:4', name: '3:4 Portrait', class: 'aspect-[3/4]' },
];

const App = () => {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Product 1
  const [uploadedImage, setUploadedImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  
  // Product 2
  const [uploadedImage2, setUploadedImage2] = useState(null);
  const [base64Image2, setBase64Image2] = useState(null);
  
  // Reference Background
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceBase64, setReferenceBase64] = useState(null);

  // Logo State
  const [logoImage, setLogoImage] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);

  // Style States
  const [activeStyleTab, setActiveStyleTab] = useState("Profesional"); // For Fashion Only
  const [selectedStyle, setSelectedStyle] = useState("Ghost 3D Fit"); // Stores Style ID
  
  // Non-Fashion Specific States
  const [activePresetTab, setActivePresetTab] = useState("Commercial"); // Commercial, Lifestyle, Premium
  const [selectedPreset, setSelectedPreset] = useState(NON_FASHION_PRESETS["Commercial"][0]); 
  const [generateTab, setGenerateTab] = useState('Preset'); // 'Preset' or 'Custom'
  // Keep these for backward compatibility/reference if needed, but UI uses presets now
  const [selectedTheme, setSelectedTheme] = useState("Terang"); 
  const [selectedResultType, setSelectedResultType] = useState("Foto Studio"); 

  const [selectedGender, setSelectedGender] = useState('Wanita');
  const [selectedAge, setSelectedAge] = useState('Dewasa');
  
  // New state for Text Generation
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [caption, setCaption] = useState("");
  const [isCaptionLoading, setIsCaptionLoading] = useState(false);
  const [isCaptionCopied, setIsCaptionCopied] = useState(false); 

  const initialSettings = {
    count: 1, 
    ratio: '1:1',
    density: 'Natural',
    posterDetails: false,
    details: {
      headline: '',
      tagline: '',
      feature1: '',
      feature2: '',
      feature3: '',
      cod: false,
      instant: false,
      sameday: false,
      price: '',
      promoPrice: '',
      cta: 'Buy Now',
      fontStyle: 'Default',
      whatsapp: '',
      instagram: '',
      website: '',
      shopee: false,
      tokopedia: false,
      tiktok: false
    },
    logo: false,
    logoPlacement: 'tr',
    visualDensity: 'Natural',
    additionalIdeas: ''
  };

  const [settings, setSettings] = useState(initialSettings);
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingIndices, setRegeneratingIndices] = useState({});
  const [generatedResults, setGeneratedResults] = useState([]);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [waitingForQuota, setWaitingForQuota] = useState(false); 
  
  const [showWarningModal, setShowWarningModal] = useState({ show: false, mode: '' });
  const [activeSubWindow, setActiveSubWindow] = useState(null); 
  const [isOpeningWindow, setIsOpeningWindow] = useState(false);
  const [isClosingWindow, setIsClosingWindow] = useState(false);

  const [previewPrompt, setPreviewPrompt] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const apiKey = ""; 

  const performAppReset = () => {
    setStep(1);
    setSelectedCategory(null);
    setUploadedImage(null);
    setBase64Image(null);
    setUploadedImage2(null);
    setBase64Image2(null);
    setReferenceImage(null);
    setReferenceBase64(null);
    setLogoImage(null);
    setLogoBase64(null);
    setSelectedGender('Wanita');
    setSelectedAge('Dewasa');
    setSettings(initialSettings);
    setGeneratedResults([]);
    setError(null);
    setProgress(0);
    setWaitingForQuota(false);
    setShowWarningModal({ show: false, mode: '' });
    setActivePresetTab("Commercial");
    setSelectedPreset(NON_FASHION_PRESETS["Commercial"][0]);
    setGenerateTab('Preset');
    setCaption("");
    setIsCaptionCopied(false);
  };

  useEffect(() => {
    if (selectedCategory === 'fashion') {
      setActiveStyleTab("Fashion Layout");
      setSelectedStyle("Ghost 3D Fit");
    } else if (selectedCategory) {
      setActivePresetTab("Commercial");
      setSelectedPreset(NON_FASHION_PRESETS["Commercial"][0]);
      setGenerateTab('Preset');
    }
  }, [selectedCategory]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setBase64Image(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload2 = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage2(reader.result);
        setBase64Image2(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReferenceUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result);
        setReferenceBase64(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImage(reader.result);
        setLogoBase64(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- CLIPBOARD FALLBACK FUNCTION ---
  const copyToClipboard = (text, onSuccess) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => {
              if (onSuccess) onSuccess();
          }).catch(err => {
              console.warn("Clipboard API failed, trying execCommand fallback", err);
              fallbackCopy(text, onSuccess);
          });
      } else {
          fallbackCopy(text, onSuccess);
      }
  };

  const fallbackCopy = (text, onSuccess) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
          const successful = document.execCommand('copy');
          if (successful && onSuccess) onSuccess();
      } catch (err) {
          console.error('Fallback copy failed', err);
          alert("Gagal menyalin teks. Mohon salin secara manual.");
      }
      document.body.removeChild(textArea);
  };

  const handleCopyPrompt = () => {
    const text = getFullPromptsForPreview();
    copyToClipboard(text, () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };
  
  const handleCopyCaption = () => {
      copyToClipboard(caption, () => {
        setIsCaptionCopied(true);
        setTimeout(() => setIsCaptionCopied(false), 2000);
    });
  }

  const handleOpenExternalAI = (url) => {
    const text = getFullPromptsForPreview();
    copyToClipboard(text, () => {
         window.open(url, '_blank');
    });
  };

  const handleDownload = async (url, filename) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        
        // If there's no logo to merge, simple download
        if (!settings.logo || !logoImage) {
             const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (!isIOS) {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `${filename}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
                return; 
            }
            // ... (share logic for ios) ...
            if (navigator.share) {
                const file = new File([blob], `${filename}.png`, { type: 'image/png' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Hasil Etalase Pro',
                    text: 'Cek hasil foto produk saya!'
                });
                return;
                }
            }
            return;
        }

        // --- MERGE LOGO WITH CANVAS ---
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        const logo = new Image();

        // Load main image
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = URL.createObjectURL(blob);
        });

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Load logo
        await new Promise((resolve, reject) => {
            logo.onload = resolve;
            logo.onerror = reject;
            logo.src = logoImage;
        });

        // Determine logo size and position
        // Base size on canvas width (e.g., 15% of width as requested)
        const logoScale = 0.15; 
        const logoWidth = canvas.width * logoScale;
        const aspectRatio = logo.width / logo.height;
        const logoHeight = logoWidth / aspectRatio;
        const padding = canvas.width * 0.05; // 5% padding

        let x, y;
        const pos = settings.logoPlacement;

        if (pos.includes('l')) x = padding; // Left
        else if (pos.includes('r')) x = canvas.width - logoWidth - padding; // Right
        else x = (canvas.width - logoWidth) / 2; // Center (horizontal)

        if (pos.includes('t')) y = padding; // Top
        else y = canvas.height - logoHeight - padding; // Bottom (default)

        // Set opacity to 40% before drawing logo
        ctx.globalAlpha = 0.4;
        ctx.drawImage(logo, x, y, logoWidth, logoHeight);
        // Reset opacity
        ctx.globalAlpha = 1.0;

        // Convert canvas back to blob for download
        canvas.toBlob(async (mergedBlob) => {
             const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

             if (!isIOS) {
                const blobUrl = window.URL.createObjectURL(mergedBlob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `${filename}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
             } else if (navigator.share) {
                 const file = new File([mergedBlob], `${filename}.png`, { type: 'image/png' });
                 if (navigator.canShare && navigator.canShare({ files: [file] })) {
                     await navigator.share({
                         files: [file],
                         title: 'Hasil Etalase Pro',
                         text: 'Cek hasil foto produk saya!'
                     });
                 }
             }
        }, 'image/png');

    } catch (err) {
      console.error("Download failed:", err);
      alert(`Gagal memproses. Coba tekan lama pada gambar.`);
    }
  };

  const nextStep = () => {
    setError(null);
    setStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    if (step === 5 && generatedResults.length > 0) {
      setShowWarningModal({ show: true, mode: 'back' });
    } else {
      setStep(prev => Math.max(prev - 1, 1));
    }
  };

  const handleNewProjectClick = () => {
    if (generatedResults.length > 0 || uploadedImage) {
      setShowWarningModal({ show: true, mode: 'reset' });
    } else {
      performAppReset();
    }
  };

  const closeHiddenWindow = () => {
    setIsClosingWindow(true);
    setTimeout(() => {
      setActiveSubWindow(null);
      setIsClosingWindow(false);
    }, 500); 
  };

  const openHiddenWindow = (key) => {
    setActiveSubWindow(key);
    setIsOpeningWindow(true);
  };

  const toggleSetting = (key) => {
    const newVal = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newVal }));
    if (newVal) {
      openHiddenWindow(key);
    }
  };

  const handleDetailChange = (field, value) => {
    let finalValue = value;
    if (field === 'price' || field === 'promoPrice') {
      finalValue = value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    setSettings(prev => ({
      ...prev,
      details: { ...prev.details, [field]: finalValue }
    }));
  };

  // Helper to truncate text to n words
  const truncateToWords = (str, count) => {
    if (!str) return "";
    return str.split(/\s+/).slice(0, count).join(" ");
  };

  // --- AI TEXT GENERATION FUNCTION (FOR DETAILS) ---
  const generateProductDetails = async () => {
    if (!base64Image) {
      alert("Mohon upload produk utama terlebih dahulu.");
      return;
    }
    
    setIsGeneratingText(true);
    
    try {
      const prompt = `
        Analyze this product image and identify what it is.
        Based on the image, generate short and catchy marketing text in INDONESIAN language (Bahasa Indonesia).
        
        CRITICAL RULES:
        - Headline: MAXIMUM 3 WORDS.
        - Tagline: MAXIMUM 3 WORDS.
        - Features: MAXIMUM 3 WORDS EACH.
        
        Return ONLY a JSON object with this exact structure:
        {
          "headline": "A short catchy headline (max 3 words)",
          "tagline": "A persuasive tagline (max 3 words)",
          "feature1": "Key feature 1 (max 3 words)",
          "feature2": "Key feature 2 (max 3 words)",
          "feature3": "Key feature 3 (max 3 words)"
        }
        
        Do not include markdown code blocks or any other text. Just the JSON string.
      `;

      const parts = [
        { text: prompt },
        { inlineData: { mimeType: "image/png", data: base64Image } }
      ];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: parts }],
          generationConfig: { 
              responseModalities: ['TEXT'], 
              temperature: 0.7 
          }
        })
      });

      if (!response.ok) {
         throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) throw new Error("No text returned from AI");

      const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);

      setSettings(prev => ({
        ...prev,
        details: {
          ...prev.details,
          headline: truncateToWords(parsedData.headline, 3),
          tagline: truncateToWords(parsedData.tagline, 3),
          feature1: truncateToWords(parsedData.feature1, 3),
          feature2: truncateToWords(parsedData.feature2, 3),
          feature3: truncateToWords(parsedData.feature3, 3)
        }
      }));

    } catch (err) {
      console.error("Text Generation Error:", err);
      alert("Gagal membuat detail otomatis. Silakan coba lagi atau isi manual.");
    } finally {
      setIsGeneratingText(false);
    }
  };

    // --- AI CAPTION GENERATION FUNCTION (FOR MARKETPLACE) ---
    const generateMarketplaceCaption = async () => {
        if (!base64Image) {
            alert("Mohon upload produk utama terlebih dahulu.");
            return;
        }

        setIsCaptionLoading(true);
        setCaption(""); // Clear previous

        try {
            const d = settings.details;
            const detailsText = `
            Product Name/Headline: ${d.headline || "Produk ini"}
            Tagline: ${d.tagline}
            Key Features: ${d.feature1}, ${d.feature2}, ${d.feature3}
            Price: ${d.price ? `Rp ${d.price}` : ""}
            Promo: ${d.promoPrice ? `Rp ${d.promoPrice}` : ""}
            `;

            const prompt = `
            Act as an expert copywriter for Indonesian marketplaces (Shopee/Tokopedia). 
            Analyze this product image and the provided details below.
            
            Product Details:
            ${detailsText}

            Write a persuasive and SEO-friendly product description in Indonesian (Bahasa Indonesia).
            Structure:
            1.  **Judul Produk yang Menarik & SEO** (Max 100 chars)
            2.  **Kalimat Pembuka/Hook** (Emotional benefit)
            3.  **Keunggulan Utama** (Bullet points, use emojis)
            4.  **Spesifikasi Produk** (Estimate materials/size from image if not provided)
            5.  **Kenapa Harus Beli Sekarang?** (FOMO/Urgency)
            6.  **Hashtags** (Relevan & Trending)

            Style: Professional, exciting, and persuasive. Use standard Indonesian marketplace formatting.
            `;

            const parts = [
                { text: prompt },
                { inlineData: { mimeType: "image/png", data: base64Image } }
            ];

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: parts }],
                    generationConfig: { 
                        responseModalities: ['TEXT'], 
                        temperature: 0.7 
                    }
                })
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const result = await response.json();
            const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) throw new Error("No caption returned");
            
            setCaption(textResponse);

        } catch (err) {
            console.error("Caption Generation Error:", err);
            alert("Gagal membuat deskripsi otomatis. Silakan coba lagi.");
        } finally {
            setIsCaptionLoading(false);
        }
    };


  const callAiApi = async (prompt, imageData1, imageData2 = null, referenceData = null, retryCount = 0) => {
    try {
      const parts = [
        { text: prompt },
        { inlineData: { mimeType: "image/png", data: imageData1 } }
      ];

      if (imageData2) {
        parts.push({ inlineData: { mimeType: "image/png", data: imageData2 } });
      }

      if (referenceData) {
        parts.push({ inlineData: { mimeType: "image/png", data: referenceData } });
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: parts }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
           throw new Error("429");
        }
        const errText = await response.text();
        console.error("API Error Response:", errText);
        throw new Error(`API Error: ${response.status} - ${errText}`);
      }

      let result;
      try {
          result = await response.json();
      } catch (jsonErr) {
          throw new Error("Gagal membaca respon dari server (Invalid JSON). Kemungkinan server sedang sibuk.");
      }

      const candidate = result.candidates?.[0];
      const imagePart = candidate?.content?.parts?.find(p => p.inlineData);
      const base64 = imagePart?.inlineData?.data;

      if (!base64) {
        const textPart = candidate?.content?.parts?.find(p => p.text);
        const errorMessage = textPart?.text || `No image returned. Reason: ${candidate?.finishReason || 'Unknown'}`;
        throw new Error(errorMessage);
      }

      return `data:image/png;base64,${base64}`;
    } catch (err) {
      console.error("callAiApi failed:", err);

      if (err.message === "429" || err.message.includes("429")) {
           const waitTime = 60000; 
           if (retryCount < 5) {
               console.warn(`Rate limit hit (429). Retrying attempt ${retryCount+1}/5 in ${waitTime/1000} seconds...`);
               setWaitingForQuota(true); 
               await new Promise(r => setTimeout(r, waitTime)); 
               setWaitingForQuota(false); 
               return callAiApi(prompt, imageData1, imageData2, referenceData, retryCount + 1);
           }
           throw new Error("Kuota API Habis (429).");
      }

      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return callAiApi(prompt, imageData1, imageData2, referenceData, retryCount + 1);
      }
      throw err;
    }
  };

  const buildAiPrompt = (index = 0) => {
    const categoryData = CATEGORIES.find(c => c.id === selectedCategory);
    const visualPrompt = VISUAL_EFFECT_OPTIONS.find(o => o.id === settings.visualDensity)?.prompt || "";
    
    let prompt = `
      \n--- DESIGN & COMPOSITION SYSTEM (CRITICAL) ---
      Create the layout, visual hierarchy, typography, spacing, and composition FIRST, then generate the visual accordingly.
      
      RULES:
      1. Image and text must be designed as ONE unified system.
      2. Typography is part of the composition, not a digital overlay.
      3. Text must follow lighting, perspective, color harmony, and material logic of the scene.
      4. Reserve intentional negative space for headline, subheadline, and CTA.
      5. Ensure clear visual hierarchy and balanced alignment.
      6. Text should feel printed, embedded, projected, or physically present in the scene.
      7. Avoid floating, flat, or mismatched typography.
      8. Avoid overcrowded visuals in text areas.
      
      USER REQUEST:
      Transform the product photo (Image 1)
    `;
    
    if (base64Image2) {
      prompt += ` and the second product photo (Image 2)`;
    }
    
    prompt += ` into a high-end marketing visual for ${categoryData?.name}.`;

    if (base64Image2) {
        prompt += `\nCOMPOSITION INSTRUCTION: Combine BOTH products into a single harmonious composition. They should look like they belong together in the same scene.`;
    }

    if (selectedCategory === 'fashion') {
      const styleDetail = STYLE_DESCRIPTORS[selectedStyle] || selectedStyle;
      prompt += `\nStyle Instruction: ${styleDetail}. 
      Target Audience: ${selectedGender}, Age Group: ${selectedAge}.`;
    } else {
      if (generateTab === 'Custom' && referenceBase64) {
        const refImageIndex = base64Image2 ? "Image 3" : "Image 2";
        prompt += `\n\nVISUAL REFERENCE INSTRUCTION: I have provided a reference image (${refImageIndex}). Please replicate the background style, composition, lighting, and mood of that reference image, but place MY PRODUCT(S) into that setting seamlessly.`;
      } else {
        // Use New 30 Presets Logic
        const styleInfo = selectedPreset;
        prompt += `\nOutput Style: ${styleInfo.name} (${styleInfo.desc})`;
        prompt += `\nVisual Description: ${styleInfo.prompt}`;
        
        // Inject Typography Instruction
        const typographyInstruction = styleInfo.typography || "Use premium high-end commercial aesthetic typography.";
        prompt += `\n- TYPOGRAPHY SPECIFICATION: ${typographyInstruction}`;
      }
    }

    prompt += `\nEnvironment Detail: ${visualPrompt} 
    
    QUALITY: Ultra-high resolution, 8k, extreme sharpness, commercial high-fidelity grade.
    CONSTRAINTS:
    1. OBJECT ISOLATION: Isolate the main product(s) perfectly. CRITICAL: If the product is being held by a hand, REMOVE THE HAND AND FINGERS completely. Only the product should remain. Remove any original background.
    2. REALISM: Product must be realistically integrated into the environment with natural lighting.
    3. TYPOGRAPHY RULES: Zero typos. High-end aesthetic placement.`;

    if (settings.posterDetails && (settings.details.headline.trim() !== '' || settings.details.tagline.trim() !== '')) {
      const d = settings.details;
      prompt += `\nRENDER TYPOGRAPHY: 
      - HEADLINE (Dominant): "${d.headline}"
      - TAGLINE (Secondary): "${d.tagline}"`;

      if (d.feature1) prompt += `\n- Feature 1: "${d.feature1}"`;
      if (d.feature2) prompt += `\n- Feature 2: "${d.feature2}"`;
      if (d.feature3) prompt += `\n- Feature 3: "${d.feature3}"`;

      const delivery = [];
      if (d.cod) delivery.push('COD Available');
      if (d.instant) delivery.push('Instant Delivery');
      if (d.sameday) delivery.push('Same Day Delivery');
      if (delivery.length > 0) prompt += `\n- Delivery Badges/Icons: ${delivery.join(', ')}`;
      
      prompt += `\n- Font Style: Use premium high-end commercial aesthetic typography.
      - Review as Art Director: Ensure text is not detached. Redesign composition until integrated.`;
    } else {
      prompt += `\nNEGATIVE CONSTRAINT: DO NOT add any text. Visual only output.`;
    }

    if (settings.additionalIdeas.trim() !== '') {
      prompt += `\nADDITIONAL CREATIVE IDEAS: ${settings.additionalIdeas}`;
    }
    
    prompt += `\nAspect ratio: ${settings.ratio}.`;
    return prompt;
  };

  const getFullPromptsForPreview = () => {
      let fullText = "";
      for(let i=0; i<settings.count; i++) {
          fullText += `--- PROMPT GAMBAR ${i+1} ---\n${buildAiPrompt(i)}\n\n`;
      }
      return fullText;
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    try {
      const results = [];
      for (let i = 0; i < settings.count; i++) {
        // --- INCREASED THROTTLING: 20 seconds safe delay ---
        if (i > 0) {
            await new Promise(r => setTimeout(r, 20000));
        }

        const stepProgress = (i * (100 / settings.count));
        setProgress(stepProgress + 5);
        
        const finalPrompt = buildAiPrompt(i); 
        const refData = (generateTab === 'Custom' && referenceBase64) ? referenceBase64 : null;
        
        const imgUrl = await callAiApi(finalPrompt, base64Image, base64Image2, refData);
        results.push(imgUrl);
        setProgress(stepProgress + (100 / settings.count));
      }
      setProgress(100);
      setGeneratedResults(results);
    } catch (err) {
      console.error("Generate Error:", err);
      setError(`${err.message}`);
    } finally {
      setIsGenerating(false);
      setWaitingForQuota(false);
    }
  };

  const handleRegenerateSingle = async (index) => {
    if (regeneratingIndices[index]) return;
    setRegeneratingIndices(prev => ({ ...prev, [index]: true }));
    const finalPrompt = buildAiPrompt(index);
    const refData = (generateTab === 'Custom' && referenceBase64) ? referenceBase64 : null;

    try {
      const newImgUrl = await callAiApi(finalPrompt, base64Image, base64Image2, refData);
      setGeneratedResults(prev => {
        const newResults = [...prev];
        newResults[index] = newImgUrl;
        return newResults;
      });
    } catch (err) {
      console.error("Regenerate Error:", err);
      alert(`Gagal regenerate gambar. ${err.message}`);
    } finally {
      setRegeneratingIndices(prev => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }
  };

  const selectLogoOption = (id) => {
    setSettings(prev => ({ ...prev, logoPlacement: id }));
    closeHiddenWindow();
  };

  const getWordCount = (str) => (!str || str.trim() === "") ? 0 : str.trim().split(/\s+/).length;
  const isHeadlineValid = getWordCount(settings.details.headline) > 0 && getWordCount(settings.details.headline) <= 3;
  const isTaglineValid = getWordCount(settings.details.tagline) > 0 && getWordCount(settings.details.tagline) <= 3;
  const isFeature1Valid = getWordCount(settings.details.feature1) <= 3;
  const isFeature2Valid = getWordCount(settings.details.feature2) <= 3;
  const isFeature3Valid = getWordCount(settings.details.feature3) <= 3;

  const canSavePosterDetails = isHeadlineValid && isTaglineValid && isFeature1Valid && isFeature2Valid && isFeature3Valid;

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-6 md:mb-8 max-w-md mx-auto px-2 md:px-4 text-slate-600">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex flex-col items-center flex-1 relative">
          <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 ${
            step >= i ? 'bg-orange-400 border-orange-400 text-white shadow-lg shadow-orange-100' : 'bg-white border-slate-200 text-slate-300'
          }`}>
            {step > i ? <Check size={12} /> : <span className="text-[8px] md:text-[10px] font-bold">{i}</span>}
          </div>
          <span className={`text-[6px] md:text-[8px] mt-1 font-bold uppercase tracking-wider text-center ${step >= i ? 'text-orange-500' : 'text-slate-400'}`}>
            {['Upload', 'Style', 'Detail', 'Preview', 'Result'][i-1]}
          </span>
          {i < 5 && <div className={`absolute top-3 md:top-4 left-1/2 w-full h-[2px] -z-0 transition-colors duration-500 ${step > i ? 'bg-orange-400' : 'bg-slate-100'}`} />}
        </div>
      ))}
    </div>
  );

  const getProgressMessage = (p) => {
    if (waitingForQuota) return "Menunggu kuota API... (Sabar ya)";
    if (p <= 16) return "nyari angel paling cakep";
    if (p <= 33) return "ngasih lighting ala studio";
    if (p <= 50) return "nambahin ornament estetik";
    if (p <= 66) return "dikit lagi beres nih";
    if (p <= 82) return "nyari finishing touch biar makin ok";
    return "sipp udah mau jadi";
  };

  const selectedRatioClass = RATIOS.find(r => r.id === settings.ratio)?.class || 'aspect-square';
  
  const getGridClasses = () => {
    if (settings.count === 1) return "grid-cols-1 max-w-sm md:max-w-xl mx-auto";
    if (settings.count === 2) return "grid-cols-1 md:grid-cols-2 max-w-lg md:max-w-4xl mx-auto";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"; 
  };

  const getActiveStyleName = () => {
    if (selectedCategory === 'fashion') return selectedStyle;
    if (generateTab === 'Custom') return "Custom Ref";
    return selectedPreset ? selectedPreset.name : "Unknown Style";
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-slate-800 font-sans p-2 md:p-8">
      <style>{`
        .image-render-sharp { 
          image-rendering: -webkit-optimize-contrast; 
          image-rendering: high-quality;
          font-smooth: always;
          -webkit-font-smoothing: antialiased;
        }
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
        .animate-scan { animation: scan 2s linear infinite; }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-blink {
          animation: blink 1.5s infinite;
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* MODALS */}
      {activeSubWindow && (
        <div className={`fixed inset-0 z-[150] flex items-center md:items-start justify-center p-2 md:p-12 bg-orange-900/10 backdrop-blur-sm transition-opacity duration-500 ${isClosingWindow ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`bg-white rounded-[2rem] md:rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl shadow-orange-100 transition-all duration-500 transform ${ isOpeningWindow && !isClosingWindow ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 md:translate-y-0' }`}>
            <div className="p-5 md:p-8 border-b border-orange-100 flex justify-between items-center bg-orange-50/50">
              <h3 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter text-orange-900">
                {activeSubWindow === 'posterDetails' ? 'Detail Tampilan' : 'Posisi Logo'}
              </h3>
              <button onClick={closeHiddenWindow} className="p-2 md:p-3 bg-white border border-orange-100 rounded-full text-orange-400 hover:text-orange-600 transition-all"><X size={20} /></button>
            </div>
            <div className="p-5 md:p-8 max-h-[80vh] overflow-y-auto no-scrollbar">
              {activeSubWindow === 'posterDetails' ? (
                <div className="space-y-6">
                  {/* AUTO GENERATE BUTTON */}
                  <div className="flex justify-end">
                    <button 
                      onClick={generateProductDetails}
                      disabled={isGeneratingText}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all text-[9px] font-black uppercase tracking-widest active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingText ? <Loader2 className="animate-spin" size={12} /> : <Bot size={12} />}
                      {isGeneratingText ? 'Proses...' : 'Isi Otomatis AI'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2 relative">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">HEADLINE</label>
                        {settings.details.headline.length > 0 && (isHeadlineValid ? <CheckCircle2 size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-rose-400" />)}
                      </div>
                      <input type="text" value={settings.details.headline} onChange={(e) => handleDetailChange('headline', e.target.value)} placeholder="Contoh: Sepatu Lari Premium" className={`w-full px-4 md:px-5 py-3 md:py-4 bg-orange-50/30 border-2 rounded-xl md:rounded-2xl outline-none transition-all font-bold italic text-slate-800 ${!isHeadlineValid && settings.details.headline.length > 0 ? 'border-rose-200' : 'border-transparent focus:border-orange-200'}`} />
                      <p className={`text-[9px] font-bold italic ${!isHeadlineValid && settings.details.headline.length > 0 ? 'text-rose-400' : 'text-slate-400'}`}>Maksimal 3 kata</p>
                    </div>
                    <div className="space-y-2 relative">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">TAGLINE</label>
                        {settings.details.tagline.length > 0 && (isTaglineValid ? <CheckCircle2 size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-rose-400" />)}
                      </div>
                      <input type="text" value={settings.details.tagline} onChange={(e) => handleDetailChange('tagline', e.target.value)} placeholder="Contoh: Nyaman Setiap Langkah" className={`w-full px-4 md:px-5 py-3 md:py-4 bg-orange-50/30 border-2 rounded-xl md:rounded-2xl outline-none font-medium text-slate-800 ${!isTaglineValid && settings.details.tagline.length > 0 ? 'border-rose-200' : 'border-transparent focus:border-orange-200'}`} />
                      <p className={`text-[9px] font-bold italic ${!isTaglineValid && settings.details.tagline.length > 0 ? 'text-rose-400' : 'text-slate-400'}`}>Maksimal 3 kata</p>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">FITUR UTAMA</label>
                        <div className="space-y-3">
                            {[1, 2, 3].map(num => (
                                <div key={num} className="relative">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] font-bold text-slate-400 italic">Fitur {num}</span>
                                        {settings.details[`feature${num}`].length > 0 && (getWordCount(settings.details[`feature${num}`]) <= 3 ? <CheckCircle2 size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-rose-400" />)}
                                    </div>
                                    <input 
                                        type="text" 
                                        value={settings.details[`feature${num}`]} 
                                        onChange={(e) => handleDetailChange(`feature${num}`, e.target.value)} 
                                        placeholder={`Contoh: Bahan Premium`} 
                                        className={`w-full px-4 py-3 bg-orange-50/30 border-2 rounded-xl outline-none transition-all font-medium text-sm text-slate-800 ${getWordCount(settings.details[`feature${num}`]) > 3 ? 'border-rose-200' : 'border-transparent focus:border-orange-200'}`} 
                                    />
                                    {getWordCount(settings.details[`feature${num}`]) > 3 && <p className="text-[8px] text-rose-400 font-bold italic mt-1">Maksimal 3 kata</p>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 md:col-span-2 pt-4 border-t border-orange-100">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-orange-300 italic">TERSEDIA (Opsional)</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button 
                                onClick={() => handleDetailChange('cod', !settings.details.cod)}
                                className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all group ${settings.details.cod ? 'border-orange-400 bg-white shadow-xl shadow-orange-50' : 'border-orange-50 bg-white/50 text-slate-400 hover:border-orange-200'}`}
                            >
                                <div className={`w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-2 shadow-sm ${settings.details.cod ? 'text-orange-600' : 'text-slate-300'}`}>
                                    <Truck size={20} />
                                </div>
                                <span className="text-[9px] font-black uppercase text-orange-900">COD</span>
                                <div className={`mt-2 w-4 h-4 rounded-md border-2 flex items-center justify-center transition-colors ${settings.details.cod ? 'bg-orange-400 border-orange-400' : 'border-slate-200 bg-white'}`}>
                                    {settings.details.cod && <Check size={10} className="text-white" />}
                                </div>
                            </button>
                            <button 
                                onClick={() => handleDetailChange('instant', !settings.details.instant)}
                                className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all group ${settings.details.instant ? 'border-emerald-400 bg-white shadow-xl shadow-emerald-50' : 'border-orange-50 bg-white/50 text-slate-400 hover:border-orange-200'}`}
                            >
                                <div className={`w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-2 shadow-sm ${settings.details.instant ? 'text-emerald-600' : 'text-slate-300'}`}>
                                    <Bike size={20} />
                                </div>
                                <span className="text-[9px] font-black uppercase text-emerald-900">INSTANT</span>
                                <div className={`mt-2 w-4 h-4 rounded-md border-2 flex items-center justify-center transition-colors ${settings.details.instant ? 'bg-emerald-400 border-emerald-400' : 'border-slate-200 bg-white'}`}>
                                    {settings.details.instant && <Check size={10} className="text-white" />}
                                </div>
                            </button>
                            <button 
                                onClick={() => handleDetailChange('sameday', !settings.details.sameday)}
                                className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all group ${settings.details.sameday ? 'border-blue-400 bg-white shadow-xl shadow-blue-50' : 'border-orange-50 bg-white/50 text-slate-400 hover:border-orange-200'}`}
                            >
                                <div className={`w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-2 shadow-sm ${settings.details.sameday ? 'text-blue-600' : 'text-slate-300'}`}>
                                    <Box size={20} />
                                </div>
                                <span className="text-[9px] font-black uppercase text-blue-900">SAMEDAY</span>
                                <div className={`mt-2 w-4 h-4 rounded-md border-2 flex items-center justify-center transition-colors ${settings.details.sameday ? 'bg-blue-400 border-blue-400' : 'border-slate-200 bg-white'}`}>
                                    {settings.details.sameday && <Check size={10} className="text-white" />}
                                </div>
                            </button>
                        </div>
                    </div>
                  </div>
                  <button onClick={closeHiddenWindow} disabled={!canSavePosterDetails} className={`w-full py-4 md:py-5 rounded-full font-black italic uppercase tracking-widest shadow-xl mt-4 md:mt-6 transition-all ${canSavePosterDetails ? 'bg-orange-400 text-white hover:bg-orange-500 active:scale-95 shadow-orange-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>Simpan Detail</button>
                </div>
              ) : (
                <div className="space-y-6">
                    {/* Upload Section */}
                    <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">Upload Logo</label>
                         <div className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${logoImage ? 'border-orange-400 bg-orange-50/20' : 'border-slate-200 hover:border-orange-300'}`}>
                             {!logoImage ? (
                                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                    <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2 text-slate-400">
                                        <Upload size={18} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Klik Upload</span>
                                </label>
                             ) : (
                                <div className="relative w-24 h-24">
                                    <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
                                    <button onClick={() => { setLogoImage(null); setLogoBase64(null); }} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full"><X size={12} /></button>
                                </div>
                             )}
                         </div>
                    </div>

                    {/* Position Section */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-orange-300">Posisi Logo</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {LOGO_OPTIONS.map(opt => {
                            const Icon = opt.icon; // Get icon component
                            return (
                                <button key={opt.id} onClick={() => selectLogoOption(opt.id)} className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all group ${settings.logoPlacement === opt.id ? 'border-orange-400 bg-orange-50/20 shadow-xl shadow-orange-50' : 'border-orange-50 bg-white/50 hover:border-orange-100'}`}>
                                <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${settings.logoPlacement === opt.id ? 'bg-orange-400 text-white' : 'bg-white text-slate-400'}`}><Icon size={20} /></div>
                                <div className={`text-center font-black italic uppercase text-[9px] tracking-widest ${settings.logoPlacement === opt.id ? 'text-orange-600' : 'text-slate-400'}`}>{opt.desc}</div>
                                </button>
                            );
                        })}
                        </div>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ... (Existing Warning Modal) ... */}
      {showWarningModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-orange-900/10 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-xs md:max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 text-slate-800">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 mx-auto"><AlertCircle size={28} className="text-rose-500" /></div>
            <h3 className="text-lg md:text-xl font-black italic text-center uppercase mb-2">Hapus Hasil?</h3>
            <p className="text-slate-500 text-center text-xs md:text-sm mb-6 md:mb-8 leading-relaxed">Seluruh data dan gambar akan dihapus jika Anda {showWarningModal.mode === 'reset' ? 'memulai project baru' : 'kembali'}.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { if (showWarningModal.mode === 'reset') performAppReset(); else { setGeneratedResults([]); setStep(3); setShowWarningModal({ show: false, mode: '' }); } }} className="w-full bg-rose-500 text-white py-3 md:py-4 rounded-full font-black italic uppercase tracking-widest shadow-lg active:scale-95 transition-all text-xs md:text-sm">Ya, Hapus</button>
              <button onClick={() => setShowWarningModal({ show: false, mode: '' })} className="w-full bg-slate-100 text-slate-500 py-3 md:py-4 rounded-full font-black italic uppercase tracking-widest text-xs md:text-sm">Batal</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-orange-100/50 overflow-hidden min-h-[90vh] md:min-h-[850px] flex flex-col border border-orange-100 relative">
        <div className="p-4 md:p-6 border-b border-orange-100/50 bg-white sticky top-0 z-20">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-300 rounded-xl flex items-center justify-center shadow-md shadow-orange-200 transform transition-transform hover:rotate-3">
                <ShoppingBag className="text-white" size={20} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none text-orange-900">Etalase Pro 2.0</h1>
                <p className="text-[9px] font-bold text-orange-300 uppercase tracking-widest mt-0.5 italic">Foto Rapi, Konversi Happy</p>
              </div>
            </div>
            <button onClick={handleNewProjectClick} className="text-[10px] md:text-sm font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 md:gap-2 px-3 md:py-2 rounded-full hover:bg-rose-50 transition-all text-orange-400 hover:bg-rose-50"><RotateCcw size={14} /> <span className="hidden xs:inline">Mulai Ulang</span></button>
          </div>
          <StepIndicator />
        </div>

        <div className="flex-1 p-4 md:p-10 overflow-y-auto no-scrollbar">
          {step === 1 && (
            <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 text-center">
              <div>
                <h2 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-orange-900 mb-4 md:mb-6">Pilih Kategori Produk</h2>
                <div className="grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                  {CATEGORIES.map((cat) => {
                    const IconComp = cat.icon;
                    return (
                      <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex flex-col items-center p-3 md:p-5 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 ${selectedCategory === cat.id ? 'border-orange-400 bg-white shadow-xl shadow-orange-100 scale-105' : 'border-orange-50 bg-white text-slate-400 hover:border-orange-200'}`}>
                        <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl mb-2 md:mb-3 ${selectedCategory === cat.id ? cat.color : 'bg-slate-50'}`}><IconComp size={20} className="md:size-7" /></div>
                        <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest italic text-center leading-tight ${selectedCategory === cat.id ? 'text-orange-600' : ''}`}>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-orange-900 mb-4 md:mb-6">Upload Foto Produk</h2>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <label className={`relative border-2 border-dashed rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 h-48 md:h-80 ${uploadedImage ? 'border-orange-400 bg-orange-50/20' : 'border-slate-200 bg-white hover:border-orange-300'}`}>
                      <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                      {uploadedImage ? <img src={uploadedImage} alt="Preview" className="w-full h-full object-contain rounded-2xl md:rounded-3xl shadow-lg" /> : <div className="text-center group"><div className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform"><Upload className="text-orange-400" size={20} /></div><p className="font-black italic uppercase tracking-widest text-[8px] md:text-sm text-orange-400">Produk Utama</p></div>}
                    </label>

                    <div className={`relative border-2 border-dashed rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 h-48 md:h-80 ${uploadedImage2 ? 'border-orange-400 bg-orange-50/20' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'}`}>
                      {!uploadedImage2 ? (
                          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center group">
                              <input type="file" className="hidden" onChange={handleFileUpload2} accept="image/*" />
                              <div className="w-10 h-10 md:w-16 md:h-16 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-sm text-slate-400 group-hover:scale-110 transition-transform"><Plus size={20} /></div>
                              <p className="font-black italic uppercase tracking-widest text-[8px] md:text-sm text-slate-400">Produk Kedua (Opsional)</p>
                          </label>
                      ) : (
                          <div className="relative w-full h-full group">
                              <img src={uploadedImage2} alt="Product 2" className="w-full h-full object-contain rounded-2xl md:rounded-3xl shadow-lg" />
                              <button onClick={() => { setUploadedImage2(null); setBase64Image2(null); }} className="absolute top-2 right-2 bg-rose-500 text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-[6px] md:text-[8px] font-bold uppercase tracking-widest backdrop-blur-sm">Produk Kedua</p>
                          </div>
                      )}
                    </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {selectedCategory === 'fashion' ? (
                <>
                  <h2 className="text-xl md:text-3xl font-black text-center italic uppercase tracking-tighter text-orange-900">Pilih Gaya Visual</h2>
                  <div className="bg-orange-50/50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-orange-100 max-w-2xl mx-auto space-y-4 md:space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                      <div className="flex-1 space-y-2 md:space-y-3">
                        <label className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-orange-300 italic"><User size={14} /> Gender</label>
                        <div className="flex bg-white p-1 rounded-xl md:rounded-2xl border border-orange-100 shadow-sm">
                          {['Pria', 'Wanita', 'Unisex'].map(g => (
                            <button key={g} onClick={() => setSelectedGender(g)} className={`flex-1 py-2 md:py-3 px-1 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase transition-all ${selectedGender === g ? 'bg-orange-400 text-white shadow-md shadow-orange-100' : 'text-slate-400 hover:text-orange-400'}`}>{g}</button>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2 md:space-y-3">
                        <label className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-orange-300 italic"><Users size={14} /> Usia</label>
                        <div className="flex bg-white p-1 rounded-xl md:rounded-2xl border border-orange-100 shadow-sm">
                          {['Dewasa', 'Remaja', 'Anak-Anak', 'Balita'].map(a => (
                            <button key={a} onClick={() => setSelectedAge(a)} className={`flex-1 py-2 md:py-3 px-1 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase transition-all ${selectedAge === a ? 'bg-orange-400 text-white shadow-md shadow-orange-100' : 'text-slate-400 hover:text-orange-400'}`}>{a}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center bg-slate-100/50 p-1 rounded-full overflow-x-auto no-scrollbar max-w-2xl mx-auto gap-1">
                    {["Fashion Layout"].map(group => (
                      <button key={group} onClick={() => setActiveStyleTab(group)} className={`flex-1 py-2.5 md:py-3 px-4 md:px-6 rounded-full text-[8px] md:text-[10px] font-black uppercase transition-all whitespace-nowrap flex items-center justify-center gap-1 md:gap-2 ${activeStyleTab === group ? 'bg-white text-orange-500 shadow-md shadow-orange-50 border border-orange-50' : 'text-slate-400 hover:text-slate-600'}`}>
                        <Scissors size={12} /> {group}
                      </button>
                    ))}
                  </div>

                  <div className={`grid gap-3 md:gap-4 overflow-y-auto no-scrollbar scroll-smooth grid-cols-2 xs:grid-cols-4 h-[350px] md:h-[420px]`}>
                    {STYLE_GROUPS["Fashion Layout"].map(style => {
                      const fashionInfo = FASHION_STYLE_DETAILS[style];
                      return (
                          <button
                            key={style}
                            onClick={() => setSelectedStyle(style)}
                            className={`
                              flex flex-col items-center 
                              p-3 md:p-4
                              rounded-2xl md:rounded-3xl border-2 transition-all duration-300
                              ${selectedStyle === style ? 'border-orange-400 bg-white shadow-xl shadow-orange-100 scale-105' : 'border-orange-50 bg-white text-slate-400 hover:border-orange-200'}
                            `}
                          >
                            <div className={`
                              p-2.5 md:p-3 rounded-xl md:rounded-2xl mb-2 md:mb-3 
                              ${selectedStyle === style ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-300'}
                            `}>
                              <fashionInfo.icon size={24} className="md:size-7" />
                            </div>
                            <div className="text-center">
                              <h4 className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest italic leading-tight ${selectedStyle === style ? 'text-orange-600' : ''}`}>{style}</h4>
                              <p className="text-[7px] md:text-[8px] font-medium text-slate-400 leading-tight mt-1 line-clamp-2 px-1">{fashionInfo.desc}</p>
                            </div>
                          </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-4 pt-4 border-t border-orange-100">
                    <h2 className="text-xl md:text-3xl font-black text-center italic uppercase tracking-tighter text-orange-900">Pilih Gaya Foto</h2>
                    
                    <div className="flex justify-center mb-6">
                        <div className="flex bg-orange-100/50 p-1 rounded-full w-full max-w-md overflow-x-auto no-scrollbar">
                            {['Commercial', 'Lifestyle', 'Premium'].map((tab) => (
                                <button 
                                    key={tab}
                                    onClick={() => { setActivePresetTab(tab); setGenerateTab('Preset'); }}
                                    className={`flex-1 py-3 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${activePresetTab === tab && generateTab === 'Preset' ? 'bg-white text-orange-500 shadow-md shadow-orange-50 border border-orange-50' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {tab === 'Commercial' && <ShoppingBag size={12} />}
                                    {tab === 'Lifestyle' && <Home size={12} />}
                                    {tab === 'Premium' && <Sparkles size={12} />}
                                    {tab}
                                </button>
                            ))}
                             <button 
                                onClick={() => setGenerateTab('Custom')}
                                className={`flex-1 py-3 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${generateTab === 'Custom' ? 'bg-white text-orange-500 shadow-md shadow-orange-50 border border-orange-50' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Wand2 size={12} /> Custom
                            </button>
                        </div>
                    </div>

                    {generateTab === 'Preset' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 animate-in fade-in slide-in-from-left-4 duration-300 h-[380px] overflow-y-auto no-scrollbar">
                        {NON_FASHION_PRESETS[activePresetTab].map(style => (
                            <button
                            key={style.id}
                            onClick={() => setSelectedPreset(style)}
                            className={`
                                flex flex-col items-center 
                                p-3 md:p-4
                                rounded-2xl md:rounded-3xl border-2 transition-all duration-300
                                ${selectedPreset.id === style.id ? 'border-orange-400 bg-white shadow-xl shadow-orange-100 scale-105' : 'border-orange-50 bg-white text-slate-400 hover:border-orange-200'}
                            `}
                            >
                            <div className={`
                                p-2.5 md:p-3 rounded-xl md:rounded-2xl mb-2 md:mb-3 
                                ${selectedPreset.id === style.id ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-300'}
                            `}>
                                <style.icon size={24} className="md:size-7" />
                            </div>
                            <div className="text-center">
                                <h4 className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest italic leading-tight ${selectedPreset.id === style.id ? 'text-orange-600' : ''}`}>{style.name}</h4>
                                <p className="text-[7px] md:text-[8px] font-medium text-slate-400 leading-tight mt-1 line-clamp-2 px-1">{style.desc}</p>
                            </div>
                            </button>
                        ))}
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-[380px] flex items-center justify-center">
                            <div className="bg-white/50 p-6 md:p-8 rounded-[2rem] border-2 border-dashed border-orange-200 text-center w-full max-w-md">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="font-black text-orange-900 uppercase tracking-widest text-sm">Upload Referensi Background</h3>
                                        <p className="text-xs text-slate-500 leading-relaxed">Upload gambar dengan suasana, pencahayaan, atau komposisi yang ingin Anda tiru. AI akan menggabungkan produk Anda ke dalam gaya referensi tersebut.</p>
                                    </div>
                                    
                                    <label className={`relative block w-full aspect-[16/9] md:aspect-[2/1] rounded-2xl overflow-hidden cursor-pointer transition-all group ${referenceImage ? 'border-0 ring-4 ring-orange-100' : 'border-2 border-orange-100 bg-orange-50/50 hover:bg-orange-50'}`}>
                                        <input type="file" className="hidden" onChange={handleReferenceUpload} accept="image/*" />
                                        {referenceImage ? (
                                            <>
                                                <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full mb-2">
                                                        <RotateCcw className="text-white" size={24} />
                                                    </div>
                                                    <span className="text-white font-bold text-xs uppercase tracking-widest">Ganti Gambar</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full gap-3">
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Wallpaper className="text-orange-300" size={32} />
                                                </div>
                                                <span className="font-black text-orange-300 text-xs uppercase tracking-widest">Klik untuk Upload</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-6">
              <h2 className="text-3xl font-black text-center italic uppercase tracking-tighter text-orange-900">Setting Tampilan</h2>
              <div className="space-y-4 md:space-y-8 max-w-4xl mx-auto text-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all flex flex-col justify-between ${settings.posterDetails ? 'border-orange-400 bg-white shadow-xl shadow-orange-50' : 'border-orange-100 bg-white/50'}`}>
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-colors ${settings.posterDetails ? 'bg-orange-400 text-white shadow-md shadow-orange-100' : 'bg-slate-50 text-slate-300'}`}><Type size={18} /></div>
                            <button onClick={() => toggleSetting('posterDetails')} className={`w-12 md:w-14 h-6 md:h-7 rounded-full relative transition-colors shadow-inner ${settings.posterDetails ? 'bg-orange-400' : 'bg-slate-200'}`}><div className={`absolute top-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transition-all shadow-md ${settings.posterDetails ? 'right-1' : 'left-1'}`} /></button>
                        </div>
                        <div><div className="font-black text-[10px] md:text-xs uppercase italic text-orange-900">1. Detail Produk</div></div>
                        {settings.posterDetails && (<button onClick={() => openHiddenWindow('posterDetails')} className="mt-4 md:mt-6 py-2.5 md:py-3 bg-orange-50/50 hover:bg-orange-400 hover:text-white rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-orange-200 transition-all text-orange-600">Lengkapi Data</button>)}
                    </div>
                    
                    <div className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all flex flex-col justify-between ${settings.logo ? 'border-orange-400 bg-white shadow-xl shadow-orange-50' : 'border-orange-100 bg-white/50'}`}>
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-colors ${settings.logo ? 'bg-orange-400 text-white shadow-md shadow-orange-100' : 'bg-slate-50 text-slate-300'}`}><Layout size={18} /></div>
                            <button onClick={() => toggleSetting('logo')} className={`w-12 md:w-14 h-6 md:h-7 rounded-full relative transition-colors shadow-inner ${settings.logo ? 'bg-orange-400' : 'bg-slate-200'}`}><div className={`absolute top-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transition-all shadow-md ${settings.logo ? 'right-1' : 'left-1'}`} /></button>
                        </div>
                        <div><div className="font-black text-[10px] md:text-xs uppercase italic text-orange-900">2. Logo Brand</div></div>
                        {settings.logo && (<button onClick={() => openHiddenWindow('logo')} className="mt-4 md:mt-6 py-2.5 md:py-3 bg-orange-50/50 hover:bg-orange-400 hover:text-white rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-orange-200 transition-all text-orange-600">Ubah Posisi</button>)}
                    </div>
                </div>

                <section className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-orange-100 shadow-sm shadow-orange-50/50">
                  <label className="block font-black text-[9px] md:text-[10px] uppercase tracking-widest mb-4 md:mb-6 text-orange-300 italic">3. Efek Visual</label>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {VISUAL_EFFECT_OPTIONS.map(opt => (
                      <button key={opt.id} onClick={() => setSettings({ ...settings, visualDensity: opt.id })} className={`flex flex-col items-center p-2.5 md:p-6 rounded-xl md:rounded-3xl border-2 transition-all relative ${ settings.visualDensity === opt.id ? 'border-orange-400 bg-white shadow-lg shadow-orange-50 scale-105 md:scale-110 z-10' : 'border-slate-50 bg-slate-50/50 text-slate-400' }`}>
                        <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center mb-1.5 md:mb-3 transition-colors ${settings.visualDensity === opt.id ? 'bg-orange-400 text-white shadow-md shadow-orange-100' : 'bg-white text-slate-200'}`}>
                          {opt.id === 'Bersih' ? <ImageIcon size={16} /> : opt.id === 'Natural' ? <Sparkles size={16} /> : <GridIcon size={16} />}
                        </div>
                        <div className={`text-center font-black italic uppercase text-[7px] md:text-xs tracking-widest mb-0.5 md:mb-1 ${settings.visualDensity === opt.id ? 'text-orange-500' : ''}`}>{opt.name}</div>
                        <p className="text-[6px] md:text-[9px] font-bold uppercase tracking-tighter leading-none mt-1 text-slate-400 text-center line-clamp-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </section>
                
                <section className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-orange-100 shadow-sm shadow-orange-50/50">
                  <label className="block font-black text-[9px] md:text-[10px] uppercase tracking-widest mb-3 md:mb-6 text-orange-300 italic">4. Jumlah Variasi</label>
                  <div className="flex gap-2 md:gap-4 text-slate-800">{[1, 2, 4].map(num => (<button key={num} onClick={() => setSettings({...settings, count: num})} className={`flex-1 h-10 md:h-16 rounded-xl md:rounded-[1.5rem] border-2 font-black text-xs md:text-base transition-all ${settings.count === num ? 'bg-orange-400 text-white border-orange-400 shadow-lg shadow-orange-100 scale-105' : 'bg-slate-50/50 border-slate-50 text-slate-400'}`}>{num}</button>))}</div>
                </section>

                <section className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-orange-100 shadow-sm shadow-orange-50/50">
                  <label className="flex items-center gap-2 font-black text-[9px] md:text-[10px] uppercase tracking-widest mb-3 md:mb-4 text-orange-300 italic">
                    <Lightbulb size={12} className="text-amber-400" />
                    5. Ide Tambahan
                  </label>
                  <textarea value={settings.additionalIdeas} onChange={(e) => setSettings({...settings, additionalIdeas: e.target.value})} placeholder="Aksen dekorasi kayu, suasana senja hangat..." className="w-full min-h-[100px] md:min-h-[120px] p-3 md:p-5 bg-orange-50/30 border-2 border-transparent focus:border-orange-200 rounded-xl md:rounded-3xl outline-none transition-all text-xs md:text-sm font-medium resize-none placeholder:text-slate-300" />
                </section>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 text-center flex flex-col items-center justify-center min-h-[500px] text-slate-900">
               <div className="w-full max-w-lg mx-auto space-y-6">
                 <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border-2 border-orange-100 text-left">
                   <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-2">
                       <Terminal size={18} className="text-orange-400" />
                       <h3 className="font-black text-orange-900 uppercase tracking-widest text-sm">AI Prompt Preview</h3>
                     </div>
                     <button 
                       onClick={handleCopyPrompt} 
                       className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${isCopied ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 hover:bg-orange-100 hover:text-orange-600'}`}
                     >
                       {isCopied ? <Check size={12} /> : <Copy size={12} />}
                       {isCopied ? 'Tersalin!' : 'Copy'}
                     </button>
                   </div>
                   <div className="bg-slate-50 rounded-xl p-4 max-h-60 overflow-y-auto border border-slate-100">
                     <pre className="whitespace-pre-wrap text-[10px] text-slate-600 font-mono leading-relaxed">{getFullPromptsForPreview()}</pre>
                   </div>
                   
                   <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100 text-left space-y-3 mt-6">
                    <h4 className="font-black text-orange-900 text-sm flex items-center gap-2">
                       💡 Cara Menggunakan Prompt Ini
                    </h4>
                    <ol className="list-decimal list-inside text-[10px] text-slate-600 space-y-1.5 font-medium leading-relaxed ml-1">
                       <li>Klik tombol <span className="font-bold text-orange-600">"Copy Prompt"</span> untuk menyalin prompt</li>
                       <li>Buka ChatGPT atau Google Gemini menggunakan tombol di bawah</li>
                       <li>Paste prompt yang sudah disalin</li>
                       <li>Jangan lupa upload foto produk Anda ke ChatGPT/Gemini</li>
                       <li className="flex flex-col gap-2">
                         <span>Upload foto dan paste prompt di ChatGPT/Gemini (tambahkan foto tumbnail dari foto yang user upload):</span>
                         {uploadedImage && (
                           <div className="mt-1">
                             <img src={uploadedImage} alt="Thumbnail Produk" className="w-12 h-12 object-cover rounded-lg border-2 border-white shadow-md" />
                           </div>
                         )}
                       </li>
                    </ol>
                    <div className="bg-white/60 p-3 rounded-xl border border-orange-100 mt-2">
                       <p className="text-[9px] text-orange-800 leading-relaxed font-medium">
                         <span className="font-bold">Catatan:</span> Jika fitur "Generate Foto" pada tools ini sedang tidak berfungsi, Anda tetap bisa membuat poster secara manual menggunakan ChatGPT atau Google Gemini dengan prompt di atas.
                       </p>
                    </div>
                  </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col gap-3">
                        <div className="text-center mb-1">
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">EXTERNAL TOOLS</span>
                        </div>
                        <button 
                            onClick={() => handleOpenExternalAI('https://chat.openai.com/')}
                            className="flex items-center justify-between w-full p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 transition-all group cursor-pointer text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm"><Bot size={18} /></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-emerald-900 uppercase tracking-tight">GENERATE DI CHATGPT</span>
                                    <span className="text-[8px] font-bold text-emerald-500">(Recommended)</span>
                                </div>
                            </div>
                            <ExternalLink size={16} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                        
                        <button 
                            onClick={() => handleOpenExternalAI('https://gemini.google.com/')}
                            className="flex items-center justify-between w-full p-4 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100 transition-all group cursor-pointer text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm"><Sparkles size={18} /></div>
                                <span className="text-[10px] font-black text-blue-900 uppercase tracking-tight">GENERATE DI GEMINI</span>
                            </div>
                            <ExternalLink size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="p-6 bg-white border border-orange-50 rounded-3xl shadow-lg shadow-orange-100/50 flex flex-col items-center text-center justify-center space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Sparkles size={120} className="text-orange-500" />
                        </div>
                        <div className="p-3 bg-orange-50 rounded-full text-orange-500 mb-1">
                            <Wand2 size={24} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black italic text-orange-900 text-lg uppercase tracking-tight">GENERATE DI APLIKASI</h3>
                            <p className="text-[9px] font-bold text-rose-500 max-w-[200px] mx-auto leading-tight">(Fitur dapat mengalami pembatasan sewaktu-waktu sesuai kebijakan layanan)</p>
                        </div>
                        <button 
                            onClick={() => { setStep(5); handleGenerate(); }} 
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-black italic uppercase tracking-widest shadow-xl shadow-orange-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
                        >
                            GENERATE FOTO <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                 </div>

                 <div className="flex justify-center mt-6">
                 </div>
               </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 text-center flex flex-col items-center justify-center min-h-[500px] text-slate-900">
              
              {error ? (
                <div className="w-full max-w-md mx-auto py-10 px-6 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-100 animate-bounce">
                        <AlertTriangle className="text-rose-500" size={40} />
                    </div>
                    <h3 className="text-xl font-black text-rose-900 mb-2 uppercase tracking-tight">Terjadi Kesalahan</h3>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed px-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => { setError(null); setStep(3); }} className="px-6 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors flex items-center gap-2">
                           <Settings size={14} /> Cek Settings
                        </button>
                        <button onClick={handleGenerate} className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-rose-200 flex items-center gap-2">
                           <RotateCcw size={14} /> Coba Lagi
                        </button>
                    </div>
                </div>
              ) : isGenerating ? (
                <div className="w-full max-w-sm md:max-w-md space-y-8 md:space-y-12 py-10">
                  <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto bg-orange-100/50 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-4 md:border-8 border-white shadow-2xl shadow-orange-100">
                    <img src={uploadedImage} alt="Scanning" className="w-full h-full object-cover opacity-40 grayscale blur-[1px]" />
                    <div className="absolute inset-x-0 h-1 bg-orange-400 shadow-[0_0_30px_4px_rgba(251,146,60,0.6)] z-20 animate-scan" />
                  </div>
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex justify-between text-[8px] md:text-[10px] font-black uppercase tracking-widest text-orange-300 px-2 md:px-4">
                        <span>{getProgressMessage(progress)}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 md:h-4 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 md:p-1 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-amber-300 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                    {waitingForQuota && (
                       <div className="flex items-center justify-center gap-2 text-orange-500 animate-pulse mt-2">
                           <Clock size={16} />
                           <span className="text-xs font-bold">Menunggu kuota API pulih... ({Math.round(progress)}%)</span>
                       </div>
                    )}
                    <p className="text-[9px] md:text-[11px] font-bold uppercase tracking-tight text-rose-400 animate-blink px-4">
                      Device tetap menyala dan tidak keluar dari aplikasi saat proses generate
                    </p>
                  </div>
                </div>
              ) : generatedResults.length > 0 ? (
                <div className="w-full space-y-8 md:space-y-10 animate-in zoom-in-95 duration-700">
                  <div className={`grid gap-4 md:gap-6 ${getGridClasses()}`}>
                    {generatedResults.map((url, i) => {
                      const downloadName = `${getActiveStyleName()}-${settings.details.headline || 'Etalase-Pro'}`.replace(/\s+/g, '-');
                      return (
                        <div key={`${url}-${i}`} className={`group relative bg-white ${selectedRatioClass} rounded-[1rem] md:rounded-[1.5rem] overflow-hidden shadow-xl border-2 md:border-4 border-white flex items-center justify-center`}>
                          {regeneratingIndices[i] && (<div className="absolute inset-0 z-50 bg-orange-900/10 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300"><Loader2 className="animate-spin text-orange-500 mb-2 w-6 h-6 md:w-8 md:h-8" /></div>)}
                          <img src={url} alt="Result" className="w-full h-full object-contain image-render-sharp" />
                          
                          {settings.logo && logoImage && (
                              <div className={`absolute w-[15%] opacity-40 pointer-events-none z-10 ${
                                  (() => {
                                      switch(settings.logoPlacement) {
                                          case 'tl': return 'top-4 left-4';
                                          case 'tc': return 'top-4 left-1/2 -translate-x-1/2';
                                          case 'tr': return 'top-4 right-4';
                                          case 'bl': return 'bottom-4 left-4';
                                          case 'bc': return 'bottom-4 left-1/2 -translate-x-1/2';
                                          case 'br': return 'bottom-4 right-4';
                                          default: return 'top-4 right-4';
                                      }
                                  })()
                              }`}>
                                  <img src={logoImage} alt="Brand Logo" className="w-full h-auto object-contain" />
                              </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-orange-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-3 md:p-4 pointer-events-none z-20">
                            <div className="flex gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 pointer-events-auto">
                                <button 
                                    onClick={() => handleDownload(url, downloadName)} 
                                    className="flex-1 bg-white text-orange-600 py-2 md:py-3 rounded-lg md:rounded-xl font-black italic text-[8px] md:text-[10px] flex items-center justify-center gap-1 shadow-2xl hover:bg-orange-50 transition-colors"
                                >
                                    <Download size={14} /> Simpan
                                </button>
                                <button onClick={() => handleRegenerateSingle(i)} className="bg-white/20 backdrop-blur-xl text-white p-2 md:p-3 rounded-lg md:rounded-xl border border-white/30 hover:bg-white/40 shadow-xl"><RotateCcw size={14} className="text-white" /></button>
                            </div>
                          </div>
                          <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1 z-20"><div className="bg-orange-400/90 backdrop-blur-md text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[6px] md:text-[8px] font-black uppercase tracking-widest border border-white/20 shadow-xl">{selectedCategory === 'fashion' ? selectedStyle : (generateTab === 'Custom' ? 'Custom Ref' : selectedPreset?.name || selectedResultType)}</div></div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-orange-900 text-sm flex items-center gap-2">
                                <FileText size={18} className="text-orange-500" />
                                Deskripsi Produk Untuk Marketplace
                            </h3>
                            {caption && (
                                <button 
                                    onClick={handleCopyCaption}
                                    className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${isCaptionCopied ? 'text-emerald-500' : 'text-slate-400 hover:text-orange-500'}`}
                                >
                                    {isCaptionCopied ? <Check size={12} /> : <Copy size={12} />} 
                                    {isCaptionCopied ? 'Teks Tersalin' : 'Salin'}
                                </button>
                            )}
                        </div>
                        
                        {isCaptionLoading ? (
                            <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-3">
                                <Loader2 className="animate-spin text-orange-400" size={24} />
                                <span className="text-xs font-medium animate-pulse">Sedang menulis deskripsi...</span>
                            </div>
                        ) : caption ? (
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-60 overflow-y-auto">
                                <pre className="whitespace-pre-wrap text-xs text-slate-600 font-sans leading-relaxed">{caption}</pre>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-xs text-slate-400 mb-4">Belum ada deskripsi. Buat deskripsi otomatis untuk marketplace Anda.</p>
                                <button 
                                    onClick={generateMarketplaceCaption}
                                    className="px-6 py-3 rounded-xl bg-orange-50 text-orange-600 font-black text-xs uppercase tracking-widest hover:bg-orange-100 transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <Bot size={16} /> Buat Deskripsi
                                </button>
                            </div>
                        )}
                  </div>

                  <div className="flex gap-2 md:gap-4 justify-center pt-6 md:pt-10 border-t border-orange-100 flex-wrap">
                    <button onClick={() => setStep(4)} className="flex-1 md:flex-none bg-slate-100 text-slate-500 px-6 md:px-8 py-3.5 md:py-5 rounded-full font-black italic uppercase tracking-widest text-[9px] md:text-xs hover:bg-slate-200 transition-all">Kembali</button>
                    <button onClick={handleNewProjectClick} className="flex-1 md:flex-none bg-white border-2 border-orange-100 text-orange-300 px-6 md:px-8 py-3.5 md:py-5 rounded-full font-black italic uppercase tracking-widest text-[9px] md:text-xs hover:border-orange-400 hover:text-orange-500 transition-all">Baru</button>
                    <button onClick={handleGenerate} className="w-full md:w-auto bg-orange-400 text-white px-10 md:px-12 py-3.5 md:py-5 rounded-full font-black italic shadow-2xl shadow-orange-100 hover:bg-orange-500 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest">Generate Ulang</button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {!isGenerating && step < 5 && (
          <div className="p-4 md:p-6 border-t border-orange-100 bg-white flex justify-between items-center gap-3 md:gap-4 text-slate-900">
            <button onClick={prevStep} disabled={step === 1} className={`flex items-center gap-1 md:gap-2 px-6 md:px-8 py-3.5 md:py-4 rounded-full font-black italic text-[10px] md:text-sm uppercase tracking-widest transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50'}`}><ChevronLeft size={16} /></button>
            {step < 4 && (
                <button onClick={nextStep} disabled={step === 1 && (!selectedCategory || !uploadedImage)} className={`px-8 md:px-12 py-3.5 md:py-4 rounded-full font-black italic text-[10px] md:text-sm uppercase tracking-widest transition-all flex items-center gap-1 md:gap-2 ${ (step === 1 && (!selectedCategory || !uploadedImage)) ? 'bg-orange-50 text-orange-200' : 'bg-orange-400 text-white shadow-xl shadow-orange-100 hover:bg-orange-500 hover:scale-105 active:scale-95' }`}>Lanjut <ChevronRight size={16} /></button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
