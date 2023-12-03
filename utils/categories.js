const categories = [
  {
    _id: "62c827b5a427b63741da9175",
    status: "show",
    name: {
      en: "Home",
    },
    id: "Root",
    parentName: "Home",
    description: {
      en: "This is Home Category",
    },
  },
  {
    _id: "62cc0791d511b304aecdfbf2",
    status: "show",
    name: {
      en: "Baby Food",
      de: "Babynahrung",
    },
    parentId: "62cc0637d511b304aecdfba8",
    parentName: "Baby Care",
    description: {
      en: "This is baby food category",
    },
    icon: "",
  },
  {
    _id: "62cc07b8d511b304aecdfbfa",
    status: "show",
    name: {
      en: "Baby Accessories",
      de: "Baby Accessoires",
    },
    parentId: "62cc0637d511b304aecdfba8",
    parentName: "Baby Care",
    description: {
      en: "This is baby accessories",
    },
    icon: "",
  },
  {
    _id: "62cfab28484d89068aa7a7f5",
    status: "show",
    name: {
      en: "Chocolate",
    },
    parentId: "62cfab19484d89068aa7a7ef",
    parentName: "Snacks & Instant",
    description: {
      en: "This is Chocolate category",
    },
    icon: "",
  },
  {
    _id: "62cfab39484d89068aa7a7fb",
    status: "show",
    name: {
      en: "Chips & Nuts",
    },
    parentId: "62cfab19484d89068aa7a7ef",
    parentName: "Snacks & Instant",
    description: {
      en: "This is Chips & Nuts category",
    },
    icon: "",
  },
  {
    _id: "62cfab4b484d89068aa7a7ff",
    status: "show",
    name: {
      en: "Canned Food",
    },
    parentId: "62cfab19484d89068aa7a7ef",
    parentName: "Snacks & Instant",
    description: {
      en: "This is Canned Food category",
    },
    icon: "",
  },
  {
    _id: "62cfad3d484d89068aa7a819",
    status: "show",
    name: {
      en: "Sauces",
    },
    parentId: "62cfad20484d89068aa7a812",
    parentName: "Sauces & Pickles",
    description: {
      en: "This is Sauces category",
    },
    icon: "",
  },
  {
    _id: "62cfad52484d89068aa7a81f",
    status: "show",
    name: {
      en: "Pickles & Condiments",
    },
    parentId: "62cfad20484d89068aa7a812",
    parentName: "Sauces & Pickles",
    description: {
      en: "This is Pickles & Condiments category",
    },
    icon: "",
  },
  {
    _id: "62d02efd2d28e904b20e22bf",
    status: "show",
    name: {
      en: "Tuna",
    },
    description: {
      en: "This is tuna fish category",
    },
    parentId: "62c851ae00bc1e3f08bb8191",
    parentName: "Fish",
    icon: "",
  },
  {
    _id: "62d03a312d28e904b20e233c",
    status: "show",
    name: {
      en: "Tuna",
      de: "Thunfisch",
    },
    description: {
      en: "This is tuna category",
      de: "Dies ist die Thunfisch-Kategorie",
    },
    parentId: "62d03a112d28e904b20e2336",
    parentName: "Fish",
    icon: "",
  },
  {
    _id: "62d03a542d28e904b20e2342",
    status: "show",
    name: {
      en: "Rui",
      de: "Rui",
    },
    description: {
      en: "This is Rui category",
      de: "Dies ist die Rui-Kategorie",
    },
    parentId: "62d03a112d28e904b20e2336",
    parentName: "Fish",
    icon: "",
  },
  {
    _id: "62d2bbd22e63b40520194f1b",
    status: "show",
    name: {
      en: "Apple",
    },
    parentId: "62cf9f32484d89068aa7a75f",
    parentName: "Fresh Fruits",
    description: {
      en: "This is the apple category",
    },
    icon: "",
  },
  {
    _id: "62d2bbe62e63b40520194f21",
    status: "show",
    name: {
      en: "Orange",
    },
    description: {
      en: "This is orange category",
    },
    parentId: "62cf9f32484d89068aa7a75f",
    parentName: "Fresh Fruits",
    icon: "",
  },
  {
    _id: "62e4ebb90ea79023fc11d847",
    status: "show",
    name: {
      en: "Beef",
      de: "Rindfleisch",
    },
    description: {
      en: "This is Beef Category",
      de: "Dies ist die Kategorie Rindfleisch",
    },
    parentId: "62c851be00bc1e3f08bb8197",
    parentName: "Meat",
    icon: "",
  },
  {
    _id: "632aae414d87ff2494210945",
    status: "show",
    name: {
      en: "Breakfast",
    },
    description: {
      en: "Breakfast",
    },
    parentId: "62c827b5a427b63741da9175",
    parentName: "Home",
    icon: "https://res.cloudinary.com/ahossain/image/upload/v1658340705/category%20icon/bagel_mt3fod.png",
  },
  {
    _id: "632aae624d87ff2494210951",
    status: "show",
    name: {
      en: "Cereal",
    },
    description: {
      en: "Cereal",
    },
    parentId: "632aae414d87ff2494210945",
    parentName: "Breakfasts",
    icon: "",
  },
  {
    _id: "632aae7b4d87ff2494210967",
    status: "show",
    name: {
      en: "Bread",
    },
    description: {
      en: "Bread",
    },
    parentId: "632aae414d87ff2494210945",
    parentName: "Breakfasts",
    icon: "",
  },
  {
    _id: "632ab0604d87ff24942109e7",
    status: "show",
    name: {
      en: "Water",
    },
    description: {
      en: "Water",
    },
    parentId: "632ab0334d87ff24942109c1",
    parentName: "Drink",
    icon: "",
  },
  {
    _id: "632ab0664d87ff24942109ef",
    status: "show",
    name: {
      en: "Tea",
    },
    description: {
      en: "Tea",
    },
    parentId: "632ab0334d87ff24942109c1",
    parentName: "Drink",
    icon: "",
  },
  

  {
    _id: "632ab1e04d87ff2494210a6a",
    status: "show",
    name: {
      en: "Jam & Jelly",
    },
    description: {
      en: "Jam & Jelly",
    },
    parentId: "62c827b5a427b63741da9175",
    parentName: "Home",
    icon: "https://i.postimg.cc/rmLvfsMC/strawberry-jam-1.png",
  },
  
  {
    _id: "632aca2b4d87ff2494210be8",
    status: "show",
    name: {
      en: "Fruits & Vegetable",
    },
    description: {
      en: "Fruits & Vegetable",
    },
    parentId: "62c827b5a427b63741da9175",
    parentName: "Home",
    icon: "https://res.cloudinary.com/ahossain/image/upload/v1658340704/category%20icon/cabbage_n59uv3.png",
  },
  {
    _id: "632aca374d87ff2494210bf0",
    status: "show",
    name: {
      en: "Fresh Vegetable",
    },
    description: {
      en: "Fresh Vegetable",
    },
    parentId: "632aca2b4d87ff2494210be8",
    parentName: "Fruits & Vegetables",
    icon: "",
  },
  {
    _id: "632aca3d4d87ff2494210bf8",
    status: "show",
    name: {
      en: "Dry Fruits",
    },
    description: {
      en: "Dry Fruits",
    },
    parentId: "632aca2b4d87ff2494210be8",
    parentName: "Fruits & Vegetables",
    icon: "",
  },
  {
    _id: "632aca454d87ff2494210c00",
    status: "show",
    name: {
      en: "Fresh Fruits",
    },
    description: {
      en: "Fresh Fruits",
    },
    parentId: "632aca2b4d87ff2494210be8",
    parentName: "Fruits & Vegetables",
    icon: "",
  },
  {
    _id: "632aca524d87ff2494210c08",
    status: "show",
    name: {
      en: "Apple",
    },
    description: {
      en: "Apple",
    },
    parentId: "632aca454d87ff2494210c00",
    parentName: "Fresh Fruits",
    icon: "",
  },
  {
    _id: "632aca594d87ff2494210c10",
    status: "show",
    name: {
      en: "Orange",
    },
    description: {
      en: "Orange",
    },
    parentId: "632aca454d87ff2494210c00",
    parentName: "Fresh Fruits",
    icon: "",
  },
 
 
];

module.exports = categories;
