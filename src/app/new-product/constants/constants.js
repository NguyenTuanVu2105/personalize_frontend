export const DEFAULT_COLOR = "#fafafa"
export const THUMBNAIL_IMAGE_COLOR = "#ffffff"
export const NON_TRANSPARENT_TYPE = 'non-transparent'
export const PRE_POSITION = {
    VERTICAL: 'Align vertically',
    HORIZON: 'Align horizontally',
    TOP: 'Align top',
    BOTTOM: 'Align bottom',
    LEFT: 'Align left',
    RIGHT: 'Align right',
    FIT: 'Fit image to frame',
    FILL: 'Fill image to frame',
    RESET: 'Restore default',
    REMOVE: 'Remove image',
    ROTATION: 'Rotation'
}

export const VIEW_STATE = {
    DESIGN: 100,
    PREVIEW: 101,
}

export const DEFAULT_DRAG = {height: 0, width: 0}
export const ERROR_DRAG = {height: -1, width: -1}

export const MAX_SCALE_ALLOW = 2.0
// export const MIN_SCALE_ALLOW = 0.3
export const MAX_DRAG_RATIO = 0.9

export const ARTWORK_ERROR_CODES = {
    "REQUIRED": "1",
    "LOW_DPI": "2",
    "LARGE_SCALE": "3",
    "UPLOAD_ERROR": "4",
    // "SMALL_SCALE": "4",
}
export const LAYER_ERRORS = {
    "1": (artwork, side) => `${side.type} side's artwork is required`,
    "2": (artwork, side) => `Artwork DPI is too low`,
    "3": (artwork, side) => `Artwork name '${artwork.name}' is scaled too large (Maximum is ${MAX_SCALE_ALLOW})`,
    "4": (artwork, side) => `Fail to upload artwork`,
    // "4": (artwork, side) => `Artwork name '${artwork.name}' is scaled too small (Minimum is ${MIN_SCALE_ALLOW})`
}

export const SIZE_NOT_SIMILAR = "Dimensions two side are not similar"

export const MAX_ROTATE_ALLOW = 360

export const DEFAULT_BACKGROUND_COLOR = "#ffffff"
// export const DEFAULT_BACKGROUND_COLOR =
// export const DEFAULT_ = null
// export const DEFAULT_BACKGROUND_COLOR = "#000000"
export const BACKGROUND_COLORS = [
    {
        label: "White",
        value: "#ffffff"
    },
    {
        label: "Black",
        value: "#000000"
    },
    {
        label: "Sport Grey",
        value: "#c8c8d2"
    },
    {
        label: "Navy",
        value: "#2d384b"
    },
    {
        label: "Gold",
        value: "#fecb00"
    },
    {
        label: "Royal Blue",
        value: "#003466"
    },
    {
        label: "Kelly Green",
        value: "#1ebb6a"
    },
    {
        label: "Brown",
        value: "#382d29"
    },
    {
        label: "Purple",
        value: "#660066"
    },
    {
        label: "Dark Heather",
        value: "#464a53"
    },
    {
        label: "Ash",
        value: "#e7e8ed"
    },
    {
        label: "Pistachio",
        value: "#91c98c"
    },
    {
        label: "Heliconia",
        value: "#f84982"
    },
    {
        label: "Texas Orange",
        value: "#c36629"
    },
    {
        label: "Light Blue",
        value: "#a1c4e2"
    },
    {
        label: "Maroon",
        value: "#660000"
    },
    {
        label: "Orange",
        value: "#ff3300"
    },
    {
        label: "Deep Forest",
        value: "#345039"
    },
    {
        label: "Vegas Gold",
        value: "#c5b358"
    },
    {
        label: "Cardinal",
        value: "#9c1b37"
    },
    {
        label: "Iris",
        value: "#5692db"
    },
    {
        label: "Lime",
        value: "#96e37d"
    },
    {
        label: "Light Pink",
        value: "#f2cfd6"
    },

]

export const TEXT_COLORS = [
    {
        label: "White",
        value: "#ffffff"
    },
    {
        label: "Black",
        value: "#000000"
    },
    {
        label: "Sport Grey",
        value: "#c8c8d2"
    },
    {
        label: "Navy",
        value: "#2d384b"
    },
    {
        label: "Gold",
        value: "#fecb00"
    },
    {
        label: "Royal Blue",
        value: "#003466"
    },
    {
        label: "Kelly Green",
        value: "#1ebb6a"
    },
    {
        label: "Brown",
        value: "#382d29"
    },
    {
        label: "Purple",
        value: "#660066"
    },
    {
        label: "Dark Heather",
        value: "#464a53"
    },
    {
        label: "Ash",
        value: "#e7e8ed"
    },
    {
        label: "Pistachio",
        value: "#91c98c"
    },
    {
        label: "Heliconia",
        value: "#f84982"
    },
    {
        label: "Texas Orange",
        value: "#c36629"
    },
    {
        label: "Light Blue",
        value: "#a1c4e2"
    },
    {
        label: "Maroon",
        value: "#660000"
    },
    {
        label: "Orange",
        value: "#ff3300"
    },
    {
        label: "Deep Forest",
        value: "#345039"
    },
    {
        label: "Vegas Gold",
        value: "#c5b358"
    },
    {
        label: "Cardinal",
        value: "#9c1b37"
    },
    {
        label: "Iris",
        value: "#5692db"
    },
    {
        label: "Lime",
        value: "#96e37d"
    },
    {
        label: "Light Pink",
        value: "#f2cfd6"
    },

]


export const LAYER_TYPE = {
    artwork: "1",
    text: "2"
}

export const DEFAULT_TYPE_FACE = [
    'Big Shoulders Stencil',
    'Akaya Kanadaka',
    'Bungee Outline',
    'Bungee Shade',
    'Eater',
    'Faster One',
    'Knewave',
    'Monoton',
    'Playball',
    'Ranchers',
    'Reggae One',
    'Seaweed Script',
    'Sigmar One',
]

export const DESIGN_SECTION_SQUARE_SIZE = 690
export const MAX_BACKGROUND_COLORS_CACHING_ALLOW = 12
export const MIN_PREVIEW_ARTWORK_SIDE = 600

export const DEFAULT_CURRENCY = {currency: "USD", rate: "1.0000000000", precision: 2} //only use when fail in getting from server
export const SCALE_DECIMAL_PLACES = 3

export const DEFAULT_FONT = [
    {
        "id": 12111643662341,
        "title": "Auther Typeface",
        "font_url": "https://storage.googleapis.com/printholo/temp-fonts/Auther%20Typeface.otf",
        "description": null,
        "create_time": "2021-03-04T16:59:12.587000Z",
        "update_time": "2021-03-04T16:58:59.017000Z"
    },
    {
        "id": 12111643661557,
        "title": "iCiel Cucho",
        "font_url": "https://storage.googleapis.com/printholo/temp-fonts/Cucho.otf",
        "description": "Almost before we knew it, we had left the ground.\n",
        "create_time": "2021-01-26T16:18:19.875000Z",
        "update_time": "2021-01-26T16:18:22.730000Z"
    },
    {
        "id": 12111643671065,
        "title": "iCiel Andes Rounded Light",
        "font_url": "https://printholo.storage.googleapis.com/personalize-fonts/AndesRoundedLight.otf",
        "description": null,
        "create_time": "2021-03-24T08:56:30.050319Z",
        "update_time": "2021-03-24T08:56:30.050336Z"
    },
    {
        "id": 12111643668317,
        "title": "iCiel Gotham Medium",
        "font_url": "https://printholo.storage.googleapis.com/personalize-fonts/Gotham-Medium.otf",
        "description": null,
        "create_time": "2021-03-24T07:39:43.724394Z",
        "update_time": "2021-03-24T07:39:43.724409Z"
    },
    {
        "id": 12111643670742,
        "title": "iCiel Hapna Slab Serif  Light",
        "font_url": "https://printholo.storage.googleapis.com/personalize-fonts/HapnaSlabSerif-Light.otf",
        "description": null,
        "create_time": "2021-03-24T08:56:19.265891Z",
        "update_time": "2021-03-24T08:56:19.265907Z"
    },
    {
        "id": 12111643673776,
        "title": "iCiel LesFruits",
        "font_url": "https://printholo.storage.googleapis.com/personalize-fonts/LesFruits.ttf",
        "description": null,
        "create_time": "2021-03-24T08:57:38.314972Z",
        "update_time": "2021-03-24T08:57:38.314989Z"
    },
    {
        "id": 12111643672219,
        "title": "iCiel LOUSIANE",
        "font_url": "https://printholo.storage.googleapis.com/personalize-fonts/iCielLOUSIANE.otf",
        "description": null,
        "create_time": "2021-03-24T08:56:54.902451Z",
        "update_time": "2021-03-24T08:56:54.902468Z"
    },
    {
        "id": 12111643668017,
        "title": "iCiel Paris Serif",
        "font_url": "https://printholo.storage.googleapis.com/personalize-fonts/iCielParisSerif-Bold.otf",
        "description": null,
        "create_time": "2021-03-24T07:39:20.633024Z",
        "update_time": "2021-03-24T08:57:56.599013Z"
    },
    {
        "id": 12111643669989,
        "title": "iCiel Pequena",
        "font_url": "https://printholo.storage.googleapis.com/personalize-fonts/iCielPequena.otf",
        "description": null,
        "create_time": "2021-03-24T08:55:55.216816Z",
        "update_time": "2021-03-24T08:55:55.216832Z"
    },
    {
        "id": 12111643673085,
        "title": "iCiel Smoothy Sans",
        "font_url": "https://printholo.storage.googleapis.com/personalize-fonts/Smoothy-Sans.ttf",
        "description": null,
        "create_time": "2021-03-24T08:57:16.789622Z",
        "update_time": "2021-03-24T08:57:16.789639Z"
    },
    {
        "id": 12111643668992,
        "title": "iCiel Stringfellows",
        "font_url": "https://printholo.storage.googleapis.com/personalize-fonts/Stringfellows.otf",
        "description": null,
        "create_time": "2021-03-24T07:40:04.254846Z",
        "update_time": "2021-03-24T07:40:04.254862Z"
    },
    {
        "id": 12111643672028,
        "title": "Rift",
        "font_url": "https://printholo.storage.googleapis.com/personalize-fonts/Fort%20Foundry%20-%20Rift-Regular.otf",
        "description": null,
        "create_time": "2021-03-24T08:56:42.178500Z",
        "update_time": "2021-03-24T08:56:42.178516Z"
    }
]