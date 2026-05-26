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
    img: require("../../assets/3rd.png"),
  },
  {
    _id: "3",
    title: "onboard_title3",
    description: "onboard_desc3",
    img: require("../../assets/2nd.png"),
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
    name: "dolmen_mall",
    address: "dolmen_address",
    distance: "2.1 ",
  },
  {
    id: "2",
    name: "luckyone_mall",
    address: "luckyone_address",
    distance: "5.4 ",
  },
  {
    id: "3",
    name: "frere_hall",
    address: "frere_address",
    distance: "3.2 ",
  },
  {
    id: "4",
    name: "sea_view",
    address: "sea_view_address",
    distance: "4.8 ",
  },
  {
    id: "5",
    name: "national_museum",
    address: "national_museum_address",
    distance: "2.9 ",
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

    img: require("../../assets/rickshaw.png"),
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
    title: "promo_special_25",
    desc: "promo_desc_today",
    color: "#A259FF",
  },
  {
    id: "2",
    title: "promo_discount_30",
    desc: "promo_desc_new_user",
    color: "#FFC107",
  },
  {
    id: "3",
    title: "promo_special_20",
    desc: "promo_desc_today",
    color: "#FF5A5F",
  },
  {
    id: "4",
    title: "promo_discount_40",
    desc: "promo_desc_valid",
    color: "#4CD964",
  },
  {
    id: "5",
    title: "promo_discount_35",
    desc: "promo_desc_valid",
    color: "#FFC107",
  },
];

export const rides = [
  {
    id: "bike",
    label: "Bike",
    image: require("../../assets/bike.png"),
    eta: "8 mins",
    price: 150,
  },
  {
    id: "rickshaw",
    label: "Rickshaw",
    image: require("../../assets/rickshaw.png"),
    eta: "6 mins",
    price: 200,
  },
  {
    id: "car",
    label: "Car",
    image: require("../../assets/car.png"),
    eta: "5 mins",
    price: 280,
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

export const timeOptions = ["morning", "evening", "full_day"];

export const driverPreferences = ["male", "female", "no_preference"];

export const pkgWeight = ["Light (0-5kg)", "Medium (5-15kg)", "Heavy (>15kg)"];

export const savedLocations = [
  {
    id: "1",
    name: "Bismillah",
    address: "Chowk Rd Se...",
  },
  {
    id: "2",
    name: "Indus",
    address: "University, Nat...",
  },
  {
    id: "3",
    name: "National",
    address: "Stadium, N...",
  },
];
