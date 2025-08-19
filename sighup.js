const countries = [{
    code: "EG",
    name: "مصر",
  },
  {
    code: "AF",
    name: "أفغانستان",
  },
  {
    code: "AL",
    name: "ألبانيا",
  },
  {
    code: "DZ",
    name: "الجزائر",
  },
  {
    code: "AD",
    name: "أندورا",
  },
  {
    code: "AO",
    name: "أنغولا",
  },
  {
    code: "AR",
    name: "الأرجنتين",
  },
  {
    code: "AM",
    name: "أرمينيا",
  },
  {
    code: "AU",
    name: "أستراليا",
  },
  {
    code: "AT",
    name: "النمسا",
  },
  {
    code: "AZ",
    name: "أذربيجان",
  },
  {
    code: "BS",
    name: "الباهاما",
  },
  {
    code: "BH",
    name: "البحرين",
  },
  {
    code: "BD",
    name: "بنغلاديش",
  },
  {
    code: "BB",
    name: "باربادوس",
  },
  {
    code: "BY",
    name: "بيلاروسيا",
  },
  {
    code: "BE",
    name: "بلجيكا",
  },
  {
    code: "BZ",
    name: "بليز",
  },
  {
    code: "BJ",
    name: "بنين",
  },
  {
    code: "BT",
    name: "بوتان",
  },
  {
    code: "BO",
    name: "بوليفيا",
  },
  {
    code: "BA",
    name: "البوسنة والهرسك",
  },
  {
    code: "BW",
    name: "بوتسوانا",
  },
  {
    code: "BR",
    name: "البرازيل",
  },
  {
    code: "BN",
    name: "بروناي",
  },
  {
    code: "BG",
    name: "بلغاريا",
  },
  {
    code: "BF",
    name: "بوركينا فاسو",
  },
  {
    code: "BI",
    name: "بوروندي",
  },
  {
    code: "KH",
    name: "كمبوديا",
  },
  {
    code: "CM",
    name: "الكاميرون",
  },
  {
    code: "CA",
    name: "كندا",
  },
  {
    code: "CV",
    name: "الرأس الأخضر",
  },
  {
    code: "CF",
    name: "جمهورية أفريقيا الوسطى",
  },
  {
    code: "TD",
    name: "تشاد",
  },
  {
    code: "CL",
    name: "تشيلي",
  },
  {
    code: "CN",
    name: "الصين",
  },
  {
    code: "CO",
    name: "كولومبيا",
  },
  {
    code: "KM",
    name: "جزر القمر",
  },
  {
    code: "CG",
    name: "الكونغو",
  },
  {
    code: "CR",
    name: "كوستاريكا",
  },
  {
    code: "HR",
    name: "كرواتيا",
  },
  {
    code: "CU",
    name: "كوبا",
  },
  {
    code: "CY",
    name: "قبرص",
  },
  {
    code: "CZ",
    name: "التشيك",
  },
  {
    code: "DK",
    name: "الدنمارك",
  },
  {
    code: "DJ",
    name: "جيبوتي",
  },
  {
    code: "DM",
    name: "دومينيكا",
  },
  {
    code: "DO",
    name: "جمهورية الدومينيكان",
  },
  {
    code: "EC",
    name: "الإكوادور",
  },
  {
    code: "SV",
    name: "السلفادور",
  },
  {
    code: "GQ",
    name: "غينيا الاستوائية",
  },
  {
    code: "ER",
    name: "إريتريا",
  },
  {
    code: "EE",
    name: "إستونيا",
  },
  {
    code: "ET",
    name: "إثيوبيا",
  },
  {
    code: "FJ",
    name: "فيجي",
  },
  {
    code: "FI",
    name: "فنلندا",
  },
  {
    code: "FR",
    name: "فرنسا",
  },
  {
    code: "GA",
    name: "الغابون",
  },
  {
    code: "GM",
    name: "غامبيا",
  },
  {
    code: "GE",
    name: "جورجيا",
  },
  {
    code: "DE",
    name: "ألمانيا",
  },
  {
    code: "GH",
    name: "غانا",
  },
  {
    code: "GR",
    name: "اليونان",
  },
  {
    code: "GD",
    name: "غرينادا",
  },
  {
    code: "GT",
    name: "غواتيمالا",
  },
  {
    code: "GN",
    name: "غينيا",
  },
  {
    code: "GW",
    name: "غينيا بيساو",
  },
  {
    code: "GY",
    name: "غيانا",
  },
  {
    code: "HT",
    name: "هايتي",
  },
  {
    code: "HN",
    name: "هندوراس",
  },
  {
    code: "HU",
    name: "هنغاريا",
  },
  {
    code: "IS",
    name: "آيسلندا",
  },
  {
    code: "IN",
    name: "الهند",
  },
  {
    code: "ID",
    name: "إندونيسيا",
  },
  {
    code: "IR",
    name: "إيران",
  },
  {
    code: "IQ",
    name: "العراق",
  },
  {
    code: "IE",
    name: "أيرلندا",
  },
  {
    code: "IT",
    name: "إيطاليا",
  },
  {
    code: "JM",
    name: "جامايكا",
  },
  {
    code: "JP",
    name: "اليابان",
  },
  {
    code: "JO",
    name: "الأردن",
  },
  {
    code: "KZ",
    name: "كازاخستان",
  },
  {
    code: "KE",
    name: "كينيا",
  },
  {
    code: "KI",
    name: "كيريباتي",
  },
  {
    code: "KP",
    name: "كوريا الشمالية",
  },
  {
    code: "KR",
    name: "كوريا الجنوبية",
  },
  {
    code: "KW",
    name: "الكويت",
  },
  {
    code: "KG",
    name: "قيرغيزستان",
  },
  {
    code: "LA",
    name: "لاوس",
  },
  {
    code: "LV",
    name: "لاتفيا",
  },
  {
    code: "LB",
    name: "لبنان",
  },
  {
    code: "LS",
    name: "ليسوتو",
  },
  {
    code: "LR",
    name: "ليبيريا",
  },
  {
    code: "LY",
    name: "ليبيا",
  },
  {
    code: "LI",
    name: "ليختنشتاين",
  },
  {
    code: "LT",
    name: "ليتوانيا",
  },
  {
    code: "LU",
    name: "لوكسمبورغ",
  },
  {
    code: "MG",
    name: "مدغشقر",
  },
  {
    code: "MW",
    name: "مالاوي",
  },
  {
    code: "MY",
    name: "ماليزيا",
  },
  {
    code: "MV",
    name: "المالديف",
  },
  {
    code: "ML",
    name: "مالي",
  },
  {
    code: "MT",
    name: "مالطا",
  },
  {
    code: "MH",
    name: "جزر مارشال",
  },
  {
    code: "MR",
    name: "موريتانيا",
  },
  {
    code: "MU",
    name: "موريشيوس",
  },
  {
    code: "MX",
    name: "المكسيك",
  },
  {
    code: "FM",
    name: "ميكرونيزيا",
  },
  {
    code: "MD",
    name: "مولدوفا",
  },
  {
    code: "MC",
    name: "موناكو",
  },
  {
    code: "MN",
    name: "منغوليا",
  },
  {
    code: "ME",
    name: "الجبل الأسود",
  },
  {
    code: "MA",
    name: "المغرب",
  },
  {
    code: "MZ",
    name: "موزمبيق",
  },
  {
    code: "MM",
    name: "ميانمار",
  },
  {
    code: "NA",
    name: "ناميبيا",
  },
  {
    code: "NR",
    name: "ناورو",
  },
  {
    code: "NP",
    name: "نيبال",
  },
  {
    code: "NL",
    name: "هولندا",
  },
  {
    code: "NZ",
    name: "نيوزيلندا",
  },
  {
    code: "NI",
    name: "نيكاراغوا",
  },
  {
    code: "NE",
    name: "النيجر",
  },
  {
    code: "NG",
    name: "نيجيريا",
  },
  {
    code: "NO",
    name: "النرويج",
  },
  {
    code: "OM",
    name: "عمان",
  },
  {
    code: "PK",
    name: "باكستان",
  },
  {
    code: "PW",
    name: "بالاو",
  },
  {
    code: "PA",
    name: "بنما",
  },
  {
    code: "PG",
    name: "بابوا غينيا الجديدة",
  },
  {
    code: "PY",
    name: "باراغواي",
  },
  {
    code: "PE",
    name: "بيرو",
  },
  {
    code: "PH",
    name: "الفلبين",
  },
  {
    code: "PL",
    name: "بولندا",
  },
  {
    code: "PT",
    name: "البرتغال",
  },
  {
    code: "QA",
    name: "قطر",
  },
  {
    code: "RO",
    name: "رومانيا",
  },
  {
    code: "RU",
    name: "روسيا",
  },
  {
    code: "RW",
    name: "رواندا",
  },
  {
    code: "KN",
    name: "سانت كيتس ونيفيس",
  },
  {
    code: "LC",
    name: "سانت لوسيا",
  },
  {
    code: "VC",
    name: "سانت فنسنت والغرينادين",
  },
  {
    code: "WS",
    name: "ساموا",
  },
  {
    code: "SM",
    name: "سان مارينو",
  },
  {
    code: "ST",
    name: "ساو تومي وبرينسيب",
  },
  {
    code: "SA",
    name: "السعودية",
  },
  {
    code: "SN",
    name: "السنغال",
  },
  {
    code: "RS",
    name: "صربيا",
  },
  {
    code: "SC",
    name: "سيشل",
  },
  {
    code: "SL",
    name: "سيراليون",
  },
  {
    code: "SG",
    name: "سنغافورة",
  },
  {
    code: "SK",
    name: "سلوفاكيا",
  },
  {
    code: "SI",
    name: "سلوفينيا",
  },
  {
    code: "SB",
    name: "جزر سليمان",
  },
  {
    code: "SO",
    name: "الصومال",
  },
  {
    code: "ZA",
    name: "جنوب أفريقيا",
  },
  {
    code: "SS",
    name: "جنوب السودان",
  },
  {
    code: "ES",
    name: "إسبانيا",
  },
  {
    code: "LK",
    name: "سريلانكا",
  },
  {
    code: "SD",
    name: "السودان",
  },
  {
    code: "SR",
    name: "سورينام",
  },
  {
    code: "SE",
    name: "السويد",
  },
  {
    code: "CH",
    name: "سويسرا",
  },
  {
    code: "SY",
    name: "سوريا",
  },
  {
    code: "TJ",
    name: "طاجيكستان",
  },
  {
    code: "TZ",
    name: "تنزانيا",
  },
  {
    code: "TH",
    name: "تايلاند",
  },
  {
    code: "TL",
    name: "تيمور الشرقية",
  },
  {
    code: "TG",
    name: "توغو",
  },
  {
    code: "TO",
    name: "تونغا",
  },
  {
    code: "TT",
    name: "ترينيداد وتوباغو",
  },
  {
    code: "TN",
    name: "تونس",
  },
  {
    code: "TR",
    name: "تركيا",
  },
  {
    code: "TM",
    name: "تركمانستان",
  },
  {
    code: "TV",
    name: "توفالو",
  },
  {
    code: "UG",
    name: "أوغندا",
  },
  {
    code: "UA",
    name: "أوكرانيا",
  },
  {
    code: "AE",
    name: "الإمارات العربية المتحدة",
  },
  {
    code: "GB",
    name: "المملكة المتحدة",
  },
  {
    code: "US",
    name: "الولايات المتحدة",
  },
  {
    code: "UY",
    name: "أوروغواي",
  },
  {
    code: "UZ",
    name: "أوزبكستان",
  },
  {
    code: "VU",
    name: "فانواتو",
  },
  {
    code: "VE",
    name: "فنزويلا",
  },
  {
    code: "VN",
    name: "فيتنام",
  },
  {
    code: "YE",
    name: "اليمن",
  },
  {
    code: "ZM",
    name: "زامبيا",
  },
  {
    code: "ZW",
    name: "زيمبابوي",
  },
];
 export { countries };