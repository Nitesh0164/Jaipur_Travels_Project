// Shape matches ItineraryDTO — easy swap for POST /api/planner/generate
export const MOCK_ITINERARY = {
  tripId:      'trip_mock_001',
  city:        'jaipur',
  title:       '2-Day Jaipur Family Heritage Trail',
  summary:     'A curated mix of royal heritage, authentic food, and hidden gems — perfectly paced for a family of 4.',
  generatedAt: '2025-03-15T10:30:00Z',
  days: [
    {
      dayNumber: 1,
      label:     'Day 1',
      theme:     'The Royal Heritage Trail',
      emoji:     '🏰',
      periods: [
        {
          period: 'Morning',
          icon:   '☀️',
          items: [
            { id:'i11', time:'7:30 AM', place:'Amber Fort',           placeId:'amber-fort',       category:'Heritage',    cost:200,  duration:'2.5 hrs', note:'Arrive at sunrise — golden light on the fort walls is magical. Book online to skip queues.', highlight:true  },
            { id:'i12', time:'10:30 AM',place:'Panna Meena Ka Kund',  placeId:'panna-meena-kund', category:'Hidden Gem',  cost:0,    duration:'30 min', note:'5-minute walk from Amber Fort. Geometric stepwell — utterly photogenic and completely free.', highlight:false },
          ],
        },
        {
          period: 'Afternoon',
          icon:   '🌤️',
          items: [
            { id:'i13', time:'12:00 PM',place:'Anokhi Cafe',          placeId:'anokhi-cafe',      category:'Cafe',        cost:400,  duration:'1 hr',   note:'Organic lunch in a heritage haveli courtyard. The beetroot salad is exceptional.',           highlight:false },
            { id:'i14', time:'2:00 PM', place:'City Palace',          placeId:'city-palace',      category:'Heritage',    cost:300,  duration:'1.5 hrs',note:'Family ticket available. Audio guide recommended — brings the royal history alive for kids.', highlight:true  },
          ],
        },
        {
          period: 'Evening',
          icon:   '🌇',
          items: [
            { id:'i15', time:'4:30 PM', place:'Hawa Mahal',           placeId:'hawa-mahal',       category:'Heritage',    cost:50,   duration:'45 min', note:'Walking distance from City Palace. Golden hour on the pink façade is spectacular.',           highlight:false },
            { id:'i16', time:'6:30 PM', place:'Johari Bazaar',        placeId:'johari-bazaar',    category:'Shopping',    cost:800,  duration:'1 hr',   note:'Evening market at its vibrant best. Browse jewellery and pick up Rajasthani souvenirs.',      highlight:false },
          ],
        },
      ],
    },
    {
      dayNumber: 2,
      label:     'Day 2',
      theme:     'Food, Views & Culture',
      emoji:     '🍴',
      periods: [
        {
          period: 'Morning',
          icon:   '☀️',
          items: [
            { id:'i21', time:'8:00 AM', place:'Lassiwala',            placeId:'lassiwala',        category:'Food',        cost:60,   duration:'20 min', note:'Get there before 10 AM — it sells out. Legendary clay-cup lassi. Don\'t miss it.',          highlight:true  },
            { id:'i22', time:'9:00 AM', place:'Jantar Mantar',        placeId:'jantar-mantar',    category:'Heritage',    cost:100,  duration:'1 hr',   note:'UNESCO astronomical instruments. Hire a guide — context makes it utterly fascinating.',       highlight:false },
            { id:'i23', time:'11:00 AM',place:'Albert Hall Museum',   placeId:'albert-hall',      category:'Heritage',    cost:150,  duration:'1.5 hrs',note:'Air-conditioned respite. Great Rajasthani art collection. Loved by families.',                highlight:false },
          ],
        },
        {
          period: 'Afternoon',
          icon:   '🌤️',
          items: [
            { id:'i24', time:'1:30 PM', place:'Bapu Bazaar',          placeId:'bapu-bazaar',      category:'Shopping',    cost:800,  duration:'1.5 hrs',note:'Block-print fabrics, jutis, bangles. Best place for gifts. Bargain with a smile.',           highlight:false },
          ],
        },
        {
          period: 'Evening',
          icon:   '🌇',
          items: [
            { id:'i25', time:'5:00 PM', place:'Nahargarh Fort',       placeId:'nahargarh-fort',   category:'Heritage',    cost:50,   duration:'2 hrs',  note:'Best sunset in Jaipur. Take a cab up. Views across the entire Pink City are worth every rupee.', highlight:true  },
            { id:'i26', time:'7:30 PM', place:'Tapri Central',        placeId:'tapri-central',    category:'Cafe',        cost:200,  duration:'1 hr',   note:'End the trip with Jaipur\'s best rooftop chai. Masala chai and city wall views — perfect.',   highlight:false },
          ],
        },
      ],
    },
  ],
  budget: { stay:2500, food:1860, travel:1200, tickets:1660, misc:500 },
  totalCost: 7720,
  tips: [
    'Book Amber Fort tickets online at asi.payumoney.com — saves a 45-min queue at the gate.',
    'Carry cash. Heritage sites, markets, and most dhabas don\'t accept cards or UPI.',
    'Jaipur is extreme in summer (12–3 PM). Plan indoor stops or breaks during peak heat.',
    'Agree on all rickshaw fares before getting in. A city-centre ride should be ₹80–150.',
    'The best photography light is 7–9 AM and 4–6 PM. Plan your monument visits around golden hour.',
  ],
}
