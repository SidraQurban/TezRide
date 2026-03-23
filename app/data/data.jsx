const data = [
  {
    _id: "1",
    title: "Book Rides Instantly Anywhere",
    description:
      "Skip the waiting. Connect with the nearest driver for a quick pickup.",
    img: require("../../assets/1st.png"),
  },
  {
    _id: "2",
    title: "Affordable and Transparent Pricing",
    description: "Check your fare upfront and pay only for what you travel.",
    img: require("../../assets/2nd.png"),
  },
  {
    _id: "3",
    title: "Safe and Verified Drivers",
    description: "Travel confidently with trusted drivers.",
    img: require("../../assets/3rd.png"),
  },
];
export default data;

export const drivers = [
  {
    id: "1",
    name: "Usman Tariq",
    rating: 4.6,
    reviews: 110,
    address: "303 Clifton",
    plate: "XYZ 789",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
  },
  {
    id: "2",
    name: "Sophia Ali",
    rating: 4.5,
    reviews: 120,
    address: "101 Clifton",
    plate: "JKL 456",
    image: "https://randomuser.me/api/portraits/women/51.jpg",
  },
  {
    id: "3",
    name: "Fatima Iqbal",
    rating: 4.7,
    reviews: 98,
    address: "202 DHA",
    plate: "ABC 123",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
  },
  {
    id: "4",
    name: "Ahmed Shah",
    rating: 4.4,
    reviews: 90,
    address: "505 DHA",
    plate: "GHI 567",
    image: "https://randomuser.me/api/portraits/men/48.jpg",
  },
  {
    id: "5",
    name: "Sara Malik",
    rating: 4.8,
    reviews: 150,
    address: "404 PECHS",
    plate: "DEF 234",
    image: "https://randomuser.me/api/portraits/women/47.jpg",
  },
];

export const SearchData = [
  {
    id: "1",
    name: "Dolmen Mall Clifton",
    address: "Block 4, Clifton, Karachi",
    distance: "2.1 Km",
  },
  {
    id: "2",
    name: "LuckyOne Mall",
    address: "Rashid Minhas Rd, Karachi",
    distance: "5.4 Km",
  },
  {
    id: "3",
    name: "Frere Hall",
    address: "Fatima Jinnah Rd, Saddar, Karachi",
    distance: "3.2 Km",
  },
  {
    id: "4",
    name: "Sea View Beach",
    address: "Clifton Beach, Karachi",
    distance: "4.8 Km",
  },
  {
    id: "5",
    name: "National Museum",
    address: "Burns Rd, Saddar, Karachi",
    distance: "2.9 Km",
  },
  {
    id: "6",
    name: "Safari Park",
    address: "University Rd, Karachi",
    distance: "6.1 Km",
  },
];

export const rideOptions = [
  {
    id: "1",
    type: "Bike",
    price: 150,
    nearby: 7,
    icon: "bicycle",
    iconLib: "Ionicons",
  },
  {
    id: "2",
    type: "Rickshaw",
    price: 200,
    nearby: 19,
    icon: "rickshaw",
    iconLib: "MaterialCommunityIcons",
  },
  {
    id: "3",
    type: "Standard",
    price: 280,
    nearby: 12,
    icon: "car",
    iconLib: "Ionicons",
  },
  {
    id: "4",
    type: "Premium",
    price: 330,
    nearby: 4,
    icon: "car-sport",
    iconLib: "Ionicons",
  },
];
