const PLATFORMS = { 'Alipay': 'Alipay支付寶', 'BOC': 'BOC中銀', 'GFB': 'GFB廣發', 'ICBC': 'ICBC工銀', 'Luso': 'Luso國際', 'MPay': 'MPay', 'TFB': 'TFB大豐', 'UePay': 'UePay極易付' };

const RAW_DATA_WEEK_1 = `
Alipay,0.4579,0.2173,0.2255,0.0805,0.0139,0.0049,39.23,816,0.5181,0.1043
BOC,0.1158,0.3688,0.3318,0.1590,0.0163,0.0083,64.69,1287,0.8171,0.2713
GFB,0.3386,0.3047,0.2240,0.1008,0.0287,0.0032,48.22,314,0.1994,0.0493
ICBC,0.2627,0.4018,0.2422,0.0732,0.0173,0.0029,44.48,925,0.5873,0.1341
Luso,0.3954,0.3175,0.2085,0.0665,0.0089,0.0032,36.58,526,0.334,0.0627
MPay,0.2319,0.3793,0.2734,0.0914,0.0178,0.0062,50.56,1291,0.8197,0.2127
TFB,0.3716,0.2474,0.2568,0.0996,0.0173,0.0073,47.36,636,0.4038,0.0982
UePay,0.3597,0.3592,0.2369,0.0281,0.0109,0.0052,35.58,581,0.3689,0.0674
`;

const RAW_DATA_WEEK_2 = `
Alipay,0.410,0.281,0.200,0.098,0.010,0.001,38.90,935,0.618,0.119
BOC,0.224,0.399,0.299,0.066,0.008,0.003,43.90,1325,0.876,0.191
GFB,0.338,0.281,0.244,0.108,0.022,0.007,50.20,409,0.271,0.067
ICBC,0.301,0.376,0.242,0.061,0.016,0.003,41.60,1075,0.711,0.147
Luso,0.500,0.258,0.190,0.044,0.006,0.001,28.49,669,0.442,0.063
MPay,0.373,0.208,0.293,0.105,0.014,0.008,48.59,1317,0.871,0.210
TFB,0.367,0.264,0.246,0.096,0.017,0.011,48.55,771,0.510,0.123
UePay,0.404,0.353,0.193,0.028,0.016,0.007,35.17,688,0.455,0.079
`;

const RAW_DATA_WEEK_3 = `
Alipay,0.404,0.370,0.172,0.045,0.007,0.002,31.47,994,0.685,0.116
BOC,0.148,0.568,0.223,0.052,0.006,0.003,41.49,1327,0.914,0.203
GFB,0.333,0.393,0.160,0.092,0.015,0.008,44.28,437,0.301,0.072
ICBC,0.307,0.497,0.149,0.041,0.003,0.003,32.61,1117,0.769,0.135
Luso,0.472,0.350,0.129,0.044,0.005,0.000,26.58,734,0.506,0.072
MPay,0.208,0.535,0.198,0.051,0.006,0.003,39.03,1360,0.937,0.196
TFB,0.337,0.398,0.182,0.067,0.010,0.007,40.17,805,0.554,0.119
UePay,0.426,0.364,0.161,0.031,0.012,0.005,32.13,733,0.505,0.087
`;

const RAW_DATA_WEEK_4 = `
Alipay,0.437,0.358,0.153,0.045,0.006,0.001,29.15,971,0.676,0.103
BOC,0.119,0.599,0.213,0.059,0.006,0.004,43.80,1312,0.914,0.209
GFB,0.339,0.374,0.183,0.086,0.011,0.005,41.77,440,0.306,0.067
ICBC,0.294,0.544,0.130,0.026,0.004,0.002,30.33,1107,0.771,0.122
Luso,0.496,0.334,0.130,0.035,0.002,0.003,25.61,711,0.495,0.066
MPay,0.210,0.508,0.186,0.074,0.011,0.011,47.41,1334,0.929,0.230
TFB,0.294,0.409,0.193,0.087,0.008,0.009,44.39,782,0.545,0.126
UePay,0.455,0.354,0.148,0.028,0.010,0.006,30.19,700,0.487,0.077
`;

function parseRawCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const stats = {};
    lines.forEach(line => {
        const cols = line.split(/,|\t/).map(c => c.trim().replace(/"/g, ''));
        const platform = cols[0];
        if (PLATFORMS[platform]) {
            stats[platform] = {
                p0: parseFloat(cols[1]) || 0,
                p10: parseFloat(cols[2]) || 0,
                p20: parseFloat(cols[3]) || 0,
                p50: parseFloat(cols[4]) || 0,
                p100: parseFloat(cols[5]) || 0,
                p200: parseFloat(cols[6]) || 0,
                exp: parseFloat(cols[7]) || 0,
                draws: parseInt(cols[8]) || 0,
                userShare: parseFloat(cols[9]) || 0,
                amtShare: parseFloat(cols[10]) || 0
            };
        }
    });
    return stats;
}

export const GLOBAL_STATS_DATA = {
    "1": {
        cutoff: "2026年4月13日0時",
        overview: {
            totalUsers: "1,575",
            usersWith200: "89",
            maxUserAmount: "950",
            avgUserAmount: "195",
            medianUserAmount: "160",
            avgPlatformsPerUser: "4"
        },
        stats: parseRawCSV(RAW_DATA_WEEK_1)
    },
    "2": {
        cutoff: "2026年4月20日0時",
        overview: {
            totalUsers: "1,512",
            usersWith200: "98",
            maxUserAmount: "1,010",
            avgUserAmount: "201",
            medianUserAmount: "170",
            avgPlatformsPerUser: "4.75"
        },
        stats: parseRawCSV(RAW_DATA_WEEK_2)
    },
    "3": {
        cutoff: "2026年4月27日0時",
        overview: {
            totalUsers: "1,452",
            usersWith200: "75",
            maxUserAmount: "690",
            avgUserAmount: "186",
            medianUserAmount: "160",
            avgPlatformsPerUser: "4.7"
        },
        stats: parseRawCSV(RAW_DATA_WEEK_3)
    },
    "4": {
        cutoff: "2026年5月7日23:00",
        overview: {
            totalUsers: "1,436",
            usersWith200: "108",
            maxUserAmount: "840",
            avgUserAmount: "192",
            medianUserAmount: "160",
            avgPlatformsPerUser: "5.12"
        },
        stats: parseRawCSV(RAW_DATA_WEEK_4)
    }
};