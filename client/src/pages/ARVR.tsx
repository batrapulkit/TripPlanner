import { Globe, Smartphone, Compass, Headset, Orbit, Shuffle, MapPin, Glasses, Languages, Hotel, Users, ListChecks } from 'lucide-react';

const ARVR = () => {
  const features = [
    {
      icon: <Glasses className="w-12 h-12 mb-4 text-primary" />,
      title: "Virtual Tours",
      description: "Experience destinations in immersive 360° virtual tours before you book. Walk through hotels, explore landmarks, and preview activities."
    },
    {
      icon: <Smartphone className="w-12 h-12 mb-4 text-primary" />,
      title: "AR Navigation",
      description: "Use augmented reality to navigate new cities with real-time points of interest, directions, and historical information directly in your view."
    },
    {
      icon: <Headset className="w-12 h-12 mb-4 text-primary" />,
      title: "VR Experiences",
      description: "Transport yourself to exotic locations with our VR experiences. Feel like you're actually there before booking your trip."
    },
    {
      icon: <MapPin className="w-12 h-12 mb-4 text-primary" />,
      title: "AR Information Overlay",
      description: "Point your camera at monuments, restaurants, or attractions to instantly see ratings, hours, menus, and historical information."
    },
    {
      icon: <Languages className="w-12 h-12 mb-4 text-primary" />,
      title: "AR Local Translation",
      description: "Translate signs, menus, and boards in real time using your camera. Break language barriers and travel confidently."
    },
    {
      icon: <Hotel className="w-12 h-12 mb-4 text-primary" />,
      title: "AR Hotel/Restaurant Previews",
      description: "Preview hotel rooms and restaurant interiors in AR before booking to ensure they meet your expectations."
    },
    {
      icon: <ListChecks className="w-12 h-12 mb-4 text-primary" />,
      title: "Virtual Itinerary Previews",
      description: "Visualize your entire trip with a day-wise VR itinerary that gives you a sneak peek into your upcoming adventures."
    },
    {
      icon: <Users className="w-12 h-12 mb-4 text-primary" />,
      title: "Social VR Travel",
      description: "Connect with friends or fellow travelers in shared virtual environments. Explore and plan together in real time."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight animate-fadeIn">
              Experience Travel in a <span className="text-blue-300">New Dimension</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 animate-fadeInDelay">
              Explore destinations in AR/VR before you travel. Plan better trips, visualize accommodations, and discover hidden gems with immersive technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInDelayLong">
              <button className="bg-white text-indigo-900 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition shadow-lg flex items-center justify-center">
                <Headset className="mr-2" />
                Try VR Demo
              </button>
              <button className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition flex items-center justify-center">
                <Smartphone className="mr-2" />
                Download AR App
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            Immersive Travel Features
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* The rest of your component remains unchanged */}
      {/* Demo section */}
      {/* How it works section */}
      {/* ... */}
    </div>
  );
};

export default ARVR;
