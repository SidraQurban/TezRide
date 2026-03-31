const data = [
  {
    _id: "1",
    title: "onboard_title1",
    description: "onboard_desc1",
    img: require("../../assets/1st.png"),
  },
  {
    _id: "2",
    title: "onboard_title2",
    description: "onboard_desc2",
    img: require("../../assets/2nd.png"),
  },
  {
    _id: "3",
    title: "onboard_title3",
    description: "onboard_desc3",
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
    rating: 4.6,
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
];

export const rideOptions = [
  {
    id: "1",
    type: "Bike",
    price: 150,
    nearby: 7,

    img: require("../../assets/bike.png"),
  },
  {
    id: "2",
    type: "Rickshaw",
    price: 200,
    nearby: 19,

    img: require("../../assets/auto.png"),
  },
  {
    id: "3",
    type: "Standard",
    price: 280,
    nearby: 12,

    img: require("../../assets/car.png"),
  },
  {
    id: "4",
    type: "Premium",
    price: 330,
    nearby: 4,

    img: require("../../assets/prem.png"),
  },
];

export const promoData = [
  {
    id: "1",
    title: "Special 25% Off",
    desc: "Special promo only today!",
    color: "#A259FF",
  },
  {
    id: "2",
    title: "Discount 30% Off",
    desc: "New user special promo",
    color: "#FFC107",
  },
  {
    id: "3",
    title: "Special 20% Off",
    desc: "Special promo only today!",
    color: "#FF5A5F",
  },
  {
    id: "4",
    title: "Discount 40% Off",
    desc: "Special promo only valid today!",
    color: "#4CD964",
  },
  {
    id: "5",
    title: "Discount 35% Off",
    desc: "Special promo only valid today!",
    color: "#FFC107",
  },
];

export const rides = [
  {
    id: "bike",
    label: "BIKE",
    image: require("../../assets/bike.png"),
    eta: "8 mins",
    price: 150,
  },
  {
    id: "rickshaw",
    label: "RICKSHAW",
    image: require("../../assets/auto.png"),
    eta: "6 mins",
    price: 200,
  },
  {
    id: "car",
    label: "CAR",
    image: require("../../assets/car.png"),
    eta: "5 mins",
    price: 280,
  },
  {
    id: "prem",
    label: "Comfort",
    image: require("../../assets/prem.png"),
    eta: "4 mins",
    price: 330,
  },
];

export const categoriesData = [
  "Food",
  "Grocery",
  "Pharmacy",
  "Electronics",
  "Bakery",
  "Fruits",
  "Meat",
];

export const shopsData = [
  {
    id: 1,
    name: "Avenue Bakery",
    rating: 4.8,
    image: require("../../assets/bakery2.webp"),
    products: [
      { id: 1, name: "Bread", image: require("../../assets/bread.png") },
      { id: 2, name: "Apples", image: require("../../assets/apples.png") },
      { id: 3, name: "Milk", image: require("../../assets/milk.png") },
      { id: 4, name: "Chocolates", image: require("../../assets/choc.png") },
    ],
  },
  {
    id: 2,
    name: "Daily Fresh Mart",
    rating: 4.6,
    image: require("../../assets/mart.jpg"),
    products: [
      { id: 1, name: "Banana", image: require("../../assets/bananas.png") },
      { id: 2, name: "Eggs", image: require("../../assets/eggs.png") },
      { id: 3, name: "Vegetables", image: require("../../assets/veges.png") },
      { id: 4, name: "Rice", image: require("../../assets/rice.png") },
    ],
  },
  {
    id: 3,
    name: "Health Pharmacy",
    rating: 4.7,
    image: require("../../assets/pharmacy.jpg"),
    products: [
      {
        id: 1,
        name: "Medicines",
        image: require("../../assets/meds.png"),
      },
      { id: 2, name: "Syrup", image: require("../../assets/syrup.png") },
      { id: 3, name: "Mask", image: require("../../assets/mask.png") },
      { id: 4, name: "Syringe", image: require("../../assets/syringe.png") },
    ],
  },
];

export const vehicles = [
  { label: "Bike", icon: "bicycle-sharp" },
  { label: "Auto", icon: "car-outline" },
  { label: "Car", icon: "car" },
];

export const timeOptions = ["Morning", "Evening", "Full Day"];

export const driverPreferences = ["Male", "Female", "No Preference"];

export const pkgWeight = ["Light (0-5kg)", "Medium (5-15kg)", "Heavy (>15kg)"];
