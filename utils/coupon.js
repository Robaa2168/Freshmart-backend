const coupons = [
  {
    _id: "643970d0e58a401b6c62c753",

    status: "show",
    title: {
      en: "NOVEMBER Gift Voucher",
      de: "august geschenkgutschein",
      hy: "օգոստոսյան նվեր վաուչեր",
      af: "augustus geskenkbewys",
      cs: "augustový dárkový poukaz",
      az: "avqust hədiyyə vauçeri",
      ln: "sánzá ya zómi na mɔ̌kɔ́",
      ar: "قسيمة هدايا أغسطس",
      pt: "voucher presente agosto",
    },
    couponCode: "NOVEMBER",
    endTime: "2023-10-31T08:30:00.000Z",

    minimumAmount: 2000,
    productType: "Grocery",
    logo: "https://i.ibb.co/PDLPDHc/ins1.jpg",
    discountType: {
      type: "percentage",
      value: 50,
    },
  },
  {
    _id: "643970d0e58a401b6c62c756",

    status: "show",
    title: {
      en: "DECEMBER Gift Voucher",
      de: "sommer geschenkgutschein",
      hy: "ամառային նվեր - վաուչեր",
      af: "somer geskenkbewys",
      cs: "letní dárkový poukaz",
      bn: "গ্রীষ্মের উপহার ভাউচার",
      az: "yay hədiyyə vauçeri",
      ln: "sanza ya Zomi na Mibale",
    },
    couponCode: "DECEMBER",
    endTime: "2023-12-25T20:38:00.000Z",

    minimumAmount: 500,
    productType: "Grocery",
    logo: "https://i.ibb.co/23kQcB9/ins3.jpg",
    discountType: {
      type: "percentage",
      value: 10,
    },
  },
  {
    _id: "643970d0e58a401b6c62c754",

    status: "show",
    title: {
      en: "Gift Voucher",
      de: "sommer geschenkgutschein",
    },
    couponCode: "FIRST",
    endTime: "2023-12-20T00:56:00.000Z",

    minimumAmount: 1000,
    productType: "Cloths",
    logo: "https://i.ibb.co/4thS4Z1/ins2.jpg",
    discountType: {
      type: "percentage",
      value: 10,
    },
  },
  {
    _id: "643970d0e58a401b6c62c755",

    status: "show",
    title: {
      en: "Black FRIDAY",
    },
    couponCode: "BFRIDAY",
    endTime: "2024-01-01T20:19:00.000Z",

    minimumAmount: 500,
    productType: "Grocery",
    logo: "https://i.ibb.co/wBBYm7j/ins4.jpg",
    discountType: {
      type: "fixed",
      value: 100,
    },
  },
];
module.exports = coupons;
