import { useState, useEffect } from 'react';
import { Plane, Calendar, Loader, Filter, AlertCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

// Define TypeScript interfaces
interface PopularFlight {
  id: string;
  airline: string;
  from: string;
  to: string;
  price: string;
  duration: string;
  departureTime: string;
  arrivalTime: string;
}

interface AmadeusFlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      operating: {
        carrierCode: string;
      };
      duration: string;
      id: string;
      numberOfStops: number;
      blacklistedInEU: boolean;
    }>;
  }>;
  price: {
    currency: string;
    total: string;
    base: string;
    fees: Array<{
      amount: string;
      type: string;
    }>;
    grandTotal: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment: Array<{
      segmentId: string;
      cabin: string;
      fareBasis: string;
      brandedFare: string;
      class: string;
      includedCheckedBags: {
        quantity: number;
      };
    }>;
  }>;
}

interface FlightSearchError {
  message: string;
  code?: string;
}

const Flights = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hasSearched, setHasSearched] = useState(false);

  // Use React Query for better data fetching
  const { data: results, isLoading, error, refetch } = useQuery({
    queryKey: ['flights', from, to, date],
    queryFn: async (): Promise<AmadeusFlightOffer[]> => {
      if (!from || !to || !date) return [];
      
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originLocationCode: from,
          destinationLocationCode: to,
          departureDate: date,
          adults: 1,
          max: 10
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch flight data');
      }

      const data = await response.json();
      return data.data || [];
    },
    enabled: false, // Don't fetch automatically
  });

  const handleSearch = () => {
    if (!from || !to || !date) {
      return;
    }
    setHasSearched(true);
    refetch();
  };

  const popularFlights: PopularFlight[] = [
    {
      id: '101',
      airline: 'Emirates',
      from: 'DXB',
      to: 'LHR',
      price: '$580',
      duration: '7h 45m',
      departureTime: '02:00 PM',
      arrivalTime: '06:45 PM',
    },
    {
      id: '102',
      airline: 'United Airlines',
      from: 'JFK',
      to: 'LAX',
      price: '$320',
      duration: '6h 30m',
      departureTime: '09:00 AM',
      arrivalTime: '03:30 PM',
    },
    {
      id: '103',
      airline: 'Singapore Airlines',
      from: 'SIN',
      to: 'NRT',
      price: '$450',
      duration: '7h 00m',
      departureTime: '11:00 AM',
      arrivalTime: '06:00 PM',
    },
  ];

  const formatDuration = (duration: string): string => {
    const hours = duration.match(/(\d+)H/)?.[1] || '0';
    const minutes = duration.match(/(\d+)M/)?.[1] || '0';
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateTimeString: string): string => {
    return format(new Date(dateTimeString), 'hh:mm a');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-indigo-800 py-32">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-white">
            Find Your Perfect Flight
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Search and compare flights from hundreds of airlines worldwide
          </p>
        </div>
      </div>

      {/* Enhanced Search Section */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">From</label>
              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-lg px-4 py-3 focus-within:border-primary transition">
                <Plane className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Origin (e.g., JFK)"
                  className="w-full bg-transparent outline-none"
                  value={from}
                  onChange={(e) => setFrom(e.target.value.toUpperCase())}
                  maxLength={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">To</label>
              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-lg px-4 py-3 focus-within:border-primary transition">
                <Plane className="w-5 h-5 text-gray-400 rotate-90" />
                <input
                  type="text"
                  placeholder="Destination (e.g., LAX)"
                  className="w-full bg-transparent outline-none"
                  value={to}
                  onChange={(e) => setTo(e.target.value.toUpperCase())}
                  maxLength={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-lg px-4 py-3 focus-within:border-primary transition">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  className="w-full bg-transparent outline-none"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full bg-primary text-white rounded-lg font-medium py-3 px-6 hover:bg-primary/90 transition flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    Search Flights
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-16">
        {error && (
          <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl mb-8">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Failed to fetch flight data. Please try again.</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <Loader className="animate-spin w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-lg text-gray-600">Searching for the best flights...</p>
          </div>
        )}

        {!isLoading && hasSearched && results && results.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {results.length} Flights Found
              </h2>
              <button className="flex items-center gap-2 text-gray-600 hover:text-primary transition">
                <Filter className="w-5 h-5" />
                Filter Results
              </button>
            </div>
            <div className="space-y-6">
              {results.map((flight: AmadeusFlightOffer) => {
                const firstSegment = flight.itineraries[0].segments[0];
                const lastSegment = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];
                
                return (
                  <div key={flight.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-xl font-bold">{firstSegment.carrierCode}</h3>
                          <div className="text-sm text-gray-500">Flight {firstSegment.number}</div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{firstSegment.departure.iataCode}</div>
                            <div className="text-sm text-gray-500">{formatDateTime(firstSegment.departure.at)}</div>
                          </div>
                          
                          <div className="flex-1 px-4">
                            <div className="h-[2px] bg-gray-300 relative">
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-sm text-gray-500">
                                {formatDuration(flight.itineraries[0].duration)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-bold">{lastSegment.arrival.iataCode}</div>
                            <div className="text-sm text-gray-500">{formatDateTime(lastSegment.arrival.at)}</div>
                          </div>
                        </div>
                        
                        {flight.itineraries[0].segments.length > 1 && (
                          <div className="mt-2 text-sm text-orange-600">
                            {flight.itineraries[0].segments.length - 1} stop(s)
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-center gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">
                            {flight.price.currency} {flight.price.total}
                          </div>
                          <div className="text-sm text-gray-500">per person</div>
                        </div>
                        
                        <button className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition">
                          Select Flight
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!isLoading && hasSearched && (!results || results.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <AlertCircle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Flights Found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or selecting different dates.
            </p>
          </div>
        )}

        {!hasSearched && (
          <div className="py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Popular Routes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularFlights.map((flight) => (
                <div key={flight.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg">{flight.airline}</h3>
                    <div className="text-primary text-xl font-bold">{flight.price}</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center flex-1">
                        <div className="text-2xl font-bold">{flight.from}</div>
                        <div className="text-sm text-gray-500">{flight.departureTime}</div>
                      </div>
                      
                      <div className="text-gray-400">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                      
                      <div className="text-center flex-1">
                        <div className="text-2xl font-bold">{flight.to}</div>
                        <div className="text-sm text-gray-500">{flight.arrivalTime}</div>
                      </div>
                    </div>
                    
                    <div className="text-center text-sm text-gray-500">
                      Duration: {flight.duration}
                    </div>
                    
                    <button className="w-full bg-primary/10 text-primary font-medium py-2 rounded-lg hover:bg-primary/20 transition">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flights;
