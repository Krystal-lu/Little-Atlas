import { GeocodingResult, SearchResult, Place, Memory } from '../types';

// Curated world destinations across all continents for instant offline search and zero-token experience
export const POPULAR_DESTINATIONS: GeocodingResult[] = [
  // Japan & East Asia
  { id: 'dest-kyoto', text: 'Kyoto', placeName: 'Kyoto, Kansai, Japan', city: 'Kyoto', region: 'Kansai', country: 'Japan', countryCode: 'jp', center: [135.7681, 35.0116] },
  { id: 'dest-tokyo', text: 'Tokyo', placeName: 'Tokyo, Kanto, Japan', city: 'Tokyo', region: 'Kanto', country: 'Japan', countryCode: 'jp', center: [139.6917, 35.6895] },
  { id: 'dest-osaka', text: 'Osaka', placeName: 'Osaka, Kansai, Japan', city: 'Osaka', region: 'Kansai', country: 'Japan', countryCode: 'jp', center: [135.5023, 34.6937] },
  { id: 'dest-nara', text: 'Nara', placeName: 'Nara, Kansai, Japan', city: 'Nara', region: 'Kansai', country: 'Japan', countryCode: 'jp', center: [135.8048, 34.6851] },
  { id: 'dest-hiroshima', text: 'Hiroshima', placeName: 'Hiroshima, Chugoku, Japan', city: 'Hiroshima', region: 'Chugoku', country: 'Japan', countryCode: 'jp', center: [132.4553, 34.3853] },
  { id: 'dest-sapporo', text: 'Sapporo', placeName: 'Sapporo, Hokkaido, Japan', city: 'Sapporo', region: 'Hokkaido', country: 'Japan', countryCode: 'jp', center: [141.3545, 43.0618] },
  { id: 'dest-fukuoka', text: 'Fukuoka', placeName: 'Fukuoka, Kyushu, Japan', city: 'Fukuoka', region: 'Kyushu', country: 'Japan', countryCode: 'jp', center: [130.4017, 33.5904] },
  { id: 'dest-hakone', text: 'Hakone', placeName: 'Hakone, Kanagawa, Japan', city: 'Hakone', region: 'Kanagawa', country: 'Japan', countryCode: 'jp', center: [139.0607, 35.2324] },
  { id: 'dest-seoul', text: 'Seoul', placeName: 'Seoul, South Korea', city: 'Seoul', region: 'Seoul', country: 'South Korea', countryCode: 'kr', center: [126.9780, 37.5665] },
  { id: 'dest-busan', text: 'Busan', placeName: 'Busan, South Korea', city: 'Busan', region: 'Gyeongsang', country: 'South Korea', countryCode: 'kr', center: [129.0756, 35.1796] },
  { id: 'dest-jeju', text: 'Jeju Island', placeName: 'Jeju, Jeju Province, South Korea', city: 'Jeju', region: 'Jeju', country: 'South Korea', countryCode: 'kr', center: [126.5312, 33.4996] },
  { id: 'dest-taipei', text: 'Taipei', placeName: 'Taipei, Taiwan', city: 'Taipei', region: 'Northern Taiwan', country: 'Taiwan', countryCode: 'tw', center: [121.5654, 25.0330] },
  { id: 'dest-hong-kong', text: 'Hong Kong', placeName: 'Hong Kong, China', city: 'Hong Kong', region: 'Hong Kong', country: 'Hong Kong', countryCode: 'hk', center: [114.1694, 22.3193] },
  { id: 'dest-beijing', text: 'Beijing', placeName: 'Beijing, China', city: 'Beijing', region: 'Beijing', country: 'China', countryCode: 'cn', center: [116.4074, 39.9042] },
  { id: 'dest-shanghai', text: 'Shanghai', placeName: 'Shanghai, China', city: 'Shanghai', region: 'East China', country: 'China', countryCode: 'cn', center: [121.4737, 31.2304] },

  // Southeast Asia
  { id: 'dest-bangkok', text: 'Bangkok', placeName: 'Bangkok, Central Thailand, Thailand', city: 'Bangkok', region: 'Central', country: 'Thailand', countryCode: 'th', center: [100.5018, 13.7563] },
  { id: 'dest-chiang-mai', text: 'Chiang Mai', placeName: 'Chiang Mai, Northern Thailand, Thailand', city: 'Chiang Mai', region: 'Northern', country: 'Thailand', countryCode: 'th', center: [98.9817, 18.7883] },
  { id: 'dest-phuket', text: 'Phuket', placeName: 'Phuket, Southern Thailand, Thailand', city: 'Phuket', region: 'Southern', country: 'Thailand', countryCode: 'th', center: [98.3923, 7.8804] },
  { id: 'dest-hanoi', text: 'Hanoi', placeName: 'Hanoi, Vietnam', city: 'Hanoi', region: 'Red River Delta', country: 'Vietnam', countryCode: 'vn', center: [105.8342, 21.0278] },
  { id: 'dest-hoi-an', text: 'Hoi An', placeName: 'Hoi An, Quang Nam, Vietnam', city: 'Hoi An', region: 'Central Coast', country: 'Vietnam', countryCode: 'vn', center: [108.3275, 15.8801] },
  { id: 'dest-saigon', text: 'Ho Chi Minh City', placeName: 'Ho Chi Minh City, Vietnam', city: 'Ho Chi Minh City', region: 'Southern Vietnam', country: 'Vietnam', countryCode: 'vn', center: [106.6297, 10.8231] },
  { id: 'dest-bali', text: 'Bali', placeName: 'Ubud, Bali, Indonesia', city: 'Ubud', region: 'Bali', country: 'Indonesia', countryCode: 'id', center: [115.2625, -8.5069] },
  { id: 'dest-singapore', text: 'Singapore', placeName: 'Singapore', city: 'Singapore', region: 'Singapore', country: 'Singapore', countryCode: 'sg', center: [103.8198, 1.3521] },
  { id: 'dest-kuala-lumpur', text: 'Kuala Lumpur', placeName: 'Kuala Lumpur, Malaysia', city: 'Kuala Lumpur', region: 'Federal Territory', country: 'Malaysia', countryCode: 'my', center: [101.6869, 3.1390] },
  { id: 'dest-penang', text: 'Penang', placeName: 'George Town, Penang, Malaysia', city: 'George Town', region: 'Penang', country: 'Malaysia', countryCode: 'my', center: [100.3327, 5.4141] },
  { id: 'dest-siem-reap', text: 'Siem Reap (Angkor Wat)', placeName: 'Siem Reap, Cambodia', city: 'Siem Reap', region: 'Siem Reap', country: 'Cambodia', countryCode: 'kh', center: [103.8560, 13.3671] },
  { id: 'dest-luang-prabang', text: 'Luang Prabang', placeName: 'Luang Prabang, Laos', city: 'Luang Prabang', region: 'Luang Prabang', country: 'Laos', countryCode: 'la', center: [102.1347, 19.8863] },
  { id: 'dest-manila', text: 'Manila', placeName: 'Manila, Philippines', city: 'Manila', region: 'Metro Manila', country: 'Philippines', countryCode: 'ph', center: [120.9842, 14.5995] },

  // South Asia
  { id: 'dest-new-delhi', text: 'New Delhi', placeName: 'New Delhi, Delhi, India', city: 'New Delhi', region: 'Delhi', country: 'India', countryCode: 'in', center: [77.2090, 28.6139] },
  { id: 'dest-mumbai', text: 'Mumbai', placeName: 'Mumbai, Maharashtra, India', city: 'Mumbai', region: 'Maharashtra', country: 'India', countryCode: 'in', center: [72.8777, 19.0760] },
  { id: 'dest-jaipur', text: 'Jaipur', placeName: 'Jaipur, Rajasthan, India', city: 'Jaipur', region: 'Rajasthan', country: 'India', countryCode: 'in', center: [75.7873, 26.9124] },
  { id: 'dest-kathmandu', text: 'Kathmandu', placeName: 'Kathmandu, Bagmati, Nepal', city: 'Kathmandu', region: 'Bagmati', country: 'Nepal', countryCode: 'np', center: [85.3240, 27.7172] },
  { id: 'dest-sri-lanka', text: 'Colombo', placeName: 'Colombo, Western Province, Sri Lanka', city: 'Colombo', region: 'Western Province', country: 'Sri Lanka', countryCode: 'lk', center: [79.8612, 6.9271] },
  { id: 'dest-maldives', text: 'Malé (Maldives)', placeName: 'Malé, Kaafu Atoll, Maldives', city: 'Malé', region: 'Kaafu', country: 'Maldives', countryCode: 'mv', center: [73.5093, 4.1755] },

  // France & Western Europe
  { id: 'dest-paris', text: 'Paris', placeName: 'Paris, Île-de-France, France', city: 'Paris', region: 'Île-de-France', country: 'France', countryCode: 'fr', center: [2.3522, 48.8566] },
  { id: 'dest-nice', text: 'Nice', placeName: 'Nice, Provence-Alpes-Côte d\'Azur, France', city: 'Nice', region: 'Côte d\'Azur', country: 'France', countryCode: 'fr', center: [7.2620, 43.7102] },
  { id: 'dest-lyon', text: 'Lyon', placeName: 'Lyon, Auvergne-Rhône-Alpes, France', city: 'Lyon', region: 'Rhône-Alpes', country: 'France', countryCode: 'fr', center: [4.8357, 45.7640] },
  { id: 'dest-bordeaux', text: 'Bordeaux', placeName: 'Bordeaux, Nouvelle-Aquitaine, France', city: 'Bordeaux', region: 'Nouvelle-Aquitaine', country: 'France', countryCode: 'fr', center: [-0.5792, 44.8378] },
  { id: 'dest-marseille', text: 'Marseille', placeName: 'Marseille, Provence, France', city: 'Marseille', region: 'Provence', country: 'France', countryCode: 'fr', center: [5.3698, 43.2965] },
  { id: 'dest-chamonix', text: 'Chamonix', placeName: 'Chamonix-Mont-Blanc, Haute-Savoie, France', city: 'Chamonix', region: 'Alps', country: 'France', countryCode: 'fr', center: [6.8694, 45.9237] },
  { id: 'dest-amsterdam', text: 'Amsterdam', placeName: 'Amsterdam, North Holland, Netherlands', city: 'Amsterdam', region: 'North Holland', country: 'Netherlands', countryCode: 'nl', center: [4.9041, 52.3676] },
  { id: 'dest-brussels', text: 'Brussels', placeName: 'Brussels, Belgium', city: 'Brussels', region: 'Brussels', country: 'Belgium', countryCode: 'be', center: [4.3517, 50.8503] },
  { id: 'dest-bruges', text: 'Bruges', placeName: 'Bruges, West Flanders, Belgium', city: 'Bruges', region: 'Flanders', country: 'Belgium', countryCode: 'be', center: [3.2247, 51.2093] },

  // United Kingdom & Ireland
  { id: 'dest-london', text: 'London', placeName: 'London, Greater London, United Kingdom', city: 'London', region: 'Greater London', country: 'United Kingdom', countryCode: 'gb', center: [-0.1276, 51.5074] },
  { id: 'dest-edinburgh', text: 'Edinburgh', placeName: 'Edinburgh, Scotland, United Kingdom', city: 'Edinburgh', region: 'Scotland', country: 'United Kingdom', countryCode: 'gb', center: [-3.1883, 55.9533] },
  { id: 'dest-oxford', text: 'Oxford', placeName: 'Oxford, Oxfordshire, United Kingdom', city: 'Oxford', region: 'Oxfordshire', country: 'United Kingdom', countryCode: 'gb', center: [-1.2577, 51.7520] },
  { id: 'dest-cotswolds', text: 'Cotswolds', placeName: 'Cotswolds, Gloucestershire, United Kingdom', city: 'Bourton-on-the-Water', region: 'Gloucestershire', country: 'United Kingdom', countryCode: 'gb', center: [-1.7570, 51.8856] },
  { id: 'dest-highlands', text: 'Scottish Highlands', placeName: 'Inverness, Scottish Highlands, United Kingdom', city: 'Inverness', region: 'Highlands', country: 'United Kingdom', countryCode: 'gb', center: [-4.2247, 57.4778] },
  { id: 'dest-dublin', text: 'Dublin', placeName: 'Dublin, County Dublin, Ireland', city: 'Dublin', region: 'Leinster', country: 'Ireland', countryCode: 'ie', center: [-6.2603, 53.3498] },
  { id: 'dest-galway', text: 'Galway', placeName: 'Galway, County Galway, Ireland', city: 'Galway', region: 'Connacht', country: 'Ireland', countryCode: 'ie', center: [-9.0568, 53.2707] },

  // Italy
  { id: 'dest-rome', text: 'Rome', placeName: 'Rome, Lazio, Italy', city: 'Rome', region: 'Lazio', country: 'Italy', countryCode: 'it', center: [12.4964, 41.9028] },
  { id: 'dest-florence', text: 'Florence', placeName: 'Florence, Tuscany, Italy', city: 'Florence', region: 'Tuscany', country: 'Italy', countryCode: 'it', center: [11.2558, 43.7696] },
  { id: 'dest-venice', text: 'Venice', placeName: 'Venice, Veneto, Italy', city: 'Venice', region: 'Veneto', country: 'Italy', countryCode: 'it', center: [12.3155, 45.4408] },
  { id: 'dest-lake-como', text: 'Lake Como', placeName: 'Lake Como, Lombardy, Italy', city: 'Como', region: 'Lombardy', country: 'Italy', countryCode: 'it', center: [9.2572, 45.9863] },
  { id: 'dest-amalfi', text: 'Amalfi Coast', placeName: 'Positano, Campania, Italy', city: 'Positano', region: 'Campania', country: 'Italy', countryCode: 'it', center: [14.4850, 40.6281] },
  { id: 'dest-milan', text: 'Milan', placeName: 'Milan, Lombardy, Italy', city: 'Milan', region: 'Lombardy', country: 'Italy', countryCode: 'it', center: [9.1900, 45.4642] },
  { id: 'dest-cinque-terre', text: 'Cinque Terre', placeName: 'Monterosso, Liguria, Italy', city: 'Monterosso', region: 'Liguria', country: 'Italy', countryCode: 'it', center: [9.6543, 44.1458] },
  { id: 'dest-dolomites', text: 'Dolomites', placeName: 'Cortina d\'Ampezzo, Veneto, Italy', city: 'Cortina', region: 'Veneto', country: 'Italy', countryCode: 'it', center: [12.1357, 46.5405] },

  // Spain & Portugal
  { id: 'dest-barcelona', text: 'Barcelona', placeName: 'Barcelona, Catalonia, Spain', city: 'Barcelona', region: 'Catalonia', country: 'Spain', countryCode: 'es', center: [2.1734, 41.3851] },
  { id: 'dest-madrid', text: 'Madrid', placeName: 'Madrid, Community of Madrid, Spain', city: 'Madrid', region: 'Madrid', country: 'Spain', countryCode: 'es', center: [-3.7038, 40.4168] },
  { id: 'dest-seville', text: 'Seville', placeName: 'Seville, Andalusia, Spain', city: 'Seville', region: 'Andalusia', country: 'Spain', countryCode: 'es', center: [-5.9845, 37.3891] },
  { id: 'dest-granada', text: 'Granada', placeName: 'Granada, Andalusia, Spain', city: 'Granada', region: 'Andalusia', country: 'Spain', countryCode: 'es', center: [-3.5986, 37.1773] },
  { id: 'dest-mallorca', text: 'Mallorca', placeName: 'Palma, Balearic Islands, Spain', city: 'Palma', region: 'Balearic Islands', country: 'Spain', countryCode: 'es', center: [2.6502, 39.5696] },
  { id: 'dest-lisbon', text: 'Lisbon', placeName: 'Lisbon, Lisbon District, Portugal', city: 'Lisbon', region: 'Lisbon District', country: 'Portugal', countryCode: 'pt', center: [-9.1393, 38.7223] },
  { id: 'dest-porto', text: 'Porto', placeName: 'Porto, Norte, Portugal', city: 'Porto', region: 'Norte', country: 'Portugal', countryCode: 'pt', center: [-8.6291, 41.1579] },
  { id: 'dest-algarve', text: 'Algarve', placeName: 'Faro, Algarve, Portugal', city: 'Faro', region: 'Algarve', country: 'Portugal', countryCode: 'pt', center: [-7.9304, 37.0194] },
  { id: 'dest-madeira', text: 'Madeira', placeName: 'Funchal, Madeira, Portugal', city: 'Funchal', region: 'Madeira', country: 'Portugal', countryCode: 'pt', center: [-16.9085, 32.6669] },

  // Central & Northern Europe
  { id: 'dest-berlin', text: 'Berlin', placeName: 'Berlin, Germany', city: 'Berlin', region: 'Berlin', country: 'Germany', countryCode: 'de', center: [13.4050, 52.5200] },
  { id: 'dest-munich', text: 'Munich', placeName: 'Munich, Bavaria, Germany', city: 'Munich', region: 'Bavaria', country: 'Germany', countryCode: 'de', center: [11.5820, 48.1351] },
  { id: 'dest-vienna', text: 'Vienna', placeName: 'Vienna, Austria', city: 'Vienna', region: 'Vienna', country: 'Austria', countryCode: 'at', center: [16.3738, 48.2082] },
  { id: 'dest-salzburg', text: 'Salzburg', placeName: 'Salzburg, Austria', city: 'Salzburg', region: 'Salzburg', country: 'Austria', countryCode: 'at', center: [13.0550, 47.8095] },
  { id: 'dest-prague', text: 'Prague', placeName: 'Prague, Czechia', city: 'Prague', region: 'Prague', country: 'Czechia', countryCode: 'cz', center: [14.4378, 50.0755] },
  { id: 'dest-budapest', text: 'Budapest', placeName: 'Budapest, Hungary', city: 'Budapest', region: 'Central Hungary', country: 'Hungary', countryCode: 'hu', center: [19.0402, 47.4979] },
  { id: 'dest-zurich', text: 'Zurich', placeName: 'Zurich, Switzerland', city: 'Zurich', region: 'Zurich', country: 'Switzerland', countryCode: 'ch', center: [8.5417, 47.3769] },
  { id: 'dest-zermatt', text: 'Zermatt', placeName: 'Zermatt, Valais, Switzerland', city: 'Zermatt', region: 'Valais', country: 'Switzerland', countryCode: 'ch', center: [7.7491, 45.9765] },
  { id: 'dest-copenhagen', text: 'Copenhagen', placeName: 'Copenhagen, Denmark', city: 'Copenhagen', region: 'Capital Region', country: 'Denmark', countryCode: 'dk', center: [12.5683, 55.6761] },
  { id: 'dest-stockholm', text: 'Stockholm', placeName: 'Stockholm, Sweden', city: 'Stockholm', region: 'Stockholm County', country: 'Sweden', countryCode: 'se', center: [18.0686, 59.3293] },
  { id: 'dest-oslo', text: 'Oslo', placeName: 'Oslo, Norway', city: 'Oslo', region: 'Eastern Norway', country: 'Norway', countryCode: 'no', center: [10.7522, 59.9139] },
  { id: 'dest-bergen', text: 'Bergen', placeName: 'Bergen, Vestland, Norway', city: 'Bergen', region: 'Vestland', country: 'Norway', countryCode: 'no', center: [5.3221, 60.3913] },
  { id: 'dest-reykjavik', text: 'Reykjavik', placeName: 'Reykjavik, Capital Region, Iceland', city: 'Reykjavik', region: 'Capital Region', country: 'Iceland', countryCode: 'is', center: [-21.9426, 64.1466] },
  { id: 'dest-vik', text: 'Vik', placeName: 'Vík í Mýrdal, South Region, Iceland', city: 'Vik', region: 'South Region', country: 'Iceland', countryCode: 'is', center: [-19.0060, 63.4186] },

  // Mediterranean & Balkans
  { id: 'dest-santorini', text: 'Santorini', placeName: 'Santorini, South Aegean, Greece', city: 'Fira', region: 'South Aegean', country: 'Greece', countryCode: 'gr', center: [25.4315, 36.3932] },
  { id: 'dest-athens', text: 'Athens', placeName: 'Athens, Attica, Greece', city: 'Athens', region: 'Attica', country: 'Greece', countryCode: 'gr', center: [23.7275, 37.9838] },
  { id: 'dest-mykonos', text: 'Mykonos', placeName: 'Mykonos, Cyclades, Greece', city: 'Mykonos', region: 'Cyclades', country: 'Greece', countryCode: 'gr', center: [25.3289, 37.4467] },
  { id: 'dest-crete', text: 'Crete', placeName: 'Chania, Crete, Greece', city: 'Chania', region: 'Crete', country: 'Greece', countryCode: 'gr', center: [24.0180, 35.5138] },
  { id: 'dest-dubrovnik', text: 'Dubrovnik', placeName: 'Dubrovnik, Dalmatia, Croatia', city: 'Dubrovnik', region: 'Dalmatia', country: 'Croatia', countryCode: 'hr', center: [18.0944, 42.6507] },
  { id: 'dest-split', text: 'Split', placeName: 'Split, Split-Dalmatia, Croatia', city: 'Split', region: 'Dalmatia', country: 'Croatia', countryCode: 'hr', center: [16.4402, 43.5081] },

  // United States & Canada
  { id: 'dest-new-york', text: 'New York City', placeName: 'New York, New York, United States', city: 'New York', region: 'New York', country: 'United States', countryCode: 'us', center: [-74.0060, 40.7128] },
  { id: 'dest-san-francisco', text: 'San Francisco', placeName: 'San Francisco, California, United States', city: 'San Francisco', region: 'California', country: 'United States', countryCode: 'us', center: [-122.4194, 37.7749] },
  { id: 'dest-los-angeles', text: 'Los Angeles', placeName: 'Los Angeles, California, United States', city: 'Los Angeles', region: 'California', country: 'United States', countryCode: 'us', center: [-118.2437, 34.0522] },
  { id: 'dest-big-sur', text: 'Big Sur', placeName: 'Big Sur, California, United States', city: 'Big Sur', region: 'California', country: 'United States', countryCode: 'us', center: [-121.8078, 36.2704] },
  { id: 'dest-yosemite', text: 'Yosemite', placeName: 'Yosemite Valley, California, United States', city: 'Yosemite', region: 'California', country: 'United States', countryCode: 'us', center: [-119.5383, 37.8651] },
  { id: 'dest-seattle', text: 'Seattle', placeName: 'Seattle, Washington, United States', city: 'Seattle', region: 'Washington', country: 'United States', countryCode: 'us', center: [-122.3321, 47.6062] },
  { id: 'dest-portland', text: 'Portland', placeName: 'Portland, Oregon, United States', city: 'Portland', region: 'Oregon', country: 'United States', countryCode: 'us', center: [-122.6784, 45.5152] },
  { id: 'dest-chicago', text: 'Chicago', placeName: 'Chicago, Illinois, United States', city: 'Chicago', region: 'Illinois', country: 'United States', countryCode: 'us', center: [-87.6298, 41.8781] },
  { id: 'dest-boston', text: 'Boston', placeName: 'Boston, Massachusetts, United States', city: 'Boston', region: 'Massachusetts', country: 'United States', countryCode: 'us', center: [-71.0589, 42.3601] },
  { id: 'dest-washington-dc', text: 'Washington D.C.', placeName: 'Washington, District of Columbia, United States', city: 'Washington', region: 'D.C.', country: 'United States', countryCode: 'us', center: [-77.0369, 38.9072] },
  { id: 'dest-miami', text: 'Miami', placeName: 'Miami, Florida, United States', city: 'Miami', region: 'Florida', country: 'United States', countryCode: 'us', center: [-80.1918, 25.7617] },
  { id: 'dest-new-orleans', text: 'New Orleans', placeName: 'New Orleans, Louisiana, United States', city: 'New Orleans', region: 'Louisiana', country: 'United States', countryCode: 'us', center: [-90.0715, 29.9511] },
  { id: 'dest-austin', text: 'Austin', placeName: 'Austin, Texas, United States', city: 'Austin', region: 'Texas', country: 'United States', countryCode: 'us', center: [-97.7431, 30.2672] },
  { id: 'dest-hawaii', text: 'Honolulu (Hawaii)', placeName: 'Honolulu, Hawaii, United States', city: 'Honolulu', region: 'Hawaii', country: 'United States', countryCode: 'us', center: [-157.8583, 21.3069] },
  { id: 'dest-maui', text: 'Maui', placeName: 'Maui, Hawaii, United States', city: 'Kahului', region: 'Hawaii', country: 'United States', countryCode: 'us', center: [-156.3319, 20.7984] },
  { id: 'dest-vancouver', text: 'Vancouver', placeName: 'Vancouver, British Columbia, Canada', city: 'Vancouver', region: 'British Columbia', country: 'Canada', countryCode: 'ca', center: [-123.1207, 49.2827] },
  { id: 'dest-banff', text: 'Banff', placeName: 'Banff, Alberta, Canada', city: 'Banff', region: 'Alberta', country: 'Canada', countryCode: 'ca', center: [-115.5708, 51.1784] },
  { id: 'dest-toronto', text: 'Toronto', placeName: 'Toronto, Ontario, Canada', city: 'Toronto', region: 'Ontario', country: 'Canada', countryCode: 'ca', center: [-79.3832, 43.6532] },
  { id: 'dest-montreal', text: 'Montreal', placeName: 'Montreal, Quebec, Canada', city: 'Montreal', region: 'Quebec', country: 'Canada', countryCode: 'ca', center: [-73.5673, 45.5017] },

  // Latin America & Caribbean
  { id: 'dest-mexico-city', text: 'Mexico City', placeName: 'Mexico City, Mexico', city: 'Mexico City', region: 'CDMX', country: 'Mexico', countryCode: 'mx', center: [-99.1332, 19.4326] },
  { id: 'dest-oaxaca', text: 'Oaxaca', placeName: 'Oaxaca de Juárez, Oaxaca, Mexico', city: 'Oaxaca', region: 'Oaxaca', country: 'Mexico', countryCode: 'mx', center: [-96.7266, 17.0732] },
  { id: 'dest-tulum', text: 'Tulum', placeName: 'Tulum, Quintana Roo, Mexico', city: 'Tulum', region: 'Riviera Maya', country: 'Mexico', countryCode: 'mx', center: [-87.4654, 20.2114] },
  { id: 'dest-havana', text: 'Havana', placeName: 'Havana, Cuba', city: 'Havana', region: 'La Habana', country: 'Cuba', countryCode: 'cu', center: [-82.3666, 23.1136] },
  { id: 'dest-rio', text: 'Rio de Janeiro', placeName: 'Rio de Janeiro, Brazil', city: 'Rio de Janeiro', region: 'Rio de Janeiro', country: 'Brazil', countryCode: 'br', center: [-43.1729, -22.9068] },
  { id: 'dest-buenos-aires', text: 'Buenos Aires', placeName: 'Buenos Aires, Argentina', city: 'Buenos Aires', region: 'Buenos Aires', country: 'Argentina', countryCode: 'ar', center: [-58.3816, -34.6037] },
  { id: 'dest-patagonia', text: 'Patagonia', placeName: 'Bariloche, Patagonia, Argentina', city: 'Bariloche', region: 'Rio Negro', country: 'Argentina', countryCode: 'ar', center: [-71.3082, -41.1335] },
  { id: 'dest-cusco', text: 'Cusco (Machu Picchu)', placeName: 'Cusco, Peru', city: 'Cusco', region: 'Cusco', country: 'Peru', countryCode: 'pe', center: [-71.9675, -13.5319] },
  { id: 'dest-cartagena', text: 'Cartagena', placeName: 'Cartagena, Bolívar, Colombia', city: 'Cartagena', region: 'Bolívar', country: 'Colombia', countryCode: 'co', center: [-75.5144, 10.3910] },
  { id: 'dest-santiago', text: 'Santiago', placeName: 'Santiago, Santiago Metropolitan, Chile', city: 'Santiago', region: 'Central Valley', country: 'Chile', countryCode: 'cl', center: [-70.6693, -33.4489] },
  { id: 'dest-costa-rica', text: 'Costa Rica', placeName: 'San José, Costa Rica', city: 'San José', region: 'Central Valley', country: 'Costa Rica', countryCode: 'cr', center: [-84.0907, 9.9281] },

  // Middle East & North Africa
  { id: 'dest-cairo', text: 'Cairo', placeName: 'Cairo, Egypt', city: 'Cairo', region: 'Cairo Governorate', country: 'Egypt', countryCode: 'eg', center: [31.2357, 30.0444] },
  { id: 'dest-marrakech', text: 'Marrakech', placeName: 'Marrakech, Marrakesh-Safi, Morocco', city: 'Marrakech', region: 'Marrakesh-Safi', country: 'Morocco', countryCode: 'ma', center: [-7.9811, 31.6295] },
  { id: 'dest-istanbul', text: 'Istanbul', placeName: 'Istanbul, Turkey', city: 'Istanbul', region: 'Marmara', country: 'Turkey', countryCode: 'tr', center: [28.9784, 41.0082] },
  { id: 'dest-cappadocia', text: 'Cappadocia', placeName: 'Göreme, Cappadocia, Turkey', city: 'Göreme', region: 'Nevşehir', country: 'Turkey', countryCode: 'tr', center: [34.8289, 38.6431] },
  { id: 'dest-dubai', text: 'Dubai', placeName: 'Dubai, United Arab Emirates', city: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', countryCode: 'ae', center: [55.2708, 25.2048] },
  { id: 'dest-petra', text: 'Petra', placeName: 'Petra, Ma\'an Governorate, Jordan', city: 'Wadi Musa', region: 'Ma\'an', country: 'Jordan', countryCode: 'jo', center: [35.4444, 30.3285] },

  // Sub-Saharan Africa
  { id: 'dest-cape-town', text: 'Cape Town', placeName: 'Cape Town, Western Cape, South Africa', city: 'Cape Town', region: 'Western Cape', country: 'South Africa', countryCode: 'za', center: [18.4241, -33.9249] },
  { id: 'dest-nairobi', text: 'Nairobi', placeName: 'Nairobi, Kenya', city: 'Nairobi', region: 'Nairobi County', country: 'Kenya', countryCode: 'ke', center: [36.8219, -1.2921] },
  { id: 'dest-zanzibar', text: 'Zanzibar', placeName: 'Stone Town, Zanzibar, Tanzania', city: 'Stone Town', region: 'Zanzibar', country: 'Tanzania', countryCode: 'tz', center: [39.1979, -6.1659] },

  // Oceania
  { id: 'dest-sydney', text: 'Sydney', placeName: 'Sydney, New South Wales, Australia', city: 'Sydney', region: 'New South Wales', country: 'Australia', countryCode: 'au', center: [151.2093, -33.8688] },
  { id: 'dest-melbourne', text: 'Melbourne', placeName: 'Melbourne, Victoria, Australia', city: 'Melbourne', region: 'Victoria', country: 'Australia', countryCode: 'au', center: [144.9631, -37.8136] },
  { id: 'dest-brisbane', text: 'Brisbane', placeName: 'Brisbane, Queensland, Australia', city: 'Brisbane', region: 'Queensland', country: 'Australia', countryCode: 'au', center: [153.0251, -27.4698] },
  { id: 'dest-queenstown', text: 'Queenstown', placeName: 'Queenstown, Otago, New Zealand', city: 'Queenstown', region: 'Otago', country: 'New Zealand', countryCode: 'nz', center: [168.6626, -45.0312] },
  { id: 'dest-auckland', text: 'Auckland', placeName: 'Auckland, New Zealand', city: 'Auckland', region: 'North Island', country: 'New Zealand', countryCode: 'nz', center: [174.7633, -36.8485] },
  { id: 'dest-fiji', text: 'Fiji', placeName: 'Suva, Central Division, Fiji', city: 'Suva', region: 'Viti Levu', country: 'Fiji', countryCode: 'fj', center: [178.4419, -18.1416] },
];

// Fallback approximate coordinates for major regions & continents when entering custom places
export const REGION_COORDINATE_PRESETS: Record<string, [number, number]> = {
  europe: [10.5, 51.1],
  uk: [-1.5, 53.5],
  france: [2.2, 46.6],
  italy: [12.6, 42.5],
  spain: [-3.7, 40.4],
  germany: [10.4, 51.1],
  japan: [138.2, 36.2],
  asia: [100.0, 34.0],
  usa: [-95.7, 37.0],
  'north america': [-100.0, 45.0],
  'south america': [-58.0, -15.0],
  africa: [20.0, 5.0],
  australia: [133.7, -25.2],
  'new zealand': [174.8, -40.9],
  nordic: [15.0, 62.0],
  caribbean: [-70.0, 18.0],
  'middle east': [45.0, 25.0],
};

export interface CategorizedSearchResults {
  savedMatches: SearchResult[];
  atlasMatches: SearchResult[];
}

/**
 * 100% Offline Search:
 * 1. Matches existing saved places first (labeled with memory counts)
 * 2. Matches curated offline destination database second
 * 3. Never queries any external map or geocoding API
 */
export function searchOfflineAndSavedPlaces(
  query: string,
  savedPlaces: Place[],
  memories: Memory[]
): CategorizedSearchResults {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return { savedMatches: [], atlasMatches: [] };
  }

  // 1. Search existing saved places first (only places with at least 1 memory)
  const savedPlacesWithMemories = savedPlaces.filter((p) =>
    memories.some((m) => m.placeId === p.id)
  );

  const matchedSaved: SearchResult[] = [];
  const matchedSavedPlaceIds = new Set<string>();

  for (const place of savedPlacesWithMemories) {
    const nameMatch = place.name.toLowerCase().includes(cleanQuery);
    const cityMatch = place.city ? place.city.toLowerCase().includes(cleanQuery) : false;
    const regionMatch = place.region ? place.region.toLowerCase().includes(cleanQuery) : false;
    const countryMatch = place.country ? place.country.toLowerCase().includes(cleanQuery) : false;

    if (nameMatch || cityMatch || regionMatch || countryMatch) {
      const placeMemories = memories.filter((m) => m.placeId === place.id);
      matchedSavedPlaceIds.add(place.id);
      matchedSaved.push({
        id: `saved-${place.id}`,
        placeName: [place.city !== place.name ? place.city : null, place.region, place.country]
          .filter(Boolean)
          .join(', ') || place.name,
        text: place.name,
        city: place.city,
        region: place.region,
        country: place.country,
        countryCode: place.countryCode,
        center:
          typeof place.longitude === 'number' && typeof place.latitude === 'number'
            ? [place.longitude, place.latitude]
            : undefined,
        existingPlaceId: place.id,
        memoriesCount: placeMemories.length,
      });
    }
  }

  // 2. Search offline curated atlas destinations second
  const localAtlasMatches: SearchResult[] = [];

  for (const dest of POPULAR_DESTINATIONS) {
    const textMatch = dest.text.toLowerCase().includes(cleanQuery);
    const placeNameMatch = dest.placeName.toLowerCase().includes(cleanQuery);
    const countryMatch = dest.country ? dest.country.toLowerCase().includes(cleanQuery) : false;
    const regionMatch = dest.region ? dest.region.toLowerCase().includes(cleanQuery) : false;
    const cityMatch = dest.city ? dest.city.toLowerCase().includes(cleanQuery) : false;

    if (textMatch || placeNameMatch || countryMatch || regionMatch || cityMatch) {
      // Check if this atlas destination matches an already-found saved place
      const alreadySaved = savedPlacesWithMemories.find((sp) => {
        const sameName = sp.name.toLowerCase() === dest.text.toLowerCase();
        const sameCountry =
          !sp.country || !dest.country || sp.country.toLowerCase() === dest.country.toLowerCase();
        return sameName && sameCountry;
      });

      if (alreadySaved && matchedSavedPlaceIds.has(alreadySaved.id)) {
        // Skip duplicate in atlas list since it is already featured prominently in savedMatches
        continue;
      }

      localAtlasMatches.push({
        id: dest.id,
        placeName: dest.placeName,
        text: dest.text,
        city: dest.city,
        region: dest.region,
        country: dest.country,
        countryCode: dest.countryCode,
        center: dest.center,
        existingPlaceId: alreadySaved?.id,
        memoriesCount: alreadySaved ? memories.filter((m) => m.placeId === alreadySaved.id).length : 0,
      });
    }
  }

  return {
    savedMatches: matchedSaved.slice(0, 5),
    atlasMatches: localAtlasMatches.slice(0, 8),
  };
}

/**
 * Legacy-compatible search wrapper returning flat results
 */
export async function searchPlaces(
  query: string,
  _ignoredToken?: string
): Promise<SearchResult[]> {
  const { savedMatches, atlasMatches } = searchOfflineAndSavedPlaces(query, [], []);
  return [...savedMatches, ...atlasMatches];
}

