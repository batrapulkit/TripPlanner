import { useState, useRef } from 'react';
import { TravelPreference } from '@shared/schema';
import { type GeneratedItinerary as ItineraryType } from '@/lib/openai';
import { apiRequest } from '@/lib/queryClient';

import HeroSection from '@/components/HeroSection';
import StepIndicator from '@/components/StepIndicator';
import PreferenceCollector from '@/components/PreferenceCollector';
import ChatInterface from '@/components/ChatInterface';
import GeneratedItinerary from '@/components/GeneratedItinerary';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CallToAction from '@/components/CallToAction';
import { useToast } from '@/hooks/use-toast';

const steps = [
  { label: "Your Preferences", value: 1 },
  { label: "AI Processing", value: 2 },
  { label: "Your Itinerary", value: 3 },
  { label: "Finalize & Book", value: 4 }
];

const Home = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preference, setPreference] = useState<TravelPreference | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryType | null>(null);
  const planningProcessRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleStartPlanning = () => {
    setCurrentStep(1);
    if (planningProcessRef.current) {
      planningProcessRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePreferenceComplete = (savedPreference: TravelPreference) => {
    setPreference(savedPreference);
    console.log("Saved preference:", savedPreference); // Debugging line
    if (!showChat) {
      handleGenerateItinerary();
    }
  };

  const handleChatStart = () => {
    setShowChat(true);
  };

  const handleBackToQuestions = () => {
    setShowChat(false);
  };

  const handleGenerateItinerary = async () => {
    if (!preference) {
      toast({
        title: "Error",
        description: "No preferences found. Please enter your preferences to continue.",
        variant: "destructive"
      });
      return;
    }

    if (!preference.id) {
      toast({
        title: "Error",
        description: "Preference ID is missing. Please try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      setCurrentStep(2);
      toast({
        title: "Generating your personalized itinerary...",
        description: "This might take a moment as our AI creates your perfect trip."
      });

      console.log("Generating itinerary with preference ID:", preference.id);

      const response = await apiRequest('POST', '/api/generate-itinerary', {
        preferenceId: preference.id
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate itinerary: ${errorText}`);
      }

      const data = await response.json();
      setItinerary(data.content);
      setCurrentStep(3);
    } catch (error) {
      console.error("Itinerary generation error:", error);
      toast({
        title: "Error generating itinerary",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      // Reset to preference collection step
      setCurrentStep(1);
    }
  };

  return (
    <>
      <HeroSection onStartPlanning={handleStartPlanning} />

      <section id="planning-process" ref={planningProcessRef} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-poppins mb-4">How TravelPal AI Works</h2>
            <p className="text-medium max-w-2xl mx-auto">
              Our AI-powered system creates hyper-personalized travel itineraries based on your preferences and interests.
            </p>
          </div>

          {currentStep > 0 && <StepIndicator currentStep={currentStep} steps={steps} />}

          {currentStep === 1 && !showChat && (
            <PreferenceCollector onComplete={handlePreferenceComplete} />
          )}

          {currentStep === 1 && showChat && preference && (
            <div className="max-w-3xl mx-auto mt-16 bg-light rounded-2xl shadow-sm p-8">
              <h3 className="text-2xl font-bold font-poppins mb-6">Tell us more about your dream trip</h3>
              <ChatInterface
                preference={preference}
                onBackToQuestions={handleBackToQuestions}
                onGenerateItinerary={handleGenerateItinerary}
              />
            </div>
          )}

          {currentStep >= 3 && itinerary && (
            <GeneratedItinerary itinerary={itinerary} />
          )}
        </div>
      </section>

      {currentStep === 0 && (
        <>
          <FeaturesSection />
          <TestimonialsSection />
          <CallToAction onStartPlanning={handleStartPlanning} />
        </>
      )}
    </>
  );
};

export default Home;
