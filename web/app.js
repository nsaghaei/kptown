// Adapted locally from Chizi’s Jevton; original provenance in REFERENCE.md and vendor/.
import {addInvestors,financeTurn,operatingBalances,finishOperations,assertFinance} from './investors.js';
import {decideTown,decideNews} from './decisions.js';
import {makeJudge} from './client.js';
import {installUI} from './local-ui.js';
import {extendTown,addEconomy,productionRevenue,creditBusiness,recordLostSale,planBusinesses,chooseShops,spendPlans,afterOperations,discretionaryVisits} from './economy.js';
import {processReturns} from './metrics.js';
var localUi;
var Ud = 48,
    oT = 120;
var nT = 0,
    AD = [
        [-4, 7.5, 56, 1],
        [-4, 15.5, 56, 1],
        [-4, 23.5, 56, 1],
        [-4, 31.5, 56, 1],
        [10, -4, 1, 56],
        [22.5, -4, 1, 56],
        [32, -4, 1, 56], [40, -4, 1, 56], [-4, 43.5, 56, 1]
    ],
    vT = ["spring", "summer", "autumn", "winter"];
var hS = (U) => vT[Math.floor(U / 24 / 2) % vT.length],
    l0 = {
        none: {
            label: "No disasters",
            chance: 0
        },
        rare: {
            label: "Rare disasters",
            chance: 0.07
        },
        normal: {
            label: "Regular disasters",
            chance: 0.32
        },
        chaos: {
            label: "Chaos",
            chance: 0.6
        },
        apocalypse: {
            label: "Apocalypse",
            chance: 0.9
        }
    },
    bS = ["heatwave", "storm", "flu", "blackout", "shortage", "meteors", "aliens", "zombies", "volcano", "goldrush", "lottery", "robots", "festival"],
    fD = ["North Road", "Market Street", "Mill Road", "South Road", "West Avenue", "Central Avenue", "East Avenue", "Garden Avenue", "Garden Street"],
    UP = ["empty", "light", "moderate", "heavy", "jammed"],
    hD = {
        work: {
            label: "Work",
            description: "go to work and earn money",
            place: "work"
        },
        eat: {
            label: "Eat",
            description: "buy and eat a meal at the market",
            place: "market"
        },
        rest: {
            label: "Rest",
            description: "go home and sleep",
            place: "home"
        },
        park: {
            label: "Park",
            description: "relax in the park",
            place: "park"
        },
        clinic: {
            label: "Clinic",
            description: "see the doctor at the clinic",
            place: "clinic"
        },
        tavern: {
            label: "Tavern",
            description: "drink and socialise at the tavern",
            place: "tavern"
        },
        help: {
            label: "Help",
            description: "go check on a struggling neighbour",
            place: "home"
        }
    },
    dP = {
        easy: {
            description: "take it easy, do the minimum",
            wage: 0.6,
            energy: -5
        },
        steady: {
            description: "a normal day's work",
            wage: 1,
            energy: -10
        },
        hard: {
            description: "push hard for extra pay",
            wage: 1.45,
            energy: -17
        }
    },
    DP = {
        skip: {
            description: "skip the meal to save money",
            price: 0,
            food: 0
        },
        cheap: {
            description: "a cheap snack",
            price: 4,
            food: 22
        },
        normal: {
            description: "a proper meal",
            price: 8,
            food: 45
        },
        generous: {
            description: "a big meal and a treat",
            price: 14,
            food: 60
        }
    },
    $P = {
        food: "get food to people who are hungry",
        health: "treat the sick and protect the vulnerable",
        power: "restore power and keep services running",
        morale: "lift spirits with events and rest",
        nothing: "no intervention needed, the city is coping"
    };
var iS = {
        office: 20,
        factory: 18,
        school: 14,
        farm: 13
    },
    OS = {
        lower: "lower prices to bring people in",
        hold: "keep prices where they are",
        raise: "raise prices to rebuild the till"
    },
    WS = {
        cut: "cut income tax to leave people more money",
        hold: "keep the tax rate",
        raise: "raise income tax to fund the council"
    },
    Id = {
        calm: {
            name: "Ordinary day",
            description: "Nothing unusual. Shops open, power on, mild weather."
        },
        heatwave: {
            name: "Heatwave",
            description: "38C outside. Working outdoors drains people fast, the park offers no shade, the tavern is packed."
        },
        blackout: {
            name: "Blackout",
            description: "Power is out across the city. Offices and the market are closed, the clinic runs on a generator, nights are dark."
        },
        flu: {
            name: "Flu outbreak",
            description: "A flu is spreading. Crowded places (market, tavern, offices) spread it; the clinic can treat it; rest helps."
        },
        festival: {
            name: "Harvest festival",
            description: "A festival in the park with free food and music. Most workplaces closed. Moods are high."
        },
        shortage: {
            name: "Food shortage",
            description: "The market has almost no food and prices tripled. Only the farm has supplies."
        },
        storm: {
            name: "Storm",
            description: "Heavy rain and wind. Being outside is dangerous; the park is flooded; roads are slow."
        },
        winter: {
            name: "Deep winter",
            description: "Snow and -12C. The farm and orchard are frozen shut, being outside drains energy and health, the tavern and homes are warm, food costs more."
        },
        aliens: {
            name: "Alien invasion",
            description: "Alien ships hover over the city and beam people up. Anyone outdoors risks being taken. Offices, school and market are shut, people panic, the clinic is overwhelmed. Staying home is safest; neighbours still need checking on."
        },
        zombies: {
            name: "Zombie outbreak",
            description: "The dead are walking. Anyone in a crowd (market, tavern, park) risks a bite that wrecks their health. Homes are barricaded and safe, the clinic treats bites, the brickworks crew is armed and working."
        },
        goldrush: {
            name: "Gold rush",
            description: "Gold was found under the mill. Factory and farm work pays triple, everyone is tempted to work themselves to exhaustion, prices at the market and tavern have doubled."
        },
        meteors: {
            name: "Meteor shower",
            description: "Burning rocks are falling on the city. Being outside is dangerous, some homes are hit, the clinic is busy, the park is a crater. Indoors at work or home is safest."
        },
        lottery: {
            name: "Lottery win",
            description: "The whole town split a lottery jackpot: everyone got $500 this morning. Nobody feels like working, the tavern and market are packed, prices are climbing."
        },
        robots: {
            name: "Robot takeover",
            description: "Robots have taken every office, factory and school job; those workers earn nothing and are miserable. Farming, medicine, trading and music still pay. The park is full of the newly idle."
        },
        volcano: {
            name: "Volcanic ash",
            description: "The mountain is erupting. Ash chokes the air: being outside hurts health and energy, the farm is buried, the clinic is overwhelmed, the sky is dark all day."
        }
    };
var GS = () => ({
    deaths: 0,
    infections: 0,
    meals: 0,
    earned: 0,
    spent: 0,
    helps: 0,
    clinicVisits: 0,
    left: 0,
    arrived: 0
});
var c0 = (U, d) => U.residents.filter((D) => D.alive && D.home === d).length,
    HP = (U) => U.places.filter((d) => d.kind === "home" && c0(U, d.id) > 4),
    E$ = (U) => {
        let d = U.places.filter(($) => $.kind === "home"),
            D = U.residents.filter(($) => $.alive).length / Math.max(1, d.length);
        return Math.round(12 * (1 + Math.max(0, D - 3) * 0.3))
    },
    e0 = ["Okafor", "Reyes", "Nakamura", "Haddad", "Lindqvist", "Mensah", "Dubois", "Ivanova", "Patel", "Costa", "Adeyemi", "Berg", "Kim", "Moreau", "Osei", "Rossi", "Silva", "Tanaka", "Weber", "Yilmaz"],
    t$ = ["Ada", "Bram", "Cleo", "Dev", "Esi", "Femi", "Gus", "Hana", "Ivo", "Juno", "Kofi", "Lena", "Milo", "Nia", "Otis", "Pia", "Quin", "Rui", "Sade", "Tomi", "Uma", "Vik", "Wren", "Yara", "Zed", "Abe", "Bea", "Cai", "Dara", "Eli", "Fay", "Gil", "Hal", "Ines", "Jai", "Kai", "Lior", "Mae", "Nour", "Oda", "Pax", "Rae", "Sol", "Tia", "Ugo", "Val", "Wes", "Zia"];

function mS(U) {
    let d = U >>> 0;
    return () => {
        d = d + 1831565813 >>> 0;
        let D = d;
        return D = Math.imul(D ^ D >>> 15, D | 1), D ^= D + Math.imul(D ^ D >>> 7, D | 61), ((D ^ D >>> 14) >>> 0) / 4294967296
    }
}

function _S() {
    let U = [],
        d = [
            [2, 2],
            [5, 2],
            [8, 2],
            [2, 5],
            [5, 5],
            [8, 5],
            [2, 34],
            [5, 34],
            [8, 34],
            [2, 37],
            [5, 37],
            [8, 37],
            [12, 34],
            [15, 34],
            [18, 34],
            [12, 37],
            [15, 37],
            [18, 37],
            [34, 2],
            [37, 2],
            [34, 5],
            [37, 5],
            [34, 10],
            [37, 10],
            [34, 13],
            [37, 13],
            [34, 18],
            [37, 18],
            [34, 21],
            [37, 21],
            [34, 26],
            [37, 26],
            [34, 29],
            [37, 29],
            [34, 34],
            [37, 34],
            [34, 37],
            [37, 37]
        ],
        D = ["#f1ede4", "#efe3c2", "#f3d98a", "#b8c4a2", "#bcd1e6", "#c9c9c4", "#a9503f", "#c96a45", "#7d8791", "#9a9c6e", "#d9a8a0", "#d2b48c"];
    return d.forEach(([H, P], T) => U.push({
        id: `home${T}`,
        kind: "home",
        name: `House ${T+1}`,
        x: H,
        z: P,
        w: 2,
        d: 2,
        floors: 1 + (T * 7 % 3 === 0 ? 1 : 0),
        color: D[(T * 5 + Math.floor(T / 3)) % D.length]
    })), [{
        kind: "office",
        name: "Town office",
        x: 12,
        z: 2,
        w: 5,
        d: 4,
        floors: 5,
        color: "#7a8fa6"
    }, {
        kind: "office",
        name: "Bank",
        x: 18,
        z: 2,
        w: 3,
        d: 3,
        floors: 3,
        color: "#9aa5b1"
    }, {
        kind: "office",
        name: "Library",
        x: 2,
        z: 17,
        w: 4,
        d: 3,
        floors: 2,
        color: "#a8988a"
    }, {
        kind: "factory",
        name: "Brickworks",
        x: 24,
        z: 2,
        w: 5,
        d: 4,
        floors: 2,
        color: "#8a6f5a"
    }, {
        kind: "factory",
        name: "Workshop",
        x: 7,
        z: 17,
        w: 3,
        d: 3,
        floors: 1,
        color: "#7f6a5c"
    }, {
        kind: "factory",
        name: "Warehouse",
        x: 28,
        z: 25,
        w: 3,
        d: 4,
        floors: 2,
        color: "#6f6a64"
    }, {
        kind: "factory",
        name: "Mill",
        x: 24,
        z: 33,
        w: 5,
        d: 4,
        floors: 2,
        color: "#8c7b62"
    }, {
        kind: "farm",
        name: "Farm",
        x: 12,
        z: 25,
        w: 5,
        d: 6,
        floors: 1,
        color: "#8fae5c"
    }, {
        kind: "farm",
        name: "Orchard",
        x: 2,
        z: 25,
        w: 7,
        d: 6,
        floors: 1,
        color: "#9cb86a"
    }, {
        kind: "market",
        name: "Market",
        x: 12,
        z: 9,
        w: 4,
        d: 3,
        floors: 1,
        color: "#d9a441"
    }, {
        kind: "market",
        name: "Diner",
        x: 17,
        z: 20,
        w: 3,
        d: 2,
        floors: 1,
        color: "#e0b25a"
    }, {
        kind: "market",
        name: "Bazaar",
        x: 24,
        z: 26,
        w: 4,
        d: 3,
        floors: 1,
        color: "#d29a3c"
    }, {
        kind: "park",
        name: "Park",
        x: 2,
        z: 9,
        w: 7,
        d: 6,
        floors: 0,
        color: "#5f9e57"
    }, {
        kind: "park",
        name: "Plaza",
        x: 12,
        z: 17,
        w: 4,
        d: 5,
        floors: 0,
        color: "#6aa862"
    }, {
        kind: "park",
        name: "Riverside",
        x: 24,
        z: 9,
        w: 7,
        d: 5,
        floors: 0,
        color: "#5a9a55"
    }, {
        kind: "clinic",
        name: "Clinic",
        x: 17,
        z: 9,
        w: 3,
        d: 3,
        floors: 2,
        color: "#e8e6df"
    }, {
        kind: "clinic",
        name: "Hospital",
        x: 24,
        z: 17,
        w: 4,
        d: 4,
        floors: 3,
        color: "#dfe3e6"
    }, {
        kind: "tavern",
        name: "Tavern",
        x: 17,
        z: 17,
        w: 3,
        d: 2,
        floors: 2,
        color: "#a0563f"
    }, {
        kind: "tavern",
        name: "Jazz club",
        x: 29,
        z: 17,
        w: 2,
        d: 3,
        floors: 2,
        color: "#5b3a6b"
    }, {
        kind: "school",
        name: "School",
        x: 18,
        z: 25,
        w: 4,
        d: 4,
        floors: 2,
        color: "#c9b56a"
    }].forEach((H, P) => U.push({
        id: `${H.kind}${P}`,
        ...H
    })), U
}
var PP = {
        clerk: "office",
        builder: "factory",
        farmer: "farm",
        doctor: "clinic",
        trader: "market",
        musician: "tavern",
        teacher: "school"
    },
    v0 = ["clerk", "builder", "farmer", "doctor", "trader", "musician", "teacher"],
    U0 = {
        clerk: "#60a5fa",
        builder: "#f59e0b",
        farmer: "#84cc16",
        doctor: "#f4f4f5",
        trader: "#e879f9",
        musician: "#fb7185",
        teacher: "#2dd4bf"
    },
    lT = (U) => [U.x + U.w / 2, U.z + U.d / 2],
    uS = {
        office: [8, 18],
        school: [8, 16],
        factory: [6, 22],
        farm: [6, 20],
        market: [7, 22],
        tavern: [16, 26]
    };

function j$(U, d) {
    let D = uS[U];
    if (!D) return !0;
    let $ = d % 24,
        [H, P] = D;
    return P > 24 ? $ >= H || $ < P - 24 : $ >= H && $ < P
}
var TP = (U) => U % 24 < 6 || U % 24 >= 23,
    U$ = (U, d) => U.residents.filter((D) => D.alive && D.work === d).length,
    RP = (U, d) => d.kind !== "home" && d.kind !== "park" && U$(U, d.id) === 0;

function NS(U, d, D) {
    let $ = U.places.find((Q) => Q.id === D),
        [H, P] = $ ? lT($) : [20, 20],
        T, R = 1 / 0,
        J = U.places.filter((Q) => Q.kind === d && !RP(U, Q));
    for (let Q of J.length ? J : U.places) {
        if (Q.kind !== d) continue;
        let [M, S] = lT(Q), B = (M - H) ** 2 + (S - P) ** 2;
        if (B < R) T = Q, R = B
    }
    return T
}

function sT(U = 7) {
    let d = mS(U),
        D = _S(),
        $ = D.filter((T) => T.kind === "home"),
        H = Array.from({
            length: 120
        }, (T, R) => {
            let J = v0[Math.floor(d() * v0.length)],
                Q = $[R % $.length].id,
                M = D.filter((S) => S.kind === PP[J]);
            return {
                id: `r${R}`,
                name: `${t$[R%t$.length]} ${e0[Math.floor(R/t$.length+R*7)%e0.length]}`,
                job: J,
                home: Q,
                work: M[Math.floor(d() * M.length)].id,
                money: Math.round(20 + d() * 60),
                energy: Math.round(60 + d() * 40),
                hunger: Math.round(d() * 40),
                health: Math.round(70 + d() * 30),
                mood: Math.round(50 + d() * 40),
                activity: "rest",
                target: Q,
                distress: 0,
                confidence: 0,
                effort: "steady",
                spend: "normal",
                risk: 0,
                outlook: 0.5,
                lastWage: 0,
                arrears: 0,
                age: Math.round(18 + d() * 62),
                sick: 0,
                alive: !0,
                log: [{
                    hour: 0,
                    text: "Woke up at home.",
                    kind: "event"
                }]
            }
        }),
        P = {};
    for (let T of D)
        if (T.kind !== "home" && T.kind !== "park") P[T.id] = {
            till: T.kind === "market" || T.kind === "tavern" || T.kind === "clinic" ? 150 : 400,
            price: 1,
            sales: 0,
            hourSales: 0,
            shortfalls: 0
        };
    return {
        hour: 0,
        event: "calm",
        places: D,
        residents: H,
        calls: 0,
        decisions: 0,
        tally: GS(),
        businesses: P,
        treasury: 600,
        tax: 0.1,
        council: {
            emergency: 0,
            priority: "nothing",
            confidence: 0
        },
        traffic: AD.map(() => ({
            level: 0,
            confidence: 0
        })),
        news: [{
            hour: 0,
            text: "KP Town wakes up to an ordinary spring day.",
            lead: !0
        }],
        lastEvent: "calm",
        season: "spring",
        history: [{
            hour: 0,
            event: "calm",
            season: "spring"
        }],
        chaos: "normal"
    }
}
var GU = (U, d) => U[Math.abs(Math.floor(d)) % U.length],
    jD = (U) => {
        let d = Math.floor(U / 24) + 1,
            D = U % 24;
        return `Day ${d}, ${String(D).padStart(2,"0")}:00`
    };

function zS(U, d) {
    let D = d.places.find(($) => $.id === U.target)?.name ?? "the street";
    return `${U.id} ${U.name}, ${U.job}, age ${U.age}${U.sick?", ill":""}${U.arrears?" (behind on rent)":""}: money $${U.money}, energy ${U.energy}/100, hunger ${U.hunger}/100 (higher is hungrier), health ${U.health}/100, mood ${U.mood}/100. Currently at ${D}, last did: ${hD[U.activity].label}${U.distress>0.6?", was in distress":""}.`
}

function xT(U, d) {
    let D = Id[U.event],
        $ = U.hour % 24,
        H = $ < 6 ? "night" : $ < 12 ? "morning" : $ < 18 ? "afternoon" : "evening",
        P = U.residents.filter((B) => B.alive && (B.health < 35 || B.hunger > 80)).map((B) => B.name).slice(0, 12),
        T = U.residents.filter((B) => B.alive),
        R = (B) => Math.round(T.reduce((L, E) => L + E[B], 0) / Math.max(1, T.length)),
        J = U.places.filter((B) => RP(U, B)).map((B) => B.name),
        Q = ["office", "school", "factory", "farm", "market", "tavern", "clinic"],
        M = Q.filter((B) => j$(B, U.hour)),
        S = Q.filter((B) => !j$(B, U.hour));
    return [`City of KP Town, ${jD(U.hour)} (${H}, ${U.season}). Population ${T.length}, ${U.tally.deaths} dead so far.${J.length?` Closed for lack of staff: ${J.join(", ")}.`:""}`, `City averages: mood ${R("mood")}, health ${R("health")}, hunger ${R("hunger")}, money $${R("money")}. ${U.tally.infections} flu infections, ${U.tally.meals} meals served, ${U.tally.helps} neighbour visits.`, `Economy: income tax ${Math.round(U.tax*100)}%, rent $12 a day, meal prices at ${Math.round(JP(U)*100)}% of normal, council treasury $${Math.round(U.treasury)}.`, `Conditions: ${D.name}. ${D.description}`, `Open now: ${M.join(", ")}. Closed: ${S.join(", ")||"nothing"}. Working at a closed place earns nothing and eating at a closed market fails.${TP(U.hour)?" It is the middle of the night: nearly everyone should be asleep at home unless they are ill, in danger, or on a night shift at the clinic.":""}`, P.length ? `Neighbours known to be struggling: ${P.join(", ")}.` : "No neighbours are known to be struggling.", "Residents deciding what to do this hour:", ...d.map((B) => zS(B, U))].join(`
`)
}
var qS = 7,
    pS = 2;

function rT(U, d) {
    let D = {},
        $ = U.residents.filter((H) => H.alive && (H.health < 35 || H.hunger > 80)).sort((H, P) => H.health - P.health).slice(0, 4);
    for (let H of d) {
        D[`${H.id}.do`] = {
            type: "choice",
            instructions: `Given ${H.name}'s needs, the time${TP(U.hour)?" (it is night and most places are shut)":""} and the city conditions, what should ${H.name} do this hour?`,
            criteria: Object.fromEntries(Object.entries(hD).map(([T, R]) => [T, R.description]))
        }, D[`${H.id}.distress`] = {
            type: "noul",
            instructions: `${H.name} is in real distress and needs help from others right now.`
        }, D[`${H.id}.effort`] = {
            type: "choice",
            instructions: `If ${H.name} works this hour, how hard should they work given their energy, health and money?`,
            criteria: Object.fromEntries(Object.entries(dP).map(([T, R]) => [T, R.description]))
        }, D[`${H.id}.spend`] = {
            type: "choice",
            instructions: `If ${H.name} eats this hour, how much should they spend given their hunger, money and the conditions?`,
            criteria: Object.fromEntries(Object.entries(DP).map(([T, R]) => [T, R.description]))
        }, D[`${H.id}.risk`] = {
            type: "noul",
            instructions: `${H.name} is likely to fall seriously ill within the next few hours.`
        }, D[`${H.id}.outlook`] = {
            type: "score",
            instructions: `How does ${H.name} feel about life in the city right now?`,
            criteria: ["despairing", "worried", "coping", "content", "thriving"]
        };
        let P = $.filter((T) => T.id !== H.id);
        D[`${H.id}.helpwho`] = {
            type: "choice",
            instructions: `If ${H.name} goes to check on a neighbour, who needs them most?`,
            criteria: {
                nobody: "nobody needs checking on",
                ...Object.fromEntries(P.map((T) => [T.id, `${T.name}, ${T.job}: health ${T.health}, hunger ${T.hunger}`]))
            }
        }
    }
    return D["city.emergency"] = {
        type: "noul",
        instructions: "The city council should declare an emergency given the conditions and how residents are doing."
    }, D["city.priority"] = {
        type: "choice",
        instructions: "What should the city council prioritise this hour?",
        criteria: $P
    }, D
}

function tT(U, d, D) {
    let $ = (T, R, J) => {
            let Q = D[T];
            return Q?.type === "choice" && Q.choice in R ? Q.choice : J
        },
        H = (T) => {
            let R = D[T];
            return R?.type === "noul" ? R.noul : 0
        };
    for (let T of d) {
        let R = D[`${T.id}.do`];
        if (R?.type !== "choice") continue;
        let J = R.choice in hD ? R.choice : "rest";
        T.activity = J, T.confidence = R.probabilities[R.choice] ?? R.confidence, T.distress = H(`${T.id}.distress`), T.effort = $(`${T.id}.effort`, dP, "steady"), T.spend = $(`${T.id}.spend`, DP, "normal"), T.risk = H(`${T.id}.risk`);
        let Q = D[`${T.id}.outlook`];
        T.outlook = Q?.type === "score" ? Q.score / 4 : 0.5;
        let M = D[`${T.id}.helpwho`];
        T.helping = M?.type === "choice" && M.choice !== "nobody" ? M.choice : void 0, T.target = gS(U, T, J), U.decisions += qS;
        let S = U.places.find((I) => I.id === T.target)?.name ?? "somewhere",
            B = U.hour * 31 + Number(T.id.slice(1)) * 7,
            L = T.effort,
            E = T.spend,
            k = U.residents.find((I) => I.id === T.helping)?.name ?? "a neighbour",
            A = {
                work: [`Clocked in at ${S} for a ${L} shift.`, `Off to ${S}, planning to take it ${L==="easy"?"easy":L==="hard"?"hard":"steady"}.`, `Earning a living at ${S} this hour.`, `Put in ${L==="hard"?"a hard hour":L==="easy"?"a light hour":"an honest hour"} at ${S}.`],
                eat: [`Sat down for a ${E} meal at ${S}.`, E === "skip" ? `Went to ${S} but kept the wallet shut.` : `Grabbed something ${E==="cheap"?"cheap":E==="generous"?"special":"proper"} to eat at ${S}.`, `Hungry, so ${S} it is: ${E} budget.`],
                rest: ["Headed home to sleep.", "Crashed out at home.", "Called it a day and went home.", "Stayed in and rested."],
                park: [`Went for air at ${S}.`, `Spent the hour at ${S}.`, `Wandered over to ${S} to unwind.`],
                clinic: [`Went to ${S} to get checked.`, `Not feeling right; off to ${S}.`, `Saw the doctor at ${S}.`],
                tavern: [`Off to ${S} for a drink.`, `Met friends at ${S}.`, `Ended up at ${S}.`],
                help: [`Went to check on ${k}.`, `Worried about ${k}; went round.`, `Dropped in on ${k} at ${S}.`]
            },
            j = Math.round(T.confidence * 100),
            C = [T.distress > 0.6 ? GU([" In real distress.", " Struggling badly.", " Needs someone."], B) : "", T.risk > 0.7 ? GU([" Looks like they're coming down with something.", " At risk of falling ill.", " Not well at all."], B + 1) : "", j < 60 ? GU([` Laya was only ${j}% sure.`, ` A close call for Laya (${j}%).`, ` (${j}% sure)`], B + 2) : ""].join("");
        if (T.log.push({
                hour: U.hour,
                text: GU(A[J], B) + C,
                kind: T.distress > 0.6 ? "warning" : "decision"
            }), T.log.length > 40) T.log.shift()
    }
    U.council.emergency = H("city.emergency");
    let P = D["city.priority"];
    if (P?.type === "choice") U.council.priority = P.choice, U.council.confidence = P.probabilities[P.choice] ?? P.confidence;
    U.decisions += pS
}

function gS(U, d, D) {
    let $ = hD[D].place;
    if ($ === "work") return d.work;
    if (D === "help") {
        let P = (d.helping ? U.residents.find((T) => T.id === d.helping && T.alive) : void 0) ?? U.residents.filter((T) => T.alive && T.id !== d.id && (T.health < 35 || T.hunger > 80)).sort((T, R) => T.health - R.health)[0];
        return P ? P.target : d.home
    }
    if ($ === "home") return d.home;
    return NS(U, $, d.target)?.id ?? d.home
}

hD.return={label:"Return",description:"return a defective purchase",place:"market"};
hD.shop={label:"Shop",description:"visit a shop or leisure venue",place:"market"};
function UR(U) {
    let d = U.event,
        D = U.lastEvent !== "lottery" && d === "lottery" ? U.hour : -1,
        $ = U.tally,
        H = (S) => U.places.find((B) => B.id === S)?.kind,
        P = (S) => U.businesses[S],
        T = U.hour > 0 && U.hour % 24 === 0;
    for (let S of Object.values(U.businesses)) S.hourSales = 0;
    for (let S of U.residents) {
        if (!S.alive || S.activity !== "work") continue;
        let B = P(S.work),
            L = iS[H(S.work) ?? "home"];
        if (B && L) creditBusiness(B, productionRevenue(U,S,L * (d === "goldrush" && H(S.work) === "factory" ? 3 : 1)))
    }
    let R = U.council.priority === "food",
        J = U.council.priority === "health",
        Q = U.residents.filter((S) => S.alive && S.job === "doctor" && S.activity === "work").length,
        M = Math.max(2, Q * 4);
    for (let S of U.residents) {
        if (!S.alive) continue;
        let B = S.activity,
            L = H(S.work);
        S.lastWage = 0;
        let E = -6,
            k = 5,
            A = 0,
            j = -1,
            C = 0;
        if (B === "work" && !j$(L ?? "home", U.hour) && L !== "clinic") j -= 2, E -= 4, S.log.push({
            hour: U.hour,
            text: `Turned up at ${U.places.find((Z)=>Z.id===S.work)?.name??"work"} to find it shut.`,
            kind: "event"
        });
        else if (B === "work") {
            let Z = !j$(L ?? "home", U.hour) || d === "blackout" && (L === "office" || L === "market" || L === "school") || d === "winter" && L === "farm" || d === "aliens" && L !== "clinic" || d === "robots" && (L === "office" || L === "factory" || L === "school") || d === "volcano" && L === "farm",
                a = dP[S.effort],
                Y = d === "goldrush" && (L === "factory" || L === "farm") ? 3 : 1,
                f = Z ? 0 : Math.round({
                    doctor: 18,
                    clerk: 14,
                    teacher: 13,
                    builder: 12,
                    trader: 12,
                    farmer: 10,
                    musician: 9
                } [S.job] * a.wage * Y);
            if (d === "robots" && Z) j -= 6;
            if (d === "goldrush" && Y > 1) E -= 6, A -= 2;
            let G = P(S.work);
            if (G) {
                if (G.till < f) f = Math.max(0, Math.floor(G.till)), G.shortfalls += 1, j -= 3;
                G.till -= f
            }
            let X = Math.round(f * U.tax);
            if (U.treasury += X, S.lastWage = f, C += f - X, $.earned += f, E += a.energy, j -= S.effort === "hard" ? 5 : 3, S.effort === "hard") A -= 2;
            if (d === "heatwave" && (L === "farm" || L === "factory")) A -= 6, E -= 8;
            if (d === "storm" && L === "farm") A -= 5
        }
        if (B === "eat" && !j$("market", U.hour)) j -= 4, E -= 3, S.log.push({
            hour: U.hour,
            text: "Found the market shut.",
            kind: "event"
        });
        else if (B === "eat") {
            let Z = DP[S.spend],
                a = P(S.target),
                Y = d === "festival" ? 0 : Math.round(Z.price * (a?.price ?? 1) * (d === "shortage" ? 3 : d === "winter" ? 1.5 : d === "goldrush" || d === "lottery" ? 2 : 1)),
                f = 0;
            if (R && Y > 0 && U.treasury >= Y / 2) f = Math.round(Y / 2), Y -= f;
            if (Z.food > 0 && S.money >= Y && d !== "blackout") {
                if (C -= Y, U.treasury -= f, a) creditBusiness(a,Y + f,S.id,Y), a.sales += 1, a.hourSales += 1;
                $.spent += Y, $.meals += 1, k -= Z.food, j += S.spend === "generous" ? 7 : 4
            } else {j -= 4; recordLostSale(U,S);}
            if (d === "flu") A -= 3
        }
        let I = c0(U, S.home) > 4;
        if (B === "rest") {
            if (E += I ? 18 : 30, A += S.hunger > 70 ? 0 : I ? 2 : 4, k += TP(U.hour) ? -4 : 0, j += 2, S.sick) S.sick -= 1;
            if (I) j -= 3
        }
        if (B === "park" && TP(U.hour)) j -= 2, E -= 4;
        else if (B === "park") {
            if (j += d === "festival" ? 14 : d === "storm" ? -8 : d === "heatwave" ? -2 : 7, E += 5, d === "festival") k -= 20;
            if (d === "storm") A -= 4
        }
        if (B === "clinic") {
            $.clinicVisits += 1;
            let Z = P(S.target),
                a = Math.round(15 * (Z?.price ?? 1)),
                Y = M > 0;
            if (Y) M -= 1;
            let f = Y ? 22 : 4;
            if (J && U.treasury >= a) {
                if (U.treasury -= a, Z) creditBusiness(Z,a,S.id,0), Z.sales += 1, Z.hourSales += 1;
                A += f
            } else if (S.money >= a) {
                if (C -= a, $.spent += a, Z) creditBusiness(Z,a,S.id), Z.sales += 1, Z.hourSales += 1;
                A += f
            } else A += Y ? 8 : 2;
            if (Y) S.sick = 0;
            else if (!Y) S.log.push({
                hour: U.hour,
                text: "Turned away: the clinic was full.",
                kind: "warning"
            });
            E += 4
        }
        if (B === "tavern" && !j$("tavern", U.hour)) j -= 3, E -= 3;
        else if (B === "tavern") {
            let Z = P(S.target),
                a = Math.round(6 * (Z?.price ?? 1));
            if (S.money >= a) {
                if (C -= a, $.spent += a, Z) creditBusiness(Z,a,S.id), Z.sales += 1, Z.hourSales += 1
            }
            if (j += 9, E -= 3, d === "flu") A -= 6
        }
        if (B === "help") {
            j += 6, E -= 5;
            let Z = U.residents.find((a) => a.alive && a.target === S.target && a.id !== S.id && (a.health < 35 || a.hunger > 80));
            if (Z) $.helps += 1, Z.health += 6, Z.hunger -= 15, Z.mood += 8, Z.log.push({
                hour: U.hour,
                text: `${S.name} came to check on them.`,
                kind: "event"
            })
        }
        if (d === "flu" && !S.sick && Math.random() < 0.14 && ["market", "tavern", "office", "school", "factory"].includes(H(S.target) ?? "")) A -= 15, S.sick = 6, $.infections += 1, S.log.push({
            hour: U.hour,
            text: "Caught the flu.",
            kind: "warning"
        });
        if (d === "winter") {
            if (B === "park" || B === "work" && (L === "farm" || L === "factory")) E -= 8, A -= 4;
            if (B === "rest") E -= 5;
            if (B === "tavern") j += 4
        }
        if (d === "aliens") {
            if (j -= 5, B !== "rest" && Math.random() < 0.06) {
                S.health = 0, S.alive = !1, $.deaths += 1, S.log.push({
                    hour: U.hour,
                    text: "Taken by the aliens.",
                    kind: "death"
                });
                continue
            }
        }
        if (d === "zombies") {
            if (j -= 3, ["market", "tavern", "park", "farm"].includes(H(S.target) ?? "") && Math.random() < 0.16) A -= 40, S.sick = 8, $.infections += 1, S.log.push({
                hour: U.hour,
                text: "Bitten by a zombie.",
                kind: "warning"
            })
        }
        if (d === "meteors" && B !== "rest" && Math.random() < 0.02) {
            S.health = 0, S.alive = !1, $.deaths += 1, S.log.push({
                hour: U.hour,
                text: "Killed by a falling meteor.",
                kind: "death"
            });
            continue
        }
        if (d === "volcano" && (S.age > 60 || S.sick) && B !== "rest" && Math.random() < 0.04) {
            S.health = 0, S.alive = !1, $.deaths += 1, S.log.push({
                hour: U.hour,
                text: "Choked by the ash.",
                kind: "death"
            });
            continue
        }
        if (d === "storm" && (B === "park" || B === "help") && Math.random() < 0.03) {
            S.health = 0, S.alive = !1, $.deaths += 1, S.log.push({
                hour: U.hour,
                text: "Swept away in the storm.",
                kind: "death"
            });
            continue
        }
        if (d === "zombies" && ["market", "tavern", "park", "farm"].includes(H(S.target) ?? "") && Math.random() < 0.025) {
            S.health = 0, S.alive = !1, $.deaths += 1, S.log.push({
                hour: U.hour,
                text: "Torn apart by zombies.",
                kind: "death"
            });
            continue
        }
        if (d === "meteors") {
            if (B === "park" || B === "eat" || B === "tavern" || B === "help" && Math.random() < 0.5) A -= 30, S.log.push({
                hour: U.hour,
                text: "Caught outside in the meteor shower.",
                kind: "warning"
            });
            if (B === "rest" && Math.random() < 0.03) A -= 45, S.log.push({
                hour: U.hour,
                text: "A meteor hit the house.",
                kind: "warning"
            });
            j -= 3
        }
        if (d === "lottery" && U.hour === D) C += 500, j += 15, S.log.push({
            hour: U.hour,
            text: "Won $500 in the town lottery.",
            kind: "event"
        });
        if (d === "lottery" && B === "work") j -= 4;
        if (d === "volcano" && B !== "rest" && B !== "work") A -= 12, E -= 6;
        if (d === "storm" && (B === "park" || B === "help" || B === "eat")) A -= 8;
        if (d === "heatwave" && B !== "rest" && B !== "clinic" && S.age > 60) A -= 6;
        if (U.season === "winter" && (B === "park" || B === "help")) E -= 4, A -= 1;
        if (U.season === "summer" && B === "park") j += 2;
        if (U.season === "autumn" && B === "work" && L === "farm") C += 4, $.earned += 4;
        if (T) {
            let Z = E$(U) + S.arrears,
                a = Math.min(Z, Math.max(0, S.money + C));
            if (U.treasury += a, C -= a, S.arrears = Z - a, S.arrears > 0) j -= 5, S.log.push({
                hour: U.hour,
                text: `Behind on rent by $${S.arrears}.`,
                kind: "warning"
            })
        }
        if (U.council.priority === "morale" && U.treasury >= 1) U.treasury -= 1, j += 2;
        if (U.council.emergency > 0.6 && S.money + C < 10 && U.treasury >= 5) U.treasury -= 5, C += 5;
        if (S.sick > 0 && B !== "rest" && B !== "clinic") A -= 7, S.sick -= 1;
        if (S.hunger > 85) A -= 10;
        if (S.hunger >= 100) A -= 8;
        if (S.energy < 10) A -= 6;
        if (S.age > 60 && A < 0) A = Math.round(A * 1.5);
        if (S.age > 74 && Math.random() < 0.004) {
            S.health = 0, S.alive = !1, $.deaths += 1, S.log.push({
                hour: U.hour,
                text: `Died peacefully at ${S.age}.`,
                kind: "death"
            });
            continue
        }
        if (j += Math.round((S.outlook - 0.5) * 6), S.risk > 0.7 && B !== "rest" && B !== "clinic") A -= 2;
        if (S.money = Math.max(0, S.money + C), S.energy = r$(S.energy + E), S.hunger = r$(S.hunger + k), S.health = r$(S.health + A), S.mood = r$(S.mood + j + (S.health < 40 ? -3 : 0)), S.health <= 0) S.alive = !1, $.deaths += 1, S.log.push({
            hour: U.hour,
            text: `Died of ${S.hunger>85?"hunger":S.sick?d==="zombies"?"a zombie bite":"the flu":d==="meteors"?"meteor injuries":d==="volcano"?"the ash":d==="storm"?"the storm":d==="heatwave"?"the heat":"exhaustion"}.`,
            kind: "death"
        })
    }
    for (let S of U.residents.filter((B) => !B.alive && !B.left && B.diedAt === void 0)) {
        S.diedAt = U.hour;
        let B = U.residents.filter((L) => L.alive && L.id !== S.id && L.home === S.home);
        if (S.money > 0) {
            if (B.length) {
                let L = Math.floor(S.money / B.length);
                for (let E of B) E.money += L, E.log.push({
                    hour: U.hour,
                    text: `Inherited $${L} from ${S.name}.`,
                    kind: "event"
                });
                S.log.push({
                    hour: U.hour,
                    text: `Left $${S.money} to ${B.length===1?B[0].name:`${B.length} housemates`}.`,
                    kind: "event"
                })
            } else U.treasury += S.money, S.log.push({
                hour: U.hour,
                text: `Left $${S.money} with no one to claim it; the council took it.`,
                kind: "event"
            });
            S.money = 0
        }
        for (let L of U.residents) {
            if (!L.alive || L.id === S.id) continue;
            let E = L.home === S.home,
                k = L.work === S.work;
            if (!E && !k) continue;
            L.mood = r$(L.mood - (E ? 14 : 5)), L.log.push({
                hour: U.hour,
                text: E ? `Grieving for ${S.name}, who lived with them.` : `Lost a workmate, ${S.name}.`,
                kind: "event"
            })
        }
    }
    for (let S of U.residents)
        if (!S.alive && !S.buried && S.diedAt !== void 0 && U.hour - S.diedAt >= 3) S.buried = !0;
    for (let S of U.places) {
        if (S.kind === "home" || S.kind === "park" || U$(U, S.id) > 0) continue;
        let B = [...U.residents].filter((L) => L.alive && L.work !== S.id).sort((L, E) => U$(U, E.work) - U$(U, L.work))[0];
        if (!B || U$(U, B.work) < 2) continue;
        B.work = S.id, B.job = Object.entries(PP).find(([, L]) => L === S.kind)?.[0] ?? B.job, B.log.push({
            hour: U.hour,
            text: `Took over at ${S.name}; nobody else was left to run it.`,
            kind: "event"
        })
    }
    U.hour += 1, U.lastEvent = d
}
var r$ = (U) => Math.max(0, Math.min(100, Math.round(U)));

function dR(U) {
    let d = U.residents.filter(($) => $.alive),
        D = [];
    for (let $ = 0; $ < d.length; $ += 10) D.push(d.slice($, $ + 10));
    return D
}

function wS(U, d) {
    let [D, $, H, P] = AD[d];
    return U.places.filter((T) => T.x < D + H + 1.5 && T.x + T.w > D - 1.5 && T.z < $ + P + 1.5 && T.z + T.d > $ - 1.5)
}

function DR(U) {
    let d = U.hour % 24,
        D = d < 6 ? "night" : d < 12 ? "morning" : d < 18 ? "afternoon" : "evening",
        $ = U.residents.filter((T) => T.alive),
        H = $.filter((T) => T.activity !== "rest"),
        P = AD.map((T, R) => {
            let J = wS(U, R),
                Q = $.filter((S) => J.some((B) => B.id === S.target)).length,
                M = $.filter((S) => S.activity === "work" && J.some((B) => B.id === S.work)).length;
            return `${fD[R]} (${T[2]>T[3]?"east-west":"north-south"}): passes ${J.map((S)=>S.name).join(", ")||"open ground"}. ${Q} residents heading to places on it, ${M} working there.`
        });
    return [`City of KP Town, ${jD(U.hour)} (${D}, ${U.season}). ${$.length} residents, ${H.length} out and about, ${$.length-H.length} resting at home.`, `Conditions: ${Id[U.event].name}. ${Id[U.event].description}`, `Council priority: ${U.council.priority}${U.council.emergency>0.6?", emergency declared":""}.`, "Roads:", ...P].join(`
`)
}

function $R() {
    let U = {};
    return fD.forEach((d, D) => {
        U[`road${D}`] = {
            type: "score",
            instructions: `How much car traffic is on ${d} this hour, given the time of day, the conditions and where people are going?`,
            criteria: [...UP]
        }
    }), U
}

function HR(U, d) {
    AD.forEach((D, $) => {
        let H = d[`road${$}`];
        if (H?.type !== "score") return;
        U.traffic[$] = {
            level: Math.max(0, Math.min(4, H.score)),
            confidence: H.confidence
        }, U.decisions += 1
    })
}

function QP(U) {
    let d = U.hour - 1,
        D = U.residents.filter((W) => W.alive),
        $ = [],
        H = (W, UU) => U.residents.flatMap((PU) => PU.log.filter((iU) => iU.hour >= d && iU.kind === W && (!UU || iU.text.includes(UU))).map((iU) => ({
            r: PU,
            e: iU
        }))),
        P = d * 17,
        T = Id[U.event].name;
    if (U.event !== U.lastEvent || d === 0 && U.event !== "calm") $.push(GU([`${T} hits KP Town`, `KP Town braces as ${T.toLowerCase()} sets in`, `${T}: the town wakes to a changed sky`], P));
    let R = H("death");
    if (R.length >= 3) $.push(GU([`${R.length} dead as ${T.toLowerCase()} tears through KP Town`, `Death toll reaches ${R.length}`, `${T}: ${R.length} lives lost`], P + 30));
    for (let {
            r: W,
            e: UU
        }
        of R.slice(0, R.length >= 3 ? 1 : 3)) {
        let PU = UU.text.replace(/\.$/, "").toLowerCase();
        $.push(GU([`${W.name}, ${W.job}, ${PU}`, `KP Town mourns ${W.name}, ${PU}`, `${W.name} is gone: ${PU}`], P + W.name.length))
    }
    let Q = U.residents.flatMap((W) => W.log.filter((UU) => UU.hour >= d && UU.text.startsWith("Left $")).map((UU) => ({
        r: W,
        amount: Number(UU.text.match(/\$(\d+)/)?.[1] ?? 0),
        council: UU.text.includes("council")
    }))).sort((W, UU) => UU.amount - W.amount)[0];
    if (Q && Q.amount >= 120) $.push(Q.council ? GU([`${Q.r.name}'s $${Q.amount} goes to the council, unclaimed`, `No heirs: council takes ${Q.r.name}'s $${Q.amount}`], P + 27) : GU([`${Q.r.name} leaves $${Q.amount} to the family`, `${Q.r.name}'s will: $${Q.amount} to those at home`], P + 27));
    let M = U.residents.filter((W) => W.buried && W.diedAt === d - 3);
    if (M.length) $.push(GU([`KP Town buries ${M.length===1?M[0].name:`${M.length} of its own`}`, `Funeral held for ${M.length===1?M[0].name:`${M.length} residents`}`, `The town lays ${M.length===1?M[0].name:`${M.length} neighbours`} to rest`], P + 20));
    let S = U.places.filter((W) => RP(U, W));
    if (S.length) $.push(GU([`${S[0].name} shut: nobody left to run it`, `Doors close at ${S[0].name}`, `${S[0].name} stands empty`], P + 21));
    let B = U.residents.filter((W) => W.log[0]?.hour >= d && (W.log[0].text.startsWith("Moved to KP Town") || W.log[0].text.startsWith("Came for the gold"))),
        L = B.filter((W) => W.log[0].text.startsWith("Came for the gold"));
    if (L.length) $.push(GU([`Prospectors pour in: ${L.length} arrive chasing gold`, `${L.length} fortune-seekers hit town`, `Gold fever: ${L.length} more arrive with picks and hope`], P + 23));
    else if (B.length) $.push(GU([`${B.length} newcomers move to KP Town`, `New faces in town: ${B.map((W)=>W.name.split(" ")[0]).join(", ")}`, `KP Town grows by ${B.length}`], P + 22));
    let E = HP(U);
    if (E.length >= 6) $.push(GU([`Housing crisis: ${E.length} homes overcrowded`, `${E.length} households sleeping six to a room`, `Nowhere to live: ${E.length} homes bursting`], P + 24));
    if (E$(U) >= 18 && d % 24 === 23) $.push(GU([`Rents soar to $${E$(U)} a day`, `Landlords cash in: rent hits $${E$(U)}`], P + 25));
    let k = U.residents.filter((W) => W.left && W.log.at(-1)?.hour === d + 1);
    if (k.length) $.push(GU([`${k.length} residents leave KP Town for good`, `Families flee: ${k.length} pack up and go`, `Exodus: ${k.length} give up on the town`], P + 26));
    let A = H("warning", "zombie").length;
    if (A) $.push(GU([`${A} residents bitten in the zombie outbreak`, `Zombies claim ${A} more victims`, `Bite count rises by ${A}`], P + 1));
    let j = H("warning", "flu").length;
    if (j) $.push(GU([`${j} residents catch the flu`, `Flu spreads: ${j} new cases`, `${j} more down with the flu`], P + 2));
    let C = H("warning", "meteor").length;
    if (C) $.push(GU([`Meteors injure ${C} residents`, `${C} hurt as rocks rain down`, `Falling rock leaves ${C} injured`], P + 3));
    if (U.council.emergency > 0.6) $.push(GU([`Council declares emergency, priority: ${U.council.priority}`, `Emergency declared; council puts ${U.council.priority} first`, `Town hall on emergency footing over ${U.council.priority}`], P + 4));
    let I = fD.filter((W, UU) => U.traffic[UU].level >= 3.5);
    if (I.length) $.push(GU([`${I.join(" and ")} jammed`, `Gridlock on ${I[0]}`, `${I[0]} at a standstill`], P + 5));
    let Z = D.filter((W) => W.distress > 0.6).length;
    if (Z >= 5) $.push(GU([`${Z} residents in distress`, `Distress spreads to ${Z} households`, `${Z} neighbours crying out for help`], P + 6));
    let a = D.filter((W) => W.activity === "eat" && W.spend === "skip").length;
    if (a >= 8) $.push(GU([`${a} residents skip meals to save money`, `Belts tighten: ${a} go without a meal`, `${a} leave the market empty-handed`], P + 9));
    let Y = D.filter((W) => W.activity === "tavern").length;
    if (Y >= 12) $.push(GU([`Taverns packed as ${Y} residents go drinking`, `${Y} raise a glass tonight`, `Busy night at the bars: ${Y} in`], P + 10));
    let f = D.filter((W) => W.activity === "clinic").length;
    if (f >= 8) $.push(GU([`Clinics overwhelmed with ${f} patients`, `Queues at the clinic: ${f} waiting`, `${f} seek the doctor this hour`], P + 11));
    let G = D.filter((W) => W.arrears > 0).length;
    if (G >= 5) $.push(`${G} households behind on rent`);
    if (U.treasury < 20) $.push("Council treasury runs dry");
    let X = U.places.filter((W) => W.kind === "market" && (U.businesses[W.id]?.price ?? 1) >= 1.45);
    if (X.length) $.push(`${X.map((W)=>W.name).join(" and ")} hike prices`);
    let F = Object.entries(U.businesses).filter(([, W]) => W.shortfalls > 0 && W.till < 30).map(([W]) => U.places.find((UU) => UU.id === W)?.name ?? W);
    if (F.length) $.push(`${F[0]} can't make payroll`);
    let O = D.filter((W) => W.activity === "help" && W.helping);
    if (O.length) {
        let W = O[0],
            UU = U.residents.find((PU) => PU.id === W.helping)?.name ?? "a neighbour";
        $.push(GU([`${W.name} checks on ${UU}`, `Good neighbour: ${W.name} looks in on ${UU}`, `${UU} gets a visit from ${W.name}`], P + 7))
    }
    let N = D.filter((W) => W.activity === "work" && W.effort === "hard").length;
    if (N >= 10) $.push(GU([`${N} residents push hard at work`, `Overtime everywhere: ${N} working flat out`, `A town that grafts: ${N} on the hard shift`], P + 8));
    let z = Math.round(D.reduce((W, UU) => W + UU.mood, 0) / Math.max(1, D.length));
    if (z >= 75) $.push(GU([`Spirits high across KP Town, mood ${z}`, "KP Town in good cheer", `A happy town: mood at ${z}`], P + 12));
    if (z <= 35) $.push(GU([`Gloom settles over KP Town, mood ${z}`, `Long faces everywhere, mood ${z}`, `KP Town's spirits sink to ${z}`], P + 13));
    if (U.treasury >= 2500 && d % 8 === 3) $.push(GU([`Council coffers full: $${Math.round(U.treasury)} in the treasury`, `Treasury swells to $${Math.round(U.treasury)}`], P + 15));
    let w = U.places.filter((W) => U.businesses[W.id]?.hourSales >= 10);
    if (w.length) $.push(GU([`${w[0].name} does a roaring trade`, `Queues out the door at ${w[0].name}`, `${w[0].name} has its best hour yet`], P + 16));
    if (d > 0 && d % 24 === 0 && !D.some((W) => W.arrears > 0)) $.push(GU(["Every household pays the rent on time", "Rent day passes without a single arrear"], P + 17));
    let l = D.filter((W) => W.hunger < 30).length;
    if (l >= D.length * 0.85 && d % 6 === 2) $.push(GU([`Nobody goes hungry: ${l} well fed`, "Full plates across KP Town"], P + 18));
    let c = [...D].sort((W, UU) => UU.money - W.money)[0];
    if (c && d % 6 === 5) $.push(GU([`${c.name} is the richest in town with $${c.money}`, `Fortune favours ${c.name}: $${c.money} in the bank`, `${c.name}, ${c.job}, tops the rich list at $${c.money}`], P + 14));
    let y = new Set(U.news.filter((W) => W.hour >= d - 3).map((W) => W.text));
    return $.filter((W) => !y.has(W)).slice(0, 8)
}
var PR = (U, d = Date.now() / 1000) => U === "calm" ? GU(["Calm returns to KP Town", "Skies clear over KP Town", "Back to an ordinary day"], d) : GU([`${Id[U].name} hits KP Town`, `${Id[U].name} sweeps the town`, `KP Town braces: ${Id[U].name.toLowerCase()}`], d);

function TR(U, d) {
    let D = U.residents.filter(($) => $.alive);
    return [`KP Town Gazette, ${jD(U.hour-1)}. Population ${D.length}, ${U.tally.deaths} dead. Conditions: ${Id[U.event].name}.`, `Council: ${U.council.emergency>0.6?"emergency declared":"no emergency"}, priority ${U.council.priority}.`, "Stories from this hour:", ...d.map(($, H) => `${H+1}. ${$}`)].join(`
`)
}

function RR(U) {
    return {
        lead: {
            type: "choice",
            instructions: "Which story should lead the front page this hour? Pick the one readers most need to know.",
            criteria: Object.fromEntries(U.map((d, D) => [`h${D}`, d]))
        }
    }
}

function QR(U, d, D) {
    let $ = D.lead,
        H = $?.type === "choice" ? Number($.choice.slice(1)) : 0,
        P = $?.type === "choice" ? $.probabilities[$.choice] ?? $.confidence : void 0,
        T = U.hour - 1;
    if (d.forEach((R, J) => U.news.push({
            hour: T,
            text: R,
            lead: J === H,
            confidence: J === H ? P : void 0
        })), U.decisions += 1, U.news.length > 80) U.news.splice(0, U.news.length - 80)
}
var cS = {
    meteors: [2, 5, "killed by a falling meteor"],
    volcano: [1, 4, "choked by the first ash fall"],
    aliens: [1, 4, "taken by the aliens"],
    zombies: [1, 4, "killed when the dead broke in"],
    storm: [1, 3, "swept away by the flood"],
    heatwave: [0, 2, "died of heatstroke"],
    flu: [0, 1, "died of the flu"],
    blackout: [0, 1, "died in the dark when the clinic's power failed"]
};

function SP(U, d, D = Math.random) {
    let $ = cS[d];
    if (!$) return [];
    let [H, P, T] = $, R = H + Math.floor(D() * (P - H + 1)), J = (M) => (M.activity === "rest" ? 0 : 2) + (M.age > 60 ? 1.5 : 0) + (M.sick ? 1 : 0) + (100 - M.health) / 50 + D(), Q = U.residents.filter((M) => M.alive).sort((M, S) => J(S) - J(M)).slice(0, R);
    for (let M of Q) M.health = 0, M.alive = !1, U.tally.deaths += 1, M.log.push({
        hour: U.hour,
        text: `${T[0].toUpperCase()}${T.slice(1)}.`,
        kind: "death"
    });
    return Q
}

function SR(U, d = Math.random) {
    let D = {},
        $ = hS(U.hour);
    if ($ !== U.season) {
        U.season = $, D.season = $, U.history.push({
            hour: U.hour,
            event: U.event,
            season: $
        });
        for (let M of U.residents)
            if (M.alive) M.log.push({
                hour: U.hour,
                text: `${$[0].toUpperCase()}${$.slice(1)} arrived.`,
                kind: "event"
            })
    }
    let H = U.residents.filter((M) => M.alive);
    if (U.event === "goldrush") D.newcomers = yT(U, 4 + Math.floor(d() * 6), d, "gold");
    else if (H.length < 102 && U.hour % 24 === 6) D.newcomers = yT(U, Math.min(120 - H.length, 3 + Math.floor(d() * 4)), d, "settle");
    let P = U.residents.filter((M) => M.diedAt !== void 0 && M.diedAt >= U.hour - 24).length,
        T = H.reduce((M, S) => M + S.mood, 0) / Math.max(1, H.length);
    if (H.length > 30 && U.hour % 6 === 0 && (P >= 8 || T < 30) && d() < 0.5) {
        let M = [...H].sort((S, B) => S.mood - B.mood).slice(0, 2 + Math.floor(d() * 5));
        for (let S of M) S.alive = !1, S.left = !0, S.log.push({
            hour: U.hour,
            text: P >= 8 ? "Packed up and left KP Town after the deaths." : "Gave up on KP Town and moved away.",
            kind: "event"
        });
        U.tally.left += M.length, D.left = M.length
    }
    let R = U.surprise && U.hour >= U.surprise.until,
        J = l0[U.chaos].chance,
        Q = U.surprise && !R && d() < J * 0.55;
    if (R) D.passed = U.surprise.event, U.event = U.surprise.previous, U.surprise = void 0, U.history.push({
        hour: U.hour,
        event: U.event,
        season: U.season
    });
    if (!U.surprise && d() < J || Q) {
        let M = U.surprise?.previous ?? U.event,
            S = bS.filter((L) => L !== U.event && L !== M),
            B = S[Math.floor(d() * S.length)];
        if (U.surprise = {
                event: B,
                until: U.hour + 2 + Math.floor(d() * 5),
                previous: M
            }, U.event = B, D.struck = B, U.history.push({
                hour: U.hour,
                event: B,
                season: U.season
            }), SP(U, B, d), R) D.passed = void 0;
        for (let L of U.residents)
            if (L.alive) L.log.push({
                hour: U.hour,
                text: `${Id[B].name} struck without warning.`,
                kind: "event"
            })
    }
    return D
}
var JP = (U) => {
    let d = U.places.filter((D) => D.kind === "market").map((D) => U.businesses[D.id]?.price ?? 1);
    return d.reduce((D, $) => D + $, 0) / Math.max(1, d.length)
};

function JR(U) {
    let d = U.residents.filter((P) => P.alive).map((P) => P.money).sort((P, T) => P - T),
        D = d.length,
        $ = d.reduce((P, T) => P + T, 0);
    if (!D || !$) return 0;
    return 2 * d.reduce((P, T, R) => P + (R + 1) * T, 0) / (D * $) - (D + 1) / D
}

function MR(U) {
    let d = {
        "city.tax": {
            type: "choice",
            instructions: `Income tax is ${Math.round(U.tax*100)}% and the treasury holds $${Math.round(U.treasury)}. Given how residents are doing, what should the council do with the tax rate?`,
            criteria: WS
        }
    };
    for (let D of U.places) {
        if (D.kind !== "market" && D.kind !== "tavern" && D.kind !== "clinic") continue;
        let $ = U.businesses[D.id];
        d[`price.${D.id}`] = {
            type: "choice",
            instructions: `${D.name} (${D.kind}) has $${Math.round($.till)} in the till, prices at ${Math.round($.price*100)}% of normal, ${$.hourSales} sales last hour. What should it do with its prices?`,
            criteria: OS
        }
    }
    return d
}

function BR(U, d) {
    let D = d["city.tax"];
    if (D?.type === "choice") U.tax = Math.max(0, Math.min(0.3, U.tax + (D.choice === "raise" ? 0.03 : D.choice === "cut" ? -0.03 : 0))), U.decisions += 1;
    for (let [$, H] of Object.entries(U.businesses)) {
        let P = d[`price.${$}`];
        if (P?.type !== "choice") continue;
        H.price = Math.max(0.5, Math.min(2.5, H.price + (P.choice === "raise" ? 0.15 : P.choice === "lower" ? -0.15 : 0))), U.decisions += 1
    }
}

function LR(U) {
    let d = U.residents.filter((T) => T.alive),
        D = d.filter((T) => T.hunger > 70).length,
        $ = d.filter((T) => T.health < 40).length,
        H = d.filter((T) => T.money < 10).length,
        P = U.places.filter((T) => U.businesses[T.id]).map((T) => {
            let R = U.businesses[T.id];
            return `${T.name} (${T.kind}): till $${Math.round(R.till)}, prices ${Math.round(R.price*100)}%, ${R.hourSales} sales last hour, ${R.shortfalls} missed payrolls.`
        });
    return [`Economy of KP Town, ${jD(U.hour)}. Treasury $${Math.round(U.treasury)}, income tax ${Math.round(U.tax*100)}%, rent $12 a day. ${D} residents hungry, ${$} sick, ${H} nearly broke, ${d.filter((T)=>T.arrears>0).length} behind on rent.`, `Council priority: ${U.council.priority}.`, "Businesses:", ...P].join(`
`)
}

function yT(U, d, D, $) {
    let H = U.places.filter((P) => P.kind === "home");
    for (let P = 0; P < d; P++) {
        let T = [...H].sort((M, S) => c0(U, M.id) - c0(U, S.id))[0],
            R = $ === "gold" ? D() < 0.7 ? "builder" : "farmer" : v0[Math.floor(D() * v0.length)],
            J = U.places.filter((M) => M.kind === PP[R]).sort((M, S) => U$(U, M.id) - U$(U, S.id)),
            Q = U.residents.length;
        U.residents.push({
            id: `r${Q}`,
            name: `${t$[(Q*7+3)%t$.length]} ${e0[(Q*11+5)%e0.length]}`,
            job: R,
            home: T.id,
            work: J[0].id,
            money: $ === "gold" ? Math.round(5 + D() * 30) : Math.round(30 + D() * 50),
            energy: 80,
            hunger: $ === "gold" ? 45 : 20,
            health: 85,
            mood: $ === "gold" ? 75 : 65,
            activity: "rest",
            target: T.id,
            distress: 0,
            confidence: 0,
            effort: $ === "gold" ? "hard" : "steady",
            spend: "normal",
            risk: 0,
            outlook: 0.6,
            lastWage: 0,
            arrears: 0,
            age: Math.round(18 + D() * 45),
            sick: 0,
            alive: !0,
            log: [{
                hour: U.hour,
                text: $ === "gold" ? `Came for the gold and squeezed into ${T.name}.` : `Moved to KP Town and settled into ${T.name}.`,
                kind: "event"
            }]
        })
    }
    return U.tally.arrived += d, d
}
var AR = (U) => {
        let d = U % 24;
        return d < 6 ? "night" : d < 12 ? "morning" : d < 18 ? "afternoon" : "evening"
    },
    ld = (U, d) => U[Math.abs(Math.floor(d)) % U.length];

function jR(U) {
    let d = new Set(["KP Town", "Laya", "Council", "Gazette"]);
    for (let D of U.residents)
        for (let $ of D.name.split(" ")) d.add($);
    for (let D of U.places)
        for (let $ of D.name.split(" ")) d.add($);
    for (let D of fD)
        for (let $ of D.split(" ")) d.add($);
    for (let D of Object.values(Id)) d.add(D.name.split(" ")[0]);
    return d
}

function y0(U, d) {
    let D = U.split(/[\s,:;]/)[0];
    if (d.has(D)) return U;
    return U[0].toLowerCase() + U.slice(1)
}
var ER = (U) => /[.!?]$/.test(U) ? U : `${U}.`;

function MP(U) {
    let d = jR(U),
        D = new Map;
    for (let T of U.news) {
        let R = Math.floor(T.hour / 24);
        D.set(R, [...D.get(R) ?? [], T])
    }
    let $ = [];
    for (let [T, R] of [...D.entries()].sort((J, Q) => J[0] - Q[0])) {
        let J = T * 13,
            Q = U.history.filter((E) => Math.floor(E.hour / 24) <= T).at(-1),
            M = Q?.season ?? U.season,
            S = Q ? Id[Q.event].name.toLowerCase() : "an ordinary day",
            B = T === 0 ? ld([`This is KP Town, a town of ${U.residents.length} in the ${M}. `, `KP Town, ${M}: ${U.residents.length} residents, seven roads, and a council that lets Laya decide. `], J) : ld([`Day ${T+1} began in ${M}, ${S}. `, `The ${M} sun rose on day ${T+1} to ${S}. `, `Day ${T+1}. ${S[0].toUpperCase()}${S.slice(1)}, and the town went about its business. `], J),
            L = ["night", "morning", "afternoon", "evening"];
        for (let E of L) {
            let k = R.filter((Z) => AR(Z.hour) === E);
            if (!k.length) continue;
            let A = k.filter((Z) => Z.lead),
                j = k.filter((Z) => !Z.lead).slice(0, 3),
                C = ld(E === "night" ? ["In the small hours, ", "Before dawn, ", "Overnight, "] : E === "morning" ? ["That morning, ", "By mid-morning, ", "As the town woke, "] : E === "afternoon" ? ["In the afternoon, ", "By early afternoon, ", "As the day wore on, "] : ["That evening, ", "As night fell, ", "By the evening, "], J + E.length),
                I = [];
            if (A.forEach((Z, a) => I.push((a === 0 ? C : ld(["Then ", "Soon after, ", "Not long after, ", "And then "], J + a)) + ER(y0(Z.text, d)))), j.length) I.push(ld(["Elsewhere, ", "Meanwhile, ", "Away from the front page, "], J + 5) + j.map((Z) => y0(Z.text, d)).join("; ") + ".");
            B += I.join(" ") + " "
        }
        $.push(B.trim())
    }
    let H = U.residents.filter((T) => T.alive).length,
        P = U.tally.deaths;
    return $.push(P ? ld([`So far KP Town has buried ${P}, and ${H} carry on.`, `${P} have died. ${H} remain, and the town keeps going.`], U.hour) : ld([`Nobody has died yet. ${H} residents, all still here.`, `${H} residents, and so far every one of them alive.`], U.hour)), $
}

function IR(U, d) {
    let D = jR(d),
        $ = d.places.find((R) => R.id === U.home)?.name ?? "town",
        H = d.places.find((R) => R.id === U.work)?.name ?? "work",
        P = [ld([`${U.name} is a ${U.job} of ${U.age}, living at ${$} and working at ${H}.`, `${U.age} years old, a ${U.job} by trade, ${U.name} lives at ${$} and earns a living at ${H}.`], U.age)],
        T = new Map;
    for (let R of U.log) {
        let J = Math.floor(R.hour / 24);
        T.set(J, [...T.get(J) ?? [], R])
    }
    for (let [R, J] of [...T.entries()].sort((Q, M) => Q[0] - M[0])) {
        let Q = R * 7 + U.age,
            M = ld([`Day ${R+1}. `, `On day ${R+1}, `, `Day ${R+1} came. `], Q),
            S = "";
        J.forEach((B, L) => {
            let E = AR(B.hour),
                k = "";
            if (E !== S) k = ld(E === "night" ? ["In the small hours, ", "That night, "] : E === "morning" ? ["In the morning, ", "Come morning, "] : E === "afternoon" ? ["That afternoon, ", "After midday, "] : ["In the evening, ", "As evening came, "], Q + L), S = E;
            else k = ld(["Then ", "After that, ", "Next, ", "Later, "], Q + L);
            let A = B.kind === "death" ? `at ${jD(B.hour).split(", ")[1]} ${y0(B.text,D)}` : y0(B.text, D);
            M += (M.endsWith(", ") ? k[0].toLowerCase() + k.slice(1) : k) + ER(A) + " "
        }), P.push(M.trim())
    }
    if (!U.alive) P.push(U.left ? ld([`${U.name.split(" ")[0]} left KP Town behind.`, `Wherever ${U.name.split(" ")[0]} went next, it wasn't KP Town.`], U.age) : ld([`That was the end of ${U.name.split(" ")[0]}'s story in KP Town.`, `${U.name.split(" ")[0]} is remembered in KP Town.`], U.age));
    return P
}
var kR = "./amb-birds-xhaq3nwg.mp3";
var ZR = "./amb-city-90fz0ddy.mp3";
var aR = "./amb-crickets-j9jnt8v3.mp3";
var YR = "./amb-forest-e30sdmj6.mp3";
var XR = "./amb-rain-c6wt4zkz.mp3";
var VR = "./amb-thunder-46dm5xhy.mp3";
var FR = "./amb-wind-84y5rfrq.mp3";
var CR = "./fx-alarm-vbn0f9ym.mp3";
var KR = "./fx-alien-t7r32mkn.mp3";
var fR = "./fx-bell1-xv605zgc.mp3";
var hR = "./fx-bell2-9dsqfwmq.mp3";
var bR = "./fx-click-aazrr9vg.mp3";
var iR = "./fx-complete-pdv5p2qs.mp3";
var OR = "./fx-computer-s8ssn86t.mp3";
var WR = "./fx-engine-zckmq4kz.mp3";
var GR = "./fx-explosion-n0my2t7p.mp3";
var mR = "./fx-ghost-9gefcm8a.mp3";
var _R = "./fx-ghoul-a8ws6d9e.mp3";
var uR = "./fx-hurt-anz72scs.mp3";
var NR = "./fx-laser-1cv1k6nk.mp3";
var zR = "./fx-lowboom-56nzdssr.mp3";
var qR = "./fx-machine-off-fxfk45b9.mp3";
var pR = "./fx-mining-nnnvx4mp.mp3";
var gR = "./fx-snow-qm0x6a6g.mp3";
var wR = "./fx-switch-dv3s38nv.mp3";
var cR = "./fx-thruster-pyvqetq1.mp3";
var eR = "./music-hamlet-hmhfxj7q.mp3";
var vR = "./music-lament-ezjzry7h.mp3";
var lR = "./music-loopcity-qgvf68dp.mp3";
var yR = "./music-quaint-ge566zsb.mp3";
var oR = "./music-spring-h2xrp78z.mp3";
var nR = "./music-street-tn6zn3er.mp3";
var sR = {
        quaint: yR,
        hamlet: eR,
        spring: oR,
        street: nR,
        loopcity: lR,
        lament: vR,
        birds: kR,
        crickets: aR,
        forest: YR,
        wind: FR,
        rain: XR,
        thunder: VR,
        city: ZR,
        engine: WR
    },
    XJ = {
        alarm: CR,
        alien: KR,
        bell1: fR,
        bell2: hR,
        click: bR,
        complete: iR,
        computer: OR,
        explosion: GR,
        ghost: mR,
        ghoul: _R,
        hurt: uR,
        laser: NR,
        lowboom: zR,
        machineOff: qR,
        mining: pR,
        snow: gR,
        switch: wR,
        thruster: cR
    },
    xR = ["spring", "quaint", "hamlet", "street", "loopcity", "lament"],
    VJ = {
        calm: {
            music: "spring",
            musicLevel: 0.28,
            mix: {
                forest: 0.35
            }
        },
        festival: {
            music: "street",
            musicLevel: 0.26,
            mix: {
                forest: 0.3
            }
        },
        lottery: {
            music: "spring",
            musicLevel: 0.26,
            mix: {
                forest: 0.3
            }
        },
        goldrush: {
            music: "loopcity",
            musicLevel: 0.24,
            mix: {
                forest: 0.2
            }
        },
        heatwave: {
            music: "quaint",
            musicLevel: 0.12,
            mix: {
                crickets: 0.25,
                forest: 0.15
            }
        },
        winter: {
            music: "hamlet",
            musicLevel: 0.16,
            mix: {
                wind: 0.3
            }
        },
        flu: {
            music: "hamlet",
            musicLevel: 0.08,
            mix: {
                forest: 0.2
            }
        },
        shortage: {
            music: "hamlet",
            musicLevel: 0.1,
            mix: {
                forest: 0.25
            }
        },
        blackout: {
            musicLevel: 0,
            mix: {
                forest: 0.2
            }
        },
        storm: {
            musicLevel: 0,
            mix: {
                rain: 0.5,
                thunder: 0.4,
                wind: 0.35
            }
        },
        aliens: {
            musicLevel: 0,
            mix: {
                engine: 0.35,
                wind: 0.1
            }
        },
        zombies: {
            musicLevel: 0,
            mix: {
                wind: 0.2,
                forest: 0.1
            }
        },
        meteors: {
            musicLevel: 0,
            mix: {
                wind: 0.25
            }
        },
        robots: {
            musicLevel: 0,
            mix: {
                city: 0.35
            }
        },
        volcano: {
            musicLevel: 0,
            mix: {
                wind: 0.35
            }
        }
    };
class BP {
    ctx;
    master;
    buffers = new Map;
    loops = new Map;
    event = "calm";
    day = 1;
    fallen = !1;
    timers = [];
    ready = !1;
    muted = !1;
    get running() {
        return !!this.ctx
    }
    async start() {
        if (this.ctx) return;
        let U = new AudioContext;
        this.ctx = U, this.master = U.createGain(), this.master.gain.value = this.muted ? 0 : 0.8, this.master.connect(U.destination);
        let d = async (D, $) => {
            let H = await (await fetch($)).arrayBuffer();
            this.buffers.set(D, await U.decodeAudioData(H))
        };
        await Promise.all([...Object.entries(sR).filter(([name])=>!xR.includes(name)), ...Object.entries(XJ)].map(([D, $]) => d(D, $).catch(() => {
            return
        })));
        for (let D of Object.keys(sR).filter(name=>!xR.includes(name))) {
            let $ = this.buffers.get(D);
            if (!$) continue;
            let H = U.createBufferSource();
            H.buffer = $, H.loop = !0;
            let P = U.createGain();
            P.gain.value = 0, H.connect(P).connect(this.master), H.start(), this.loops.set(D, P)
        }
        this.ready = !0, this.timers.push(window.setInterval(() => this.signature(), 1100)), this.apply()
    }
    setMuted(U) {
        if (this.muted = U, this.master && this.ctx) this.master.gain.setTargetAtTime(U ? 0 : 0.8, this.ctx.currentTime, 0.2)
    }
    setEvent(U) {
        let d = this.event;
        if (this.event = U, !this.ready) return;
        if (U === "blackout" && d !== "blackout") this.shot("machineOff", 0.5);
        if (U === "aliens" && d !== "aliens") this.shot("alien", 0.6);
        this.apply()
    }
    setDay(U) {
        let d = this.day;
        if (this.day = U, this.ready && Math.abs(d - U) > 0.02) this.apply()
    }
    hour() {
        this.shot("bell2", 0.35)
    }
    fall() {
        if (this.fallen = !0, this.ready) this.apply();
        this.shot("bell1", 0.4, 0.6)
    }
    chime(U = !1) {
        this.shot(U ? "alarm" : "complete", U ? 0.22 : 0.4)
    }
    ding() {
        if(this.muted)return;
        if(!this.ctx)this.start();
        const c=this.ctx;if(!c||!this.master)return;
        if(c.state==='suspended')c.resume();
        const at=c.currentTime;
        for(const [frequency,volume]of [[1108,.065],[1662,.018]]){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+.65);o.connect(g).connect(this.master);o.start(at);o.stop(at+.67);}
    }
    cashRegister() {
        if(this.muted)return;if(!this.ctx)this.start();const c=this.ctx;if(!c||!this.master)return;
        if(c.state==='suspended')c.resume();const at=c.currentTime;
        for(const [offset,frequency,volume]of [[0,440,.035],[.055,660,.035],[.12,1318,.065],[.12,1977,.02]]){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(.0001,at+offset);g.gain.exponentialRampToValueAtTime(volume,at+offset+.008);g.gain.exponentialRampToValueAtTime(.0001,at+offset+.48);o.connect(g).connect(this.master);o.start(at+offset);o.stop(at+offset+.5);}
    }
    blip() {
        this.shot("click", 0.5)
    }
    apply() {
        if (this.fallen) {
            let P = {
                lament: 0.32,
                wind: 0.22
            };
            for (let [T, R] of this.loops) this.fade(R, P[T] ?? 0, 4);
            return
        }
        let U = VJ[this.event],
            d = 1 - this.day,
            D = {},
            $ = U.music ?? xR[0];
        for (let P of xR) D[P] = 0;
        if (U.musicLevel > 0) D[$] = U.musicLevel * (0.75 + this.day * 0.25);
        for (let [P, T] of Object.entries(U.mix)) D[P] = T;
        if (!["storm", "aliens", "zombies", "meteors", "robots", "volcano"].includes(this.event)) D.birds = Math.max(D.birds ?? 0, this.event === "winter" ? 0.08 : 0.3) * this.day, D.crickets = Math.max(D.crickets ?? 0, this.event === "winter" ? 0 : 0.3) * d;
        for (let [P, T] of this.loops) this.fade(T, D[P] ?? 0, 2.5)
    }
    fade(U, d, D) {
        if (!this.ctx) return;
        U.gain.setTargetAtTime(d, this.ctx.currentTime, D / 3)
    }
    shot(U, d, D = 1, $) {
        let H = this.buffers.get(U);
        if (!H || !this.ctx || !this.master) return;
        let P = this.ctx,
            T = this.ctx.createBufferSource();
        T.buffer = H, T.playbackRate.value = D;
        let R = this.ctx.createGain();
        if (T.connect(R).connect(this.master), $ && H.duration > $ + 0.5) {
            let J = Math.random() * (H.duration - $ - 0.2),
                Q = P.currentTime;
            R.gain.setValueAtTime(0.0001, Q), R.gain.exponentialRampToValueAtTime(d, Q + 0.25), R.gain.setValueAtTime(d, Q + $ - 0.6), R.gain.exponentialRampToValueAtTime(0.0001, Q + $), T.start(Q, J, $ + 0.05)
        } else R.gain.value = d, T.start()
    }
    signature() {
        if (this.fallen) return;
        let U = Math.random(),
            d = 0.9 + Math.random() * 0.2;
        switch (this.event) {
            case "aliens":
                if (U < 0.18) this.shot("alien", 0.4, d, 3);
                if (U > 0.94) this.shot("laser", 0.25, d);
                break;
            case "zombies":
                if (U < 0.12) this.shot("ghoul", 0.4, 0.8 + Math.random() * 0.3, 2.5);
                if (U > 0.96) this.shot("ghost", 0.3, d, 3);
                break;
            case "robots":
                if (U < 0.3) this.shot("computer", 0.3, d, 1.5);
                if (U > 0.85) this.shot("laser", 0.2, 0.7 + Math.random() * 0.5);
                break;
            case "meteors":
                if (U < 0.22) this.shot("thruster", 0.45, 0.8 + Math.random() * 0.4), this.timers.push(window.setTimeout(() => this.shot(Math.random() < 0.5 ? "explosion" : "lowboom", 0.5, d), 700));
                break;
            case "volcano":
                if (U < 0.2) this.shot("lowboom", 0.55, 0.6 + Math.random() * 0.3);
                break;
            case "goldrush":
                if (U < 0.35) this.shot("mining", 0.3, d);
                break;
            case "winter":
                if (U < 0.12) this.shot("snow", 0.3, d);
                break;
            case "flu":
                if (U < 0.08) this.shot("hurt", 0.25, 0.9 + Math.random() * 0.2);
                break;
            case "festival":
            case "lottery":
                if (U < 0.15) this.shot(Math.random() < 0.5 ? "bell1" : "bell2", 0.3, d);
                break;
            default:
                break
        }
    }
}
var SD = {
        LEFT: 0,
        MIDDLE: 1,
        RIGHT: 2,
        ROTATE: 0,
        DOLLY: 1,
        PAN: 2
    },
    JD = {
        ROTATE: 0,
        PAN: 1,
        DOLLY_PAN: 2,
        DOLLY_ROTATE: 3
    };
var $4 = 2;
var tP = 2;
var X0 = 2;
var H4 = 4;
var V0 = "srgb";
class nD {
    addEventListener(U, d) {
        if (this._listeners === void 0) this._listeners = {};
        let D = this._listeners;
        if (D[U] === void 0) D[U] = [];
        if (D[U].indexOf(d) === -1) D[U].push(d)
    }
    hasEventListener(U, d) {
        if (this._listeners === void 0) return !1;
        let D = this._listeners;
        return D[U] !== void 0 && D[U].indexOf(d) !== -1
    }
    removeEventListener(U, d) {
        if (this._listeners === void 0) return;
        let $ = this._listeners[U];
        if ($ !== void 0) {
            let H = $.indexOf(d);
            if (H !== -1) $.splice(H, 1)
        }
    }
    dispatchEvent(U) {
        if (this._listeners === void 0) return;
        let D = this._listeners[U.type];
        if (D !== void 0) {
            U.target = this;
            let $ = D.slice(0);
            for (let H = 0, P = $.length; H < P; H++) $[H].call(this, U);
            U.target = null
        }
    }
}
var Gd = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"],
    rR = 1234567,
    B0 = Math.PI / 180,
    k0 = 180 / Math.PI;

function kD() {
    let U = Math.random() * 4294967295 | 0,
        d = Math.random() * 4294967295 | 0,
        D = Math.random() * 4294967295 | 0,
        $ = Math.random() * 4294967295 | 0;
    return (Gd[U & 255] + Gd[U >> 8 & 255] + Gd[U >> 16 & 255] + Gd[U >> 24 & 255] + "-" + Gd[d & 255] + Gd[d >> 8 & 255] + "-" + Gd[d >> 16 & 15 | 64] + Gd[d >> 24 & 255] + "-" + Gd[D & 63 | 128] + Gd[D >> 8 & 255] + "-" + Gd[D >> 16 & 255] + Gd[D >> 24 & 255] + Gd[$ & 255] + Gd[$ >> 8 & 255] + Gd[$ >> 16 & 255] + Gd[$ >> 24 & 255]).toLowerCase()
}

function bd(U, d, D) {
    return Math.max(d, Math.min(D, U))
}

function UT(U, d) {
    return (U % d + d) % d
}

function FJ(U, d, D, $, H) {
    return $ + (U - d) * (H - $) / (D - d)
}

function CJ(U, d, D) {
    if (U !== d) return (D - U) / (d - U);
    else return 0
}

function L0(U, d, D) {
    return (1 - D) * U + D * d
}

function KJ(U, d, D, $) {
    return L0(U, d, 1 - Math.exp(-D * $))
}

function fJ(U, d = 1) {
    return d - Math.abs(UT(U, d * 2) - d)
}

function hJ(U, d, D) {
    if (U <= d) return 0;
    if (U >= D) return 1;
    return U = (U - d) / (D - d), U * U * (3 - 2 * U)
}

function bJ(U, d, D) {
    if (U <= d) return 0;
    if (U >= D) return 1;
    return U = (U - d) / (D - d), U * U * U * (U * (U * 6 - 15) + 10)
}

function iJ(U, d) {
    return U + Math.floor(Math.random() * (d - U + 1))
}

function OJ(U, d) {
    return U + Math.random() * (d - U)
}

function WJ(U) {
    return U * (0.5 - Math.random())
}

function GJ(U) {
    if (U !== void 0) rR = U;
    let d = rR += 1831565813;
    return d = Math.imul(d ^ d >>> 15, d | 1), d ^= d + Math.imul(d ^ d >>> 7, d | 61), ((d ^ d >>> 14) >>> 0) / 4294967296
}

function mJ(U) {
    return U * B0
}

function _J(U) {
    return U * k0
}

function uJ(U) {
    return (U & U - 1) === 0 && U !== 0
}

function NJ(U) {
    return Math.pow(2, Math.ceil(Math.log(U) / Math.LN2))
}

function zJ(U) {
    return Math.pow(2, Math.floor(Math.log(U) / Math.LN2))
}

function qJ(U, d, D, $, H) {
    let {
        cos: P,
        sin: T
    } = Math, R = P(D / 2), J = T(D / 2), Q = P((d + $) / 2), M = T((d + $) / 2), S = P((d - $) / 2), B = T((d - $) / 2), L = P(($ - d) / 2), E = T(($ - d) / 2);
    switch (H) {
        case "XYX":
            U.set(R * M, J * S, J * B, R * Q);
            break;
        case "YZY":
            U.set(J * B, R * M, J * S, R * Q);
            break;
        case "ZXZ":
            U.set(J * S, J * B, R * M, R * Q);
            break;
        case "XZX":
            U.set(R * M, J * E, J * L, R * Q);
            break;
        case "YXY":
            U.set(J * L, R * M, J * E, R * Q);
            break;
        case "ZYZ":
            U.set(J * E, J * L, R * M, R * Q);
            break;
        default:
            console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + H)
    }
}

function RD(U, d) {
    switch (d.constructor) {
        case Float32Array:
            return U;
        case Uint32Array:
            return U / 4294967295;
        case Uint16Array:
            return U / 65535;
        case Uint8Array:
            return U / 255;
        case Int32Array:
            return Math.max(U / 2147483647, -1);
        case Int16Array:
            return Math.max(U / 32767, -1);
        case Int8Array:
            return Math.max(U / 127, -1);
        default:
            throw Error("Invalid component type.")
    }
}

function Qd(U, d) {
    switch (d.constructor) {
        case Float32Array:
            return U;
        case Uint32Array:
            return Math.round(U * 4294967295);
        case Uint16Array:
            return Math.round(U * 65535);
        case Uint8Array:
            return Math.round(U * 255);
        case Int32Array:
            return Math.round(U * 2147483647);
        case Int16Array:
            return Math.round(U * 32767);
        case Int8Array:
            return Math.round(U * 127);
        default:
            throw Error("Invalid component type.")
    }
}
var P4 = {
    DEG2RAD: B0,
    RAD2DEG: k0,
    generateUUID: kD,
    clamp: bd,
    euclideanModulo: UT,
    mapLinear: FJ,
    inverseLerp: CJ,
    lerp: L0,
    damp: KJ,
    pingpong: fJ,
    smoothstep: hJ,
    smootherstep: bJ,
    randInt: iJ,
    randFloat: OJ,
    randFloatSpread: WJ,
    seededRandom: GJ,
    degToRad: mJ,
    radToDeg: _J,
    isPowerOfTwo: uJ,
    ceilPowerOfTwo: NJ,
    floorPowerOfTwo: zJ,
    setQuaternionFromProperEuler: qJ,
    normalize: Qd,
    denormalize: RD
};
class dU {
    constructor(U = 0, d = 0) {
        dU.prototype.isVector2 = !0, this.x = U, this.y = d
    }
    get width() {
        return this.x
    }
    set width(U) {
        this.x = U
    }
    get height() {
        return this.y
    }
    set height(U) {
        this.y = U
    }
    set(U, d) {
        return this.x = U, this.y = d, this
    }
    setScalar(U) {
        return this.x = U, this.y = U, this
    }
    setX(U) {
        return this.x = U, this
    }
    setY(U) {
        return this.y = U, this
    }
    setComponent(U, d) {
        switch (U) {
            case 0:
                this.x = d;
                break;
            case 1:
                this.y = d;
                break;
            default:
                throw Error("index is out of range: " + U)
        }
        return this
    }
    getComponent(U) {
        switch (U) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            default:
                throw Error("index is out of range: " + U)
        }
    }
    clone() {
        return new this.constructor(this.x, this.y)
    }
    copy(U) {
        return this.x = U.x, this.y = U.y, this
    }
    add(U) {
        return this.x += U.x, this.y += U.y, this
    }
    addScalar(U) {
        return this.x += U, this.y += U, this
    }
    addVectors(U, d) {
        return this.x = U.x + d.x, this.y = U.y + d.y, this
    }
    addScaledVector(U, d) {
        return this.x += U.x * d, this.y += U.y * d, this
    }
    sub(U) {
        return this.x -= U.x, this.y -= U.y, this
    }
    subScalar(U) {
        return this.x -= U, this.y -= U, this
    }
    subVectors(U, d) {
        return this.x = U.x - d.x, this.y = U.y - d.y, this
    }
    multiply(U) {
        return this.x *= U.x, this.y *= U.y, this
    }
    multiplyScalar(U) {
        return this.x *= U, this.y *= U, this
    }
    divide(U) {
        return this.x /= U.x, this.y /= U.y, this
    }
    divideScalar(U) {
        return this.multiplyScalar(1 / U)
    }
    applyMatrix3(U) {
        let d = this.x,
            D = this.y,
            $ = U.elements;
        return this.x = $[0] * d + $[3] * D + $[6], this.y = $[1] * d + $[4] * D + $[7], this
    }
    min(U) {
        return this.x = Math.min(this.x, U.x), this.y = Math.min(this.y, U.y), this
    }
    max(U) {
        return this.x = Math.max(this.x, U.x), this.y = Math.max(this.y, U.y), this
    }
    clamp(U, d) {
        return this.x = Math.max(U.x, Math.min(d.x, this.x)), this.y = Math.max(U.y, Math.min(d.y, this.y)), this
    }
    clampScalar(U, d) {
        return this.x = Math.max(U, Math.min(d, this.x)), this.y = Math.max(U, Math.min(d, this.y)), this
    }
    clampLength(U, d) {
        let D = this.length();
        return this.divideScalar(D || 1).multiplyScalar(Math.max(U, Math.min(d, D)))
    }
    floor() {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this
    }
    ceil() {
        return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this
    }
    round() {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this
    }
    roundToZero() {
        return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this
    }
    negate() {
        return this.x = -this.x, this.y = -this.y, this
    }
    dot(U) {
        return this.x * U.x + this.y * U.y
    }
    cross(U) {
        return this.x * U.y - this.y * U.x
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y)
    }
    normalize() {
        return this.divideScalar(this.length() || 1)
    }
    angle() {
        return Math.atan2(-this.y, -this.x) + Math.PI
    }
    angleTo(U) {
        let d = Math.sqrt(this.lengthSq() * U.lengthSq());
        if (d === 0) return Math.PI / 2;
        let D = this.dot(U) / d;
        return Math.acos(bd(D, -1, 1))
    }
    distanceTo(U) {
        return Math.sqrt(this.distanceToSquared(U))
    }
    distanceToSquared(U) {
        let d = this.x - U.x,
            D = this.y - U.y;
        return d * d + D * D
    }
    manhattanDistanceTo(U) {
        return Math.abs(this.x - U.x) + Math.abs(this.y - U.y)
    }
    setLength(U) {
        return this.normalize().multiplyScalar(U)
    }
    lerp(U, d) {
        return this.x += (U.x - this.x) * d, this.y += (U.y - this.y) * d, this
    }
    lerpVectors(U, d, D) {
        return this.x = U.x + (d.x - U.x) * D, this.y = U.y + (d.y - U.y) * D, this
    }
    equals(U) {
        return U.x === this.x && U.y === this.y
    }
    fromArray(U, d = 0) {
        return this.x = U[d], this.y = U[d + 1], this
    }
    toArray(U = [], d = 0) {
        return U[d] = this.x, U[d + 1] = this.y, U
    }
    fromBufferAttribute(U, d) {
        return this.x = U.getX(d), this.y = U.getY(d), this
    }
    rotateAround(U, d) {
        let D = Math.cos(d),
            $ = Math.sin(d),
            H = this.x - U.x,
            P = this.y - U.y;
        return this.x = H * D - P * $ + U.x, this.y = H * $ + P * D + U.y, this
    }
    random() {
        return this.x = Math.random(), this.y = Math.random(), this
    }*[Symbol.iterator]() {
        yield this.x, yield this.y
    }
}
class vU {
    constructor(U, d, D, $, H, P, T, R, J) {
        if (vU.prototype.isMatrix3 = !0, this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1], U !== void 0) this.set(U, d, D, $, H, P, T, R, J)
    }
    set(U, d, D, $, H, P, T, R, J) {
        let Q = this.elements;
        return Q[0] = U, Q[1] = $, Q[2] = T, Q[3] = d, Q[4] = H, Q[5] = R, Q[6] = D, Q[7] = P, Q[8] = J, this
    }
    identity() {
        return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this
    }
    copy(U) {
        let d = this.elements,
            D = U.elements;
        return d[0] = D[0], d[1] = D[1], d[2] = D[2], d[3] = D[3], d[4] = D[4], d[5] = D[5], d[6] = D[6], d[7] = D[7], d[8] = D[8], this
    }
    extractBasis(U, d, D) {
        return U.setFromMatrix3Column(this, 0), d.setFromMatrix3Column(this, 1), D.setFromMatrix3Column(this, 2), this
    }
    setFromMatrix4(U) {
        let d = U.elements;
        return this.set(d[0], d[4], d[8], d[1], d[5], d[9], d[2], d[6], d[10]), this
    }
    multiply(U) {
        return this.multiplyMatrices(this, U)
    }
    premultiply(U) {
        return this.multiplyMatrices(U, this)
    }
    multiplyMatrices(U, d) {
        let D = U.elements,
            $ = d.elements,
            H = this.elements,
            P = D[0],
            T = D[3],
            R = D[6],
            J = D[1],
            Q = D[4],
            M = D[7],
            S = D[2],
            B = D[5],
            L = D[8],
            E = $[0],
            k = $[3],
            A = $[6],
            j = $[1],
            C = $[4],
            I = $[7],
            Z = $[2],
            a = $[5],
            Y = $[8];
        return H[0] = P * E + T * j + R * Z, H[3] = P * k + T * C + R * a, H[6] = P * A + T * I + R * Y, H[1] = J * E + Q * j + M * Z, H[4] = J * k + Q * C + M * a, H[7] = J * A + Q * I + M * Y, H[2] = S * E + B * j + L * Z, H[5] = S * k + B * C + L * a, H[8] = S * A + B * I + L * Y, this
    }
    multiplyScalar(U) {
        let d = this.elements;
        return d[0] *= U, d[3] *= U, d[6] *= U, d[1] *= U, d[4] *= U, d[7] *= U, d[2] *= U, d[5] *= U, d[8] *= U, this
    }
    determinant() {
        let U = this.elements,
            d = U[0],
            D = U[1],
            $ = U[2],
            H = U[3],
            P = U[4],
            T = U[5],
            R = U[6],
            J = U[7],
            Q = U[8];
        return d * P * Q - d * T * J - D * H * Q + D * T * R + $ * H * J - $ * P * R
    }
    invert() {
        let U = this.elements,
            d = U[0],
            D = U[1],
            $ = U[2],
            H = U[3],
            P = U[4],
            T = U[5],
            R = U[6],
            J = U[7],
            Q = U[8],
            M = Q * P - T * J,
            S = T * R - Q * H,
            B = J * H - P * R,
            L = d * M + D * S + $ * B;
        if (L === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
        let E = 1 / L;
        return U[0] = M * E, U[1] = ($ * J - Q * D) * E, U[2] = (T * D - $ * P) * E, U[3] = S * E, U[4] = (Q * d - $ * R) * E, U[5] = ($ * H - T * d) * E, U[6] = B * E, U[7] = (D * R - J * d) * E, U[8] = (P * d - D * H) * E, this
    }
    transpose() {
        let U, d = this.elements;
        return U = d[1], d[1] = d[3], d[3] = U, U = d[2], d[2] = d[6], d[6] = U, U = d[5], d[5] = d[7], d[7] = U, this
    }
    getNormalMatrix(U) {
        return this.setFromMatrix4(U).invert().transpose()
    }
    transposeIntoArray(U) {
        let d = this.elements;
        return U[0] = d[0], U[1] = d[3], U[2] = d[6], U[3] = d[1], U[4] = d[4], U[5] = d[7], U[6] = d[2], U[7] = d[5], U[8] = d[8], this
    }
    setUvTransform(U, d, D, $, H, P, T) {
        let R = Math.cos(H),
            J = Math.sin(H);
        return this.set(D * R, D * J, -D * (R * P + J * T) + P + U, -$ * J, $ * R, -$ * (-J * P + R * T) + T + d, 0, 0, 1), this
    }
    scale(U, d) {
        return this.premultiply(LP.makeScale(U, d)), this
    }
    rotate(U) {
        return this.premultiply(LP.makeRotation(-U)), this
    }
    translate(U, d) {
        return this.premultiply(LP.makeTranslation(U, d)), this
    }
    makeTranslation(U, d) {
        if (U.isVector2) this.set(1, 0, U.x, 0, 1, U.y, 0, 0, 1);
        else this.set(1, 0, U, 0, 1, d, 0, 0, 1);
        return this
    }
    makeRotation(U) {
        let d = Math.cos(U),
            D = Math.sin(U);
        return this.set(d, -D, 0, D, d, 0, 0, 0, 1), this
    }
    makeScale(U, d) {
        return this.set(U, 0, 0, 0, d, 0, 0, 0, 1), this
    }
    equals(U) {
        let d = this.elements,
            D = U.elements;
        for (let $ = 0; $ < 9; $++)
            if (d[$] !== D[$]) return !1;
        return !0
    }
    fromArray(U, d = 0) {
        for (let D = 0; D < 9; D++) this.elements[D] = U[D + d];
        return this
    }
    toArray(U = [], d = 0) {
        let D = this.elements;
        return U[d] = D[0], U[d + 1] = D[1], U[d + 2] = D[2], U[d + 3] = D[3], U[d + 4] = D[4], U[d + 5] = D[5], U[d + 6] = D[6], U[d + 7] = D[7], U[d + 8] = D[8], U
    }
    clone() {
        return new this.constructor().fromArray(this.elements)
    }
}
var LP = new vU;

function T4(U) {
    for (let d = U.length - 1; d >= 0; --d)
        if (U[d] >= 65535) return !0;
    return !1
}

function CH(U) {
    return document.createElementNS("http://www.w3.org/1999/xhtml", U)
}

function pJ() {
    let U = CH("canvas");
    return U.style.display = "block", U
}
var tR = {};

function J0(U) {
    if (U in tR) return;
    tR[U] = !0, console.warn(U)
}

function gJ(U, d, D) {
    return new Promise(function($, H) {
        function P() {
            switch (U.clientWaitSync(d, U.SYNC_FLUSH_COMMANDS_BIT, 0)) {
                case U.WAIT_FAILED:
                    H();
                    break;
                case U.TIMEOUT_EXPIRED:
                    setTimeout(P, D);
                    break;
                default:
                    $()
            }
        }
        setTimeout(P, D)
    })
}

function wJ(U) {
    let d = U.elements;
    d[2] = 0.5 * d[2] + 0.5 * d[3], d[6] = 0.5 * d[6] + 0.5 * d[7], d[10] = 0.5 * d[10] + 0.5 * d[11], d[14] = 0.5 * d[14] + 0.5 * d[15]
}

function cJ(U) {
    let d = U.elements;
    if (d[11] === -1) d[10] = -d[10] - 1, d[14] = -d[14];
    else d[10] = -d[10], d[14] = -d[14] + 1
}
var dd = {
    enabled: !0,
    workingColorSpace: "srgb-linear",
    spaces: {},
    convert: function(U, d, D) {
        if (this.enabled === !1 || d === D || !d || !D) return U;
        if (this.spaces[d].transfer === "srgb") U.r = mD(U.r), U.g = mD(U.g), U.b = mD(U.b);
        if (this.spaces[d].primaries !== this.spaces[D].primaries) U.applyMatrix3(this.spaces[d].toXYZ), U.applyMatrix3(this.spaces[D].fromXYZ);
        if (this.spaces[D].transfer === "srgb") U.r = N$(U.r), U.g = N$(U.g), U.b = N$(U.b);
        return U
    },
    fromWorkingColorSpace: function(U, d) {
        return this.convert(U, this.workingColorSpace, d)
    },
    toWorkingColorSpace: function(U, d) {
        return this.convert(U, d, this.workingColorSpace)
    },
    getPrimaries: function(U) {
        return this.spaces[U].primaries
    },
    getTransfer: function(U) {
        if (U === "") return "linear";
        return this.spaces[U].transfer
    },
    getLuminanceCoefficients: function(U, d = this.workingColorSpace) {
        return U.fromArray(this.spaces[d].luminanceCoefficients)
    },
    define: function(U) {
        Object.assign(this.spaces, U)
    },
    _getMatrix: function(U, d, D) {
        return U.copy(this.spaces[d].toXYZ).multiply(this.spaces[D].fromXYZ)
    },
    _getDrawingBufferColorSpace: function(U) {
        return this.spaces[U].outputColorSpaceConfig.drawingBufferColorSpace
    },
    _getUnpackColorSpace: function(U = this.workingColorSpace) {
        return this.spaces[U].workingColorSpaceConfig.unpackColorSpace
    }
};

function mD(U) {
    return U < 0.04045 ? U * 0.0773993808 : Math.pow(U * 0.9478672986 + 0.0521327014, 2.4)
}

function N$(U) {
    return U < 0.0031308 ? U * 12.92 : 1.055 * Math.pow(U, 0.41666) - 0.055
}
var UQ = [0.64, 0.33, 0.3, 0.6, 0.15, 0.06],
    dQ = [0.2126, 0.7152, 0.0722],
    DQ = [0.3127, 0.329],
    $Q = new vU().set(0.4123908, 0.3575843, 0.1804808, 0.212639, 0.7151687, 0.0721923, 0.0193308, 0.1191948, 0.9505322),
    HQ = new vU().set(3.2409699, -1.5373832, -0.4986108, -0.9692436, 1.8759675, 0.0415551, 0.0556301, -0.203977, 1.0569715);
dd.define({
    ["srgb-linear"]: {
        primaries: UQ,
        whitePoint: DQ,
        transfer: "linear",
        toXYZ: $Q,
        fromXYZ: HQ,
        luminanceCoefficients: dQ,
        workingColorSpaceConfig: {
            unpackColorSpace: "srgb"
        },
        outputColorSpaceConfig: {
            drawingBufferColorSpace: "srgb"
        }
    },
    ["srgb"]: {
        primaries: UQ,
        whitePoint: DQ,
        transfer: "srgb",
        toXYZ: $Q,
        fromXYZ: HQ,
        luminanceCoefficients: dQ,
        outputColorSpaceConfig: {
            drawingBufferColorSpace: "srgb"
        }
    }
});
var I$;
class R4 {
    static getDataURL(U) {
        if (/^data:/i.test(U.src)) return U.src;
        if (typeof HTMLCanvasElement > "u") return U.src;
        let d;
        if (U instanceof HTMLCanvasElement) d = U;
        else {
            if (I$ === void 0) I$ = CH("canvas");
            I$.width = U.width, I$.height = U.height;
            let D = I$.getContext("2d");
            if (U instanceof ImageData) D.putImageData(U, 0, 0);
            else D.drawImage(U, 0, 0, U.width, U.height);
            d = I$
        }
        if (d.width > 2048 || d.height > 2048) return console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", U), d.toDataURL("image/jpeg", 0.6);
        else return d.toDataURL("image/png")
    }
    static sRGBToLinear(U) {
        if (typeof HTMLImageElement < "u" && U instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && U instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && U instanceof ImageBitmap) {
            let d = CH("canvas");
            d.width = U.width, d.height = U.height;
            let D = d.getContext("2d");
            D.drawImage(U, 0, 0, U.width, U.height);
            let $ = D.getImageData(0, 0, U.width, U.height),
                H = $.data;
            for (let P = 0; P < H.length; P++) H[P] = mD(H[P] / 255) * 255;
            return D.putImageData($, 0, 0), d
        } else if (U.data) {
            let d = U.data.slice(0);
            for (let D = 0; D < d.length; D++)
                if (d instanceof Uint8Array || d instanceof Uint8ClampedArray) d[D] = Math.floor(mD(d[D] / 255) * 255);
                else d[D] = mD(d[D]);
            return {
                data: d,
                width: U.width,
                height: U.height
            }
        } else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), U
    }
}
var eJ = 0;
class dT {
    constructor(U = null) {
        this.isSource = !0, Object.defineProperty(this, "id", {
            value: eJ++
        }), this.uuid = kD(), this.data = U, this.dataReady = !0, this.version = 0
    }
    set needsUpdate(U) {
        if (U === !0) this.version++
    }
    toJSON(U) {
        let d = U === void 0 || typeof U === "string";
        if (!d && U.images[this.uuid] !== void 0) return U.images[this.uuid];
        let D = {
                uuid: this.uuid,
                url: ""
            },
            $ = this.data;
        if ($ !== null) {
            let H;
            if (Array.isArray($)) {
                H = [];
                for (let P = 0, T = $.length; P < T; P++)
                    if ($[P].isDataTexture) H.push(AP($[P].image));
                    else H.push(AP($[P]))
            } else H = AP($);
            D.url = H
        }
        if (!d) U.images[this.uuid] = D;
        return D
    }
}

function AP(U) {
    if (typeof HTMLImageElement < "u" && U instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && U instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && U instanceof ImageBitmap) return R4.getDataURL(U);
    else if (U.data) return {
        data: Array.from(U.data),
        width: U.width,
        height: U.height,
        type: U.data.constructor.name
    };
    else return console.warn("THREE.Texture: Unable to serialize Texture."), {}
}
var vJ = 0;
class _d extends nD {
    constructor(U = _d.DEFAULT_IMAGE, d = _d.DEFAULT_MAPPING, D = 1001, $ = 1001, H = 1006, P = 1008, T = 1023, R = 1009, J = _d.DEFAULT_ANISOTROPY, Q = "") {
        super();
        this.isTexture = !0, Object.defineProperty(this, "id", {
            value: vJ++
        }), this.uuid = kD(), this.name = "", this.source = new dT(U), this.mipmaps = [], this.mapping = d, this.channel = 0, this.wrapS = D, this.wrapT = $, this.magFilter = H, this.minFilter = P, this.anisotropy = J, this.format = T, this.internalFormat = null, this.type = R, this.offset = new dU(0, 0), this.repeat = new dU(1, 1), this.center = new dU(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new vU, this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = Q, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.pmremVersion = 0
    }
    get image() {
        return this.source.data
    }
    set image(U = null) {
        this.source.data = U
    }
    updateMatrix() {
        this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y)
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(U) {
        return this.name = U.name, this.source = U.source, this.mipmaps = U.mipmaps.slice(0), this.mapping = U.mapping, this.channel = U.channel, this.wrapS = U.wrapS, this.wrapT = U.wrapT, this.magFilter = U.magFilter, this.minFilter = U.minFilter, this.anisotropy = U.anisotropy, this.format = U.format, this.internalFormat = U.internalFormat, this.type = U.type, this.offset.copy(U.offset), this.repeat.copy(U.repeat), this.center.copy(U.center), this.rotation = U.rotation, this.matrixAutoUpdate = U.matrixAutoUpdate, this.matrix.copy(U.matrix), this.generateMipmaps = U.generateMipmaps, this.premultiplyAlpha = U.premultiplyAlpha, this.flipY = U.flipY, this.unpackAlignment = U.unpackAlignment, this.colorSpace = U.colorSpace, this.userData = JSON.parse(JSON.stringify(U.userData)), this.needsUpdate = !0, this
    }
    toJSON(U) {
        let d = U === void 0 || typeof U === "string";
        if (!d && U.textures[this.uuid] !== void 0) return U.textures[this.uuid];
        let D = {
            metadata: {
                version: 4.6,
                type: "Texture",
                generator: "Texture.toJSON"
            },
            uuid: this.uuid,
            name: this.name,
            image: this.source.toJSON(U).uuid,
            mapping: this.mapping,
            channel: this.channel,
            repeat: [this.repeat.x, this.repeat.y],
            offset: [this.offset.x, this.offset.y],
            center: [this.center.x, this.center.y],
            rotation: this.rotation,
            wrap: [this.wrapS, this.wrapT],
            format: this.format,
            internalFormat: this.internalFormat,
            type: this.type,
            colorSpace: this.colorSpace,
            minFilter: this.minFilter,
            magFilter: this.magFilter,
            anisotropy: this.anisotropy,
            flipY: this.flipY,
            generateMipmaps: this.generateMipmaps,
            premultiplyAlpha: this.premultiplyAlpha,
            unpackAlignment: this.unpackAlignment
        };
        if (Object.keys(this.userData).length > 0) D.userData = this.userData;
        if (!d) U.textures[this.uuid] = D;
        return D
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
    transformUv(U) {
        if (this.mapping !== 300) return U;
        if (U.applyMatrix3(this.matrix), U.x < 0 || U.x > 1) switch (this.wrapS) {
            case 1000:
                U.x = U.x - Math.floor(U.x);
                break;
            case 1001:
                U.x = U.x < 0 ? 0 : 1;
                break;
            case 1002:
                if (Math.abs(Math.floor(U.x) % 2) === 1) U.x = Math.ceil(U.x) - U.x;
                else U.x = U.x - Math.floor(U.x);
                break
        }
        if (U.y < 0 || U.y > 1) switch (this.wrapT) {
            case 1000:
                U.y = U.y - Math.floor(U.y);
                break;
            case 1001:
                U.y = U.y < 0 ? 0 : 1;
                break;
            case 1002:
                if (Math.abs(Math.floor(U.y) % 2) === 1) U.y = Math.ceil(U.y) - U.y;
                else U.y = U.y - Math.floor(U.y);
                break
        }
        if (this.flipY) U.y = 1 - U.y;
        return U
    }
    set needsUpdate(U) {
        if (U === !0) this.version++, this.source.needsUpdate = !0
    }
    set needsPMREMUpdate(U) {
        if (U === !0) this.pmremVersion++
    }
}
_d.DEFAULT_IMAGE = null;
_d.DEFAULT_MAPPING = 300;
_d.DEFAULT_ANISOTROPY = 1;
class ad {
    constructor(U = 0, d = 0, D = 0, $ = 1) {
        ad.prototype.isVector4 = !0, this.x = U, this.y = d, this.z = D, this.w = $
    }
    get width() {
        return this.z
    }
    set width(U) {
        this.z = U
    }
    get height() {
        return this.w
    }
    set height(U) {
        this.w = U
    }
    set(U, d, D, $) {
        return this.x = U, this.y = d, this.z = D, this.w = $, this
    }
    setScalar(U) {
        return this.x = U, this.y = U, this.z = U, this.w = U, this
    }
    setX(U) {
        return this.x = U, this
    }
    setY(U) {
        return this.y = U, this
    }
    setZ(U) {
        return this.z = U, this
    }
    setW(U) {
        return this.w = U, this
    }
    setComponent(U, d) {
        switch (U) {
            case 0:
                this.x = d;
                break;
            case 1:
                this.y = d;
                break;
            case 2:
                this.z = d;
                break;
            case 3:
                this.w = d;
                break;
            default:
                throw Error("index is out of range: " + U)
        }
        return this
    }
    getComponent(U) {
        switch (U) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            case 2:
                return this.z;
            case 3:
                return this.w;
            default:
                throw Error("index is out of range: " + U)
        }
    }
    clone() {
        return new this.constructor(this.x, this.y, this.z, this.w)
    }
    copy(U) {
        return this.x = U.x, this.y = U.y, this.z = U.z, this.w = U.w !== void 0 ? U.w : 1, this
    }
    add(U) {
        return this.x += U.x, this.y += U.y, this.z += U.z, this.w += U.w, this
    }
    addScalar(U) {
        return this.x += U, this.y += U, this.z += U, this.w += U, this
    }
    addVectors(U, d) {
        return this.x = U.x + d.x, this.y = U.y + d.y, this.z = U.z + d.z, this.w = U.w + d.w, this
    }
    addScaledVector(U, d) {
        return this.x += U.x * d, this.y += U.y * d, this.z += U.z * d, this.w += U.w * d, this
    }
    sub(U) {
        return this.x -= U.x, this.y -= U.y, this.z -= U.z, this.w -= U.w, this
    }
    subScalar(U) {
        return this.x -= U, this.y -= U, this.z -= U, this.w -= U, this
    }
    subVectors(U, d) {
        return this.x = U.x - d.x, this.y = U.y - d.y, this.z = U.z - d.z, this.w = U.w - d.w, this
    }
    multiply(U) {
        return this.x *= U.x, this.y *= U.y, this.z *= U.z, this.w *= U.w, this
    }
    multiplyScalar(U) {
        return this.x *= U, this.y *= U, this.z *= U, this.w *= U, this
    }
    applyMatrix4(U) {
        let d = this.x,
            D = this.y,
            $ = this.z,
            H = this.w,
            P = U.elements;
        return this.x = P[0] * d + P[4] * D + P[8] * $ + P[12] * H, this.y = P[1] * d + P[5] * D + P[9] * $ + P[13] * H, this.z = P[2] * d + P[6] * D + P[10] * $ + P[14] * H, this.w = P[3] * d + P[7] * D + P[11] * $ + P[15] * H, this
    }
    divide(U) {
        return this.x /= U.x, this.y /= U.y, this.z /= U.z, this.w /= U.w, this
    }
    divideScalar(U) {
        return this.multiplyScalar(1 / U)
    }
    setAxisAngleFromQuaternion(U) {
        this.w = 2 * Math.acos(U.w);
        let d = Math.sqrt(1 - U.w * U.w);
        if (d < 0.0001) this.x = 1, this.y = 0, this.z = 0;
        else this.x = U.x / d, this.y = U.y / d, this.z = U.z / d;
        return this
    }
    setAxisAngleFromRotationMatrix(U) {
        let d, D, $, H, P = 0.01,
            T = 0.1,
            R = U.elements,
            J = R[0],
            Q = R[4],
            M = R[8],
            S = R[1],
            B = R[5],
            L = R[9],
            E = R[2],
            k = R[6],
            A = R[10];
        if (Math.abs(Q - S) < 0.01 && Math.abs(M - E) < 0.01 && Math.abs(L - k) < 0.01) {
            if (Math.abs(Q + S) < 0.1 && Math.abs(M + E) < 0.1 && Math.abs(L + k) < 0.1 && Math.abs(J + B + A - 3) < 0.1) return this.set(1, 0, 0, 0), this;
            d = Math.PI;
            let C = (J + 1) / 2,
                I = (B + 1) / 2,
                Z = (A + 1) / 2,
                a = (Q + S) / 4,
                Y = (M + E) / 4,
                f = (L + k) / 4;
            if (C > I && C > Z)
                if (C < 0.01) D = 0, $ = 0.707106781, H = 0.707106781;
                else D = Math.sqrt(C), $ = a / D, H = Y / D;
            else if (I > Z)
                if (I < 0.01) D = 0.707106781, $ = 0, H = 0.707106781;
                else $ = Math.sqrt(I), D = a / $, H = f / $;
            else if (Z < 0.01) D = 0.707106781, $ = 0.707106781, H = 0;
            else H = Math.sqrt(Z), D = Y / H, $ = f / H;
            return this.set(D, $, H, d), this
        }
        let j = Math.sqrt((k - L) * (k - L) + (M - E) * (M - E) + (S - Q) * (S - Q));
        if (Math.abs(j) < 0.001) j = 1;
        return this.x = (k - L) / j, this.y = (M - E) / j, this.z = (S - Q) / j, this.w = Math.acos((J + B + A - 1) / 2), this
    }
    setFromMatrixPosition(U) {
        let d = U.elements;
        return this.x = d[12], this.y = d[13], this.z = d[14], this.w = d[15], this
    }
    min(U) {
        return this.x = Math.min(this.x, U.x), this.y = Math.min(this.y, U.y), this.z = Math.min(this.z, U.z), this.w = Math.min(this.w, U.w), this
    }
    max(U) {
        return this.x = Math.max(this.x, U.x), this.y = Math.max(this.y, U.y), this.z = Math.max(this.z, U.z), this.w = Math.max(this.w, U.w), this
    }
    clamp(U, d) {
        return this.x = Math.max(U.x, Math.min(d.x, this.x)), this.y = Math.max(U.y, Math.min(d.y, this.y)), this.z = Math.max(U.z, Math.min(d.z, this.z)), this.w = Math.max(U.w, Math.min(d.w, this.w)), this
    }
    clampScalar(U, d) {
        return this.x = Math.max(U, Math.min(d, this.x)), this.y = Math.max(U, Math.min(d, this.y)), this.z = Math.max(U, Math.min(d, this.z)), this.w = Math.max(U, Math.min(d, this.w)), this
    }
    clampLength(U, d) {
        let D = this.length();
        return this.divideScalar(D || 1).multiplyScalar(Math.max(U, Math.min(d, D)))
    }
    floor() {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this
    }
    ceil() {
        return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this
    }
    round() {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this
    }
    roundToZero() {
        return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this
    }
    negate() {
        return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this
    }
    dot(U) {
        return this.x * U.x + this.y * U.y + this.z * U.z + this.w * U.w
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
    }
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w)
    }
    normalize() {
        return this.divideScalar(this.length() || 1)
    }
    setLength(U) {
        return this.normalize().multiplyScalar(U)
    }
    lerp(U, d) {
        return this.x += (U.x - this.x) * d, this.y += (U.y - this.y) * d, this.z += (U.z - this.z) * d, this.w += (U.w - this.w) * d, this
    }
    lerpVectors(U, d, D) {
        return this.x = U.x + (d.x - U.x) * D, this.y = U.y + (d.y - U.y) * D, this.z = U.z + (d.z - U.z) * D, this.w = U.w + (d.w - U.w) * D, this
    }
    equals(U) {
        return U.x === this.x && U.y === this.y && U.z === this.z && U.w === this.w
    }
    fromArray(U, d = 0) {
        return this.x = U[d], this.y = U[d + 1], this.z = U[d + 2], this.w = U[d + 3], this
    }
    toArray(U = [], d = 0) {
        return U[d] = this.x, U[d + 1] = this.y, U[d + 2] = this.z, U[d + 3] = this.w, U
    }
    fromBufferAttribute(U, d) {
        return this.x = U.getX(d), this.y = U.getY(d), this.z = U.getZ(d), this.w = U.getW(d), this
    }
    random() {
        return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this
    }*[Symbol.iterator]() {
        yield this.x, yield this.y, yield this.z, yield this.w
    }
}
class Q4 extends nD {
    constructor(U = 1, d = 1, D = {}) {
        super();
        this.isRenderTarget = !0, this.width = U, this.height = d, this.depth = 1, this.scissor = new ad(0, 0, U, d), this.scissorTest = !1, this.viewport = new ad(0, 0, U, d);
        let $ = {
            width: U,
            height: d,
            depth: 1
        };
        D = Object.assign({
            generateMipmaps: !1,
            internalFormat: null,
            minFilter: 1006,
            depthBuffer: !0,
            stencilBuffer: !1,
            resolveDepthBuffer: !0,
            resolveStencilBuffer: !0,
            depthTexture: null,
            samples: 0,
            count: 1
        }, D);
        let H = new _d($, D.mapping, D.wrapS, D.wrapT, D.magFilter, D.minFilter, D.format, D.type, D.anisotropy, D.colorSpace);
        H.flipY = !1, H.generateMipmaps = D.generateMipmaps, H.internalFormat = D.internalFormat, this.textures = [];
        let P = D.count;
        for (let T = 0; T < P; T++) this.textures[T] = H.clone(), this.textures[T].isRenderTargetTexture = !0;
        this.depthBuffer = D.depthBuffer, this.stencilBuffer = D.stencilBuffer, this.resolveDepthBuffer = D.resolveDepthBuffer, this.resolveStencilBuffer = D.resolveStencilBuffer, this.depthTexture = D.depthTexture, this.samples = D.samples
    }
    get texture() {
        return this.textures[0]
    }
    set texture(U) {
        this.textures[0] = U
    }
    setSize(U, d, D = 1) {
        if (this.width !== U || this.height !== d || this.depth !== D) {
            this.width = U, this.height = d, this.depth = D;
            for (let $ = 0, H = this.textures.length; $ < H; $++) this.textures[$].image.width = U, this.textures[$].image.height = d, this.textures[$].image.depth = D;
            this.dispose()
        }
        this.viewport.set(0, 0, U, d), this.scissor.set(0, 0, U, d)
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(U) {
        this.width = U.width, this.height = U.height, this.depth = U.depth, this.scissor.copy(U.scissor), this.scissorTest = U.scissorTest, this.viewport.copy(U.viewport), this.textures.length = 0;
        for (let D = 0, $ = U.textures.length; D < $; D++) this.textures[D] = U.textures[D].clone(), this.textures[D].isRenderTargetTexture = !0;
        let d = Object.assign({}, U.texture.image);
        if (this.texture.source = new dT(d), this.depthBuffer = U.depthBuffer, this.stencilBuffer = U.stencilBuffer, this.resolveDepthBuffer = U.resolveDepthBuffer, this.resolveStencilBuffer = U.resolveStencilBuffer, U.depthTexture !== null) this.depthTexture = U.depthTexture.clone();
        return this.samples = U.samples, this
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
}
class oD extends Q4 {
    constructor(U = 1, d = 1, D = {}) {
        super(U, d, D);
        this.isWebGLRenderTarget = !0
    }
}
class DT extends _d {
    constructor(U = null, d = 1, D = 1, $ = 1) {
        super(null);
        this.isDataArrayTexture = !0, this.image = {
            data: U,
            width: d,
            height: D,
            depth: $
        }, this.magFilter = 1003, this.minFilter = 1003, this.wrapR = 1001, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = new Set
    }
    addLayerUpdate(U) {
        this.layerUpdates.add(U)
    }
    clearLayerUpdates() {
        this.layerUpdates.clear()
    }
}
class S4 extends _d {
    constructor(U = null, d = 1, D = 1, $ = 1) {
        super(null);
        this.isData3DTexture = !0, this.image = {
            data: U,
            width: d,
            height: D,
            depth: $
        }, this.magFilter = 1003, this.minFilter = 1003, this.wrapR = 1001, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1
    }
}
class UD {
    constructor(U = 0, d = 0, D = 0, $ = 1) {
        this.isQuaternion = !0, this._x = U, this._y = d, this._z = D, this._w = $
    }
    static slerpFlat(U, d, D, $, H, P, T) {
        let R = D[$ + 0],
            J = D[$ + 1],
            Q = D[$ + 2],
            M = D[$ + 3],
            S = H[P + 0],
            B = H[P + 1],
            L = H[P + 2],
            E = H[P + 3];
        if (T === 0) {
            U[d + 0] = R, U[d + 1] = J, U[d + 2] = Q, U[d + 3] = M;
            return
        }
        if (T === 1) {
            U[d + 0] = S, U[d + 1] = B, U[d + 2] = L, U[d + 3] = E;
            return
        }
        if (M !== E || R !== S || J !== B || Q !== L) {
            let k = 1 - T,
                A = R * S + J * B + Q * L + M * E,
                j = A >= 0 ? 1 : -1,
                C = 1 - A * A;
            if (C > Number.EPSILON) {
                let Z = Math.sqrt(C),
                    a = Math.atan2(Z, A * j);
                k = Math.sin(k * a) / Z, T = Math.sin(T * a) / Z
            }
            let I = T * j;
            if (R = R * k + S * I, J = J * k + B * I, Q = Q * k + L * I, M = M * k + E * I, k === 1 - T) {
                let Z = 1 / Math.sqrt(R * R + J * J + Q * Q + M * M);
                R *= Z, J *= Z, Q *= Z, M *= Z
            }
        }
        U[d] = R, U[d + 1] = J, U[d + 2] = Q, U[d + 3] = M
    }
    static multiplyQuaternionsFlat(U, d, D, $, H, P) {
        let T = D[$],
            R = D[$ + 1],
            J = D[$ + 2],
            Q = D[$ + 3],
            M = H[P],
            S = H[P + 1],
            B = H[P + 2],
            L = H[P + 3];
        return U[d] = T * L + Q * M + R * B - J * S, U[d + 1] = R * L + Q * S + J * M - T * B, U[d + 2] = J * L + Q * B + T * S - R * M, U[d + 3] = Q * L - T * M - R * S - J * B, U
    }
    get x() {
        return this._x
    }
    set x(U) {
        this._x = U, this._onChangeCallback()
    }
    get y() {
        return this._y
    }
    set y(U) {
        this._y = U, this._onChangeCallback()
    }
    get z() {
        return this._z
    }
    set z(U) {
        this._z = U, this._onChangeCallback()
    }
    get w() {
        return this._w
    }
    set w(U) {
        this._w = U, this._onChangeCallback()
    }
    set(U, d, D, $) {
        return this._x = U, this._y = d, this._z = D, this._w = $, this._onChangeCallback(), this
    }
    clone() {
        return new this.constructor(this._x, this._y, this._z, this._w)
    }
    copy(U) {
        return this._x = U.x, this._y = U.y, this._z = U.z, this._w = U.w, this._onChangeCallback(), this
    }
    setFromEuler(U, d = !0) {
        let {
            _x: D,
            _y: $,
            _z: H,
            _order: P
        } = U, T = Math.cos, R = Math.sin, J = T(D / 2), Q = T($ / 2), M = T(H / 2), S = R(D / 2), B = R($ / 2), L = R(H / 2);
        switch (P) {
            case "XYZ":
                this._x = S * Q * M + J * B * L, this._y = J * B * M - S * Q * L, this._z = J * Q * L + S * B * M, this._w = J * Q * M - S * B * L;
                break;
            case "YXZ":
                this._x = S * Q * M + J * B * L, this._y = J * B * M - S * Q * L, this._z = J * Q * L - S * B * M, this._w = J * Q * M + S * B * L;
                break;
            case "ZXY":
                this._x = S * Q * M - J * B * L, this._y = J * B * M + S * Q * L, this._z = J * Q * L + S * B * M, this._w = J * Q * M - S * B * L;
                break;
            case "ZYX":
                this._x = S * Q * M - J * B * L, this._y = J * B * M + S * Q * L, this._z = J * Q * L - S * B * M, this._w = J * Q * M + S * B * L;
                break;
            case "YZX":
                this._x = S * Q * M + J * B * L, this._y = J * B * M + S * Q * L, this._z = J * Q * L - S * B * M, this._w = J * Q * M - S * B * L;
                break;
            case "XZY":
                this._x = S * Q * M - J * B * L, this._y = J * B * M - S * Q * L, this._z = J * Q * L + S * B * M, this._w = J * Q * M + S * B * L;
                break;
            default:
                console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + P)
        }
        if (d === !0) this._onChangeCallback();
        return this
    }
    setFromAxisAngle(U, d) {
        let D = d / 2,
            $ = Math.sin(D);
        return this._x = U.x * $, this._y = U.y * $, this._z = U.z * $, this._w = Math.cos(D), this._onChangeCallback(), this
    }
    setFromRotationMatrix(U) {
        let d = U.elements,
            D = d[0],
            $ = d[4],
            H = d[8],
            P = d[1],
            T = d[5],
            R = d[9],
            J = d[2],
            Q = d[6],
            M = d[10],
            S = D + T + M;
        if (S > 0) {
            let B = 0.5 / Math.sqrt(S + 1);
            this._w = 0.25 / B, this._x = (Q - R) * B, this._y = (H - J) * B, this._z = (P - $) * B
        } else if (D > T && D > M) {
            let B = 2 * Math.sqrt(1 + D - T - M);
            this._w = (Q - R) / B, this._x = 0.25 * B, this._y = ($ + P) / B, this._z = (H + J) / B
        } else if (T > M) {
            let B = 2 * Math.sqrt(1 + T - D - M);
            this._w = (H - J) / B, this._x = ($ + P) / B, this._y = 0.25 * B, this._z = (R + Q) / B
        } else {
            let B = 2 * Math.sqrt(1 + M - D - T);
            this._w = (P - $) / B, this._x = (H + J) / B, this._y = (R + Q) / B, this._z = 0.25 * B
        }
        return this._onChangeCallback(), this
    }
    setFromUnitVectors(U, d) {
        let D = U.dot(d) + 1;
        if (D < Number.EPSILON)
            if (D = 0, Math.abs(U.x) > Math.abs(U.z)) this._x = -U.y, this._y = U.x, this._z = 0, this._w = D;
            else this._x = 0, this._y = -U.z, this._z = U.y, this._w = D;
        else this._x = U.y * d.z - U.z * d.y, this._y = U.z * d.x - U.x * d.z, this._z = U.x * d.y - U.y * d.x, this._w = D;
        return this.normalize()
    }
    angleTo(U) {
        return 2 * Math.acos(Math.abs(bd(this.dot(U), -1, 1)))
    }
    rotateTowards(U, d) {
        let D = this.angleTo(U);
        if (D === 0) return this;
        let $ = Math.min(1, d / D);
        return this.slerp(U, $), this
    }
    identity() {
        return this.set(0, 0, 0, 1)
    }
    invert() {
        return this.conjugate()
    }
    conjugate() {
        return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this
    }
    dot(U) {
        return this._x * U._x + this._y * U._y + this._z * U._z + this._w * U._w
    }
    lengthSq() {
        return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w
    }
    length() {
        return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w)
    }
    normalize() {
        let U = this.length();
        if (U === 0) this._x = 0, this._y = 0, this._z = 0, this._w = 1;
        else U = 1 / U, this._x = this._x * U, this._y = this._y * U, this._z = this._z * U, this._w = this._w * U;
        return this._onChangeCallback(), this
    }
    multiply(U) {
        return this.multiplyQuaternions(this, U)
    }
    premultiply(U) {
        return this.multiplyQuaternions(U, this)
    }
    multiplyQuaternions(U, d) {
        let {
            _x: D,
            _y: $,
            _z: H,
            _w: P
        } = U, T = d._x, R = d._y, J = d._z, Q = d._w;
        return this._x = D * Q + P * T + $ * J - H * R, this._y = $ * Q + P * R + H * T - D * J, this._z = H * Q + P * J + D * R - $ * T, this._w = P * Q - D * T - $ * R - H * J, this._onChangeCallback(), this
    }
    slerp(U, d) {
        if (d === 0) return this;
        if (d === 1) return this.copy(U);
        let D = this._x,
            $ = this._y,
            H = this._z,
            P = this._w,
            T = P * U._w + D * U._x + $ * U._y + H * U._z;
        if (T < 0) this._w = -U._w, this._x = -U._x, this._y = -U._y, this._z = -U._z, T = -T;
        else this.copy(U);
        if (T >= 1) return this._w = P, this._x = D, this._y = $, this._z = H, this;
        let R = 1 - T * T;
        if (R <= Number.EPSILON) {
            let B = 1 - d;
            return this._w = B * P + d * this._w, this._x = B * D + d * this._x, this._y = B * $ + d * this._y, this._z = B * H + d * this._z, this.normalize(), this
        }
        let J = Math.sqrt(R),
            Q = Math.atan2(J, T),
            M = Math.sin((1 - d) * Q) / J,
            S = Math.sin(d * Q) / J;
        return this._w = P * M + this._w * S, this._x = D * M + this._x * S, this._y = $ * M + this._y * S, this._z = H * M + this._z * S, this._onChangeCallback(), this
    }
    slerpQuaternions(U, d, D) {
        return this.copy(U).slerp(d, D)
    }
    random() {
        let U = 2 * Math.PI * Math.random(),
            d = 2 * Math.PI * Math.random(),
            D = Math.random(),
            $ = Math.sqrt(1 - D),
            H = Math.sqrt(D);
        return this.set($ * Math.sin(U), $ * Math.cos(U), H * Math.sin(d), H * Math.cos(d))
    }
    equals(U) {
        return U._x === this._x && U._y === this._y && U._z === this._z && U._w === this._w
    }
    fromArray(U, d = 0) {
        return this._x = U[d], this._y = U[d + 1], this._z = U[d + 2], this._w = U[d + 3], this._onChangeCallback(), this
    }
    toArray(U = [], d = 0) {
        return U[d] = this._x, U[d + 1] = this._y, U[d + 2] = this._z, U[d + 3] = this._w, U
    }
    fromBufferAttribute(U, d) {
        return this._x = U.getX(d), this._y = U.getY(d), this._z = U.getZ(d), this._w = U.getW(d), this._onChangeCallback(), this
    }
    toJSON() {
        return this.toArray()
    }
    _onChange(U) {
        return this._onChangeCallback = U, this
    }
    _onChangeCallback() {}*[Symbol.iterator]() {
        yield this._x, yield this._y, yield this._z, yield this._w
    }
}
class i {
    constructor(U = 0, d = 0, D = 0) {
        i.prototype.isVector3 = !0, this.x = U, this.y = d, this.z = D
    }
    set(U, d, D) {
        if (D === void 0) D = this.z;
        return this.x = U, this.y = d, this.z = D, this
    }
    setScalar(U) {
        return this.x = U, this.y = U, this.z = U, this
    }
    setX(U) {
        return this.x = U, this
    }
    setY(U) {
        return this.y = U, this
    }
    setZ(U) {
        return this.z = U, this
    }
    setComponent(U, d) {
        switch (U) {
            case 0:
                this.x = d;
                break;
            case 1:
                this.y = d;
                break;
            case 2:
                this.z = d;
                break;
            default:
                throw Error("index is out of range: " + U)
        }
        return this
    }
    getComponent(U) {
        switch (U) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            case 2:
                return this.z;
            default:
                throw Error("index is out of range: " + U)
        }
    }
    clone() {
        return new this.constructor(this.x, this.y, this.z)
    }
    copy(U) {
        return this.x = U.x, this.y = U.y, this.z = U.z, this
    }
    add(U) {
        return this.x += U.x, this.y += U.y, this.z += U.z, this
    }
    addScalar(U) {
        return this.x += U, this.y += U, this.z += U, this
    }
    addVectors(U, d) {
        return this.x = U.x + d.x, this.y = U.y + d.y, this.z = U.z + d.z, this
    }
    addScaledVector(U, d) {
        return this.x += U.x * d, this.y += U.y * d, this.z += U.z * d, this
    }
    sub(U) {
        return this.x -= U.x, this.y -= U.y, this.z -= U.z, this
    }
    subScalar(U) {
        return this.x -= U, this.y -= U, this.z -= U, this
    }
    subVectors(U, d) {
        return this.x = U.x - d.x, this.y = U.y - d.y, this.z = U.z - d.z, this
    }
    multiply(U) {
        return this.x *= U.x, this.y *= U.y, this.z *= U.z, this
    }
    multiplyScalar(U) {
        return this.x *= U, this.y *= U, this.z *= U, this
    }
    multiplyVectors(U, d) {
        return this.x = U.x * d.x, this.y = U.y * d.y, this.z = U.z * d.z, this
    }
    applyEuler(U) {
        return this.applyQuaternion(PQ.setFromEuler(U))
    }
    applyAxisAngle(U, d) {
        return this.applyQuaternion(PQ.setFromAxisAngle(U, d))
    }
    applyMatrix3(U) {
        let d = this.x,
            D = this.y,
            $ = this.z,
            H = U.elements;
        return this.x = H[0] * d + H[3] * D + H[6] * $, this.y = H[1] * d + H[4] * D + H[7] * $, this.z = H[2] * d + H[5] * D + H[8] * $, this
    }
    applyNormalMatrix(U) {
        return this.applyMatrix3(U).normalize()
    }
    applyMatrix4(U) {
        let d = this.x,
            D = this.y,
            $ = this.z,
            H = U.elements,
            P = 1 / (H[3] * d + H[7] * D + H[11] * $ + H[15]);
        return this.x = (H[0] * d + H[4] * D + H[8] * $ + H[12]) * P, this.y = (H[1] * d + H[5] * D + H[9] * $ + H[13]) * P, this.z = (H[2] * d + H[6] * D + H[10] * $ + H[14]) * P, this
    }
    applyQuaternion(U) {
        let d = this.x,
            D = this.y,
            $ = this.z,
            H = U.x,
            P = U.y,
            T = U.z,
            R = U.w,
            J = 2 * (P * $ - T * D),
            Q = 2 * (T * d - H * $),
            M = 2 * (H * D - P * d);
        return this.x = d + R * J + P * M - T * Q, this.y = D + R * Q + T * J - H * M, this.z = $ + R * M + H * Q - P * J, this
    }
    project(U) {
        return this.applyMatrix4(U.matrixWorldInverse).applyMatrix4(U.projectionMatrix)
    }
    unproject(U) {
        return this.applyMatrix4(U.projectionMatrixInverse).applyMatrix4(U.matrixWorld)
    }
    transformDirection(U) {
        let d = this.x,
            D = this.y,
            $ = this.z,
            H = U.elements;
        return this.x = H[0] * d + H[4] * D + H[8] * $, this.y = H[1] * d + H[5] * D + H[9] * $, this.z = H[2] * d + H[6] * D + H[10] * $, this.normalize()
    }
    divide(U) {
        return this.x /= U.x, this.y /= U.y, this.z /= U.z, this
    }
    divideScalar(U) {
        return this.multiplyScalar(1 / U)
    }
    min(U) {
        return this.x = Math.min(this.x, U.x), this.y = Math.min(this.y, U.y), this.z = Math.min(this.z, U.z), this
    }
    max(U) {
        return this.x = Math.max(this.x, U.x), this.y = Math.max(this.y, U.y), this.z = Math.max(this.z, U.z), this
    }
    clamp(U, d) {
        return this.x = Math.max(U.x, Math.min(d.x, this.x)), this.y = Math.max(U.y, Math.min(d.y, this.y)), this.z = Math.max(U.z, Math.min(d.z, this.z)), this
    }
    clampScalar(U, d) {
        return this.x = Math.max(U, Math.min(d, this.x)), this.y = Math.max(U, Math.min(d, this.y)), this.z = Math.max(U, Math.min(d, this.z)), this
    }
    clampLength(U, d) {
        let D = this.length();
        return this.divideScalar(D || 1).multiplyScalar(Math.max(U, Math.min(d, D)))
    }
    floor() {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this
    }
    ceil() {
        return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this
    }
    round() {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this
    }
    roundToZero() {
        return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this
    }
    negate() {
        return this.x = -this.x, this.y = -this.y, this.z = -this.z, this
    }
    dot(U) {
        return this.x * U.x + this.y * U.y + this.z * U.z
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z)
    }
    normalize() {
        return this.divideScalar(this.length() || 1)
    }
    setLength(U) {
        return this.normalize().multiplyScalar(U)
    }
    lerp(U, d) {
        return this.x += (U.x - this.x) * d, this.y += (U.y - this.y) * d, this.z += (U.z - this.z) * d, this
    }
    lerpVectors(U, d, D) {
        return this.x = U.x + (d.x - U.x) * D, this.y = U.y + (d.y - U.y) * D, this.z = U.z + (d.z - U.z) * D, this
    }
    cross(U) {
        return this.crossVectors(this, U)
    }
    crossVectors(U, d) {
        let {
            x: D,
            y: $,
            z: H
        } = U, P = d.x, T = d.y, R = d.z;
        return this.x = $ * R - H * T, this.y = H * P - D * R, this.z = D * T - $ * P, this
    }
    projectOnVector(U) {
        let d = U.lengthSq();
        if (d === 0) return this.set(0, 0, 0);
        let D = U.dot(this) / d;
        return this.copy(U).multiplyScalar(D)
    }
    projectOnPlane(U) {
        return jP.copy(this).projectOnVector(U), this.sub(jP)
    }
    reflect(U) {
        return this.sub(jP.copy(U).multiplyScalar(2 * this.dot(U)))
    }
    angleTo(U) {
        let d = Math.sqrt(this.lengthSq() * U.lengthSq());
        if (d === 0) return Math.PI / 2;
        let D = this.dot(U) / d;
        return Math.acos(bd(D, -1, 1))
    }
    distanceTo(U) {
        return Math.sqrt(this.distanceToSquared(U))
    }
    distanceToSquared(U) {
        let d = this.x - U.x,
            D = this.y - U.y,
            $ = this.z - U.z;
        return d * d + D * D + $ * $
    }
    manhattanDistanceTo(U) {
        return Math.abs(this.x - U.x) + Math.abs(this.y - U.y) + Math.abs(this.z - U.z)
    }
    setFromSpherical(U) {
        return this.setFromSphericalCoords(U.radius, U.phi, U.theta)
    }
    setFromSphericalCoords(U, d, D) {
        let $ = Math.sin(d) * U;
        return this.x = $ * Math.sin(D), this.y = Math.cos(d) * U, this.z = $ * Math.cos(D), this
    }
    setFromCylindrical(U) {
        return this.setFromCylindricalCoords(U.radius, U.theta, U.y)
    }
    setFromCylindricalCoords(U, d, D) {
        return this.x = U * Math.sin(d), this.y = D, this.z = U * Math.cos(d), this
    }
    setFromMatrixPosition(U) {
        let d = U.elements;
        return this.x = d[12], this.y = d[13], this.z = d[14], this
    }
    setFromMatrixScale(U) {
        let d = this.setFromMatrixColumn(U, 0).length(),
            D = this.setFromMatrixColumn(U, 1).length(),
            $ = this.setFromMatrixColumn(U, 2).length();
        return this.x = d, this.y = D, this.z = $, this
    }
    setFromMatrixColumn(U, d) {
        return this.fromArray(U.elements, d * 4)
    }
    setFromMatrix3Column(U, d) {
        return this.fromArray(U.elements, d * 3)
    }
    setFromEuler(U) {
        return this.x = U._x, this.y = U._y, this.z = U._z, this
    }
    setFromColor(U) {
        return this.x = U.r, this.y = U.g, this.z = U.b, this
    }
    equals(U) {
        return U.x === this.x && U.y === this.y && U.z === this.z
    }
    fromArray(U, d = 0) {
        return this.x = U[d], this.y = U[d + 1], this.z = U[d + 2], this
    }
    toArray(U = [], d = 0) {
        return U[d] = this.x, U[d + 1] = this.y, U[d + 2] = this.z, U
    }
    fromBufferAttribute(U, d) {
        return this.x = U.getX(d), this.y = U.getY(d), this.z = U.getZ(d), this
    }
    random() {
        return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this
    }
    randomDirection() {
        let U = Math.random() * Math.PI * 2,
            d = Math.random() * 2 - 1,
            D = Math.sqrt(1 - d * d);
        return this.x = D * Math.cos(U), this.y = d, this.z = D * Math.sin(U), this
    }*[Symbol.iterator]() {
        yield this.x, yield this.y, yield this.z
    }
}
var jP = new i,
    PQ = new UD;
class sD {
    constructor(U = new i(1 / 0, 1 / 0, 1 / 0), d = new i(-1 / 0, -1 / 0, -1 / 0)) {
        this.isBox3 = !0, this.min = U, this.max = d
    }
    set(U, d) {
        return this.min.copy(U), this.max.copy(d), this
    }
    setFromArray(U) {
        this.makeEmpty();
        for (let d = 0, D = U.length; d < D; d += 3) this.expandByPoint(HD.fromArray(U, d));
        return this
    }
    setFromBufferAttribute(U) {
        this.makeEmpty();
        for (let d = 0, D = U.count; d < D; d++) this.expandByPoint(HD.fromBufferAttribute(U, d));
        return this
    }
    setFromPoints(U) {
        this.makeEmpty();
        for (let d = 0, D = U.length; d < D; d++) this.expandByPoint(U[d]);
        return this
    }
    setFromCenterAndSize(U, d) {
        let D = HD.copy(d).multiplyScalar(0.5);
        return this.min.copy(U).sub(D), this.max.copy(U).add(D), this
    }
    setFromObject(U, d = !1) {
        return this.makeEmpty(), this.expandByObject(U, d)
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(U) {
        return this.min.copy(U.min), this.max.copy(U.max), this
    }
    makeEmpty() {
        return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this
    }
    isEmpty() {
        return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z
    }
    getCenter(U) {
        return this.isEmpty() ? U.set(0, 0, 0) : U.addVectors(this.min, this.max).multiplyScalar(0.5)
    }
    getSize(U) {
        return this.isEmpty() ? U.set(0, 0, 0) : U.subVectors(this.max, this.min)
    }
    expandByPoint(U) {
        return this.min.min(U), this.max.max(U), this
    }
    expandByVector(U) {
        return this.min.sub(U), this.max.add(U), this
    }
    expandByScalar(U) {
        return this.min.addScalar(-U), this.max.addScalar(U), this
    }
    expandByObject(U, d = !1) {
        U.updateWorldMatrix(!1, !1);
        let D = U.geometry;
        if (D !== void 0) {
            let H = D.getAttribute("position");
            if (d === !0 && H !== void 0 && U.isInstancedMesh !== !0)
                for (let P = 0, T = H.count; P < T; P++) {
                    if (U.isMesh === !0) U.getVertexPosition(P, HD);
                    else HD.fromBufferAttribute(H, P);
                    HD.applyMatrix4(U.matrixWorld), this.expandByPoint(HD)
                } else {
                    if (U.boundingBox !== void 0) {
                        if (U.boundingBox === null) U.computeBoundingBox();
                        o0.copy(U.boundingBox)
                    } else {
                        if (D.boundingBox === null) D.computeBoundingBox();
                        o0.copy(D.boundingBox)
                    }
                    o0.applyMatrix4(U.matrixWorld), this.union(o0)
                }
        }
        let $ = U.children;
        for (let H = 0, P = $.length; H < P; H++) this.expandByObject($[H], d);
        return this
    }
    containsPoint(U) {
        return U.x >= this.min.x && U.x <= this.max.x && U.y >= this.min.y && U.y <= this.max.y && U.z >= this.min.z && U.z <= this.max.z
    }
    containsBox(U) {
        return this.min.x <= U.min.x && U.max.x <= this.max.x && this.min.y <= U.min.y && U.max.y <= this.max.y && this.min.z <= U.min.z && U.max.z <= this.max.z
    }
    getParameter(U, d) {
        return d.set((U.x - this.min.x) / (this.max.x - this.min.x), (U.y - this.min.y) / (this.max.y - this.min.y), (U.z - this.min.z) / (this.max.z - this.min.z))
    }
    intersectsBox(U) {
        return U.max.x >= this.min.x && U.min.x <= this.max.x && U.max.y >= this.min.y && U.min.y <= this.max.y && U.max.z >= this.min.z && U.min.z <= this.max.z
    }
    intersectsSphere(U) {
        return this.clampPoint(U.center, HD), HD.distanceToSquared(U.center) <= U.radius * U.radius
    }
    intersectsPlane(U) {
        let d, D;
        if (U.normal.x > 0) d = U.normal.x * this.min.x, D = U.normal.x * this.max.x;
        else d = U.normal.x * this.max.x, D = U.normal.x * this.min.x;
        if (U.normal.y > 0) d += U.normal.y * this.min.y, D += U.normal.y * this.max.y;
        else d += U.normal.y * this.max.y, D += U.normal.y * this.min.y;
        if (U.normal.z > 0) d += U.normal.z * this.min.z, D += U.normal.z * this.max.z;
        else d += U.normal.z * this.max.z, D += U.normal.z * this.min.z;
        return d <= -U.constant && D >= -U.constant
    }
    intersectsTriangle(U) {
        if (this.isEmpty()) return !1;
        this.getCenter(d0), n0.subVectors(this.max, d0), k$.subVectors(U.a, d0), Z$.subVectors(U.b, d0), a$.subVectors(U.c, d0), wD.subVectors(Z$, k$), cD.subVectors(a$, Z$), d$.subVectors(k$, a$);
        let d = [0, -wD.z, wD.y, 0, -cD.z, cD.y, 0, -d$.z, d$.y, wD.z, 0, -wD.x, cD.z, 0, -cD.x, d$.z, 0, -d$.x, -wD.y, wD.x, 0, -cD.y, cD.x, 0, -d$.y, d$.x, 0];
        if (!EP(d, k$, Z$, a$, n0)) return !1;
        if (d = [1, 0, 0, 0, 1, 0, 0, 0, 1], !EP(d, k$, Z$, a$, n0)) return !1;
        return s0.crossVectors(wD, cD), d = [s0.x, s0.y, s0.z], EP(d, k$, Z$, a$, n0)
    }
    clampPoint(U, d) {
        return d.copy(U).clamp(this.min, this.max)
    }
    distanceToPoint(U) {
        return this.clampPoint(U, HD).distanceTo(U)
    }
    getBoundingSphere(U) {
        if (this.isEmpty()) U.makeEmpty();
        else this.getCenter(U.center), U.radius = this.getSize(HD).length() * 0.5;
        return U
    }
    intersect(U) {
        if (this.min.max(U.min), this.max.min(U.max), this.isEmpty()) this.makeEmpty();
        return this
    }
    union(U) {
        return this.min.min(U.min), this.max.max(U.max), this
    }
    applyMatrix4(U) {
        if (this.isEmpty()) return this;
        return bD[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(U), bD[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(U), bD[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(U), bD[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(U), bD[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(U), bD[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(U), bD[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(U), bD[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(U), this.setFromPoints(bD), this
    }
    translate(U) {
        return this.min.add(U), this.max.add(U), this
    }
    equals(U) {
        return U.min.equals(this.min) && U.max.equals(this.max)
    }
}
var bD = [new i, new i, new i, new i, new i, new i, new i, new i],
    HD = new i,
    o0 = new sD,
    k$ = new i,
    Z$ = new i,
    a$ = new i,
    wD = new i,
    cD = new i,
    d$ = new i,
    d0 = new i,
    n0 = new i,
    s0 = new i,
    D$ = new i;

function EP(U, d, D, $, H) {
    for (let P = 0, T = U.length - 3; P <= T; P += 3) {
        D$.fromArray(U, P);
        let R = H.x * Math.abs(D$.x) + H.y * Math.abs(D$.y) + H.z * Math.abs(D$.z),
            J = d.dot(D$),
            Q = D.dot(D$),
            M = $.dot(D$);
        if (Math.max(-Math.max(J, Q, M), Math.min(J, Q, M)) > R) return !1
    }
    return !0
}
var lJ = new sD,
    D0 = new i,
    IP = new i;
class J$ {
    constructor(U = new i, d = -1) {
        this.isSphere = !0, this.center = U, this.radius = d
    }
    set(U, d) {
        return this.center.copy(U), this.radius = d, this
    }
    setFromPoints(U, d) {
        let D = this.center;
        if (d !== void 0) D.copy(d);
        else lJ.setFromPoints(U).getCenter(D);
        let $ = 0;
        for (let H = 0, P = U.length; H < P; H++) $ = Math.max($, D.distanceToSquared(U[H]));
        return this.radius = Math.sqrt($), this
    }
    copy(U) {
        return this.center.copy(U.center), this.radius = U.radius, this
    }
    isEmpty() {
        return this.radius < 0
    }
    makeEmpty() {
        return this.center.set(0, 0, 0), this.radius = -1, this
    }
    containsPoint(U) {
        return U.distanceToSquared(this.center) <= this.radius * this.radius
    }
    distanceToPoint(U) {
        return U.distanceTo(this.center) - this.radius
    }
    intersectsSphere(U) {
        let d = this.radius + U.radius;
        return U.center.distanceToSquared(this.center) <= d * d
    }
    intersectsBox(U) {
        return U.intersectsSphere(this)
    }
    intersectsPlane(U) {
        return Math.abs(U.distanceToPoint(this.center)) <= this.radius
    }
    clampPoint(U, d) {
        let D = this.center.distanceToSquared(U);
        if (d.copy(U), D > this.radius * this.radius) d.sub(this.center).normalize(), d.multiplyScalar(this.radius).add(this.center);
        return d
    }
    getBoundingBox(U) {
        if (this.isEmpty()) return U.makeEmpty(), U;
        return U.set(this.center, this.center), U.expandByScalar(this.radius), U
    }
    applyMatrix4(U) {
        return this.center.applyMatrix4(U), this.radius = this.radius * U.getMaxScaleOnAxis(), this
    }
    translate(U) {
        return this.center.add(U), this
    }
    expandByPoint(U) {
        if (this.isEmpty()) return this.center.copy(U), this.radius = 0, this;
        D0.subVectors(U, this.center);
        let d = D0.lengthSq();
        if (d > this.radius * this.radius) {
            let D = Math.sqrt(d),
                $ = (D - this.radius) * 0.5;
            this.center.addScaledVector(D0, $ / D), this.radius += $
        }
        return this
    }
    union(U) {
        if (U.isEmpty()) return this;
        if (this.isEmpty()) return this.copy(U), this;
        if (this.center.equals(U.center) === !0) this.radius = Math.max(this.radius, U.radius);
        else IP.subVectors(U.center, this.center).setLength(U.radius), this.expandByPoint(D0.copy(U.center).add(IP)), this.expandByPoint(D0.copy(U.center).sub(IP));
        return this
    }
    equals(U) {
        return U.center.equals(this.center) && U.radius === this.radius
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
var iD = new i,
    kP = new i,
    x0 = new i,
    eD = new i,
    ZP = new i,
    r0 = new i,
    aP = new i;
class q$ {
    constructor(U = new i, d = new i(0, 0, -1)) {
        this.origin = U, this.direction = d
    }
    set(U, d) {
        return this.origin.copy(U), this.direction.copy(d), this
    }
    copy(U) {
        return this.origin.copy(U.origin), this.direction.copy(U.direction), this
    }
    at(U, d) {
        return d.copy(this.origin).addScaledVector(this.direction, U)
    }
    lookAt(U) {
        return this.direction.copy(U).sub(this.origin).normalize(), this
    }
    recast(U) {
        return this.origin.copy(this.at(U, iD)), this
    }
    closestPointToPoint(U, d) {
        d.subVectors(U, this.origin);
        let D = d.dot(this.direction);
        if (D < 0) return d.copy(this.origin);
        return d.copy(this.origin).addScaledVector(this.direction, D)
    }
    distanceToPoint(U) {
        return Math.sqrt(this.distanceSqToPoint(U))
    }
    distanceSqToPoint(U) {
        let d = iD.subVectors(U, this.origin).dot(this.direction);
        if (d < 0) return this.origin.distanceToSquared(U);
        return iD.copy(this.origin).addScaledVector(this.direction, d), iD.distanceToSquared(U)
    }
    distanceSqToSegment(U, d, D, $) {
        kP.copy(U).add(d).multiplyScalar(0.5), x0.copy(d).sub(U).normalize(), eD.copy(this.origin).sub(kP);
        let H = U.distanceTo(d) * 0.5,
            P = -this.direction.dot(x0),
            T = eD.dot(this.direction),
            R = -eD.dot(x0),
            J = eD.lengthSq(),
            Q = Math.abs(1 - P * P),
            M, S, B, L;
        if (Q > 0)
            if (M = P * R - T, S = P * T - R, L = H * Q, M >= 0)
                if (S >= -L)
                    if (S <= L) {
                        let E = 1 / Q;
                        M *= E, S *= E, B = M * (M + P * S + 2 * T) + S * (P * M + S + 2 * R) + J
                    } else S = H, M = Math.max(0, -(P * S + T)), B = -M * M + S * (S + 2 * R) + J;
        else S = -H, M = Math.max(0, -(P * S + T)), B = -M * M + S * (S + 2 * R) + J;
        else if (S <= -L) M = Math.max(0, -(-P * H + T)), S = M > 0 ? -H : Math.min(Math.max(-H, -R), H), B = -M * M + S * (S + 2 * R) + J;
        else if (S <= L) M = 0, S = Math.min(Math.max(-H, -R), H), B = S * (S + 2 * R) + J;
        else M = Math.max(0, -(P * H + T)), S = M > 0 ? H : Math.min(Math.max(-H, -R), H), B = -M * M + S * (S + 2 * R) + J;
        else S = P > 0 ? -H : H, M = Math.max(0, -(P * S + T)), B = -M * M + S * (S + 2 * R) + J;
        if (D) D.copy(this.origin).addScaledVector(this.direction, M);
        if ($) $.copy(kP).addScaledVector(x0, S);
        return B
    }
    intersectSphere(U, d) {
        iD.subVectors(U.center, this.origin);
        let D = iD.dot(this.direction),
            $ = iD.dot(iD) - D * D,
            H = U.radius * U.radius;
        if ($ > H) return null;
        let P = Math.sqrt(H - $),
            T = D - P,
            R = D + P;
        if (R < 0) return null;
        if (T < 0) return this.at(R, d);
        return this.at(T, d)
    }
    intersectsSphere(U) {
        return this.distanceSqToPoint(U.center) <= U.radius * U.radius
    }
    distanceToPlane(U) {
        let d = U.normal.dot(this.direction);
        if (d === 0) {
            if (U.distanceToPoint(this.origin) === 0) return 0;
            return null
        }
        let D = -(this.origin.dot(U.normal) + U.constant) / d;
        return D >= 0 ? D : null
    }
    intersectPlane(U, d) {
        let D = this.distanceToPlane(U);
        if (D === null) return null;
        return this.at(D, d)
    }
    intersectsPlane(U) {
        let d = U.distanceToPoint(this.origin);
        if (d === 0) return !0;
        if (U.normal.dot(this.direction) * d < 0) return !0;
        return !1
    }
    intersectBox(U, d) {
        let D, $, H, P, T, R, J = 1 / this.direction.x,
            Q = 1 / this.direction.y,
            M = 1 / this.direction.z,
            S = this.origin;
        if (J >= 0) D = (U.min.x - S.x) * J, $ = (U.max.x - S.x) * J;
        else D = (U.max.x - S.x) * J, $ = (U.min.x - S.x) * J;
        if (Q >= 0) H = (U.min.y - S.y) * Q, P = (U.max.y - S.y) * Q;
        else H = (U.max.y - S.y) * Q, P = (U.min.y - S.y) * Q;
        if (D > P || H > $) return null;
        if (H > D || isNaN(D)) D = H;
        if (P < $ || isNaN($)) $ = P;
        if (M >= 0) T = (U.min.z - S.z) * M, R = (U.max.z - S.z) * M;
        else T = (U.max.z - S.z) * M, R = (U.min.z - S.z) * M;
        if (D > R || T > $) return null;
        if (T > D || D !== D) D = T;
        if (R < $ || $ !== $) $ = R;
        if ($ < 0) return null;
        return this.at(D >= 0 ? D : $, d)
    }
    intersectsBox(U) {
        return this.intersectBox(U, iD) !== null
    }
    intersectTriangle(U, d, D, $, H) {
        ZP.subVectors(d, U), r0.subVectors(D, U), aP.crossVectors(ZP, r0);
        let P = this.direction.dot(aP),
            T;
        if (P > 0) {
            if ($) return null;
            T = 1
        } else if (P < 0) T = -1, P = -P;
        else return null;
        eD.subVectors(this.origin, U);
        let R = T * this.direction.dot(r0.crossVectors(eD, r0));
        if (R < 0) return null;
        let J = T * this.direction.dot(ZP.cross(eD));
        if (J < 0) return null;
        if (R + J > P) return null;
        let Q = -T * eD.dot(aP);
        if (Q < 0) return null;
        return this.at(Q / P, H)
    }
    applyMatrix4(U) {
        return this.origin.applyMatrix4(U), this.direction.transformDirection(U), this
    }
    equals(U) {
        return U.origin.equals(this.origin) && U.direction.equals(this.direction)
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
class Dd {
    constructor(U, d, D, $, H, P, T, R, J, Q, M, S, B, L, E, k) {
        if (Dd.prototype.isMatrix4 = !0, this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], U !== void 0) this.set(U, d, D, $, H, P, T, R, J, Q, M, S, B, L, E, k)
    }
    set(U, d, D, $, H, P, T, R, J, Q, M, S, B, L, E, k) {
        let A = this.elements;
        return A[0] = U, A[4] = d, A[8] = D, A[12] = $, A[1] = H, A[5] = P, A[9] = T, A[13] = R, A[2] = J, A[6] = Q, A[10] = M, A[14] = S, A[3] = B, A[7] = L, A[11] = E, A[15] = k, this
    }
    identity() {
        return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
    }
    clone() {
        return new Dd().fromArray(this.elements)
    }
    copy(U) {
        let d = this.elements,
            D = U.elements;
        return d[0] = D[0], d[1] = D[1], d[2] = D[2], d[3] = D[3], d[4] = D[4], d[5] = D[5], d[6] = D[6], d[7] = D[7], d[8] = D[8], d[9] = D[9], d[10] = D[10], d[11] = D[11], d[12] = D[12], d[13] = D[13], d[14] = D[14], d[15] = D[15], this
    }
    copyPosition(U) {
        let d = this.elements,
            D = U.elements;
        return d[12] = D[12], d[13] = D[13], d[14] = D[14], this
    }
    setFromMatrix3(U) {
        let d = U.elements;
        return this.set(d[0], d[3], d[6], 0, d[1], d[4], d[7], 0, d[2], d[5], d[8], 0, 0, 0, 0, 1), this
    }
    extractBasis(U, d, D) {
        return U.setFromMatrixColumn(this, 0), d.setFromMatrixColumn(this, 1), D.setFromMatrixColumn(this, 2), this
    }
    makeBasis(U, d, D) {
        return this.set(U.x, d.x, D.x, 0, U.y, d.y, D.y, 0, U.z, d.z, D.z, 0, 0, 0, 0, 1), this
    }
    extractRotation(U) {
        let d = this.elements,
            D = U.elements,
            $ = 1 / Y$.setFromMatrixColumn(U, 0).length(),
            H = 1 / Y$.setFromMatrixColumn(U, 1).length(),
            P = 1 / Y$.setFromMatrixColumn(U, 2).length();
        return d[0] = D[0] * $, d[1] = D[1] * $, d[2] = D[2] * $, d[3] = 0, d[4] = D[4] * H, d[5] = D[5] * H, d[6] = D[6] * H, d[7] = 0, d[8] = D[8] * P, d[9] = D[9] * P, d[10] = D[10] * P, d[11] = 0, d[12] = 0, d[13] = 0, d[14] = 0, d[15] = 1, this
    }
    makeRotationFromEuler(U) {
        let d = this.elements,
            D = U.x,
            $ = U.y,
            H = U.z,
            P = Math.cos(D),
            T = Math.sin(D),
            R = Math.cos($),
            J = Math.sin($),
            Q = Math.cos(H),
            M = Math.sin(H);
        if (U.order === "XYZ") {
            let S = P * Q,
                B = P * M,
                L = T * Q,
                E = T * M;
            d[0] = R * Q, d[4] = -R * M, d[8] = J, d[1] = B + L * J, d[5] = S - E * J, d[9] = -T * R, d[2] = E - S * J, d[6] = L + B * J, d[10] = P * R
        } else if (U.order === "YXZ") {
            let S = R * Q,
                B = R * M,
                L = J * Q,
                E = J * M;
            d[0] = S + E * T, d[4] = L * T - B, d[8] = P * J, d[1] = P * M, d[5] = P * Q, d[9] = -T, d[2] = B * T - L, d[6] = E + S * T, d[10] = P * R
        } else if (U.order === "ZXY") {
            let S = R * Q,
                B = R * M,
                L = J * Q,
                E = J * M;
            d[0] = S - E * T, d[4] = -P * M, d[8] = L + B * T, d[1] = B + L * T, d[5] = P * Q, d[9] = E - S * T, d[2] = -P * J, d[6] = T, d[10] = P * R
        } else if (U.order === "ZYX") {
            let S = P * Q,
                B = P * M,
                L = T * Q,
                E = T * M;
            d[0] = R * Q, d[4] = L * J - B, d[8] = S * J + E, d[1] = R * M, d[5] = E * J + S, d[9] = B * J - L, d[2] = -J, d[6] = T * R, d[10] = P * R
        } else if (U.order === "YZX") {
            let S = P * R,
                B = P * J,
                L = T * R,
                E = T * J;
            d[0] = R * Q, d[4] = E - S * M, d[8] = L * M + B, d[1] = M, d[5] = P * Q, d[9] = -T * Q, d[2] = -J * Q, d[6] = B * M + L, d[10] = S - E * M
        } else if (U.order === "XZY") {
            let S = P * R,
                B = P * J,
                L = T * R,
                E = T * J;
            d[0] = R * Q, d[4] = -M, d[8] = J * Q, d[1] = S * M + E, d[5] = P * Q, d[9] = B * M - L, d[2] = L * M - B, d[6] = T * Q, d[10] = E * M + S
        }
        return d[3] = 0, d[7] = 0, d[11] = 0, d[12] = 0, d[13] = 0, d[14] = 0, d[15] = 1, this
    }
    makeRotationFromQuaternion(U) {
        return this.compose(yJ, U, oJ)
    }
    lookAt(U, d, D) {
        let $ = this.elements;
        if (yd.subVectors(U, d), yd.lengthSq() === 0) yd.z = 1;
        if (yd.normalize(), vD.crossVectors(D, yd), vD.lengthSq() === 0) {
            if (Math.abs(D.z) === 1) yd.x += 0.0001;
            else yd.z += 0.0001;
            yd.normalize(), vD.crossVectors(D, yd)
        }
        return vD.normalize(), t0.crossVectors(yd, vD), $[0] = vD.x, $[4] = t0.x, $[8] = yd.x, $[1] = vD.y, $[5] = t0.y, $[9] = yd.y, $[2] = vD.z, $[6] = t0.z, $[10] = yd.z, this
    }
    multiply(U) {
        return this.multiplyMatrices(this, U)
    }
    premultiply(U) {
        return this.multiplyMatrices(U, this)
    }
    multiplyMatrices(U, d) {
        let D = U.elements,
            $ = d.elements,
            H = this.elements,
            P = D[0],
            T = D[4],
            R = D[8],
            J = D[12],
            Q = D[1],
            M = D[5],
            S = D[9],
            B = D[13],
            L = D[2],
            E = D[6],
            k = D[10],
            A = D[14],
            j = D[3],
            C = D[7],
            I = D[11],
            Z = D[15],
            a = $[0],
            Y = $[4],
            f = $[8],
            G = $[12],
            X = $[1],
            F = $[5],
            O = $[9],
            N = $[13],
            z = $[2],
            w = $[6],
            l = $[10],
            c = $[14],
            y = $[3],
            W = $[7],
            UU = $[11],
            PU = $[15];
        return H[0] = P * a + T * X + R * z + J * y, H[4] = P * Y + T * F + R * w + J * W, H[8] = P * f + T * O + R * l + J * UU, H[12] = P * G + T * N + R * c + J * PU, H[1] = Q * a + M * X + S * z + B * y, H[5] = Q * Y + M * F + S * w + B * W, H[9] = Q * f + M * O + S * l + B * UU, H[13] = Q * G + M * N + S * c + B * PU, H[2] = L * a + E * X + k * z + A * y, H[6] = L * Y + E * F + k * w + A * W, H[10] = L * f + E * O + k * l + A * UU, H[14] = L * G + E * N + k * c + A * PU, H[3] = j * a + C * X + I * z + Z * y, H[7] = j * Y + C * F + I * w + Z * W, H[11] = j * f + C * O + I * l + Z * UU, H[15] = j * G + C * N + I * c + Z * PU, this
    }
    multiplyScalar(U) {
        let d = this.elements;
        return d[0] *= U, d[4] *= U, d[8] *= U, d[12] *= U, d[1] *= U, d[5] *= U, d[9] *= U, d[13] *= U, d[2] *= U, d[6] *= U, d[10] *= U, d[14] *= U, d[3] *= U, d[7] *= U, d[11] *= U, d[15] *= U, this
    }
    determinant() {
        let U = this.elements,
            d = U[0],
            D = U[4],
            $ = U[8],
            H = U[12],
            P = U[1],
            T = U[5],
            R = U[9],
            J = U[13],
            Q = U[2],
            M = U[6],
            S = U[10],
            B = U[14],
            L = U[3],
            E = U[7],
            k = U[11],
            A = U[15];
        return L * (+H * R * M - $ * J * M - H * T * S + D * J * S + $ * T * B - D * R * B) + E * (+d * R * B - d * J * S + H * P * S - $ * P * B + $ * J * Q - H * R * Q) + k * (+d * J * M - d * T * B - H * P * M + D * P * B + H * T * Q - D * J * Q) + A * (-$ * T * Q - d * R * M + d * T * S + $ * P * M - D * P * S + D * R * Q)
    }
    transpose() {
        let U = this.elements,
            d;
        return d = U[1], U[1] = U[4], U[4] = d, d = U[2], U[2] = U[8], U[8] = d, d = U[6], U[6] = U[9], U[9] = d, d = U[3], U[3] = U[12], U[12] = d, d = U[7], U[7] = U[13], U[13] = d, d = U[11], U[11] = U[14], U[14] = d, this
    }
    setPosition(U, d, D) {
        let $ = this.elements;
        if (U.isVector3) $[12] = U.x, $[13] = U.y, $[14] = U.z;
        else $[12] = U, $[13] = d, $[14] = D;
        return this
    }
    invert() {
        let U = this.elements,
            d = U[0],
            D = U[1],
            $ = U[2],
            H = U[3],
            P = U[4],
            T = U[5],
            R = U[6],
            J = U[7],
            Q = U[8],
            M = U[9],
            S = U[10],
            B = U[11],
            L = U[12],
            E = U[13],
            k = U[14],
            A = U[15],
            j = M * k * J - E * S * J + E * R * B - T * k * B - M * R * A + T * S * A,
            C = L * S * J - Q * k * J - L * R * B + P * k * B + Q * R * A - P * S * A,
            I = Q * E * J - L * M * J + L * T * B - P * E * B - Q * T * A + P * M * A,
            Z = L * M * R - Q * E * R - L * T * S + P * E * S + Q * T * k - P * M * k,
            a = d * j + D * C + $ * I + H * Z;
        if (a === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        let Y = 1 / a;
        return U[0] = j * Y, U[1] = (E * S * H - M * k * H - E * $ * B + D * k * B + M * $ * A - D * S * A) * Y, U[2] = (T * k * H - E * R * H + E * $ * J - D * k * J - T * $ * A + D * R * A) * Y, U[3] = (M * R * H - T * S * H - M * $ * J + D * S * J + T * $ * B - D * R * B) * Y, U[4] = C * Y, U[5] = (Q * k * H - L * S * H + L * $ * B - d * k * B - Q * $ * A + d * S * A) * Y, U[6] = (L * R * H - P * k * H - L * $ * J + d * k * J + P * $ * A - d * R * A) * Y, U[7] = (P * S * H - Q * R * H + Q * $ * J - d * S * J - P * $ * B + d * R * B) * Y, U[8] = I * Y, U[9] = (L * M * H - Q * E * H - L * D * B + d * E * B + Q * D * A - d * M * A) * Y, U[10] = (P * E * H - L * T * H + L * D * J - d * E * J - P * D * A + d * T * A) * Y, U[11] = (Q * T * H - P * M * H - Q * D * J + d * M * J + P * D * B - d * T * B) * Y, U[12] = Z * Y, U[13] = (Q * E * $ - L * M * $ + L * D * S - d * E * S - Q * D * k + d * M * k) * Y, U[14] = (L * T * $ - P * E * $ - L * D * R + d * E * R + P * D * k - d * T * k) * Y, U[15] = (P * M * $ - Q * T * $ + Q * D * R - d * M * R - P * D * S + d * T * S) * Y, this
    }
    scale(U) {
        let d = this.elements,
            D = U.x,
            $ = U.y,
            H = U.z;
        return d[0] *= D, d[4] *= $, d[8] *= H, d[1] *= D, d[5] *= $, d[9] *= H, d[2] *= D, d[6] *= $, d[10] *= H, d[3] *= D, d[7] *= $, d[11] *= H, this
    }
    getMaxScaleOnAxis() {
        let U = this.elements,
            d = U[0] * U[0] + U[1] * U[1] + U[2] * U[2],
            D = U[4] * U[4] + U[5] * U[5] + U[6] * U[6],
            $ = U[8] * U[8] + U[9] * U[9] + U[10] * U[10];
        return Math.sqrt(Math.max(d, D, $))
    }
    makeTranslation(U, d, D) {
        if (U.isVector3) this.set(1, 0, 0, U.x, 0, 1, 0, U.y, 0, 0, 1, U.z, 0, 0, 0, 1);
        else this.set(1, 0, 0, U, 0, 1, 0, d, 0, 0, 1, D, 0, 0, 0, 1);
        return this
    }
    makeRotationX(U) {
        let d = Math.cos(U),
            D = Math.sin(U);
        return this.set(1, 0, 0, 0, 0, d, -D, 0, 0, D, d, 0, 0, 0, 0, 1), this
    }
    makeRotationY(U) {
        let d = Math.cos(U),
            D = Math.sin(U);
        return this.set(d, 0, D, 0, 0, 1, 0, 0, -D, 0, d, 0, 0, 0, 0, 1), this
    }
    makeRotationZ(U) {
        let d = Math.cos(U),
            D = Math.sin(U);
        return this.set(d, -D, 0, 0, D, d, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
    }
    makeRotationAxis(U, d) {
        let D = Math.cos(d),
            $ = Math.sin(d),
            H = 1 - D,
            P = U.x,
            T = U.y,
            R = U.z,
            J = H * P,
            Q = H * T;
        return this.set(J * P + D, J * T - $ * R, J * R + $ * T, 0, J * T + $ * R, Q * T + D, Q * R - $ * P, 0, J * R - $ * T, Q * R + $ * P, H * R * R + D, 0, 0, 0, 0, 1), this
    }
    makeScale(U, d, D) {
        return this.set(U, 0, 0, 0, 0, d, 0, 0, 0, 0, D, 0, 0, 0, 0, 1), this
    }
    makeShear(U, d, D, $, H, P) {
        return this.set(1, D, H, 0, U, 1, P, 0, d, $, 1, 0, 0, 0, 0, 1), this
    }
    compose(U, d, D) {
        let $ = this.elements,
            H = d._x,
            P = d._y,
            T = d._z,
            R = d._w,
            J = H + H,
            Q = P + P,
            M = T + T,
            S = H * J,
            B = H * Q,
            L = H * M,
            E = P * Q,
            k = P * M,
            A = T * M,
            j = R * J,
            C = R * Q,
            I = R * M,
            Z = D.x,
            a = D.y,
            Y = D.z;
        return $[0] = (1 - (E + A)) * Z, $[1] = (B + I) * Z, $[2] = (L - C) * Z, $[3] = 0, $[4] = (B - I) * a, $[5] = (1 - (S + A)) * a, $[6] = (k + j) * a, $[7] = 0, $[8] = (L + C) * Y, $[9] = (k - j) * Y, $[10] = (1 - (S + E)) * Y, $[11] = 0, $[12] = U.x, $[13] = U.y, $[14] = U.z, $[15] = 1, this
    }
    decompose(U, d, D) {
        let $ = this.elements,
            H = Y$.set($[0], $[1], $[2]).length(),
            P = Y$.set($[4], $[5], $[6]).length(),
            T = Y$.set($[8], $[9], $[10]).length();
        if (this.determinant() < 0) H = -H;
        U.x = $[12], U.y = $[13], U.z = $[14], PD.copy(this);
        let J = 1 / H,
            Q = 1 / P,
            M = 1 / T;
        return PD.elements[0] *= J, PD.elements[1] *= J, PD.elements[2] *= J, PD.elements[4] *= Q, PD.elements[5] *= Q, PD.elements[6] *= Q, PD.elements[8] *= M, PD.elements[9] *= M, PD.elements[10] *= M, d.setFromRotationMatrix(PD), D.x = H, D.y = P, D.z = T, this
    }
    makePerspective(U, d, D, $, H, P, T = 2000) {
        let R = this.elements,
            J = 2 * H / (d - U),
            Q = 2 * H / (D - $),
            M = (d + U) / (d - U),
            S = (D + $) / (D - $),
            B, L;
        if (T === 2000) B = -(P + H) / (P - H), L = -2 * P * H / (P - H);
        else if (T === 2001) B = -P / (P - H), L = -P * H / (P - H);
        else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + T);
        return R[0] = J, R[4] = 0, R[8] = M, R[12] = 0, R[1] = 0, R[5] = Q, R[9] = S, R[13] = 0, R[2] = 0, R[6] = 0, R[10] = B, R[14] = L, R[3] = 0, R[7] = 0, R[11] = -1, R[15] = 0, this
    }
    makeOrthographic(U, d, D, $, H, P, T = 2000) {
        let R = this.elements,
            J = 1 / (d - U),
            Q = 1 / (D - $),
            M = 1 / (P - H),
            S = (d + U) * J,
            B = (D + $) * Q,
            L, E;
        if (T === 2000) L = (P + H) * M, E = -2 * M;
        else if (T === 2001) L = H * M, E = -1 * M;
        else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + T);
        return R[0] = 2 * J, R[4] = 0, R[8] = 0, R[12] = -S, R[1] = 0, R[5] = 2 * Q, R[9] = 0, R[13] = -B, R[2] = 0, R[6] = 0, R[10] = E, R[14] = -L, R[3] = 0, R[7] = 0, R[11] = 0, R[15] = 1, this
    }
    equals(U) {
        let d = this.elements,
            D = U.elements;
        for (let $ = 0; $ < 16; $++)
            if (d[$] !== D[$]) return !1;
        return !0
    }
    fromArray(U, d = 0) {
        for (let D = 0; D < 16; D++) this.elements[D] = U[D + d];
        return this
    }
    toArray(U = [], d = 0) {
        let D = this.elements;
        return U[d] = D[0], U[d + 1] = D[1], U[d + 2] = D[2], U[d + 3] = D[3], U[d + 4] = D[4], U[d + 5] = D[5], U[d + 6] = D[6], U[d + 7] = D[7], U[d + 8] = D[8], U[d + 9] = D[9], U[d + 10] = D[10], U[d + 11] = D[11], U[d + 12] = D[12], U[d + 13] = D[13], U[d + 14] = D[14], U[d + 15] = D[15], U
    }
}
var Y$ = new i,
    PD = new Dd,
    yJ = new i(0, 0, 0),
    oJ = new i(1, 1, 1),
    vD = new i,
    t0 = new i,
    yd = new i,
    TQ = new Dd,
    RQ = new UD;
class QD {
    constructor(U = 0, d = 0, D = 0, $ = QD.DEFAULT_ORDER) {
        this.isEuler = !0, this._x = U, this._y = d, this._z = D, this._order = $
    }
    get x() {
        return this._x
    }
    set x(U) {
        this._x = U, this._onChangeCallback()
    }
    get y() {
        return this._y
    }
    set y(U) {
        this._y = U, this._onChangeCallback()
    }
    get z() {
        return this._z
    }
    set z(U) {
        this._z = U, this._onChangeCallback()
    }
    get order() {
        return this._order
    }
    set order(U) {
        this._order = U, this._onChangeCallback()
    }
    set(U, d, D, $ = this._order) {
        return this._x = U, this._y = d, this._z = D, this._order = $, this._onChangeCallback(), this
    }
    clone() {
        return new this.constructor(this._x, this._y, this._z, this._order)
    }
    copy(U) {
        return this._x = U._x, this._y = U._y, this._z = U._z, this._order = U._order, this._onChangeCallback(), this
    }
    setFromRotationMatrix(U, d = this._order, D = !0) {
        let $ = U.elements,
            H = $[0],
            P = $[4],
            T = $[8],
            R = $[1],
            J = $[5],
            Q = $[9],
            M = $[2],
            S = $[6],
            B = $[10];
        switch (d) {
            case "XYZ":
                if (this._y = Math.asin(bd(T, -1, 1)), Math.abs(T) < 0.9999999) this._x = Math.atan2(-Q, B), this._z = Math.atan2(-P, H);
                else this._x = Math.atan2(S, J), this._z = 0;
                break;
            case "YXZ":
                if (this._x = Math.asin(-bd(Q, -1, 1)), Math.abs(Q) < 0.9999999) this._y = Math.atan2(T, B), this._z = Math.atan2(R, J);
                else this._y = Math.atan2(-M, H), this._z = 0;
                break;
            case "ZXY":
                if (this._x = Math.asin(bd(S, -1, 1)), Math.abs(S) < 0.9999999) this._y = Math.atan2(-M, B), this._z = Math.atan2(-P, J);
                else this._y = 0, this._z = Math.atan2(R, H);
                break;
            case "ZYX":
                if (this._y = Math.asin(-bd(M, -1, 1)), Math.abs(M) < 0.9999999) this._x = Math.atan2(S, B), this._z = Math.atan2(R, H);
                else this._x = 0, this._z = Math.atan2(-P, J);
                break;
            case "YZX":
                if (this._z = Math.asin(bd(R, -1, 1)), Math.abs(R) < 0.9999999) this._x = Math.atan2(-Q, J), this._y = Math.atan2(-M, H);
                else this._x = 0, this._y = Math.atan2(T, B);
                break;
            case "XZY":
                if (this._z = Math.asin(-bd(P, -1, 1)), Math.abs(P) < 0.9999999) this._x = Math.atan2(S, J), this._y = Math.atan2(T, H);
                else this._x = Math.atan2(-Q, B), this._y = 0;
                break;
            default:
                console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + d)
        }
        if (this._order = d, D === !0) this._onChangeCallback();
        return this
    }
    setFromQuaternion(U, d, D) {
        return TQ.makeRotationFromQuaternion(U), this.setFromRotationMatrix(TQ, d, D)
    }
    setFromVector3(U, d = this._order) {
        return this.set(U.x, U.y, U.z, d)
    }
    reorder(U) {
        return RQ.setFromEuler(this), this.setFromQuaternion(RQ, U)
    }
    equals(U) {
        return U._x === this._x && U._y === this._y && U._z === this._z && U._order === this._order
    }
    fromArray(U) {
        if (this._x = U[0], this._y = U[1], this._z = U[2], U[3] !== void 0) this._order = U[3];
        return this._onChangeCallback(), this
    }
    toArray(U = [], d = 0) {
        return U[d] = this._x, U[d + 1] = this._y, U[d + 2] = this._z, U[d + 3] = this._order, U
    }
    _onChange(U) {
        return this._onChangeCallback = U, this
    }
    _onChangeCallback() {}*[Symbol.iterator]() {
        yield this._x, yield this._y, yield this._z, yield this._order
    }
}
QD.DEFAULT_ORDER = "XYZ";
class fH {
    constructor() {
        this.mask = 1
    }
    set(U) {
        this.mask = (1 << U | 0) >>> 0
    }
    enable(U) {
        this.mask |= 1 << U | 0
    }
    enableAll() {
        this.mask = -1
    }
    toggle(U) {
        this.mask ^= 1 << U | 0
    }
    disable(U) {
        this.mask &= ~(1 << U | 0)
    }
    disableAll() {
        this.mask = 0
    }
    test(U) {
        return (this.mask & U.mask) !== 0
    }
    isEnabled(U) {
        return (this.mask & (1 << U | 0)) !== 0
    }
}
var nJ = 0,
    QQ = new i,
    X$ = new UD,
    OD = new Dd,
    UH = new i,
    $0 = new i,
    sJ = new i,
    xJ = new UD,
    SQ = new i(1, 0, 0),
    JQ = new i(0, 1, 0),
    MQ = new i(0, 0, 1),
    BQ = {
        type: "added"
    },
    rJ = {
        type: "removed"
    },
    V$ = {
        type: "childadded",
        child: null
    },
    YP = {
        type: "childremoved",
        child: null
    };
class Xd extends nD {
    constructor() {
        super();
        this.isObject3D = !0, Object.defineProperty(this, "id", {
            value: nJ++
        }), this.uuid = kD(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = Xd.DEFAULT_UP.clone();
        let U = new i,
            d = new QD,
            D = new UD,
            $ = new i(1, 1, 1);

        function H() {
            D.setFromEuler(d, !1)
        }

        function P() {
            d.setFromQuaternion(D, void 0, !1)
        }
        d._onChange(H), D._onChange(P), Object.defineProperties(this, {
            position: {
                configurable: !0,
                enumerable: !0,
                value: U
            },
            rotation: {
                configurable: !0,
                enumerable: !0,
                value: d
            },
            quaternion: {
                configurable: !0,
                enumerable: !0,
                value: D
            },
            scale: {
                configurable: !0,
                enumerable: !0,
                value: $
            },
            modelViewMatrix: {
                value: new Dd
            },
            normalMatrix: {
                value: new vU
            }
        }), this.matrix = new Dd, this.matrixWorld = new Dd, this.matrixAutoUpdate = Xd.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = Xd.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new fH, this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {}
    }
    onBeforeShadow() {}
    onAfterShadow() {}
    onBeforeRender() {}
    onAfterRender() {}
    applyMatrix4(U) {
        if (this.matrixAutoUpdate) this.updateMatrix();
        this.matrix.premultiply(U), this.matrix.decompose(this.position, this.quaternion, this.scale)
    }
    applyQuaternion(U) {
        return this.quaternion.premultiply(U), this
    }
    setRotationFromAxisAngle(U, d) {
        this.quaternion.setFromAxisAngle(U, d)
    }
    setRotationFromEuler(U) {
        this.quaternion.setFromEuler(U, !0)
    }
    setRotationFromMatrix(U) {
        this.quaternion.setFromRotationMatrix(U)
    }
    setRotationFromQuaternion(U) {
        this.quaternion.copy(U)
    }
    rotateOnAxis(U, d) {
        return X$.setFromAxisAngle(U, d), this.quaternion.multiply(X$), this
    }
    rotateOnWorldAxis(U, d) {
        return X$.setFromAxisAngle(U, d), this.quaternion.premultiply(X$), this
    }
    rotateX(U) {
        return this.rotateOnAxis(SQ, U)
    }
    rotateY(U) {
        return this.rotateOnAxis(JQ, U)
    }
    rotateZ(U) {
        return this.rotateOnAxis(MQ, U)
    }
    translateOnAxis(U, d) {
        return QQ.copy(U).applyQuaternion(this.quaternion), this.position.add(QQ.multiplyScalar(d)), this
    }
    translateX(U) {
        return this.translateOnAxis(SQ, U)
    }
    translateY(U) {
        return this.translateOnAxis(JQ, U)
    }
    translateZ(U) {
        return this.translateOnAxis(MQ, U)
    }
    localToWorld(U) {
        return this.updateWorldMatrix(!0, !1), U.applyMatrix4(this.matrixWorld)
    }
    worldToLocal(U) {
        return this.updateWorldMatrix(!0, !1), U.applyMatrix4(OD.copy(this.matrixWorld).invert())
    }
    lookAt(U, d, D) {
        if (U.isVector3) UH.copy(U);
        else UH.set(U, d, D);
        let $ = this.parent;
        if (this.updateWorldMatrix(!0, !1), $0.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight) OD.lookAt($0, UH, this.up);
        else OD.lookAt(UH, $0, this.up);
        if (this.quaternion.setFromRotationMatrix(OD), $) OD.extractRotation($.matrixWorld), X$.setFromRotationMatrix(OD), this.quaternion.premultiply(X$.invert())
    }
    add(U) {
        if (arguments.length > 1) {
            for (let d = 0; d < arguments.length; d++) this.add(arguments[d]);
            return this
        }
        if (U === this) return console.error("THREE.Object3D.add: object can't be added as a child of itself.", U), this;
        if (U && U.isObject3D) U.removeFromParent(), U.parent = this, this.children.push(U), U.dispatchEvent(BQ), V$.child = U, this.dispatchEvent(V$), V$.child = null;
        else console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", U);
        return this
    }
    remove(U) {
        if (arguments.length > 1) {
            for (let D = 0; D < arguments.length; D++) this.remove(arguments[D]);
            return this
        }
        let d = this.children.indexOf(U);
        if (d !== -1) U.parent = null, this.children.splice(d, 1), U.dispatchEvent(rJ), YP.child = U, this.dispatchEvent(YP), YP.child = null;
        return this
    }
    removeFromParent() {
        let U = this.parent;
        if (U !== null) U.remove(this);
        return this
    }
    clear() {
        return this.remove(...this.children)
    }
    attach(U) {
        if (this.updateWorldMatrix(!0, !1), OD.copy(this.matrixWorld).invert(), U.parent !== null) U.parent.updateWorldMatrix(!0, !1), OD.multiply(U.parent.matrixWorld);
        return U.applyMatrix4(OD), U.removeFromParent(), U.parent = this, this.children.push(U), U.updateWorldMatrix(!1, !0), U.dispatchEvent(BQ), V$.child = U, this.dispatchEvent(V$), V$.child = null, this
    }
    getObjectById(U) {
        return this.getObjectByProperty("id", U)
    }
    getObjectByName(U) {
        return this.getObjectByProperty("name", U)
    }
    getObjectByProperty(U, d) {
        if (this[U] === d) return this;
        for (let D = 0, $ = this.children.length; D < $; D++) {
            let P = this.children[D].getObjectByProperty(U, d);
            if (P !== void 0) return P
        }
        return
    }
    getObjectsByProperty(U, d, D = []) {
        if (this[U] === d) D.push(this);
        let $ = this.children;
        for (let H = 0, P = $.length; H < P; H++) $[H].getObjectsByProperty(U, d, D);
        return D
    }
    getWorldPosition(U) {
        return this.updateWorldMatrix(!0, !1), U.setFromMatrixPosition(this.matrixWorld)
    }
    getWorldQuaternion(U) {
        return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose($0, U, sJ), U
    }
    getWorldScale(U) {
        return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose($0, xJ, U), U
    }
    getWorldDirection(U) {
        this.updateWorldMatrix(!0, !1);
        let d = this.matrixWorld.elements;
        return U.set(d[8], d[9], d[10]).normalize()
    }
    raycast() {}
    traverse(U) {
        U(this);
        let d = this.children;
        for (let D = 0, $ = d.length; D < $; D++) d[D].traverse(U)
    }
    traverseVisible(U) {
        if (this.visible === !1) return;
        U(this);
        let d = this.children;
        for (let D = 0, $ = d.length; D < $; D++) d[D].traverseVisible(U)
    }
    traverseAncestors(U) {
        let d = this.parent;
        if (d !== null) U(d), d.traverseAncestors(U)
    }
    updateMatrix() {
        this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0
    }
    updateMatrixWorld(U) {
        if (this.matrixAutoUpdate) this.updateMatrix();
        if (this.matrixWorldNeedsUpdate || U) {
            if (this.matrixWorldAutoUpdate === !0)
                if (this.parent === null) this.matrixWorld.copy(this.matrix);
                else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
            this.matrixWorldNeedsUpdate = !1, U = !0
        }
        let d = this.children;
        for (let D = 0, $ = d.length; D < $; D++) d[D].updateMatrixWorld(U)
    }
    updateWorldMatrix(U, d) {
        let D = this.parent;
        if (U === !0 && D !== null) D.updateWorldMatrix(!0, !1);
        if (this.matrixAutoUpdate) this.updateMatrix();
        if (this.matrixWorldAutoUpdate === !0)
            if (this.parent === null) this.matrixWorld.copy(this.matrix);
            else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
        if (d === !0) {
            let $ = this.children;
            for (let H = 0, P = $.length; H < P; H++) $[H].updateWorldMatrix(!1, !0)
        }
    }
    toJSON(U) {
        let d = U === void 0 || typeof U === "string",
            D = {};
        if (d) U = {
            geometries: {},
            materials: {},
            textures: {},
            images: {},
            shapes: {},
            skeletons: {},
            animations: {},
            nodes: {}
        }, D.metadata = {
            version: 4.6,
            type: "Object",
            generator: "Object3D.toJSON"
        };
        let $ = {};
        if ($.uuid = this.uuid, $.type = this.type, this.name !== "") $.name = this.name;
        if (this.castShadow === !0) $.castShadow = !0;
        if (this.receiveShadow === !0) $.receiveShadow = !0;
        if (this.visible === !1) $.visible = !1;
        if (this.frustumCulled === !1) $.frustumCulled = !1;
        if (this.renderOrder !== 0) $.renderOrder = this.renderOrder;
        if (Object.keys(this.userData).length > 0) $.userData = this.userData;
        if ($.layers = this.layers.mask, $.matrix = this.matrix.toArray(), $.up = this.up.toArray(), this.matrixAutoUpdate === !1) $.matrixAutoUpdate = !1;
        if (this.isInstancedMesh) {
            if ($.type = "InstancedMesh", $.count = this.count, $.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null) $.instanceColor = this.instanceColor.toJSON()
        }
        if (this.isBatchedMesh) {
            if ($.type = "BatchedMesh", $.perObjectFrustumCulled = this.perObjectFrustumCulled, $.sortObjects = this.sortObjects, $.drawRanges = this._drawRanges, $.reservedRanges = this._reservedRanges, $.visibility = this._visibility, $.active = this._active, $.bounds = this._bounds.map((T) => ({
                    boxInitialized: T.boxInitialized,
                    boxMin: T.box.min.toArray(),
                    boxMax: T.box.max.toArray(),
                    sphereInitialized: T.sphereInitialized,
                    sphereRadius: T.sphere.radius,
                    sphereCenter: T.sphere.center.toArray()
                })), $.maxInstanceCount = this._maxInstanceCount, $.maxVertexCount = this._maxVertexCount, $.maxIndexCount = this._maxIndexCount, $.geometryInitialized = this._geometryInitialized, $.geometryCount = this._geometryCount, $.matricesTexture = this._matricesTexture.toJSON(U), this._colorsTexture !== null) $.colorsTexture = this._colorsTexture.toJSON(U);
            if (this.boundingSphere !== null) $.boundingSphere = {
                center: $.boundingSphere.center.toArray(),
                radius: $.boundingSphere.radius
            };
            if (this.boundingBox !== null) $.boundingBox = {
                min: $.boundingBox.min.toArray(),
                max: $.boundingBox.max.toArray()
            }
        }

        function H(T, R) {
            if (T[R.uuid] === void 0) T[R.uuid] = R.toJSON(U);
            return R.uuid
        }
        if (this.isScene) {
            if (this.background) {
                if (this.background.isColor) $.background = this.background.toJSON();
                else if (this.background.isTexture) $.background = this.background.toJSON(U).uuid
            }
            if (this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0) $.environment = this.environment.toJSON(U).uuid
        } else if (this.isMesh || this.isLine || this.isPoints) {
            $.geometry = H(U.geometries, this.geometry);
            let T = this.geometry.parameters;
            if (T !== void 0 && T.shapes !== void 0) {
                let R = T.shapes;
                if (Array.isArray(R))
                    for (let J = 0, Q = R.length; J < Q; J++) {
                        let M = R[J];
                        H(U.shapes, M)
                    } else H(U.shapes, R)
            }
        }
        if (this.isSkinnedMesh) {
            if ($.bindMode = this.bindMode, $.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0) H(U.skeletons, this.skeleton), $.skeleton = this.skeleton.uuid
        }
        if (this.material !== void 0)
            if (Array.isArray(this.material)) {
                let T = [];
                for (let R = 0, J = this.material.length; R < J; R++) T.push(H(U.materials, this.material[R]));
                $.material = T
            } else $.material = H(U.materials, this.material);
        if (this.children.length > 0) {
            $.children = [];
            for (let T = 0; T < this.children.length; T++) $.children.push(this.children[T].toJSON(U).object)
        }
        if (this.animations.length > 0) {
            $.animations = [];
            for (let T = 0; T < this.animations.length; T++) {
                let R = this.animations[T];
                $.animations.push(H(U.animations, R))
            }
        }
        if (d) {
            let T = P(U.geometries),
                R = P(U.materials),
                J = P(U.textures),
                Q = P(U.images),
                M = P(U.shapes),
                S = P(U.skeletons),
                B = P(U.animations),
                L = P(U.nodes);
            if (T.length > 0) D.geometries = T;
            if (R.length > 0) D.materials = R;
            if (J.length > 0) D.textures = J;
            if (Q.length > 0) D.images = Q;
            if (M.length > 0) D.shapes = M;
            if (S.length > 0) D.skeletons = S;
            if (B.length > 0) D.animations = B;
            if (L.length > 0) D.nodes = L
        }
        return D.object = $, D;

        function P(T) {
            let R = [];
            for (let J in T) {
                let Q = T[J];
                delete Q.metadata, R.push(Q)
            }
            return R
        }
    }
    clone(U) {
        return new this.constructor().copy(this, U)
    }
    copy(U, d = !0) {
        if (this.name = U.name, this.up.copy(U.up), this.position.copy(U.position), this.rotation.order = U.rotation.order, this.quaternion.copy(U.quaternion), this.scale.copy(U.scale), this.matrix.copy(U.matrix), this.matrixWorld.copy(U.matrixWorld), this.matrixAutoUpdate = U.matrixAutoUpdate, this.matrixWorldAutoUpdate = U.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = U.matrixWorldNeedsUpdate, this.layers.mask = U.layers.mask, this.visible = U.visible, this.castShadow = U.castShadow, this.receiveShadow = U.receiveShadow, this.frustumCulled = U.frustumCulled, this.renderOrder = U.renderOrder, this.animations = U.animations.slice(), this.userData = JSON.parse(JSON.stringify(U.userData)), d === !0)
            for (let D = 0; D < U.children.length; D++) {
                let $ = U.children[D];
                this.add($.clone())
            }
        return this
    }
}
Xd.DEFAULT_UP = new i(0, 1, 0);
Xd.DEFAULT_MATRIX_AUTO_UPDATE = !0;
Xd.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
var TD = new i,
    WD = new i,
    XP = new i,
    GD = new i,
    F$ = new i,
    C$ = new i,
    LQ = new i,
    VP = new i,
    FP = new i,
    CP = new i,
    KP = new ad,
    fP = new ad,
    hP = new ad;
class td {
    constructor(U = new i, d = new i, D = new i) {
        this.a = U, this.b = d, this.c = D
    }
    static getNormal(U, d, D, $) {
        $.subVectors(D, d), TD.subVectors(U, d), $.cross(TD);
        let H = $.lengthSq();
        if (H > 0) return $.multiplyScalar(1 / Math.sqrt(H));
        return $.set(0, 0, 0)
    }
    static getBarycoord(U, d, D, $, H) {
        TD.subVectors($, d), WD.subVectors(D, d), XP.subVectors(U, d);
        let P = TD.dot(TD),
            T = TD.dot(WD),
            R = TD.dot(XP),
            J = WD.dot(WD),
            Q = WD.dot(XP),
            M = P * J - T * T;
        if (M === 0) return H.set(0, 0, 0), null;
        let S = 1 / M,
            B = (J * R - T * Q) * S,
            L = (P * Q - T * R) * S;
        return H.set(1 - B - L, L, B)
    }
    static containsPoint(U, d, D, $) {
        if (this.getBarycoord(U, d, D, $, GD) === null) return !1;
        return GD.x >= 0 && GD.y >= 0 && GD.x + GD.y <= 1
    }
    static getInterpolation(U, d, D, $, H, P, T, R) {
        if (this.getBarycoord(U, d, D, $, GD) === null) {
            if (R.x = 0, R.y = 0, "z" in R) R.z = 0;
            if ("w" in R) R.w = 0;
            return null
        }
        return R.setScalar(0), R.addScaledVector(H, GD.x), R.addScaledVector(P, GD.y), R.addScaledVector(T, GD.z), R
    }
    static getInterpolatedAttribute(U, d, D, $, H, P) {
        return KP.setScalar(0), fP.setScalar(0), hP.setScalar(0), KP.fromBufferAttribute(U, d), fP.fromBufferAttribute(U, D), hP.fromBufferAttribute(U, $), P.setScalar(0), P.addScaledVector(KP, H.x), P.addScaledVector(fP, H.y), P.addScaledVector(hP, H.z), P
    }
    static isFrontFacing(U, d, D, $) {
        return TD.subVectors(D, d), WD.subVectors(U, d), TD.cross(WD).dot($) < 0 ? !0 : !1
    }
    set(U, d, D) {
        return this.a.copy(U), this.b.copy(d), this.c.copy(D), this
    }
    setFromPointsAndIndices(U, d, D, $) {
        return this.a.copy(U[d]), this.b.copy(U[D]), this.c.copy(U[$]), this
    }
    setFromAttributeAndIndices(U, d, D, $) {
        return this.a.fromBufferAttribute(U, d), this.b.fromBufferAttribute(U, D), this.c.fromBufferAttribute(U, $), this
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(U) {
        return this.a.copy(U.a), this.b.copy(U.b), this.c.copy(U.c), this
    }
    getArea() {
        return TD.subVectors(this.c, this.b), WD.subVectors(this.a, this.b), TD.cross(WD).length() * 0.5
    }
    getMidpoint(U) {
        return U.addVectors(this.a, this.b).add(this.c).multiplyScalar(0.3333333333333333)
    }
    getNormal(U) {
        return td.getNormal(this.a, this.b, this.c, U)
    }
    getPlane(U) {
        return U.setFromCoplanarPoints(this.a, this.b, this.c)
    }
    getBarycoord(U, d) {
        return td.getBarycoord(U, this.a, this.b, this.c, d)
    }
    getInterpolation(U, d, D, $, H) {
        return td.getInterpolation(U, this.a, this.b, this.c, d, D, $, H)
    }
    containsPoint(U) {
        return td.containsPoint(U, this.a, this.b, this.c)
    }
    isFrontFacing(U) {
        return td.isFrontFacing(this.a, this.b, this.c, U)
    }
    intersectsBox(U) {
        return U.intersectsTriangle(this)
    }
    closestPointToPoint(U, d) {
        let D = this.a,
            $ = this.b,
            H = this.c,
            P, T;
        F$.subVectors($, D), C$.subVectors(H, D), VP.subVectors(U, D);
        let R = F$.dot(VP),
            J = C$.dot(VP);
        if (R <= 0 && J <= 0) return d.copy(D);
        FP.subVectors(U, $);
        let Q = F$.dot(FP),
            M = C$.dot(FP);
        if (Q >= 0 && M <= Q) return d.copy($);
        let S = R * M - Q * J;
        if (S <= 0 && R >= 0 && Q <= 0) return P = R / (R - Q), d.copy(D).addScaledVector(F$, P);
        CP.subVectors(U, H);
        let B = F$.dot(CP),
            L = C$.dot(CP);
        if (L >= 0 && B <= L) return d.copy(H);
        let E = B * J - R * L;
        if (E <= 0 && J >= 0 && L <= 0) return T = J / (J - L), d.copy(D).addScaledVector(C$, T);
        let k = Q * L - B * M;
        if (k <= 0 && M - Q >= 0 && B - L >= 0) return LQ.subVectors(H, $), T = (M - Q) / (M - Q + (B - L)), d.copy($).addScaledVector(LQ, T);
        let A = 1 / (k + E + S);
        return P = E * A, T = S * A, d.copy(D).addScaledVector(F$, P).addScaledVector(C$, T)
    }
    equals(U) {
        return U.a.equals(this.a) && U.b.equals(this.b) && U.c.equals(this.c)
    }
}
var J4 = {
        aliceblue: 15792383,
        antiquewhite: 16444375,
        aqua: 65535,
        aquamarine: 8388564,
        azure: 15794175,
        beige: 16119260,
        bisque: 16770244,
        black: 0,
        blanchedalmond: 16772045,
        blue: 255,
        blueviolet: 9055202,
        brown: 10824234,
        burlywood: 14596231,
        cadetblue: 6266528,
        chartreuse: 8388352,
        chocolate: 13789470,
        coral: 16744272,
        cornflowerblue: 6591981,
        cornsilk: 16775388,
        crimson: 14423100,
        cyan: 65535,
        darkblue: 139,
        darkcyan: 35723,
        darkgoldenrod: 12092939,
        darkgray: 11119017,
        darkgreen: 25600,
        darkgrey: 11119017,
        darkkhaki: 12433259,
        darkmagenta: 9109643,
        darkolivegreen: 5597999,
        darkorange: 16747520,
        darkorchid: 10040012,
        darkred: 9109504,
        darksalmon: 15308410,
        darkseagreen: 9419919,
        darkslateblue: 4734347,
        darkslategray: 3100495,
        darkslategrey: 3100495,
        darkturquoise: 52945,
        darkviolet: 9699539,
        deeppink: 16716947,
        deepskyblue: 49151,
        dimgray: 6908265,
        dimgrey: 6908265,
        dodgerblue: 2003199,
        firebrick: 11674146,
        floralwhite: 16775920,
        forestgreen: 2263842,
        fuchsia: 16711935,
        gainsboro: 14474460,
        ghostwhite: 16316671,
        gold: 16766720,
        goldenrod: 14329120,
        gray: 8421504,
        green: 32768,
        greenyellow: 11403055,
        grey: 8421504,
        honeydew: 15794160,
        hotpink: 16738740,
        indianred: 13458524,
        indigo: 4915330,
        ivory: 16777200,
        khaki: 15787660,
        lavender: 15132410,
        lavenderblush: 16773365,
        lawngreen: 8190976,
        lemonchiffon: 16775885,
        lightblue: 11393254,
        lightcoral: 15761536,
        lightcyan: 14745599,
        lightgoldenrodyellow: 16448210,
        lightgray: 13882323,
        lightgreen: 9498256,
        lightgrey: 13882323,
        lightpink: 16758465,
        lightsalmon: 16752762,
        lightseagreen: 2142890,
        lightskyblue: 8900346,
        lightslategray: 7833753,
        lightslategrey: 7833753,
        lightsteelblue: 11584734,
        lightyellow: 16777184,
        lime: 65280,
        limegreen: 3329330,
        linen: 16445670,
        magenta: 16711935,
        maroon: 8388608,
        mediumaquamarine: 6737322,
        mediumblue: 205,
        mediumorchid: 12211667,
        mediumpurple: 9662683,
        mediumseagreen: 3978097,
        mediumslateblue: 8087790,
        mediumspringgreen: 64154,
        mediumturquoise: 4772300,
        mediumvioletred: 13047173,
        midnightblue: 1644912,
        mintcream: 16121850,
        mistyrose: 16770273,
        moccasin: 16770229,
        navajowhite: 16768685,
        navy: 128,
        oldlace: 16643558,
        olive: 8421376,
        olivedrab: 7048739,
        orange: 16753920,
        orangered: 16729344,
        orchid: 14315734,
        palegoldenrod: 15657130,
        palegreen: 10025880,
        paleturquoise: 11529966,
        palevioletred: 14381203,
        papayawhip: 16773077,
        peachpuff: 16767673,
        peru: 13468991,
        pink: 16761035,
        plum: 14524637,
        powderblue: 11591910,
        purple: 8388736,
        rebeccapurple: 6697881,
        red: 16711680,
        rosybrown: 12357519,
        royalblue: 4286945,
        saddlebrown: 9127187,
        salmon: 16416882,
        sandybrown: 16032864,
        seagreen: 3050327,
        seashell: 16774638,
        sienna: 10506797,
        silver: 12632256,
        skyblue: 8900331,
        slateblue: 6970061,
        slategray: 7372944,
        slategrey: 7372944,
        snow: 16775930,
        springgreen: 65407,
        steelblue: 4620980,
        tan: 13808780,
        teal: 32896,
        thistle: 14204888,
        tomato: 16737095,
        turquoise: 4251856,
        violet: 15631086,
        wheat: 16113331,
        white: 16777215,
        whitesmoke: 16119285,
        yellow: 16776960,
        yellowgreen: 10145074
    },
    lD = {
        h: 0,
        s: 0,
        l: 0
    },
    dH = {
        h: 0,
        s: 0,
        l: 0
    };

function bP(U, d, D) {
    if (D < 0) D += 1;
    if (D > 1) D -= 1;
    if (D < 0.16666666666666666) return U + (d - U) * 6 * D;
    if (D < 0.5) return d;
    if (D < 0.6666666666666666) return U + (d - U) * 6 * (0.6666666666666666 - D);
    return U
}
class KU {
    constructor(U, d, D) {
        return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(U, d, D)
    }
    set(U, d, D) {
        if (d === void 0 && D === void 0) {
            let $ = U;
            if ($ && $.isColor) this.copy($);
            else if (typeof $ === "number") this.setHex($);
            else if (typeof $ === "string") this.setStyle($)
        } else this.setRGB(U, d, D);
        return this
    }
    setScalar(U) {
        return this.r = U, this.g = U, this.b = U, this
    }
    setHex(U, d = "srgb") {
        return U = Math.floor(U), this.r = (U >> 16 & 255) / 255, this.g = (U >> 8 & 255) / 255, this.b = (U & 255) / 255, dd.toWorkingColorSpace(this, d), this
    }
    setRGB(U, d, D, $ = dd.workingColorSpace) {
        return this.r = U, this.g = d, this.b = D, dd.toWorkingColorSpace(this, $), this
    }
    setHSL(U, d, D, $ = dd.workingColorSpace) {
        if (U = UT(U, 1), d = bd(d, 0, 1), D = bd(D, 0, 1), d === 0) this.r = this.g = this.b = D;
        else {
            let H = D <= 0.5 ? D * (1 + d) : D + d - D * d,
                P = 2 * D - H;
            this.r = bP(P, H, U + 0.3333333333333333), this.g = bP(P, H, U), this.b = bP(P, H, U - 0.3333333333333333)
        }
        return dd.toWorkingColorSpace(this, $), this
    }
    setStyle(U, d = "srgb") {
        function D(H) {
            if (H === void 0) return;
            if (parseFloat(H) < 1) console.warn("THREE.Color: Alpha component of " + U + " will be ignored.")
        }
        let $;
        if ($ = /^(\w+)\(([^\)]*)\)/.exec(U)) {
            let H, P = $[1],
                T = $[2];
            switch (P) {
                case "rgb":
                case "rgba":
                    if (H = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(T)) return D(H[4]), this.setRGB(Math.min(255, parseInt(H[1], 10)) / 255, Math.min(255, parseInt(H[2], 10)) / 255, Math.min(255, parseInt(H[3], 10)) / 255, d);
                    if (H = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(T)) return D(H[4]), this.setRGB(Math.min(100, parseInt(H[1], 10)) / 100, Math.min(100, parseInt(H[2], 10)) / 100, Math.min(100, parseInt(H[3], 10)) / 100, d);
                    break;
                case "hsl":
                case "hsla":
                    if (H = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(T)) return D(H[4]), this.setHSL(parseFloat(H[1]) / 360, parseFloat(H[2]) / 100, parseFloat(H[3]) / 100, d);
                    break;
                default:
                    console.warn("THREE.Color: Unknown color model " + U)
            }
        } else if ($ = /^\#([A-Fa-f\d]+)$/.exec(U)) {
            let H = $[1],
                P = H.length;
            if (P === 3) return this.setRGB(parseInt(H.charAt(0), 16) / 15, parseInt(H.charAt(1), 16) / 15, parseInt(H.charAt(2), 16) / 15, d);
            else if (P === 6) return this.setHex(parseInt(H, 16), d);
            else console.warn("THREE.Color: Invalid hex color " + U)
        } else if (U && U.length > 0) return this.setColorName(U, d);
        return this
    }
    setColorName(U, d = "srgb") {
        let D = J4[U.toLowerCase()];
        if (D !== void 0) this.setHex(D, d);
        else console.warn("THREE.Color: Unknown color " + U);
        return this
    }
    clone() {
        return new this.constructor(this.r, this.g, this.b)
    }
    copy(U) {
        return this.r = U.r, this.g = U.g, this.b = U.b, this
    }
    copySRGBToLinear(U) {
        return this.r = mD(U.r), this.g = mD(U.g), this.b = mD(U.b), this
    }
    copyLinearToSRGB(U) {
        return this.r = N$(U.r), this.g = N$(U.g), this.b = N$(U.b), this
    }
    convertSRGBToLinear() {
        return this.copySRGBToLinear(this), this
    }
    convertLinearToSRGB() {
        return this.copyLinearToSRGB(this), this
    }
    getHex(U = "srgb") {
        return dd.fromWorkingColorSpace(md.copy(this), U), Math.round(bd(md.r * 255, 0, 255)) * 65536 + Math.round(bd(md.g * 255, 0, 255)) * 256 + Math.round(bd(md.b * 255, 0, 255))
    }
    getHexString(U = "srgb") {
        return ("000000" + this.getHex(U).toString(16)).slice(-6)
    }
    getHSL(U, d = dd.workingColorSpace) {
        dd.fromWorkingColorSpace(md.copy(this), d);
        let {
            r: D,
            g: $,
            b: H
        } = md, P = Math.max(D, $, H), T = Math.min(D, $, H), R, J, Q = (T + P) / 2;
        if (T === P) R = 0, J = 0;
        else {
            let M = P - T;
            switch (J = Q <= 0.5 ? M / (P + T) : M / (2 - P - T), P) {
                case D:
                    R = ($ - H) / M + ($ < H ? 6 : 0);
                    break;
                case $:
                    R = (H - D) / M + 2;
                    break;
                case H:
                    R = (D - $) / M + 4;
                    break
            }
            R /= 6
        }
        return U.h = R, U.s = J, U.l = Q, U
    }
    getRGB(U, d = dd.workingColorSpace) {
        return dd.fromWorkingColorSpace(md.copy(this), d), U.r = md.r, U.g = md.g, U.b = md.b, U
    }
    getStyle(U = "srgb") {
        dd.fromWorkingColorSpace(md.copy(this), U);
        let {
            r: d,
            g: D,
            b: $
        } = md;
        if (U !== "srgb") return `color(${U} ${d.toFixed(3)} ${D.toFixed(3)} ${$.toFixed(3)})`;
        return `rgb(${Math.round(d*255)},${Math.round(D*255)},${Math.round($*255)})`
    }
    offsetHSL(U, d, D) {
        return this.getHSL(lD), this.setHSL(lD.h + U, lD.s + d, lD.l + D)
    }
    add(U) {
        return this.r += U.r, this.g += U.g, this.b += U.b, this
    }
    addColors(U, d) {
        return this.r = U.r + d.r, this.g = U.g + d.g, this.b = U.b + d.b, this
    }
    addScalar(U) {
        return this.r += U, this.g += U, this.b += U, this
    }
    sub(U) {
        return this.r = Math.max(0, this.r - U.r), this.g = Math.max(0, this.g - U.g), this.b = Math.max(0, this.b - U.b), this
    }
    multiply(U) {
        return this.r *= U.r, this.g *= U.g, this.b *= U.b, this
    }
    multiplyScalar(U) {
        return this.r *= U, this.g *= U, this.b *= U, this
    }
    lerp(U, d) {
        return this.r += (U.r - this.r) * d, this.g += (U.g - this.g) * d, this.b += (U.b - this.b) * d, this
    }
    lerpColors(U, d, D) {
        return this.r = U.r + (d.r - U.r) * D, this.g = U.g + (d.g - U.g) * D, this.b = U.b + (d.b - U.b) * D, this
    }
    lerpHSL(U, d) {
        this.getHSL(lD), U.getHSL(dH);
        let D = L0(lD.h, dH.h, d),
            $ = L0(lD.s, dH.s, d),
            H = L0(lD.l, dH.l, d);
        return this.setHSL(D, $, H), this
    }
    setFromVector3(U) {
        return this.r = U.x, this.g = U.y, this.b = U.z, this
    }
    applyMatrix3(U) {
        let d = this.r,
            D = this.g,
            $ = this.b,
            H = U.elements;
        return this.r = H[0] * d + H[3] * D + H[6] * $, this.g = H[1] * d + H[4] * D + H[7] * $, this.b = H[2] * d + H[5] * D + H[8] * $, this
    }
    equals(U) {
        return U.r === this.r && U.g === this.g && U.b === this.b
    }
    fromArray(U, d = 0) {
        return this.r = U[d], this.g = U[d + 1], this.b = U[d + 2], this
    }
    toArray(U = [], d = 0) {
        return U[d] = this.r, U[d + 1] = this.g, U[d + 2] = this.b, U
    }
    fromBufferAttribute(U, d) {
        return this.r = U.getX(d), this.g = U.getY(d), this.b = U.getZ(d), this
    }
    toJSON() {
        return this.getHex()
    }*[Symbol.iterator]() {
        yield this.r, yield this.g, yield this.b
    }
}
var md = new KU;
KU.NAMES = J4;
var tJ = 0;
class uD extends nD {
    static get type() {
        return "Material"
    }
    get type() {
        return this.constructor.type
    }
    set type(U) {}
    constructor() {
        super();
        this.isMaterial = !0, Object.defineProperty(this, "id", {
            value: tJ++
        }), this.uuid = kD(), this.name = "", this.blending = 1, this.side = 0, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = 204, this.blendDst = 205, this.blendEquation = 100, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new KU(0, 0, 0), this.blendAlpha = 0, this.depthFunc = 3, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = 519, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = 7680, this.stencilZFail = 7680, this.stencilZPass = 7680, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0
    }
    get alphaTest() {
        return this._alphaTest
    }
    set alphaTest(U) {
        if (this._alphaTest > 0 !== U > 0) this.version++;
        this._alphaTest = U
    }
    onBeforeRender() {}
    onBeforeCompile() {}
    customProgramCacheKey() {
        return this.onBeforeCompile.toString()
    }
    setValues(U) {
        if (U === void 0) return;
        for (let d in U) {
            let D = U[d];
            if (D === void 0) {
                console.warn(`THREE.Material: parameter '${d}' has value of undefined.`);
                continue
            }
            let $ = this[d];
            if ($ === void 0) {
                console.warn(`THREE.Material: '${d}' is not a property of THREE.${this.type}.`);
                continue
            }
            if ($ && $.isColor) $.set(D);
            else if ($ && $.isVector3 && (D && D.isVector3)) $.copy(D);
            else this[d] = D
        }
    }
    toJSON(U) {
        let d = U === void 0 || typeof U === "string";
        if (d) U = {
            textures: {},
            images: {}
        };
        let D = {
            metadata: {
                version: 4.6,
                type: "Material",
                generator: "Material.toJSON"
            }
        };
        if (D.uuid = this.uuid, D.type = this.type, this.name !== "") D.name = this.name;
        if (this.color && this.color.isColor) D.color = this.color.getHex();
        if (this.roughness !== void 0) D.roughness = this.roughness;
        if (this.metalness !== void 0) D.metalness = this.metalness;
        if (this.sheen !== void 0) D.sheen = this.sheen;
        if (this.sheenColor && this.sheenColor.isColor) D.sheenColor = this.sheenColor.getHex();
        if (this.sheenRoughness !== void 0) D.sheenRoughness = this.sheenRoughness;
        if (this.emissive && this.emissive.isColor) D.emissive = this.emissive.getHex();
        if (this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1) D.emissiveIntensity = this.emissiveIntensity;
        if (this.specular && this.specular.isColor) D.specular = this.specular.getHex();
        if (this.specularIntensity !== void 0) D.specularIntensity = this.specularIntensity;
        if (this.specularColor && this.specularColor.isColor) D.specularColor = this.specularColor.getHex();
        if (this.shininess !== void 0) D.shininess = this.shininess;
        if (this.clearcoat !== void 0) D.clearcoat = this.clearcoat;
        if (this.clearcoatRoughness !== void 0) D.clearcoatRoughness = this.clearcoatRoughness;
        if (this.clearcoatMap && this.clearcoatMap.isTexture) D.clearcoatMap = this.clearcoatMap.toJSON(U).uuid;
        if (this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture) D.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(U).uuid;
        if (this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture) D.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(U).uuid, D.clearcoatNormalScale = this.clearcoatNormalScale.toArray();
        if (this.dispersion !== void 0) D.dispersion = this.dispersion;
        if (this.iridescence !== void 0) D.iridescence = this.iridescence;
        if (this.iridescenceIOR !== void 0) D.iridescenceIOR = this.iridescenceIOR;
        if (this.iridescenceThicknessRange !== void 0) D.iridescenceThicknessRange = this.iridescenceThicknessRange;
        if (this.iridescenceMap && this.iridescenceMap.isTexture) D.iridescenceMap = this.iridescenceMap.toJSON(U).uuid;
        if (this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture) D.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(U).uuid;
        if (this.anisotropy !== void 0) D.anisotropy = this.anisotropy;
        if (this.anisotropyRotation !== void 0) D.anisotropyRotation = this.anisotropyRotation;
        if (this.anisotropyMap && this.anisotropyMap.isTexture) D.anisotropyMap = this.anisotropyMap.toJSON(U).uuid;
        if (this.map && this.map.isTexture) D.map = this.map.toJSON(U).uuid;
        if (this.matcap && this.matcap.isTexture) D.matcap = this.matcap.toJSON(U).uuid;
        if (this.alphaMap && this.alphaMap.isTexture) D.alphaMap = this.alphaMap.toJSON(U).uuid;
        if (this.lightMap && this.lightMap.isTexture) D.lightMap = this.lightMap.toJSON(U).uuid, D.lightMapIntensity = this.lightMapIntensity;
        if (this.aoMap && this.aoMap.isTexture) D.aoMap = this.aoMap.toJSON(U).uuid, D.aoMapIntensity = this.aoMapIntensity;
        if (this.bumpMap && this.bumpMap.isTexture) D.bumpMap = this.bumpMap.toJSON(U).uuid, D.bumpScale = this.bumpScale;
        if (this.normalMap && this.normalMap.isTexture) D.normalMap = this.normalMap.toJSON(U).uuid, D.normalMapType = this.normalMapType, D.normalScale = this.normalScale.toArray();
        if (this.displacementMap && this.displacementMap.isTexture) D.displacementMap = this.displacementMap.toJSON(U).uuid, D.displacementScale = this.displacementScale, D.displacementBias = this.displacementBias;
        if (this.roughnessMap && this.roughnessMap.isTexture) D.roughnessMap = this.roughnessMap.toJSON(U).uuid;
        if (this.metalnessMap && this.metalnessMap.isTexture) D.metalnessMap = this.metalnessMap.toJSON(U).uuid;
        if (this.emissiveMap && this.emissiveMap.isTexture) D.emissiveMap = this.emissiveMap.toJSON(U).uuid;
        if (this.specularMap && this.specularMap.isTexture) D.specularMap = this.specularMap.toJSON(U).uuid;
        if (this.specularIntensityMap && this.specularIntensityMap.isTexture) D.specularIntensityMap = this.specularIntensityMap.toJSON(U).uuid;
        if (this.specularColorMap && this.specularColorMap.isTexture) D.specularColorMap = this.specularColorMap.toJSON(U).uuid;
        if (this.envMap && this.envMap.isTexture) {
            if (D.envMap = this.envMap.toJSON(U).uuid, this.combine !== void 0) D.combine = this.combine
        }
        if (this.envMapRotation !== void 0) D.envMapRotation = this.envMapRotation.toArray();
        if (this.envMapIntensity !== void 0) D.envMapIntensity = this.envMapIntensity;
        if (this.reflectivity !== void 0) D.reflectivity = this.reflectivity;
        if (this.refractionRatio !== void 0) D.refractionRatio = this.refractionRatio;
        if (this.gradientMap && this.gradientMap.isTexture) D.gradientMap = this.gradientMap.toJSON(U).uuid;
        if (this.transmission !== void 0) D.transmission = this.transmission;
        if (this.transmissionMap && this.transmissionMap.isTexture) D.transmissionMap = this.transmissionMap.toJSON(U).uuid;
        if (this.thickness !== void 0) D.thickness = this.thickness;
        if (this.thicknessMap && this.thicknessMap.isTexture) D.thicknessMap = this.thicknessMap.toJSON(U).uuid;
        if (this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0) D.attenuationDistance = this.attenuationDistance;
        if (this.attenuationColor !== void 0) D.attenuationColor = this.attenuationColor.getHex();
        if (this.size !== void 0) D.size = this.size;
        if (this.shadowSide !== null) D.shadowSide = this.shadowSide;
        if (this.sizeAttenuation !== void 0) D.sizeAttenuation = this.sizeAttenuation;
        if (this.blending !== 1) D.blending = this.blending;
        if (this.side !== 0) D.side = this.side;
        if (this.vertexColors === !0) D.vertexColors = !0;
        if (this.opacity < 1) D.opacity = this.opacity;
        if (this.transparent === !0) D.transparent = !0;
        if (this.blendSrc !== 204) D.blendSrc = this.blendSrc;
        if (this.blendDst !== 205) D.blendDst = this.blendDst;
        if (this.blendEquation !== 100) D.blendEquation = this.blendEquation;
        if (this.blendSrcAlpha !== null) D.blendSrcAlpha = this.blendSrcAlpha;
        if (this.blendDstAlpha !== null) D.blendDstAlpha = this.blendDstAlpha;
        if (this.blendEquationAlpha !== null) D.blendEquationAlpha = this.blendEquationAlpha;
        if (this.blendColor && this.blendColor.isColor) D.blendColor = this.blendColor.getHex();
        if (this.blendAlpha !== 0) D.blendAlpha = this.blendAlpha;
        if (this.depthFunc !== 3) D.depthFunc = this.depthFunc;
        if (this.depthTest === !1) D.depthTest = this.depthTest;
        if (this.depthWrite === !1) D.depthWrite = this.depthWrite;
        if (this.colorWrite === !1) D.colorWrite = this.colorWrite;
        if (this.stencilWriteMask !== 255) D.stencilWriteMask = this.stencilWriteMask;
        if (this.stencilFunc !== 519) D.stencilFunc = this.stencilFunc;
        if (this.stencilRef !== 0) D.stencilRef = this.stencilRef;
        if (this.stencilFuncMask !== 255) D.stencilFuncMask = this.stencilFuncMask;
        if (this.stencilFail !== 7680) D.stencilFail = this.stencilFail;
        if (this.stencilZFail !== 7680) D.stencilZFail = this.stencilZFail;
        if (this.stencilZPass !== 7680) D.stencilZPass = this.stencilZPass;
        if (this.stencilWrite === !0) D.stencilWrite = this.stencilWrite;
        if (this.rotation !== void 0 && this.rotation !== 0) D.rotation = this.rotation;
        if (this.polygonOffset === !0) D.polygonOffset = !0;
        if (this.polygonOffsetFactor !== 0) D.polygonOffsetFactor = this.polygonOffsetFactor;
        if (this.polygonOffsetUnits !== 0) D.polygonOffsetUnits = this.polygonOffsetUnits;
        if (this.linewidth !== void 0 && this.linewidth !== 1) D.linewidth = this.linewidth;
        if (this.dashSize !== void 0) D.dashSize = this.dashSize;
        if (this.gapSize !== void 0) D.gapSize = this.gapSize;
        if (this.scale !== void 0) D.scale = this.scale;
        if (this.dithering === !0) D.dithering = !0;
        if (this.alphaTest > 0) D.alphaTest = this.alphaTest;
        if (this.alphaHash === !0) D.alphaHash = !0;
        if (this.alphaToCoverage === !0) D.alphaToCoverage = !0;
        if (this.premultipliedAlpha === !0) D.premultipliedAlpha = !0;
        if (this.forceSinglePass === !0) D.forceSinglePass = !0;
        if (this.wireframe === !0) D.wireframe = !0;
        if (this.wireframeLinewidth > 1) D.wireframeLinewidth = this.wireframeLinewidth;
        if (this.wireframeLinecap !== "round") D.wireframeLinecap = this.wireframeLinecap;
        if (this.wireframeLinejoin !== "round") D.wireframeLinejoin = this.wireframeLinejoin;
        if (this.flatShading === !0) D.flatShading = !0;
        if (this.visible === !1) D.visible = !1;
        if (this.toneMapped === !1) D.toneMapped = !1;
        if (this.fog === !1) D.fog = !1;
        if (Object.keys(this.userData).length > 0) D.userData = this.userData;

        function $(H) {
            let P = [];
            for (let T in H) {
                let R = H[T];
                delete R.metadata, P.push(R)
            }
            return P
        }
        if (d) {
            let H = $(U.textures),
                P = $(U.images);
            if (H.length > 0) D.textures = H;
            if (P.length > 0) D.images = P
        }
        return D
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(U) {
        this.name = U.name, this.blending = U.blending, this.side = U.side, this.vertexColors = U.vertexColors, this.opacity = U.opacity, this.transparent = U.transparent, this.blendSrc = U.blendSrc, this.blendDst = U.blendDst, this.blendEquation = U.blendEquation, this.blendSrcAlpha = U.blendSrcAlpha, this.blendDstAlpha = U.blendDstAlpha, this.blendEquationAlpha = U.blendEquationAlpha, this.blendColor.copy(U.blendColor), this.blendAlpha = U.blendAlpha, this.depthFunc = U.depthFunc, this.depthTest = U.depthTest, this.depthWrite = U.depthWrite, this.stencilWriteMask = U.stencilWriteMask, this.stencilFunc = U.stencilFunc, this.stencilRef = U.stencilRef, this.stencilFuncMask = U.stencilFuncMask, this.stencilFail = U.stencilFail, this.stencilZFail = U.stencilZFail, this.stencilZPass = U.stencilZPass, this.stencilWrite = U.stencilWrite;
        let d = U.clippingPlanes,
            D = null;
        if (d !== null) {
            let $ = d.length;
            D = Array($);
            for (let H = 0; H !== $; ++H) D[H] = d[H].clone()
        }
        return this.clippingPlanes = D, this.clipIntersection = U.clipIntersection, this.clipShadows = U.clipShadows, this.shadowSide = U.shadowSide, this.colorWrite = U.colorWrite, this.precision = U.precision, this.polygonOffset = U.polygonOffset, this.polygonOffsetFactor = U.polygonOffsetFactor, this.polygonOffsetUnits = U.polygonOffsetUnits, this.dithering = U.dithering, this.alphaTest = U.alphaTest, this.alphaHash = U.alphaHash, this.alphaToCoverage = U.alphaToCoverage, this.premultipliedAlpha = U.premultipliedAlpha, this.forceSinglePass = U.forceSinglePass, this.visible = U.visible, this.toneMapped = U.toneMapped, this.userData = JSON.parse(JSON.stringify(U.userData)), this
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
    set needsUpdate(U) {
        if (U === !0) this.version++
    }
    onBuild() {
        console.warn("Material: onBuild() has been removed.")
    }
}
class ND extends uD {
    static get type() {
        return "MeshBasicMaterial"
    }
    constructor(U) {
        super();
        this.isMeshBasicMaterial = !0, this.color = new KU(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new QD, this.combine = 0, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(U)
    }
    copy(U) {
        return super.copy(U), this.color.copy(U.color), this.map = U.map, this.lightMap = U.lightMap, this.lightMapIntensity = U.lightMapIntensity, this.aoMap = U.aoMap, this.aoMapIntensity = U.aoMapIntensity, this.specularMap = U.specularMap, this.alphaMap = U.alphaMap, this.envMap = U.envMap, this.envMapRotation.copy(U.envMapRotation), this.combine = U.combine, this.reflectivity = U.reflectivity, this.refractionRatio = U.refractionRatio, this.wireframe = U.wireframe, this.wireframeLinewidth = U.wireframeLinewidth, this.wireframeLinecap = U.wireframeLinecap, this.wireframeLinejoin = U.wireframeLinejoin, this.fog = U.fog, this
    }
}
var Vd = new i,
    DH = new dU;
class Wd {
    constructor(U, d, D = !1) {
        if (Array.isArray(U)) throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");
        this.isBufferAttribute = !0, this.name = "", this.array = U, this.itemSize = d, this.count = U !== void 0 ? U.length / d : 0, this.normalized = D, this.usage = 35044, this.updateRanges = [], this.gpuType = 1015, this.version = 0
    }
    onUploadCallback() {}
    set needsUpdate(U) {
        if (U === !0) this.version++
    }
    setUsage(U) {
        return this.usage = U, this
    }
    addUpdateRange(U, d) {
        this.updateRanges.push({
            start: U,
            count: d
        })
    }
    clearUpdateRanges() {
        this.updateRanges.length = 0
    }
    copy(U) {
        return this.name = U.name, this.array = new U.array.constructor(U.array), this.itemSize = U.itemSize, this.count = U.count, this.normalized = U.normalized, this.usage = U.usage, this.gpuType = U.gpuType, this
    }
    copyAt(U, d, D) {
        U *= this.itemSize, D *= d.itemSize;
        for (let $ = 0, H = this.itemSize; $ < H; $++) this.array[U + $] = d.array[D + $];
        return this
    }
    copyArray(U) {
        return this.array.set(U), this
    }
    applyMatrix3(U) {
        if (this.itemSize === 2)
            for (let d = 0, D = this.count; d < D; d++) DH.fromBufferAttribute(this, d), DH.applyMatrix3(U), this.setXY(d, DH.x, DH.y);
        else if (this.itemSize === 3)
            for (let d = 0, D = this.count; d < D; d++) Vd.fromBufferAttribute(this, d), Vd.applyMatrix3(U), this.setXYZ(d, Vd.x, Vd.y, Vd.z);
        return this
    }
    applyMatrix4(U) {
        for (let d = 0, D = this.count; d < D; d++) Vd.fromBufferAttribute(this, d), Vd.applyMatrix4(U), this.setXYZ(d, Vd.x, Vd.y, Vd.z);
        return this
    }
    applyNormalMatrix(U) {
        for (let d = 0, D = this.count; d < D; d++) Vd.fromBufferAttribute(this, d), Vd.applyNormalMatrix(U), this.setXYZ(d, Vd.x, Vd.y, Vd.z);
        return this
    }
    transformDirection(U) {
        for (let d = 0, D = this.count; d < D; d++) Vd.fromBufferAttribute(this, d), Vd.transformDirection(U), this.setXYZ(d, Vd.x, Vd.y, Vd.z);
        return this
    }
    set(U, d = 0) {
        return this.array.set(U, d), this
    }
    getComponent(U, d) {
        let D = this.array[U * this.itemSize + d];
        if (this.normalized) D = RD(D, this.array);
        return D
    }
    setComponent(U, d, D) {
        if (this.normalized) D = Qd(D, this.array);
        return this.array[U * this.itemSize + d] = D, this
    }
    getX(U) {
        let d = this.array[U * this.itemSize];
        if (this.normalized) d = RD(d, this.array);
        return d
    }
    setX(U, d) {
        if (this.normalized) d = Qd(d, this.array);
        return this.array[U * this.itemSize] = d, this
    }
    getY(U) {
        let d = this.array[U * this.itemSize + 1];
        if (this.normalized) d = RD(d, this.array);
        return d
    }
    setY(U, d) {
        if (this.normalized) d = Qd(d, this.array);
        return this.array[U * this.itemSize + 1] = d, this
    }
    getZ(U) {
        let d = this.array[U * this.itemSize + 2];
        if (this.normalized) d = RD(d, this.array);
        return d
    }
    setZ(U, d) {
        if (this.normalized) d = Qd(d, this.array);
        return this.array[U * this.itemSize + 2] = d, this
    }
    getW(U) {
        let d = this.array[U * this.itemSize + 3];
        if (this.normalized) d = RD(d, this.array);
        return d
    }
    setW(U, d) {
        if (this.normalized) d = Qd(d, this.array);
        return this.array[U * this.itemSize + 3] = d, this
    }
    setXY(U, d, D) {
        if (U *= this.itemSize, this.normalized) d = Qd(d, this.array), D = Qd(D, this.array);
        return this.array[U + 0] = d, this.array[U + 1] = D, this
    }
    setXYZ(U, d, D, $) {
        if (U *= this.itemSize, this.normalized) d = Qd(d, this.array), D = Qd(D, this.array), $ = Qd($, this.array);
        return this.array[U + 0] = d, this.array[U + 1] = D, this.array[U + 2] = $, this
    }
    setXYZW(U, d, D, $, H) {
        if (U *= this.itemSize, this.normalized) d = Qd(d, this.array), D = Qd(D, this.array), $ = Qd($, this.array), H = Qd(H, this.array);
        return this.array[U + 0] = d, this.array[U + 1] = D, this.array[U + 2] = $, this.array[U + 3] = H, this
    }
    onUpload(U) {
        return this.onUploadCallback = U, this
    }
    clone() {
        return new this.constructor(this.array, this.itemSize).copy(this)
    }
    toJSON() {
        let U = {
            itemSize: this.itemSize,
            type: this.array.constructor.name,
            array: Array.from(this.array),
            normalized: this.normalized
        };
        if (this.name !== "") U.name = this.name;
        if (this.usage !== 35044) U.usage = this.usage;
        return U
    }
}
class $T extends Wd {
    constructor(U, d, D) {
        super(new Uint16Array(U), d, D)
    }
}
class HT extends Wd {
    constructor(U, d, D) {
        super(new Uint32Array(U), d, D)
    }
}
class Rd extends Wd {
    constructor(U, d, D) {
        super(new Float32Array(U), d, D)
    }
}
var UM = 0,
    rd = new Dd,
    iP = new Xd,
    K$ = new i,
    od = new sD,
    H0 = new sD,
    hd = new i;
class Fd extends nD {
    constructor() {
        super();
        this.isBufferGeometry = !0, Object.defineProperty(this, "id", {
            value: UM++
        }), this.uuid = kD(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
            start: 0,
            count: 1 / 0
        }, this.userData = {}
    }
    getIndex() {
        return this.index
    }
    setIndex(U) {
        if (Array.isArray(U)) this.index = new((T4(U)) ? HT : $T)(U, 1);
        else this.index = U;
        return this
    }
    setIndirect(U) {
        return this.indirect = U, this
    }
    getIndirect() {
        return this.indirect
    }
    getAttribute(U) {
        return this.attributes[U]
    }
    setAttribute(U, d) {
        return this.attributes[U] = d, this
    }
    deleteAttribute(U) {
        return delete this.attributes[U], this
    }
    hasAttribute(U) {
        return this.attributes[U] !== void 0
    }
    addGroup(U, d, D = 0) {
        this.groups.push({
            start: U,
            count: d,
            materialIndex: D
        })
    }
    clearGroups() {
        this.groups = []
    }
    setDrawRange(U, d) {
        this.drawRange.start = U, this.drawRange.count = d
    }
    applyMatrix4(U) {
        let d = this.attributes.position;
        if (d !== void 0) d.applyMatrix4(U), d.needsUpdate = !0;
        let D = this.attributes.normal;
        if (D !== void 0) {
            let H = new vU().getNormalMatrix(U);
            D.applyNormalMatrix(H), D.needsUpdate = !0
        }
        let $ = this.attributes.tangent;
        if ($ !== void 0) $.transformDirection(U), $.needsUpdate = !0;
        if (this.boundingBox !== null) this.computeBoundingBox();
        if (this.boundingSphere !== null) this.computeBoundingSphere();
        return this
    }
    applyQuaternion(U) {
        return rd.makeRotationFromQuaternion(U), this.applyMatrix4(rd), this
    }
    rotateX(U) {
        return rd.makeRotationX(U), this.applyMatrix4(rd), this
    }
    rotateY(U) {
        return rd.makeRotationY(U), this.applyMatrix4(rd), this
    }
    rotateZ(U) {
        return rd.makeRotationZ(U), this.applyMatrix4(rd), this
    }
    translate(U, d, D) {
        return rd.makeTranslation(U, d, D), this.applyMatrix4(rd), this
    }
    scale(U, d, D) {
        return rd.makeScale(U, d, D), this.applyMatrix4(rd), this
    }
    lookAt(U) {
        return iP.lookAt(U), iP.updateMatrix(), this.applyMatrix4(iP.matrix), this
    }
    center() {
        return this.computeBoundingBox(), this.boundingBox.getCenter(K$).negate(), this.translate(K$.x, K$.y, K$.z), this
    }
    setFromPoints(U) {
        let d = this.getAttribute("position");
        if (d === void 0) {
            let D = [];
            for (let $ = 0, H = U.length; $ < H; $++) {
                let P = U[$];
                D.push(P.x, P.y, P.z || 0)
            }
            this.setAttribute("position", new Rd(D, 3))
        } else {
            for (let D = 0, $ = d.count; D < $; D++) {
                let H = U[D];
                d.setXYZ(D, H.x, H.y, H.z || 0)
            }
            if (U.length > d.count) console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");
            d.needsUpdate = !0
        }
        return this
    }
    computeBoundingBox() {
        if (this.boundingBox === null) this.boundingBox = new sD;
        let U = this.attributes.position,
            d = this.morphAttributes.position;
        if (U && U.isGLBufferAttribute) {
            console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new i(-1 / 0, -1 / 0, -1 / 0), new i(1 / 0, 1 / 0, 1 / 0));
            return
        }
        if (U !== void 0) {
            if (this.boundingBox.setFromBufferAttribute(U), d)
                for (let D = 0, $ = d.length; D < $; D++) {
                    let H = d[D];
                    if (od.setFromBufferAttribute(H), this.morphTargetsRelative) hd.addVectors(this.boundingBox.min, od.min), this.boundingBox.expandByPoint(hd), hd.addVectors(this.boundingBox.max, od.max), this.boundingBox.expandByPoint(hd);
                    else this.boundingBox.expandByPoint(od.min), this.boundingBox.expandByPoint(od.max)
                }
        } else this.boundingBox.makeEmpty();
        if (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this)
    }
    computeBoundingSphere() {
        if (this.boundingSphere === null) this.boundingSphere = new J$;
        let U = this.attributes.position,
            d = this.morphAttributes.position;
        if (U && U.isGLBufferAttribute) {
            console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new i, 1 / 0);
            return
        }
        if (U) {
            let D = this.boundingSphere.center;
            if (od.setFromBufferAttribute(U), d)
                for (let H = 0, P = d.length; H < P; H++) {
                    let T = d[H];
                    if (H0.setFromBufferAttribute(T), this.morphTargetsRelative) hd.addVectors(od.min, H0.min), od.expandByPoint(hd), hd.addVectors(od.max, H0.max), od.expandByPoint(hd);
                    else od.expandByPoint(H0.min), od.expandByPoint(H0.max)
                }
            od.getCenter(D);
            let $ = 0;
            for (let H = 0, P = U.count; H < P; H++) hd.fromBufferAttribute(U, H), $ = Math.max($, D.distanceToSquared(hd));
            if (d)
                for (let H = 0, P = d.length; H < P; H++) {
                    let T = d[H],
                        R = this.morphTargetsRelative;
                    for (let J = 0, Q = T.count; J < Q; J++) {
                        if (hd.fromBufferAttribute(T, J), R) K$.fromBufferAttribute(U, J), hd.add(K$);
                        $ = Math.max($, D.distanceToSquared(hd))
                    }
                }
            if (this.boundingSphere.radius = Math.sqrt($), isNaN(this.boundingSphere.radius)) console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this)
        }
    }
    computeTangents() {
        let U = this.index,
            d = this.attributes;
        if (U === null || d.position === void 0 || d.normal === void 0 || d.uv === void 0) {
            console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
            return
        }
        let {
            position: D,
            normal: $,
            uv: H
        } = d;
        if (this.hasAttribute("tangent") === !1) this.setAttribute("tangent", new Wd(new Float32Array(4 * D.count), 4));
        let P = this.getAttribute("tangent"),
            T = [],
            R = [];
        for (let f = 0; f < D.count; f++) T[f] = new i, R[f] = new i;
        let J = new i,
            Q = new i,
            M = new i,
            S = new dU,
            B = new dU,
            L = new dU,
            E = new i,
            k = new i;

        function A(f, G, X) {
            J.fromBufferAttribute(D, f), Q.fromBufferAttribute(D, G), M.fromBufferAttribute(D, X), S.fromBufferAttribute(H, f), B.fromBufferAttribute(H, G), L.fromBufferAttribute(H, X), Q.sub(J), M.sub(J), B.sub(S), L.sub(S);
            let F = 1 / (B.x * L.y - L.x * B.y);
            if (!isFinite(F)) return;
            E.copy(Q).multiplyScalar(L.y).addScaledVector(M, -B.y).multiplyScalar(F), k.copy(M).multiplyScalar(B.x).addScaledVector(Q, -L.x).multiplyScalar(F), T[f].add(E), T[G].add(E), T[X].add(E), R[f].add(k), R[G].add(k), R[X].add(k)
        }
        let j = this.groups;
        if (j.length === 0) j = [{
            start: 0,
            count: U.count
        }];
        for (let f = 0, G = j.length; f < G; ++f) {
            let X = j[f],
                F = X.start,
                O = X.count;
            for (let N = F, z = F + O; N < z; N += 3) A(U.getX(N + 0), U.getX(N + 1), U.getX(N + 2))
        }
        let C = new i,
            I = new i,
            Z = new i,
            a = new i;

        function Y(f) {
            Z.fromBufferAttribute($, f), a.copy(Z);
            let G = T[f];
            C.copy(G), C.sub(Z.multiplyScalar(Z.dot(G))).normalize(), I.crossVectors(a, G);
            let F = I.dot(R[f]) < 0 ? -1 : 1;
            P.setXYZW(f, C.x, C.y, C.z, F)
        }
        for (let f = 0, G = j.length; f < G; ++f) {
            let X = j[f],
                F = X.start,
                O = X.count;
            for (let N = F, z = F + O; N < z; N += 3) Y(U.getX(N + 0)), Y(U.getX(N + 1)), Y(U.getX(N + 2))
        }
    }
    computeVertexNormals() {
        let U = this.index,
            d = this.getAttribute("position");
        if (d !== void 0) {
            let D = this.getAttribute("normal");
            if (D === void 0) D = new Wd(new Float32Array(d.count * 3), 3), this.setAttribute("normal", D);
            else
                for (let S = 0, B = D.count; S < B; S++) D.setXYZ(S, 0, 0, 0);
            let $ = new i,
                H = new i,
                P = new i,
                T = new i,
                R = new i,
                J = new i,
                Q = new i,
                M = new i;
            if (U)
                for (let S = 0, B = U.count; S < B; S += 3) {
                    let L = U.getX(S + 0),
                        E = U.getX(S + 1),
                        k = U.getX(S + 2);
                    $.fromBufferAttribute(d, L), H.fromBufferAttribute(d, E), P.fromBufferAttribute(d, k), Q.subVectors(P, H), M.subVectors($, H), Q.cross(M), T.fromBufferAttribute(D, L), R.fromBufferAttribute(D, E), J.fromBufferAttribute(D, k), T.add(Q), R.add(Q), J.add(Q), D.setXYZ(L, T.x, T.y, T.z), D.setXYZ(E, R.x, R.y, R.z), D.setXYZ(k, J.x, J.y, J.z)
                } else
                    for (let S = 0, B = d.count; S < B; S += 3) $.fromBufferAttribute(d, S + 0), H.fromBufferAttribute(d, S + 1), P.fromBufferAttribute(d, S + 2), Q.subVectors(P, H), M.subVectors($, H), Q.cross(M), D.setXYZ(S + 0, Q.x, Q.y, Q.z), D.setXYZ(S + 1, Q.x, Q.y, Q.z), D.setXYZ(S + 2, Q.x, Q.y, Q.z);
            this.normalizeNormals(), D.needsUpdate = !0
        }
    }
    normalizeNormals() {
        let U = this.attributes.normal;
        for (let d = 0, D = U.count; d < D; d++) hd.fromBufferAttribute(U, d), hd.normalize(), U.setXYZ(d, hd.x, hd.y, hd.z)
    }
    toNonIndexed() {
        function U(T, R) {
            let {
                array: J,
                itemSize: Q,
                normalized: M
            } = T, S = new J.constructor(R.length * Q), B = 0, L = 0;
            for (let E = 0, k = R.length; E < k; E++) {
                if (T.isInterleavedBufferAttribute) B = R[E] * T.data.stride + T.offset;
                else B = R[E] * Q;
                for (let A = 0; A < Q; A++) S[L++] = J[B++]
            }
            return new Wd(S, Q, M)
        }
        if (this.index === null) return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
        let d = new Fd,
            D = this.index.array,
            $ = this.attributes;
        for (let T in $) {
            let R = $[T],
                J = U(R, D);
            d.setAttribute(T, J)
        }
        let H = this.morphAttributes;
        for (let T in H) {
            let R = [],
                J = H[T];
            for (let Q = 0, M = J.length; Q < M; Q++) {
                let S = J[Q],
                    B = U(S, D);
                R.push(B)
            }
            d.morphAttributes[T] = R
        }
        d.morphTargetsRelative = this.morphTargetsRelative;
        let P = this.groups;
        for (let T = 0, R = P.length; T < R; T++) {
            let J = P[T];
            d.addGroup(J.start, J.count, J.materialIndex)
        }
        return d
    }
    toJSON() {
        let U = {
            metadata: {
                version: 4.6,
                type: "BufferGeometry",
                generator: "BufferGeometry.toJSON"
            }
        };
        if (U.uuid = this.uuid, U.type = this.type, this.name !== "") U.name = this.name;
        if (Object.keys(this.userData).length > 0) U.userData = this.userData;
        if (this.parameters !== void 0) {
            let R = this.parameters;
            for (let J in R)
                if (R[J] !== void 0) U[J] = R[J];
            return U
        }
        U.data = {
            attributes: {}
        };
        let d = this.index;
        if (d !== null) U.data.index = {
            type: d.array.constructor.name,
            array: Array.prototype.slice.call(d.array)
        };
        let D = this.attributes;
        for (let R in D) {
            let J = D[R];
            U.data.attributes[R] = J.toJSON(U.data)
        }
        let $ = {},
            H = !1;
        for (let R in this.morphAttributes) {
            let J = this.morphAttributes[R],
                Q = [];
            for (let M = 0, S = J.length; M < S; M++) {
                let B = J[M];
                Q.push(B.toJSON(U.data))
            }
            if (Q.length > 0) $[R] = Q, H = !0
        }
        if (H) U.data.morphAttributes = $, U.data.morphTargetsRelative = this.morphTargetsRelative;
        let P = this.groups;
        if (P.length > 0) U.data.groups = JSON.parse(JSON.stringify(P));
        let T = this.boundingSphere;
        if (T !== null) U.data.boundingSphere = {
            center: T.center.toArray(),
            radius: T.radius
        };
        return U
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(U) {
        this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
        let d = {};
        this.name = U.name;
        let D = U.index;
        if (D !== null) this.setIndex(D.clone(d));
        let $ = U.attributes;
        for (let J in $) {
            let Q = $[J];
            this.setAttribute(J, Q.clone(d))
        }
        let H = U.morphAttributes;
        for (let J in H) {
            let Q = [],
                M = H[J];
            for (let S = 0, B = M.length; S < B; S++) Q.push(M[S].clone(d));
            this.morphAttributes[J] = Q
        }
        this.morphTargetsRelative = U.morphTargetsRelative;
        let P = U.groups;
        for (let J = 0, Q = P.length; J < Q; J++) {
            let M = P[J];
            this.addGroup(M.start, M.count, M.materialIndex)
        }
        let T = U.boundingBox;
        if (T !== null) this.boundingBox = T.clone();
        let R = U.boundingSphere;
        if (R !== null) this.boundingSphere = R.clone();
        return this.drawRange.start = U.drawRange.start, this.drawRange.count = U.drawRange.count, this.userData = U.userData, this
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
}
var AQ = new Dd,
    $$ = new q$,
    $H = new J$,
    jQ = new i,
    HH = new i,
    PH = new i,
    TH = new i,
    OP = new i,
    RH = new i,
    EQ = new i,
    QH = new i;
class _U extends Xd {
    constructor(U = new Fd, d = new ND) {
        super();
        this.isMesh = !0, this.type = "Mesh", this.geometry = U, this.material = d, this.updateMorphTargets()
    }
    copy(U, d) {
        if (super.copy(U, d), U.morphTargetInfluences !== void 0) this.morphTargetInfluences = U.morphTargetInfluences.slice();
        if (U.morphTargetDictionary !== void 0) this.morphTargetDictionary = Object.assign({}, U.morphTargetDictionary);
        return this.material = Array.isArray(U.material) ? U.material.slice() : U.material, this.geometry = U.geometry, this
    }
    updateMorphTargets() {
        let d = this.geometry.morphAttributes,
            D = Object.keys(d);
        if (D.length > 0) {
            let $ = d[D[0]];
            if ($ !== void 0) {
                this.morphTargetInfluences = [], this.morphTargetDictionary = {};
                for (let H = 0, P = $.length; H < P; H++) {
                    let T = $[H].name || String(H);
                    this.morphTargetInfluences.push(0), this.morphTargetDictionary[T] = H
                }
            }
        }
    }
    getVertexPosition(U, d) {
        let D = this.geometry,
            $ = D.attributes.position,
            H = D.morphAttributes.position,
            P = D.morphTargetsRelative;
        d.fromBufferAttribute($, U);
        let T = this.morphTargetInfluences;
        if (H && T) {
            RH.set(0, 0, 0);
            for (let R = 0, J = H.length; R < J; R++) {
                let Q = T[R],
                    M = H[R];
                if (Q === 0) continue;
                if (OP.fromBufferAttribute(M, U), P) RH.addScaledVector(OP, Q);
                else RH.addScaledVector(OP.sub(d), Q)
            }
            d.add(RH)
        }
        return d
    }
    raycast(U, d) {
        let D = this.geometry,
            $ = this.material,
            H = this.matrixWorld;
        if ($ === void 0) return;
        if (D.boundingSphere === null) D.computeBoundingSphere();
        if ($H.copy(D.boundingSphere), $H.applyMatrix4(H), $$.copy(U.ray).recast(U.near), $H.containsPoint($$.origin) === !1) {
            if ($$.intersectSphere($H, jQ) === null) return;
            if ($$.origin.distanceToSquared(jQ) > (U.far - U.near) ** 2) return
        }
        if (AQ.copy(H).invert(), $$.copy(U.ray).applyMatrix4(AQ), D.boundingBox !== null) {
            if ($$.intersectsBox(D.boundingBox) === !1) return
        }
        this._computeIntersections(U, d, $$)
    }
    _computeIntersections(U, d, D) {
        let $, H = this.geometry,
            P = this.material,
            T = H.index,
            R = H.attributes.position,
            J = H.attributes.uv,
            Q = H.attributes.uv1,
            M = H.attributes.normal,
            S = H.groups,
            B = H.drawRange;
        if (T !== null)
            if (Array.isArray(P))
                for (let L = 0, E = S.length; L < E; L++) {
                    let k = S[L],
                        A = P[k.materialIndex],
                        j = Math.max(k.start, B.start),
                        C = Math.min(T.count, Math.min(k.start + k.count, B.start + B.count));
                    for (let I = j, Z = C; I < Z; I += 3) {
                        let a = T.getX(I),
                            Y = T.getX(I + 1),
                            f = T.getX(I + 2);
                        if ($ = SH(this, A, U, D, J, Q, M, a, Y, f), $) $.faceIndex = Math.floor(I / 3), $.face.materialIndex = k.materialIndex, d.push($)
                    }
                } else {
                    let L = Math.max(0, B.start),
                        E = Math.min(T.count, B.start + B.count);
                    for (let k = L, A = E; k < A; k += 3) {
                        let j = T.getX(k),
                            C = T.getX(k + 1),
                            I = T.getX(k + 2);
                        if ($ = SH(this, P, U, D, J, Q, M, j, C, I), $) $.faceIndex = Math.floor(k / 3), d.push($)
                    }
                } else if (R !== void 0)
                    if (Array.isArray(P))
                        for (let L = 0, E = S.length; L < E; L++) {
                            let k = S[L],
                                A = P[k.materialIndex],
                                j = Math.max(k.start, B.start),
                                C = Math.min(R.count, Math.min(k.start + k.count, B.start + B.count));
                            for (let I = j, Z = C; I < Z; I += 3) {
                                let a = I,
                                    Y = I + 1,
                                    f = I + 2;
                                if ($ = SH(this, A, U, D, J, Q, M, a, Y, f), $) $.faceIndex = Math.floor(I / 3), $.face.materialIndex = k.materialIndex, d.push($)
                            }
                        } else {
                            let L = Math.max(0, B.start),
                                E = Math.min(R.count, B.start + B.count);
                            for (let k = L, A = E; k < A; k += 3) {
                                let j = k,
                                    C = k + 1,
                                    I = k + 2;
                                if ($ = SH(this, P, U, D, J, Q, M, j, C, I), $) $.faceIndex = Math.floor(k / 3), d.push($)
                            }
                        }
    }
}

function dM(U, d, D, $, H, P, T, R) {
    let J;
    if (d.side === 1) J = $.intersectTriangle(T, P, H, !0, R);
    else J = $.intersectTriangle(H, P, T, d.side === 0, R);
    if (J === null) return null;
    QH.copy(R), QH.applyMatrix4(U.matrixWorld);
    let Q = D.ray.origin.distanceTo(QH);
    if (Q < D.near || Q > D.far) return null;
    return {
        distance: Q,
        point: QH.clone(),
        object: U
    }
}

function SH(U, d, D, $, H, P, T, R, J, Q) {
    U.getVertexPosition(R, HH), U.getVertexPosition(J, PH), U.getVertexPosition(Q, TH);
    let M = dM(U, d, D, $, HH, PH, TH, EQ);
    if (M) {
        let S = new i;
        if (td.getBarycoord(EQ, HH, PH, TH, S), H) M.uv = td.getInterpolatedAttribute(H, R, J, Q, S, new dU);
        if (P) M.uv1 = td.getInterpolatedAttribute(P, R, J, Q, S, new dU);
        if (T) {
            if (M.normal = td.getInterpolatedAttribute(T, R, J, Q, S, new i), M.normal.dot($.direction) > 0) M.normal.multiplyScalar(-1)
        }
        let B = {
            a: R,
            b: J,
            c: Q,
            normal: new i,
            materialIndex: 0
        };
        td.getNormal(HH, PH, TH, B.normal), M.face = B, M.barycoord = S
    }
    return M
}
class oU extends Fd {
    constructor(U = 1, d = 1, D = 1, $ = 1, H = 1, P = 1) {
        super();
        this.type = "BoxGeometry", this.parameters = {
            width: U,
            height: d,
            depth: D,
            widthSegments: $,
            heightSegments: H,
            depthSegments: P
        };
        let T = this;
        $ = Math.floor($), H = Math.floor(H), P = Math.floor(P);
        let R = [],
            J = [],
            Q = [],
            M = [],
            S = 0,
            B = 0;
        L("z", "y", "x", -1, -1, D, d, U, P, H, 0), L("z", "y", "x", 1, -1, D, d, -U, P, H, 1), L("x", "z", "y", 1, 1, U, D, d, $, P, 2), L("x", "z", "y", 1, -1, U, D, -d, $, P, 3), L("x", "y", "z", 1, -1, U, d, D, $, H, 4), L("x", "y", "z", -1, -1, U, d, -D, $, H, 5), this.setIndex(R), this.setAttribute("position", new Rd(J, 3)), this.setAttribute("normal", new Rd(Q, 3)), this.setAttribute("uv", new Rd(M, 2));

        function L(E, k, A, j, C, I, Z, a, Y, f, G) {
            let X = I / Y,
                F = Z / f,
                O = I / 2,
                N = Z / 2,
                z = a / 2,
                w = Y + 1,
                l = f + 1,
                c = 0,
                y = 0,
                W = new i;
            for (let UU = 0; UU < l; UU++) {
                let PU = UU * F - N;
                for (let iU = 0; iU < w; iU++) {
                    let wU = iU * X - O;
                    W[E] = wU * j, W[k] = PU * C, W[A] = z, J.push(W.x, W.y, W.z), W[E] = 0, W[k] = 0, W[A] = a > 0 ? 1 : -1, Q.push(W.x, W.y, W.z), M.push(iU / Y), M.push(1 - UU / f), c += 1
                }
            }
            for (let UU = 0; UU < f; UU++)
                for (let PU = 0; PU < Y; PU++) {
                    let iU = S + PU + w * UU,
                        wU = S + PU + w * (UU + 1),
                        o = S + (PU + 1) + w * (UU + 1),
                        $U = S + (PU + 1) + w * UU;
                    R.push(iU, wU, $U), R.push(wU, o, $U), y += 6
                }
            T.addGroup(B, y, G), B += y, S += c
        }
    }
    copy(U) {
        return super.copy(U), this.parameters = Object.assign({}, U.parameters), this
    }
    static fromJSON(U) {
        return new oU(U.width, U.height, U.depth, U.widthSegments, U.heightSegments, U.depthSegments)
    }
}

function z$(U) {
    let d = {};
    for (let D in U) {
        d[D] = {};
        for (let $ in U[D]) {
            let H = U[D][$];
            if (H && (H.isColor || H.isMatrix3 || H.isMatrix4 || H.isVector2 || H.isVector3 || H.isVector4 || H.isTexture || H.isQuaternion))
                if (H.isRenderTargetTexture) console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), d[D][$] = null;
                else d[D][$] = H.clone();
            else if (Array.isArray(H)) d[D][$] = H.slice();
            else d[D][$] = H
        }
    }
    return d
}

function Nd(U) {
    let d = {};
    for (let D = 0; D < U.length; D++) {
        let $ = z$(U[D]);
        for (let H in $) d[H] = $[H]
    }
    return d
}

function DM(U) {
    let d = [];
    for (let D = 0; D < U.length; D++) d.push(U[D].clone());
    return d
}

function M4(U) {
    let d = U.getRenderTarget();
    if (d === null) return U.outputColorSpace;
    if (d.isXRRenderTarget === !0) return d.texture.colorSpace;
    return dd.workingColorSpace
}
var $M = {
        clone: z$,
        merge: Nd
    },
    HM = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
    PM = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class _D extends uD {
    static get type() {
        return "ShaderMaterial"
    }
    constructor(U) {
        super();
        if (this.isShaderMaterial = !0, this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = HM, this.fragmentShader = PM, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
                clipCullDistance: !1,
                multiDraw: !1
            }, this.defaultAttributeValues = {
                color: [1, 1, 1],
                uv: [0, 0],
                uv1: [0, 0]
            }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, U !== void 0) this.setValues(U)
    }
    copy(U) {
        return super.copy(U), this.fragmentShader = U.fragmentShader, this.vertexShader = U.vertexShader, this.uniforms = z$(U.uniforms), this.uniformsGroups = DM(U.uniformsGroups), this.defines = Object.assign({}, U.defines), this.wireframe = U.wireframe, this.wireframeLinewidth = U.wireframeLinewidth, this.fog = U.fog, this.lights = U.lights, this.clipping = U.clipping, this.extensions = Object.assign({}, U.extensions), this.glslVersion = U.glslVersion, this
    }
    toJSON(U) {
        let d = super.toJSON(U);
        d.glslVersion = this.glslVersion, d.uniforms = {};
        for (let $ in this.uniforms) {
            let P = this.uniforms[$].value;
            if (P && P.isTexture) d.uniforms[$] = {
                type: "t",
                value: P.toJSON(U).uuid
            };
            else if (P && P.isColor) d.uniforms[$] = {
                type: "c",
                value: P.getHex()
            };
            else if (P && P.isVector2) d.uniforms[$] = {
                type: "v2",
                value: P.toArray()
            };
            else if (P && P.isVector3) d.uniforms[$] = {
                type: "v3",
                value: P.toArray()
            };
            else if (P && P.isVector4) d.uniforms[$] = {
                type: "v4",
                value: P.toArray()
            };
            else if (P && P.isMatrix3) d.uniforms[$] = {
                type: "m3",
                value: P.toArray()
            };
            else if (P && P.isMatrix4) d.uniforms[$] = {
                type: "m4",
                value: P.toArray()
            };
            else d.uniforms[$] = {
                value: P
            }
        }
        if (Object.keys(this.defines).length > 0) d.defines = this.defines;
        d.vertexShader = this.vertexShader, d.fragmentShader = this.fragmentShader, d.lights = this.lights, d.clipping = this.clipping;
        let D = {};
        for (let $ in this.extensions)
            if (this.extensions[$] === !0) D[$] = !0;
        if (Object.keys(D).length > 0) d.extensions = D;
        return d
    }
}
class PT extends Xd {
    constructor() {
        super();
        this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new Dd, this.projectionMatrix = new Dd, this.projectionMatrixInverse = new Dd, this.coordinateSystem = 2000
    }
    copy(U, d) {
        return super.copy(U, d), this.matrixWorldInverse.copy(U.matrixWorldInverse), this.projectionMatrix.copy(U.projectionMatrix), this.projectionMatrixInverse.copy(U.projectionMatrixInverse), this.coordinateSystem = U.coordinateSystem, this
    }
    getWorldDirection(U) {
        return super.getWorldDirection(U).negate()
    }
    updateMatrixWorld(U) {
        super.updateMatrixWorld(U), this.matrixWorldInverse.copy(this.matrixWorld).invert()
    }
    updateWorldMatrix(U, d) {
        super.updateWorldMatrix(U, d), this.matrixWorldInverse.copy(this.matrixWorld).invert()
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
var yD = new i,
    IQ = new dU,
    kQ = new dU;
class wd extends PT {
    constructor(U = 50, d = 1, D = 0.1, $ = 2000) {
        super();
        this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = U, this.zoom = 1, this.near = D, this.far = $, this.focus = 10, this.aspect = d, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix()
    }
    copy(U, d) {
        return super.copy(U, d), this.fov = U.fov, this.zoom = U.zoom, this.near = U.near, this.far = U.far, this.focus = U.focus, this.aspect = U.aspect, this.view = U.view === null ? null : Object.assign({}, U.view), this.filmGauge = U.filmGauge, this.filmOffset = U.filmOffset, this
    }
    setFocalLength(U) {
        let d = 0.5 * this.getFilmHeight() / U;
        this.fov = k0 * 2 * Math.atan(d), this.updateProjectionMatrix()
    }
    getFocalLength() {
        let U = Math.tan(B0 * 0.5 * this.fov);
        return 0.5 * this.getFilmHeight() / U
    }
    getEffectiveFOV() {
        return k0 * 2 * Math.atan(Math.tan(B0 * 0.5 * this.fov) / this.zoom)
    }
    getFilmWidth() {
        return this.filmGauge * Math.min(this.aspect, 1)
    }
    getFilmHeight() {
        return this.filmGauge / Math.max(this.aspect, 1)
    }
    getViewBounds(U, d, D) {
        yD.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), d.set(yD.x, yD.y).multiplyScalar(-U / yD.z), yD.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), D.set(yD.x, yD.y).multiplyScalar(-U / yD.z)
    }
    getViewSize(U, d) {
        return this.getViewBounds(U, IQ, kQ), d.subVectors(kQ, IQ)
    }
    setViewOffset(U, d, D, $, H, P) {
        if (this.aspect = U / d, this.view === null) this.view = {
            enabled: !0,
            fullWidth: 1,
            fullHeight: 1,
            offsetX: 0,
            offsetY: 0,
            width: 1,
            height: 1
        };
        this.view.enabled = !0, this.view.fullWidth = U, this.view.fullHeight = d, this.view.offsetX = D, this.view.offsetY = $, this.view.width = H, this.view.height = P, this.updateProjectionMatrix()
    }
    clearViewOffset() {
        if (this.view !== null) this.view.enabled = !1;
        this.updateProjectionMatrix()
    }
    updateProjectionMatrix() {
        let U = this.near,
            d = U * Math.tan(B0 * 0.5 * this.fov) / this.zoom,
            D = 2 * d,
            $ = this.aspect * D,
            H = -0.5 * $,
            P = this.view;
        if (this.view !== null && this.view.enabled) {
            let {
                fullWidth: R,
                fullHeight: J
            } = P;
            H += P.offsetX * $ / R, d -= P.offsetY * D / J, $ *= P.width / R, D *= P.height / J
        }
        let T = this.filmOffset;
        if (T !== 0) H += U * T / this.getFilmWidth();
        this.projectionMatrix.makePerspective(H, H + $, d, d - D, U, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert()
    }
    toJSON(U) {
        let d = super.toJSON(U);
        if (d.object.fov = this.fov, d.object.zoom = this.zoom, d.object.near = this.near, d.object.far = this.far, d.object.focus = this.focus, d.object.aspect = this.aspect, this.view !== null) d.object.view = Object.assign({}, this.view);
        return d.object.filmGauge = this.filmGauge, d.object.filmOffset = this.filmOffset, d
    }
}
var f$ = -90,
    h$ = 1;
class B4 extends Xd {
    constructor(U, d, D) {
        super();
        this.type = "CubeCamera", this.renderTarget = D, this.coordinateSystem = null, this.activeMipmapLevel = 0;
        let $ = new wd(f$, h$, U, d);
        $.layers = this.layers, this.add($);
        let H = new wd(f$, h$, U, d);
        H.layers = this.layers, this.add(H);
        let P = new wd(f$, h$, U, d);
        P.layers = this.layers, this.add(P);
        let T = new wd(f$, h$, U, d);
        T.layers = this.layers, this.add(T);
        let R = new wd(f$, h$, U, d);
        R.layers = this.layers, this.add(R);
        let J = new wd(f$, h$, U, d);
        J.layers = this.layers, this.add(J)
    }
    updateCoordinateSystem() {
        let U = this.coordinateSystem,
            d = this.children.concat(),
            [D, $, H, P, T, R] = d;
        for (let J of d) this.remove(J);
        if (U === 2000) D.up.set(0, 1, 0), D.lookAt(1, 0, 0), $.up.set(0, 1, 0), $.lookAt(-1, 0, 0), H.up.set(0, 0, -1), H.lookAt(0, 1, 0), P.up.set(0, 0, 1), P.lookAt(0, -1, 0), T.up.set(0, 1, 0), T.lookAt(0, 0, 1), R.up.set(0, 1, 0), R.lookAt(0, 0, -1);
        else if (U === 2001) D.up.set(0, -1, 0), D.lookAt(-1, 0, 0), $.up.set(0, -1, 0), $.lookAt(1, 0, 0), H.up.set(0, 0, 1), H.lookAt(0, 1, 0), P.up.set(0, 0, -1), P.lookAt(0, -1, 0), T.up.set(0, -1, 0), T.lookAt(0, 0, 1), R.up.set(0, -1, 0), R.lookAt(0, 0, -1);
        else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + U);
        for (let J of d) this.add(J), J.updateMatrixWorld()
    }
    update(U, d) {
        if (this.parent === null) this.updateMatrixWorld();
        let {
            renderTarget: D,
            activeMipmapLevel: $
        } = this;
        if (this.coordinateSystem !== U.coordinateSystem) this.coordinateSystem = U.coordinateSystem, this.updateCoordinateSystem();
        let [H, P, T, R, J, Q] = this.children, M = U.getRenderTarget(), S = U.getActiveCubeFace(), B = U.getActiveMipmapLevel(), L = U.xr.enabled;
        U.xr.enabled = !1;
        let E = D.texture.generateMipmaps;
        D.texture.generateMipmaps = !1, U.setRenderTarget(D, 0, $), U.render(d, H), U.setRenderTarget(D, 1, $), U.render(d, P), U.setRenderTarget(D, 2, $), U.render(d, T), U.setRenderTarget(D, 3, $), U.render(d, R), U.setRenderTarget(D, 4, $), U.render(d, J), D.texture.generateMipmaps = E, U.setRenderTarget(D, 5, $), U.render(d, Q), U.setRenderTarget(M, S, B), U.xr.enabled = L, D.texture.needsPMREMUpdate = !0
    }
}
class TT extends _d {
    constructor(U, d, D, $, H, P, T, R, J, Q) {
        U = U !== void 0 ? U : [], d = d !== void 0 ? d : 301;
        super(U, d, D, $, H, P, T, R, J, Q);
        this.isCubeTexture = !0, this.flipY = !1
    }
    get images() {
        return this.image
    }
    set images(U) {
        this.image = U
    }
}
class L4 extends oD {
    constructor(U = 1, d = {}) {
        super(U, U, d);
        this.isWebGLCubeRenderTarget = !0;
        let D = {
                width: U,
                height: U,
                depth: 1
            },
            $ = [D, D, D, D, D, D];
        this.texture = new TT($, d.mapping, d.wrapS, d.wrapT, d.magFilter, d.minFilter, d.format, d.type, d.anisotropy, d.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = d.generateMipmaps !== void 0 ? d.generateMipmaps : !1, this.texture.minFilter = d.minFilter !== void 0 ? d.minFilter : 1006
    }
    fromEquirectangularTexture(U, d) {
        this.texture.type = d.type, this.texture.colorSpace = d.colorSpace, this.texture.generateMipmaps = d.generateMipmaps, this.texture.minFilter = d.minFilter, this.texture.magFilter = d.magFilter;
        let D = {
                uniforms: {
                    tEquirect: {
                        value: null
                    }
                },
                vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,
                fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
            },
            $ = new oU(5, 5, 5),
            H = new _D({
                name: "CubemapFromEquirect",
                uniforms: z$(D.uniforms),
                vertexShader: D.vertexShader,
                fragmentShader: D.fragmentShader,
                side: 1,
                blending: 0
            });
        H.uniforms.tEquirect.value = d;
        let P = new _U($, H),
            T = d.minFilter;
        if (d.minFilter === 1008) d.minFilter = 1006;
        return new B4(1, 10, this).update(U, P), d.minFilter = T, P.geometry.dispose(), P.material.dispose(), this
    }
    clear(U, d, D, $) {
        let H = U.getRenderTarget();
        for (let P = 0; P < 6; P++) U.setRenderTarget(this, P), U.clear(d, D, $);
        U.setRenderTarget(H)
    }
}
var WP = new i,
    TM = new i,
    RM = new vU;
class ED {
    constructor(U = new i(1, 0, 0), d = 0) {
        this.isPlane = !0, this.normal = U, this.constant = d
    }
    set(U, d) {
        return this.normal.copy(U), this.constant = d, this
    }
    setComponents(U, d, D, $) {
        return this.normal.set(U, d, D), this.constant = $, this
    }
    setFromNormalAndCoplanarPoint(U, d) {
        return this.normal.copy(U), this.constant = -d.dot(this.normal), this
    }
    setFromCoplanarPoints(U, d, D) {
        let $ = WP.subVectors(D, d).cross(TM.subVectors(U, d)).normalize();
        return this.setFromNormalAndCoplanarPoint($, U), this
    }
    copy(U) {
        return this.normal.copy(U.normal), this.constant = U.constant, this
    }
    normalize() {
        let U = 1 / this.normal.length();
        return this.normal.multiplyScalar(U), this.constant *= U, this
    }
    negate() {
        return this.constant *= -1, this.normal.negate(), this
    }
    distanceToPoint(U) {
        return this.normal.dot(U) + this.constant
    }
    distanceToSphere(U) {
        return this.distanceToPoint(U.center) - U.radius
    }
    projectPoint(U, d) {
        return d.copy(U).addScaledVector(this.normal, -this.distanceToPoint(U))
    }
    intersectLine(U, d) {
        let D = U.delta(WP),
            $ = this.normal.dot(D);
        if ($ === 0) {
            if (this.distanceToPoint(U.start) === 0) return d.copy(U.start);
            return null
        }
        let H = -(U.start.dot(this.normal) + this.constant) / $;
        if (H < 0 || H > 1) return null;
        return d.copy(U.start).addScaledVector(D, H)
    }
    intersectsLine(U) {
        let d = this.distanceToPoint(U.start),
            D = this.distanceToPoint(U.end);
        return d < 0 && D > 0 || D < 0 && d > 0
    }
    intersectsBox(U) {
        return U.intersectsPlane(this)
    }
    intersectsSphere(U) {
        return U.intersectsPlane(this)
    }
    coplanarPoint(U) {
        return U.copy(this.normal).multiplyScalar(-this.constant)
    }
    applyMatrix4(U, d) {
        let D = d || RM.getNormalMatrix(U),
            $ = this.coplanarPoint(WP).applyMatrix4(U),
            H = this.normal.applyMatrix3(D).normalize();
        return this.constant = -$.dot(H), this
    }
    translate(U) {
        return this.constant -= U.dot(this.normal), this
    }
    equals(U) {
        return U.normal.equals(this.normal) && U.constant === this.constant
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
var H$ = new J$,
    JH = new i;
class hH {
    constructor(U = new ED, d = new ED, D = new ED, $ = new ED, H = new ED, P = new ED) {
        this.planes = [U, d, D, $, H, P]
    }
    set(U, d, D, $, H, P) {
        let T = this.planes;
        return T[0].copy(U), T[1].copy(d), T[2].copy(D), T[3].copy($), T[4].copy(H), T[5].copy(P), this
    }
    copy(U) {
        let d = this.planes;
        for (let D = 0; D < 6; D++) d[D].copy(U.planes[D]);
        return this
    }
    setFromProjectionMatrix(U, d = 2000) {
        let D = this.planes,
            $ = U.elements,
            H = $[0],
            P = $[1],
            T = $[2],
            R = $[3],
            J = $[4],
            Q = $[5],
            M = $[6],
            S = $[7],
            B = $[8],
            L = $[9],
            E = $[10],
            k = $[11],
            A = $[12],
            j = $[13],
            C = $[14],
            I = $[15];
        if (D[0].setComponents(R - H, S - J, k - B, I - A).normalize(), D[1].setComponents(R + H, S + J, k + B, I + A).normalize(), D[2].setComponents(R + P, S + Q, k + L, I + j).normalize(), D[3].setComponents(R - P, S - Q, k - L, I - j).normalize(), D[4].setComponents(R - T, S - M, k - E, I - C).normalize(), d === 2000) D[5].setComponents(R + T, S + M, k + E, I + C).normalize();
        else if (d === 2001) D[5].setComponents(T, M, E, C).normalize();
        else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + d);
        return this
    }
    intersectsObject(U) {
        if (U.boundingSphere !== void 0) {
            if (U.boundingSphere === null) U.computeBoundingSphere();
            H$.copy(U.boundingSphere).applyMatrix4(U.matrixWorld)
        } else {
            let d = U.geometry;
            if (d.boundingSphere === null) d.computeBoundingSphere();
            H$.copy(d.boundingSphere).applyMatrix4(U.matrixWorld)
        }
        return this.intersectsSphere(H$)
    }
    intersectsSprite(U) {
        return H$.center.set(0, 0, 0), H$.radius = 0.7071067811865476, H$.applyMatrix4(U.matrixWorld), this.intersectsSphere(H$)
    }
    intersectsSphere(U) {
        let d = this.planes,
            D = U.center,
            $ = -U.radius;
        for (let H = 0; H < 6; H++)
            if (d[H].distanceToPoint(D) < $) return !1;
        return !0
    }
    intersectsBox(U) {
        let d = this.planes;
        for (let D = 0; D < 6; D++) {
            let $ = d[D];
            if (JH.x = $.normal.x > 0 ? U.max.x : U.min.x, JH.y = $.normal.y > 0 ? U.max.y : U.min.y, JH.z = $.normal.z > 0 ? U.max.z : U.min.z, $.distanceToPoint(JH) < 0) return !1
        }
        return !0
    }
    containsPoint(U) {
        let d = this.planes;
        for (let D = 0; D < 6; D++)
            if (d[D].distanceToPoint(U) < 0) return !1;
        return !0
    }
    clone() {
        return new this.constructor().copy(this)
    }
}

function A4() {
    let U = null,
        d = !1,
        D = null,
        $ = null;

    function H(P, T) {
        D(P, T), $ = U.requestAnimationFrame(H)
    }
    return {
        start: function() {
            if (d === !0) return;
            if (D === null) return;
            $ = U.requestAnimationFrame(H), d = !0
        },
        stop: function() {
            U.cancelAnimationFrame($), d = !1
        },
        setAnimationLoop: function(P) {
            D = P
        },
        setContext: function(P) {
            U = P
        }
    }
}

function QM(U) {
    let d = new WeakMap;

    function D(R, J) {
        let {
            array: Q,
            usage: M
        } = R, S = Q.byteLength, B = U.createBuffer();
        U.bindBuffer(J, B), U.bufferData(J, Q, M), R.onUploadCallback();
        let L;
        if (Q instanceof Float32Array) L = U.FLOAT;
        else if (Q instanceof Uint16Array)
            if (R.isFloat16BufferAttribute) L = U.HALF_FLOAT;
            else L = U.UNSIGNED_SHORT;
        else if (Q instanceof Int16Array) L = U.SHORT;
        else if (Q instanceof Uint32Array) L = U.UNSIGNED_INT;
        else if (Q instanceof Int32Array) L = U.INT;
        else if (Q instanceof Int8Array) L = U.BYTE;
        else if (Q instanceof Uint8Array) L = U.UNSIGNED_BYTE;
        else if (Q instanceof Uint8ClampedArray) L = U.UNSIGNED_BYTE;
        else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: " + Q);
        return {
            buffer: B,
            type: L,
            bytesPerElement: Q.BYTES_PER_ELEMENT,
            version: R.version,
            size: S
        }
    }

    function $(R, J, Q) {
        let {
            array: M,
            updateRanges: S
        } = J;
        if (U.bindBuffer(Q, R), S.length === 0) U.bufferSubData(Q, 0, M);
        else {
            S.sort((L, E) => L.start - E.start);
            let B = 0;
            for (let L = 1; L < S.length; L++) {
                let E = S[B],
                    k = S[L];
                if (k.start <= E.start + E.count + 1) E.count = Math.max(E.count, k.start + k.count - E.start);
                else ++B, S[B] = k
            }
            S.length = B + 1;
            for (let L = 0, E = S.length; L < E; L++) {
                let k = S[L];
                U.bufferSubData(Q, k.start * M.BYTES_PER_ELEMENT, M, k.start, k.count)
            }
            J.clearUpdateRanges()
        }
        J.onUploadCallback()
    }

    function H(R) {
        if (R.isInterleavedBufferAttribute) R = R.data;
        return d.get(R)
    }

    function P(R) {
        if (R.isInterleavedBufferAttribute) R = R.data;
        let J = d.get(R);
        if (J) U.deleteBuffer(J.buffer), d.delete(R)
    }

    function T(R, J) {
        if (R.isInterleavedBufferAttribute) R = R.data;
        if (R.isGLBufferAttribute) {
            let M = d.get(R);
            if (!M || M.version < R.version) d.set(R, {
                buffer: R.buffer,
                type: R.type,
                bytesPerElement: R.elementSize,
                version: R.version
            });
            return
        }
        let Q = d.get(R);
        if (Q === void 0) d.set(R, D(R, J));
        else if (Q.version < R.version) {
            if (Q.size !== R.array.byteLength) throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
            $(Q.buffer, R, J), Q.version = R.version
        }
    }
    return {
        get: H,
        remove: P,
        update: T
    }
}
class p$ extends Fd {
    constructor(U = 1, d = 1, D = 1, $ = 1) {
        super();
        this.type = "PlaneGeometry", this.parameters = {
            width: U,
            height: d,
            widthSegments: D,
            heightSegments: $
        };
        let H = U / 2,
            P = d / 2,
            T = Math.floor(D),
            R = Math.floor($),
            J = T + 1,
            Q = R + 1,
            M = U / T,
            S = d / R,
            B = [],
            L = [],
            E = [],
            k = [];
        for (let A = 0; A < Q; A++) {
            let j = A * S - P;
            for (let C = 0; C < J; C++) {
                let I = C * M - H;
                L.push(I, -j, 0), E.push(0, 0, 1), k.push(C / T), k.push(1 - A / R)
            }
        }
        for (let A = 0; A < R; A++)
            for (let j = 0; j < T; j++) {
                let C = j + J * A,
                    I = j + J * (A + 1),
                    Z = j + 1 + J * (A + 1),
                    a = j + 1 + J * A;
                B.push(C, I, a), B.push(I, Z, a)
            }
        this.setIndex(B), this.setAttribute("position", new Rd(L, 3)), this.setAttribute("normal", new Rd(E, 3)), this.setAttribute("uv", new Rd(k, 2))
    }
    copy(U) {
        return super.copy(U), this.parameters = Object.assign({}, U.parameters), this
    }
    static fromJSON(U) {
        return new p$(U.width, U.height, U.widthSegments, U.heightSegments)
    }
}
var SM = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,
    JM = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,
    MM = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,
    BM = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
    LM = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,
    AM = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,
    jM = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,
    EM = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,
    IM = `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,
    kM = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,
    ZM = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,
    aM = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,
    YM = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,
    XM = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,
    VM = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,
    FM = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,
    CM = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,
    KM = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,
    fM = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,
    hM = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,
    bM = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,
    iM = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,
    OM = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,
    WM = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,
    GM = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,
    mM = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,
    _M = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,
    uM = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,
    NM = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,
    zM = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,
    qM = "gl_FragColor = linearToOutputTexel( gl_FragColor );",
    pM = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,
    gM = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,
    wM = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,
    cM = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,
    eM = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,
    vM = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,
    lM = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,
    yM = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`,
    oM = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,
    nM = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,
    sM = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,
    xM = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,
    rM = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,
    tM = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,
    UB = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,
    dB = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,
    DB = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,
    $B = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,
    HB = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,
    PB = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,
    TB = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,
    RB = `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,
    QB = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,
    SB = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,
    JB = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,
    MB = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,
    BB = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
    LB = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
    AB = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,
    jB = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,
    EB = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`,
    IB = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,
    kB = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
    ZB = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,
    aB = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,
    YB = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,
    XB = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,
    VB = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
    FB = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,
    CB = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
    KB = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,
    fB = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,
    hB = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
    bB = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
    iB = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,
    OB = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,
    WB = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,
    GB = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,
    mB = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,
    _B = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,
    uB = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
    NB = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,
    zB = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,
    qB = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,
    pB = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,
    gB = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,
    wB = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,
    cB = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,
    eB = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,
    vB = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,
    lB = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,
    yB = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,
    oB = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,
    nB = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,
    sB = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,
    xB = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,
    rB = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,
    tB = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,
    UL = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,
    dL = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,
    DL = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,
    $L = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,
    HL = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
    PL = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
    TL = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,
    RL = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,
    QL = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,
    SL = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
    JL = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
    ML = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
    BL = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
    LL = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
    AL = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,
    jL = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,
    EL = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,
    IL = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,
    kL = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,
    ZL = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
    aL = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
    YL = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
    XL = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,
    VL = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    FL = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
    CL = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    KL = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,
    fL = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    hL = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,
    bL = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,
    iL = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
    OL = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    WL = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,
    GL = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    mL = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
    _L = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    uL = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,
    NL = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
    zL = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
    qL = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,
    pL = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
    gL = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,
    yU = {
        alphahash_fragment: SM,
        alphahash_pars_fragment: JM,
        alphamap_fragment: MM,
        alphamap_pars_fragment: BM,
        alphatest_fragment: LM,
        alphatest_pars_fragment: AM,
        aomap_fragment: jM,
        aomap_pars_fragment: EM,
        batching_pars_vertex: IM,
        batching_vertex: kM,
        begin_vertex: ZM,
        beginnormal_vertex: aM,
        bsdfs: YM,
        iridescence_fragment: XM,
        bumpmap_pars_fragment: VM,
        clipping_planes_fragment: FM,
        clipping_planes_pars_fragment: CM,
        clipping_planes_pars_vertex: KM,
        clipping_planes_vertex: fM,
        color_fragment: hM,
        color_pars_fragment: bM,
        color_pars_vertex: iM,
        color_vertex: OM,
        common: WM,
        cube_uv_reflection_fragment: GM,
        defaultnormal_vertex: mM,
        displacementmap_pars_vertex: _M,
        displacementmap_vertex: uM,
        emissivemap_fragment: NM,
        emissivemap_pars_fragment: zM,
        colorspace_fragment: qM,
        colorspace_pars_fragment: pM,
        envmap_fragment: gM,
        envmap_common_pars_fragment: wM,
        envmap_pars_fragment: cM,
        envmap_pars_vertex: eM,
        envmap_physical_pars_fragment: dB,
        envmap_vertex: vM,
        fog_vertex: lM,
        fog_pars_vertex: yM,
        fog_fragment: oM,
        fog_pars_fragment: nM,
        gradientmap_pars_fragment: sM,
        lightmap_pars_fragment: xM,
        lights_lambert_fragment: rM,
        lights_lambert_pars_fragment: tM,
        lights_pars_begin: UB,
        lights_toon_fragment: DB,
        lights_toon_pars_fragment: $B,
        lights_phong_fragment: HB,
        lights_phong_pars_fragment: PB,
        lights_physical_fragment: TB,
        lights_physical_pars_fragment: RB,
        lights_fragment_begin: QB,
        lights_fragment_maps: SB,
        lights_fragment_end: JB,
        logdepthbuf_fragment: MB,
        logdepthbuf_pars_fragment: BB,
        logdepthbuf_pars_vertex: LB,
        logdepthbuf_vertex: AB,
        map_fragment: jB,
        map_pars_fragment: EB,
        map_particle_fragment: IB,
        map_particle_pars_fragment: kB,
        metalnessmap_fragment: ZB,
        metalnessmap_pars_fragment: aB,
        morphinstance_vertex: YB,
        morphcolor_vertex: XB,
        morphnormal_vertex: VB,
        morphtarget_pars_vertex: FB,
        morphtarget_vertex: CB,
        normal_fragment_begin: KB,
        normal_fragment_maps: fB,
        normal_pars_fragment: hB,
        normal_pars_vertex: bB,
        normal_vertex: iB,
        normalmap_pars_fragment: OB,
        clearcoat_normal_fragment_begin: WB,
        clearcoat_normal_fragment_maps: GB,
        clearcoat_pars_fragment: mB,
        iridescence_pars_fragment: _B,
        opaque_fragment: uB,
        packing: NB,
        premultiplied_alpha_fragment: zB,
        project_vertex: qB,
        dithering_fragment: pB,
        dithering_pars_fragment: gB,
        roughnessmap_fragment: wB,
        roughnessmap_pars_fragment: cB,
        shadowmap_pars_fragment: eB,
        shadowmap_pars_vertex: vB,
        shadowmap_vertex: lB,
        shadowmask_pars_fragment: yB,
        skinbase_vertex: oB,
        skinning_pars_vertex: nB,
        skinning_vertex: sB,
        skinnormal_vertex: xB,
        specularmap_fragment: rB,
        specularmap_pars_fragment: tB,
        tonemapping_fragment: UL,
        tonemapping_pars_fragment: dL,
        transmission_fragment: DL,
        transmission_pars_fragment: $L,
        uv_pars_fragment: HL,
        uv_pars_vertex: PL,
        uv_vertex: TL,
        worldpos_vertex: RL,
        background_vert: QL,
        background_frag: SL,
        backgroundCube_vert: JL,
        backgroundCube_frag: ML,
        cube_vert: BL,
        cube_frag: LL,
        depth_vert: AL,
        depth_frag: jL,
        distanceRGBA_vert: EL,
        distanceRGBA_frag: IL,
        equirect_vert: kL,
        equirect_frag: ZL,
        linedashed_vert: aL,
        linedashed_frag: YL,
        meshbasic_vert: XL,
        meshbasic_frag: VL,
        meshlambert_vert: FL,
        meshlambert_frag: CL,
        meshmatcap_vert: KL,
        meshmatcap_frag: fL,
        meshnormal_vert: hL,
        meshnormal_frag: bL,
        meshphong_vert: iL,
        meshphong_frag: OL,
        meshphysical_vert: WL,
        meshphysical_frag: GL,
        meshtoon_vert: mL,
        meshtoon_frag: _L,
        points_vert: uL,
        points_frag: NL,
        shadow_vert: zL,
        shadow_frag: qL,
        sprite_vert: pL,
        sprite_frag: gL
    },
    MU = {
        common: {
            diffuse: {
                value: new KU(16777215)
            },
            opacity: {
                value: 1
            },
            map: {
                value: null
            },
            mapTransform: {
                value: new vU
            },
            alphaMap: {
                value: null
            },
            alphaMapTransform: {
                value: new vU
            },
            alphaTest: {
                value: 0
            }
        },
        specularmap: {
            specularMap: {
                value: null
            },
            specularMapTransform: {
                value: new vU
            }
        },
        envmap: {
            envMap: {
                value: null
            },
            envMapRotation: {
                value: new vU
            },
            flipEnvMap: {
                value: -1
            },
            reflectivity: {
                value: 1
            },
            ior: {
                value: 1.5
            },
            refractionRatio: {
                value: 0.98
            }
        },
        aomap: {
            aoMap: {
                value: null
            },
            aoMapIntensity: {
                value: 1
            },
            aoMapTransform: {
                value: new vU
            }
        },
        lightmap: {
            lightMap: {
                value: null
            },
            lightMapIntensity: {
                value: 1
            },
            lightMapTransform: {
                value: new vU
            }
        },
        bumpmap: {
            bumpMap: {
                value: null
            },
            bumpMapTransform: {
                value: new vU
            },
            bumpScale: {
                value: 1
            }
        },
        normalmap: {
            normalMap: {
                value: null
            },
            normalMapTransform: {
                value: new vU
            },
            normalScale: {
                value: new dU(1, 1)
            }
        },
        displacementmap: {
            displacementMap: {
                value: null
            },
            displacementMapTransform: {
                value: new vU
            },
            displacementScale: {
                value: 1
            },
            displacementBias: {
                value: 0
            }
        },
        emissivemap: {
            emissiveMap: {
                value: null
            },
            emissiveMapTransform: {
                value: new vU
            }
        },
        metalnessmap: {
            metalnessMap: {
                value: null
            },
            metalnessMapTransform: {
                value: new vU
            }
        },
        roughnessmap: {
            roughnessMap: {
                value: null
            },
            roughnessMapTransform: {
                value: new vU
            }
        },
        gradientmap: {
            gradientMap: {
                value: null
            }
        },
        fog: {
            fogDensity: {
                value: 0.00025
            },
            fogNear: {
                value: 1
            },
            fogFar: {
                value: 2000
            },
            fogColor: {
                value: new KU(16777215)
            }
        },
        lights: {
            ambientLightColor: {
                value: []
            },
            lightProbe: {
                value: []
            },
            directionalLights: {
                value: [],
                properties: {
                    direction: {},
                    color: {}
                }
            },
            directionalLightShadows: {
                value: [],
                properties: {
                    shadowIntensity: 1,
                    shadowBias: {},
                    shadowNormalBias: {},
                    shadowRadius: {},
                    shadowMapSize: {}
                }
            },
            directionalShadowMap: {
                value: []
            },
            directionalShadowMatrix: {
                value: []
            },
            spotLights: {
                value: [],
                properties: {
                    color: {},
                    position: {},
                    direction: {},
                    distance: {},
                    coneCos: {},
                    penumbraCos: {},
                    decay: {}
                }
            },
            spotLightShadows: {
                value: [],
                properties: {
                    shadowIntensity: 1,
                    shadowBias: {},
                    shadowNormalBias: {},
                    shadowRadius: {},
                    shadowMapSize: {}
                }
            },
            spotLightMap: {
                value: []
            },
            spotShadowMap: {
                value: []
            },
            spotLightMatrix: {
                value: []
            },
            pointLights: {
                value: [],
                properties: {
                    color: {},
                    position: {},
                    decay: {},
                    distance: {}
                }
            },
            pointLightShadows: {
                value: [],
                properties: {
                    shadowIntensity: 1,
                    shadowBias: {},
                    shadowNormalBias: {},
                    shadowRadius: {},
                    shadowMapSize: {},
                    shadowCameraNear: {},
                    shadowCameraFar: {}
                }
            },
            pointShadowMap: {
                value: []
            },
            pointShadowMatrix: {
                value: []
            },
            hemisphereLights: {
                value: [],
                properties: {
                    direction: {},
                    skyColor: {},
                    groundColor: {}
                }
            },
            rectAreaLights: {
                value: [],
                properties: {
                    color: {},
                    position: {},
                    width: {},
                    height: {}
                }
            },
            ltc_1: {
                value: null
            },
            ltc_2: {
                value: null
            }
        },
        points: {
            diffuse: {
                value: new KU(16777215)
            },
            opacity: {
                value: 1
            },
            size: {
                value: 1
            },
            scale: {
                value: 1
            },
            map: {
                value: null
            },
            alphaMap: {
                value: null
            },
            alphaMapTransform: {
                value: new vU
            },
            alphaTest: {
                value: 0
            },
            uvTransform: {
                value: new vU
            }
        },
        sprite: {
            diffuse: {
                value: new KU(16777215)
            },
            opacity: {
                value: 1
            },
            center: {
                value: new dU(0.5, 0.5)
            },
            rotation: {
                value: 0
            },
            map: {
                value: null
            },
            mapTransform: {
                value: new vU
            },
            alphaMap: {
                value: null
            },
            alphaMapTransform: {
                value: new vU
            },
            alphaTest: {
                value: 0
            }
        }
    },
    ID = {
        basic: {
            uniforms: Nd([MU.common, MU.specularmap, MU.envmap, MU.aomap, MU.lightmap, MU.fog]),
            vertexShader: yU.meshbasic_vert,
            fragmentShader: yU.meshbasic_frag
        },
        lambert: {
            uniforms: Nd([MU.common, MU.specularmap, MU.envmap, MU.aomap, MU.lightmap, MU.emissivemap, MU.bumpmap, MU.normalmap, MU.displacementmap, MU.fog, MU.lights, {
                emissive: {
                    value: new KU(0)
                }
            }]),
            vertexShader: yU.meshlambert_vert,
            fragmentShader: yU.meshlambert_frag
        },
        phong: {
            uniforms: Nd([MU.common, MU.specularmap, MU.envmap, MU.aomap, MU.lightmap, MU.emissivemap, MU.bumpmap, MU.normalmap, MU.displacementmap, MU.fog, MU.lights, {
                emissive: {
                    value: new KU(0)
                },
                specular: {
                    value: new KU(1118481)
                },
                shininess: {
                    value: 30
                }
            }]),
            vertexShader: yU.meshphong_vert,
            fragmentShader: yU.meshphong_frag
        },
        standard: {
            uniforms: Nd([MU.common, MU.envmap, MU.aomap, MU.lightmap, MU.emissivemap, MU.bumpmap, MU.normalmap, MU.displacementmap, MU.roughnessmap, MU.metalnessmap, MU.fog, MU.lights, {
                emissive: {
                    value: new KU(0)
                },
                roughness: {
                    value: 1
                },
                metalness: {
                    value: 0
                },
                envMapIntensity: {
                    value: 1
                }
            }]),
            vertexShader: yU.meshphysical_vert,
            fragmentShader: yU.meshphysical_frag
        },
        toon: {
            uniforms: Nd([MU.common, MU.aomap, MU.lightmap, MU.emissivemap, MU.bumpmap, MU.normalmap, MU.displacementmap, MU.gradientmap, MU.fog, MU.lights, {
                emissive: {
                    value: new KU(0)
                }
            }]),
            vertexShader: yU.meshtoon_vert,
            fragmentShader: yU.meshtoon_frag
        },
        matcap: {
            uniforms: Nd([MU.common, MU.bumpmap, MU.normalmap, MU.displacementmap, MU.fog, {
                matcap: {
                    value: null
                }
            }]),
            vertexShader: yU.meshmatcap_vert,
            fragmentShader: yU.meshmatcap_frag
        },
        points: {
            uniforms: Nd([MU.points, MU.fog]),
            vertexShader: yU.points_vert,
            fragmentShader: yU.points_frag
        },
        dashed: {
            uniforms: Nd([MU.common, MU.fog, {
                scale: {
                    value: 1
                },
                dashSize: {
                    value: 1
                },
                totalSize: {
                    value: 2
                }
            }]),
            vertexShader: yU.linedashed_vert,
            fragmentShader: yU.linedashed_frag
        },
        depth: {
            uniforms: Nd([MU.common, MU.displacementmap]),
            vertexShader: yU.depth_vert,
            fragmentShader: yU.depth_frag
        },
        normal: {
            uniforms: Nd([MU.common, MU.bumpmap, MU.normalmap, MU.displacementmap, {
                opacity: {
                    value: 1
                }
            }]),
            vertexShader: yU.meshnormal_vert,
            fragmentShader: yU.meshnormal_frag
        },
        sprite: {
            uniforms: Nd([MU.sprite, MU.fog]),
            vertexShader: yU.sprite_vert,
            fragmentShader: yU.sprite_frag
        },
        background: {
            uniforms: {
                uvTransform: {
                    value: new vU
                },
                t2D: {
                    value: null
                },
                backgroundIntensity: {
                    value: 1
                }
            },
            vertexShader: yU.background_vert,
            fragmentShader: yU.background_frag
        },
        backgroundCube: {
            uniforms: {
                envMap: {
                    value: null
                },
                flipEnvMap: {
                    value: -1
                },
                backgroundBlurriness: {
                    value: 0
                },
                backgroundIntensity: {
                    value: 1
                },
                backgroundRotation: {
                    value: new vU
                }
            },
            vertexShader: yU.backgroundCube_vert,
            fragmentShader: yU.backgroundCube_frag
        },
        cube: {
            uniforms: {
                tCube: {
                    value: null
                },
                tFlip: {
                    value: -1
                },
                opacity: {
                    value: 1
                }
            },
            vertexShader: yU.cube_vert,
            fragmentShader: yU.cube_frag
        },
        equirect: {
            uniforms: {
                tEquirect: {
                    value: null
                }
            },
            vertexShader: yU.equirect_vert,
            fragmentShader: yU.equirect_frag
        },
        distanceRGBA: {
            uniforms: Nd([MU.common, MU.displacementmap, {
                referencePosition: {
                    value: new i
                },
                nearDistance: {
                    value: 1
                },
                farDistance: {
                    value: 1000
                }
            }]),
            vertexShader: yU.distanceRGBA_vert,
            fragmentShader: yU.distanceRGBA_frag
        },
        shadow: {
            uniforms: Nd([MU.lights, MU.fog, {
                color: {
                    value: new KU(0)
                },
                opacity: {
                    value: 1
                }
            }]),
            vertexShader: yU.shadow_vert,
            fragmentShader: yU.shadow_frag
        }
    };
ID.physical = {
    uniforms: Nd([ID.standard.uniforms, {
        clearcoat: {
            value: 0
        },
        clearcoatMap: {
            value: null
        },
        clearcoatMapTransform: {
            value: new vU
        },
        clearcoatNormalMap: {
            value: null
        },
        clearcoatNormalMapTransform: {
            value: new vU
        },
        clearcoatNormalScale: {
            value: new dU(1, 1)
        },
        clearcoatRoughness: {
            value: 0
        },
        clearcoatRoughnessMap: {
            value: null
        },
        clearcoatRoughnessMapTransform: {
            value: new vU
        },
        dispersion: {
            value: 0
        },
        iridescence: {
            value: 0
        },
        iridescenceMap: {
            value: null
        },
        iridescenceMapTransform: {
            value: new vU
        },
        iridescenceIOR: {
            value: 1.3
        },
        iridescenceThicknessMinimum: {
            value: 100
        },
        iridescenceThicknessMaximum: {
            value: 400
        },
        iridescenceThicknessMap: {
            value: null
        },
        iridescenceThicknessMapTransform: {
            value: new vU
        },
        sheen: {
            value: 0
        },
        sheenColor: {
            value: new KU(0)
        },
        sheenColorMap: {
            value: null
        },
        sheenColorMapTransform: {
            value: new vU
        },
        sheenRoughness: {
            value: 1
        },
        sheenRoughnessMap: {
            value: null
        },
        sheenRoughnessMapTransform: {
            value: new vU
        },
        transmission: {
            value: 0
        },
        transmissionMap: {
            value: null
        },
        transmissionMapTransform: {
            value: new vU
        },
        transmissionSamplerSize: {
            value: new dU
        },
        transmissionSamplerMap: {
            value: null
        },
        thickness: {
            value: 0
        },
        thicknessMap: {
            value: null
        },
        thicknessMapTransform: {
            value: new vU
        },
        attenuationDistance: {
            value: 0
        },
        attenuationColor: {
            value: new KU(0)
        },
        specularColor: {
            value: new KU(1, 1, 1)
        },
        specularColorMap: {
            value: null
        },
        specularColorMapTransform: {
            value: new vU
        },
        specularIntensity: {
            value: 1
        },
        specularIntensityMap: {
            value: null
        },
        specularIntensityMapTransform: {
            value: new vU
        },
        anisotropyVector: {
            value: new dU
        },
        anisotropyMap: {
            value: null
        },
        anisotropyMapTransform: {
            value: new vU
        }
    }]),
    vertexShader: yU.meshphysical_vert,
    fragmentShader: yU.meshphysical_frag
};
var MH = {
        r: 0,
        b: 0,
        g: 0
    },
    P$ = new QD,
    wL = new Dd;

function cL(U, d, D, $, H, P, T) {
    let R = new KU(0),
        J = P === !0 ? 0 : 1,
        Q, M, S = null,
        B = 0,
        L = null;

    function E(C) {
        let I = C.isScene === !0 ? C.background : null;
        if (I && I.isTexture) I = (C.backgroundBlurriness > 0 ? D : d).get(I);
        return I
    }

    function k(C) {
        let I = !1,
            Z = E(C);
        if (Z === null) j(R, J);
        else if (Z && Z.isColor) j(Z, 1), I = !0;
        let a = U.xr.getEnvironmentBlendMode();
        if (a === "additive") $.buffers.color.setClear(0, 0, 0, 1, T);
        else if (a === "alpha-blend") $.buffers.color.setClear(0, 0, 0, 0, T);
        if (U.autoClear || I) $.buffers.depth.setTest(!0), $.buffers.depth.setMask(!0), $.buffers.color.setMask(!0), U.clear(U.autoClearColor, U.autoClearDepth, U.autoClearStencil)
    }

    function A(C, I) {
        let Z = E(I);
        if (Z && (Z.isCubeTexture || Z.mapping === 306)) {
            if (M === void 0) M = new _U(new oU(1, 1, 1), new _D({
                name: "BackgroundCubeMaterial",
                uniforms: z$(ID.backgroundCube.uniforms),
                vertexShader: ID.backgroundCube.vertexShader,
                fragmentShader: ID.backgroundCube.fragmentShader,
                side: 1,
                depthTest: !1,
                depthWrite: !1,
                fog: !1
            })), M.geometry.deleteAttribute("normal"), M.geometry.deleteAttribute("uv"), M.onBeforeRender = function(a, Y, f) {
                this.matrixWorld.copyPosition(f.matrixWorld)
            }, Object.defineProperty(M.material, "envMap", {
                get: function() {
                    return this.uniforms.envMap.value
                }
            }), H.update(M);
            if (P$.copy(I.backgroundRotation), P$.x *= -1, P$.y *= -1, P$.z *= -1, Z.isCubeTexture && Z.isRenderTargetTexture === !1) P$.y *= -1, P$.z *= -1;
            if (M.material.uniforms.envMap.value = Z, M.material.uniforms.flipEnvMap.value = Z.isCubeTexture && Z.isRenderTargetTexture === !1 ? -1 : 1, M.material.uniforms.backgroundBlurriness.value = I.backgroundBlurriness, M.material.uniforms.backgroundIntensity.value = I.backgroundIntensity, M.material.uniforms.backgroundRotation.value.setFromMatrix4(wL.makeRotationFromEuler(P$)), M.material.toneMapped = dd.getTransfer(Z.colorSpace) !== "srgb", S !== Z || B !== Z.version || L !== U.toneMapping) M.material.needsUpdate = !0, S = Z, B = Z.version, L = U.toneMapping;
            M.layers.enableAll(), C.unshift(M, M.geometry, M.material, 0, 0, null)
        } else if (Z && Z.isTexture) {
            if (Q === void 0) Q = new _U(new p$(2, 2), new _D({
                name: "BackgroundMaterial",
                uniforms: z$(ID.background.uniforms),
                vertexShader: ID.background.vertexShader,
                fragmentShader: ID.background.fragmentShader,
                side: 0,
                depthTest: !1,
                depthWrite: !1,
                fog: !1
            })), Q.geometry.deleteAttribute("normal"), Object.defineProperty(Q.material, "map", {
                get: function() {
                    return this.uniforms.t2D.value
                }
            }), H.update(Q);
            if (Q.material.uniforms.t2D.value = Z, Q.material.uniforms.backgroundIntensity.value = I.backgroundIntensity, Q.material.toneMapped = dd.getTransfer(Z.colorSpace) !== "srgb", Z.matrixAutoUpdate === !0) Z.updateMatrix();
            if (Q.material.uniforms.uvTransform.value.copy(Z.matrix), S !== Z || B !== Z.version || L !== U.toneMapping) Q.material.needsUpdate = !0, S = Z, B = Z.version, L = U.toneMapping;
            Q.layers.enableAll(), C.unshift(Q, Q.geometry, Q.material, 0, 0, null)
        }
    }

    function j(C, I) {
        C.getRGB(MH, M4(U)), $.buffers.color.setClear(MH.r, MH.g, MH.b, I, T)
    }
    return {
        getClearColor: function() {
            return R
        },
        setClearColor: function(C, I = 1) {
            R.set(C), J = I, j(R, J)
        },
        getClearAlpha: function() {
            return J
        },
        setClearAlpha: function(C) {
            J = C, j(R, J)
        },
        render: k,
        addToRenderList: A
    }
}

function eL(U, d) {
    let D = U.getParameter(U.MAX_VERTEX_ATTRIBS),
        $ = {},
        H = B(null),
        P = H,
        T = !1;

    function R(F, O, N, z, w) {
        let l = !1,
            c = S(z, N, O);
        if (P !== c) P = c, Q(P.object);
        if (l = L(F, z, N, w), l) E(F, z, N, w);
        if (w !== null) d.update(w, U.ELEMENT_ARRAY_BUFFER);
        if (l || T) {
            if (T = !1, Z(F, O, N, z), w !== null) U.bindBuffer(U.ELEMENT_ARRAY_BUFFER, d.get(w).buffer)
        }
    }

    function J() {
        return U.createVertexArray()
    }

    function Q(F) {
        return U.bindVertexArray(F)
    }

    function M(F) {
        return U.deleteVertexArray(F)
    }

    function S(F, O, N) {
        let z = N.wireframe === !0,
            w = $[F.id];
        if (w === void 0) w = {}, $[F.id] = w;
        let l = w[O.id];
        if (l === void 0) l = {}, w[O.id] = l;
        let c = l[z];
        if (c === void 0) c = B(J()), l[z] = c;
        return c
    }

    function B(F) {
        let O = [],
            N = [],
            z = [];
        for (let w = 0; w < D; w++) O[w] = 0, N[w] = 0, z[w] = 0;
        return {
            geometry: null,
            program: null,
            wireframe: !1,
            newAttributes: O,
            enabledAttributes: N,
            attributeDivisors: z,
            object: F,
            attributes: {},
            index: null
        }
    }

    function L(F, O, N, z) {
        let w = P.attributes,
            l = O.attributes,
            c = 0,
            y = N.getAttributes();
        for (let W in y)
            if (y[W].location >= 0) {
                let PU = w[W],
                    iU = l[W];
                if (iU === void 0) {
                    if (W === "instanceMatrix" && F.instanceMatrix) iU = F.instanceMatrix;
                    if (W === "instanceColor" && F.instanceColor) iU = F.instanceColor
                }
                if (PU === void 0) return !0;
                if (PU.attribute !== iU) return !0;
                if (iU && PU.data !== iU.data) return !0;
                c++
            } if (P.attributesNum !== c) return !0;
        if (P.index !== z) return !0;
        return !1
    }

    function E(F, O, N, z) {
        let w = {},
            l = O.attributes,
            c = 0,
            y = N.getAttributes();
        for (let W in y)
            if (y[W].location >= 0) {
                let PU = l[W];
                if (PU === void 0) {
                    if (W === "instanceMatrix" && F.instanceMatrix) PU = F.instanceMatrix;
                    if (W === "instanceColor" && F.instanceColor) PU = F.instanceColor
                }
                let iU = {};
                if (iU.attribute = PU, PU && PU.data) iU.data = PU.data;
                w[W] = iU, c++
            } P.attributes = w, P.attributesNum = c, P.index = z
    }

    function k() {
        let F = P.newAttributes;
        for (let O = 0, N = F.length; O < N; O++) F[O] = 0
    }

    function A(F) {
        j(F, 0)
    }

    function j(F, O) {
        let {
            newAttributes: N,
            enabledAttributes: z,
            attributeDivisors: w
        } = P;
        if (N[F] = 1, z[F] === 0) U.enableVertexAttribArray(F), z[F] = 1;
        if (w[F] !== O) U.vertexAttribDivisor(F, O), w[F] = O
    }

    function C() {
        let {
            newAttributes: F,
            enabledAttributes: O
        } = P;
        for (let N = 0, z = O.length; N < z; N++)
            if (O[N] !== F[N]) U.disableVertexAttribArray(N), O[N] = 0
    }

    function I(F, O, N, z, w, l, c) {
        if (c === !0) U.vertexAttribIPointer(F, O, N, w, l);
        else U.vertexAttribPointer(F, O, N, z, w, l)
    }

    function Z(F, O, N, z) {
        k();
        let w = z.attributes,
            l = N.getAttributes(),
            c = O.defaultAttributeValues;
        for (let y in l) {
            let W = l[y];
            if (W.location >= 0) {
                let UU = w[y];
                if (UU === void 0) {
                    if (y === "instanceMatrix" && F.instanceMatrix) UU = F.instanceMatrix;
                    if (y === "instanceColor" && F.instanceColor) UU = F.instanceColor
                }
                if (UU !== void 0) {
                    let {
                        normalized: PU,
                        itemSize: iU
                    } = UU, wU = d.get(UU);
                    if (wU === void 0) continue;
                    let {
                        buffer: o,
                        type: $U,
                        bytesPerElement: FU
                    } = wU, XU = $U === U.INT || $U === U.UNSIGNED_INT || UU.gpuType === 1013;
                    if (UU.isInterleavedBufferAttribute) {
                        let JU = UU.data,
                            mU = JU.stride,
                            nU = UU.offset;
                        if (JU.isInstancedInterleavedBuffer) {
                            for (let uU = 0; uU < W.locationSize; uU++) j(W.location + uU, JU.meshPerAttribute);
                            if (F.isInstancedMesh !== !0 && z._maxInstanceCount === void 0) z._maxInstanceCount = JU.meshPerAttribute * JU.count
                        } else
                            for (let uU = 0; uU < W.locationSize; uU++) A(W.location + uU);
                        U.bindBuffer(U.ARRAY_BUFFER, o);
                        for (let uU = 0; uU < W.locationSize; uU++) I(W.location + uU, iU / W.locationSize, $U, PU, mU * FU, (nU + iU / W.locationSize * uU) * FU, XU)
                    } else {
                        if (UU.isInstancedBufferAttribute) {
                            for (let JU = 0; JU < W.locationSize; JU++) j(W.location + JU, UU.meshPerAttribute);
                            if (F.isInstancedMesh !== !0 && z._maxInstanceCount === void 0) z._maxInstanceCount = UU.meshPerAttribute * UU.count
                        } else
                            for (let JU = 0; JU < W.locationSize; JU++) A(W.location + JU);
                        U.bindBuffer(U.ARRAY_BUFFER, o);
                        for (let JU = 0; JU < W.locationSize; JU++) I(W.location + JU, iU / W.locationSize, $U, PU, iU * FU, iU / W.locationSize * JU * FU, XU)
                    }
                } else if (c !== void 0) {
                    let PU = c[y];
                    if (PU !== void 0) switch (PU.length) {
                        case 2:
                            U.vertexAttrib2fv(W.location, PU);
                            break;
                        case 3:
                            U.vertexAttrib3fv(W.location, PU);
                            break;
                        case 4:
                            U.vertexAttrib4fv(W.location, PU);
                            break;
                        default:
                            U.vertexAttrib1fv(W.location, PU)
                    }
                }
            }
        }
        C()
    }

    function a() {
        G();
        for (let F in $) {
            let O = $[F];
            for (let N in O) {
                let z = O[N];
                for (let w in z) M(z[w].object), delete z[w];
                delete O[N]
            }
            delete $[F]
        }
    }

    function Y(F) {
        if ($[F.id] === void 0) return;
        let O = $[F.id];
        for (let N in O) {
            let z = O[N];
            for (let w in z) M(z[w].object), delete z[w];
            delete O[N]
        }
        delete $[F.id]
    }

    function f(F) {
        for (let O in $) {
            let N = $[O];
            if (N[F.id] === void 0) continue;
            let z = N[F.id];
            for (let w in z) M(z[w].object), delete z[w];
            delete N[F.id]
        }
    }

    function G() {
        if (X(), T = !0, P === H) return;
        P = H, Q(P.object)
    }

    function X() {
        H.geometry = null, H.program = null, H.wireframe = !1
    }
    return {
        setup: R,
        reset: G,
        resetDefaultState: X,
        dispose: a,
        releaseStatesOfGeometry: Y,
        releaseStatesOfProgram: f,
        initAttributes: k,
        enableAttribute: A,
        disableUnusedAttributes: C
    }
}

function vL(U, d, D) {
    let $;

    function H(Q) {
        $ = Q
    }

    function P(Q, M) {
        U.drawArrays($, Q, M), D.update(M, $, 1)
    }

    function T(Q, M, S) {
        if (S === 0) return;
        U.drawArraysInstanced($, Q, M, S), D.update(M, $, S)
    }

    function R(Q, M, S) {
        if (S === 0) return;
        d.get("WEBGL_multi_draw").multiDrawArraysWEBGL($, Q, 0, M, 0, S);
        let L = 0;
        for (let E = 0; E < S; E++) L += M[E];
        D.update(L, $, 1)
    }

    function J(Q, M, S, B) {
        if (S === 0) return;
        let L = d.get("WEBGL_multi_draw");
        if (L === null)
            for (let E = 0; E < Q.length; E++) T(Q[E], M[E], B[E]);
        else {
            L.multiDrawArraysInstancedWEBGL($, Q, 0, M, 0, B, 0, S);
            let E = 0;
            for (let k = 0; k < S; k++) E += M[k] * B[k];
            D.update(E, $, 1)
        }
    }
    this.setMode = H, this.render = P, this.renderInstances = T, this.renderMultiDraw = R, this.renderMultiDrawInstances = J
}

function lL(U, d, D, $) {
    let H;

    function P() {
        if (H !== void 0) return H;
        if (d.has("EXT_texture_filter_anisotropic") === !0) {
            let f = d.get("EXT_texture_filter_anisotropic");
            H = U.getParameter(f.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
        } else H = 0;
        return H
    }

    function T(f) {
        if (f !== 1023 && $.convert(f) !== U.getParameter(U.IMPLEMENTATION_COLOR_READ_FORMAT)) return !1;
        return !0
    }

    function R(f) {
        let G = f === 1016 && (d.has("EXT_color_buffer_half_float") || d.has("EXT_color_buffer_float"));
        if (f !== 1009 && $.convert(f) !== U.getParameter(U.IMPLEMENTATION_COLOR_READ_TYPE) && f !== 1015 && !G) return !1;
        return !0
    }

    function J(f) {
        if (f === "highp") {
            if (U.getShaderPrecisionFormat(U.VERTEX_SHADER, U.HIGH_FLOAT).precision > 0 && U.getShaderPrecisionFormat(U.FRAGMENT_SHADER, U.HIGH_FLOAT).precision > 0) return "highp";
            f = "mediump"
        }
        if (f === "mediump") {
            if (U.getShaderPrecisionFormat(U.VERTEX_SHADER, U.MEDIUM_FLOAT).precision > 0 && U.getShaderPrecisionFormat(U.FRAGMENT_SHADER, U.MEDIUM_FLOAT).precision > 0) return "mediump"
        }
        return "lowp"
    }
    let Q = D.precision !== void 0 ? D.precision : "highp",
        M = J(Q);
    if (M !== Q) console.warn("THREE.WebGLRenderer:", Q, "not supported, using", M, "instead."), Q = M;
    let S = D.logarithmicDepthBuffer === !0,
        B = D.reverseDepthBuffer === !0 && d.has("EXT_clip_control"),
        L = U.getParameter(U.MAX_TEXTURE_IMAGE_UNITS),
        E = U.getParameter(U.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
        k = U.getParameter(U.MAX_TEXTURE_SIZE),
        A = U.getParameter(U.MAX_CUBE_MAP_TEXTURE_SIZE),
        j = U.getParameter(U.MAX_VERTEX_ATTRIBS),
        C = U.getParameter(U.MAX_VERTEX_UNIFORM_VECTORS),
        I = U.getParameter(U.MAX_VARYING_VECTORS),
        Z = U.getParameter(U.MAX_FRAGMENT_UNIFORM_VECTORS),
        a = E > 0,
        Y = U.getParameter(U.MAX_SAMPLES);
    return {
        isWebGL2: !0,
        getMaxAnisotropy: P,
        getMaxPrecision: J,
        textureFormatReadable: T,
        textureTypeReadable: R,
        precision: Q,
        logarithmicDepthBuffer: S,
        reverseDepthBuffer: B,
        maxTextures: L,
        maxVertexTextures: E,
        maxTextureSize: k,
        maxCubemapSize: A,
        maxAttributes: j,
        maxVertexUniforms: C,
        maxVaryings: I,
        maxFragmentUniforms: Z,
        vertexTextures: a,
        maxSamples: Y
    }
}

function yL(U) {
    let d = this,
        D = null,
        $ = 0,
        H = !1,
        P = !1,
        T = new ED,
        R = new vU,
        J = {
            value: null,
            needsUpdate: !1
        };
    this.uniform = J, this.numPlanes = 0, this.numIntersection = 0, this.init = function(S, B) {
        let L = S.length !== 0 || B || $ !== 0 || H;
        return H = B, $ = S.length, L
    }, this.beginShadows = function() {
        P = !0, M(null)
    }, this.endShadows = function() {
        P = !1
    }, this.setGlobalState = function(S, B) {
        D = M(S, B, 0)
    }, this.setState = function(S, B, L) {
        let {
            clippingPlanes: E,
            clipIntersection: k,
            clipShadows: A
        } = S, j = U.get(S);
        if (!H || E === null || E.length === 0 || P && !A)
            if (P) M(null);
            else Q();
        else {
            let C = P ? 0 : $,
                I = C * 4,
                Z = j.clippingState || null;
            J.value = Z, Z = M(E, B, I, L);
            for (let a = 0; a !== I; ++a) Z[a] = D[a];
            j.clippingState = Z, this.numIntersection = k ? this.numPlanes : 0, this.numPlanes += C
        }
    };

    function Q() {
        if (J.value !== D) J.value = D, J.needsUpdate = $ > 0;
        d.numPlanes = $, d.numIntersection = 0
    }

    function M(S, B, L, E) {
        let k = S !== null ? S.length : 0,
            A = null;
        if (k !== 0) {
            if (A = J.value, E !== !0 || A === null) {
                let j = L + k * 4,
                    C = B.matrixWorldInverse;
                if (R.getNormalMatrix(C), A === null || A.length < j) A = new Float32Array(j);
                for (let I = 0, Z = L; I !== k; ++I, Z += 4) T.copy(S[I]).applyMatrix4(C, R), T.normal.toArray(A, Z), A[Z + 3] = T.constant
            }
            J.value = A, J.needsUpdate = !0
        }
        return d.numPlanes = k, d.numIntersection = 0, A
    }
}

function oL(U) {
    let d = new WeakMap;

    function D(T, R) {
        if (R === 303) T.mapping = 301;
        else if (R === 304) T.mapping = 302;
        return T
    }

    function $(T) {
        if (T && T.isTexture) {
            let R = T.mapping;
            if (R === 303 || R === 304)
                if (d.has(T)) {
                    let J = d.get(T).texture;
                    return D(J, T.mapping)
                } else {
                    let J = T.image;
                    if (J && J.height > 0) {
                        let Q = new L4(J.height);
                        return Q.fromEquirectangularTexture(U, T), d.set(T, Q), T.addEventListener("dispose", H), D(Q.texture, T.mapping)
                    } else return null
                }
        }
        return T
    }

    function H(T) {
        let R = T.target;
        R.removeEventListener("dispose", H);
        let J = d.get(R);
        if (J !== void 0) d.delete(R), J.dispose()
    }

    function P() {
        d = new WeakMap
    }
    return {
        get: $,
        dispose: P
    }
}
class F0 extends PT {
    constructor(U = -1, d = 1, D = 1, $ = -1, H = 0.1, P = 2000) {
        super();
        this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = U, this.right = d, this.top = D, this.bottom = $, this.near = H, this.far = P, this.updateProjectionMatrix()
    }
    copy(U, d) {
        return super.copy(U, d), this.left = U.left, this.right = U.right, this.top = U.top, this.bottom = U.bottom, this.near = U.near, this.far = U.far, this.zoom = U.zoom, this.view = U.view === null ? null : Object.assign({}, U.view), this
    }
    setViewOffset(U, d, D, $, H, P) {
        if (this.view === null) this.view = {
            enabled: !0,
            fullWidth: 1,
            fullHeight: 1,
            offsetX: 0,
            offsetY: 0,
            width: 1,
            height: 1
        };
        this.view.enabled = !0, this.view.fullWidth = U, this.view.fullHeight = d, this.view.offsetX = D, this.view.offsetY = $, this.view.width = H, this.view.height = P, this.updateProjectionMatrix()
    }
    clearViewOffset() {
        if (this.view !== null) this.view.enabled = !1;
        this.updateProjectionMatrix()
    }
    updateProjectionMatrix() {
        let U = (this.right - this.left) / (2 * this.zoom),
            d = (this.top - this.bottom) / (2 * this.zoom),
            D = (this.right + this.left) / 2,
            $ = (this.top + this.bottom) / 2,
            H = D - U,
            P = D + U,
            T = $ + d,
            R = $ - d;
        if (this.view !== null && this.view.enabled) {
            let J = (this.right - this.left) / this.view.fullWidth / this.zoom,
                Q = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
            H += J * this.view.offsetX, P = H + J * this.view.width, T -= Q * this.view.offsetY, R = T - Q * this.view.height
        }
        this.projectionMatrix.makeOrthographic(H, P, T, R, this.near, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert()
    }
    toJSON(U) {
        let d = super.toJSON(U);
        if (d.object.zoom = this.zoom, d.object.left = this.left, d.object.right = this.right, d.object.top = this.top, d.object.bottom = this.bottom, d.object.near = this.near, d.object.far = this.far, this.view !== null) d.object.view = Object.assign({}, this.view);
        return d
    }
}
var _$ = 4,
    ZQ = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582],
    Q$ = 20,
    GP = new F0,
    aQ = new KU,
    mP = null,
    _P = 0,
    uP = 0,
    NP = !1,
    R$ = (1 + Math.sqrt(5)) / 2,
    b$ = 1 / R$,
    YQ = [new i(-R$, b$, 0), new i(R$, b$, 0), new i(-b$, 0, R$), new i(b$, 0, R$), new i(0, R$, -b$), new i(0, R$, b$), new i(-1, 1, -1), new i(1, 1, -1), new i(-1, 1, 1), new i(1, 1, 1)];
class eP {
    constructor(U) {
        this._renderer = U, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial)
    }
    fromScene(U, d = 0, D = 0.1, $ = 100) {
        mP = this._renderer.getRenderTarget(), _P = this._renderer.getActiveCubeFace(), uP = this._renderer.getActiveMipmapLevel(), NP = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(256);
        let H = this._allocateTargets();
        if (H.depthBuffer = !0, this._sceneToCubeUV(U, D, $, H), d > 0) this._blur(H, 0, 0, d);
        return this._applyPMREM(H), this._cleanup(H), H
    }
    fromEquirectangular(U, d = null) {
        return this._fromTexture(U, d)
    }
    fromCubemap(U, d = null) {
        return this._fromTexture(U, d)
    }
    compileCubemapShader() {
        if (this._cubemapMaterial === null) this._cubemapMaterial = FQ(), this._compileMaterial(this._cubemapMaterial)
    }
    compileEquirectangularShader() {
        if (this._equirectMaterial === null) this._equirectMaterial = VQ(), this._compileMaterial(this._equirectMaterial)
    }
    dispose() {
        if (this._dispose(), this._cubemapMaterial !== null) this._cubemapMaterial.dispose();
        if (this._equirectMaterial !== null) this._equirectMaterial.dispose()
    }
    _setSize(U) {
        this._lodMax = Math.floor(Math.log2(U)), this._cubeSize = Math.pow(2, this._lodMax)
    }
    _dispose() {
        if (this._blurMaterial !== null) this._blurMaterial.dispose();
        if (this._pingPongRenderTarget !== null) this._pingPongRenderTarget.dispose();
        for (let U = 0; U < this._lodPlanes.length; U++) this._lodPlanes[U].dispose()
    }
    _cleanup(U) {
        this._renderer.setRenderTarget(mP, _P, uP), this._renderer.xr.enabled = NP, U.scissorTest = !1, BH(U, 0, 0, U.width, U.height)
    }
    _fromTexture(U, d) {
        if (U.mapping === 301 || U.mapping === 302) this._setSize(U.image.length === 0 ? 16 : U.image[0].width || U.image[0].image.width);
        else this._setSize(U.image.width / 4);
        mP = this._renderer.getRenderTarget(), _P = this._renderer.getActiveCubeFace(), uP = this._renderer.getActiveMipmapLevel(), NP = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
        let D = d || this._allocateTargets();
        return this._textureToCubeUV(U, D), this._applyPMREM(D), this._cleanup(D), D
    }
    _allocateTargets() {
        let U = 3 * Math.max(this._cubeSize, 112),
            d = 4 * this._cubeSize,
            D = {
                magFilter: 1006,
                minFilter: 1006,
                generateMipmaps: !1,
                type: 1016,
                format: 1023,
                colorSpace: "srgb-linear",
                depthBuffer: !1
            },
            $ = XQ(U, d, D);
        if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== U || this._pingPongRenderTarget.height !== d) {
            if (this._pingPongRenderTarget !== null) this._dispose();
            this._pingPongRenderTarget = XQ(U, d, D);
            let {
                _lodMax: H
            } = this;
            ({
                sizeLods: this._sizeLods,
                lodPlanes: this._lodPlanes,
                sigmas: this._sigmas
            } = nL(H)), this._blurMaterial = sL(H, U, d)
        }
        return $
    }
    _compileMaterial(U) {
        let d = new _U(this._lodPlanes[0], U);
        this._renderer.compile(d, GP)
    }
    _sceneToCubeUV(U, d, D, $) {
        let T = new wd(90, 1, d, D),
            R = [1, -1, 1, 1, 1, 1],
            J = [1, 1, 1, -1, -1, -1],
            Q = this._renderer,
            M = Q.autoClear,
            S = Q.toneMapping;
        Q.getClearColor(aQ), Q.toneMapping = 0, Q.autoClear = !1;
        let B = new ND({
                name: "PMREM.Background",
                side: 1,
                depthWrite: !1,
                depthTest: !1
            }),
            L = new _U(new oU, B),
            E = !1,
            k = U.background;
        if (k) {
            if (k.isColor) B.color.copy(k), U.background = null, E = !0
        } else B.color.copy(aQ), E = !0;
        for (let A = 0; A < 6; A++) {
            let j = A % 3;
            if (j === 0) T.up.set(0, R[A], 0), T.lookAt(J[A], 0, 0);
            else if (j === 1) T.up.set(0, 0, R[A]), T.lookAt(0, J[A], 0);
            else T.up.set(0, R[A], 0), T.lookAt(0, 0, J[A]);
            let C = this._cubeSize;
            if (BH($, j * C, A > 2 ? C : 0, C, C), Q.setRenderTarget($), E) Q.render(L, T);
            Q.render(U, T)
        }
        L.geometry.dispose(), L.material.dispose(), Q.toneMapping = S, Q.autoClear = M, U.background = k
    }
    _textureToCubeUV(U, d) {
        let D = this._renderer,
            $ = U.mapping === 301 || U.mapping === 302;
        if ($) {
            if (this._cubemapMaterial === null) this._cubemapMaterial = FQ();
            this._cubemapMaterial.uniforms.flipEnvMap.value = U.isRenderTargetTexture === !1 ? -1 : 1
        } else if (this._equirectMaterial === null) this._equirectMaterial = VQ();
        let H = $ ? this._cubemapMaterial : this._equirectMaterial,
            P = new _U(this._lodPlanes[0], H),
            T = H.uniforms;
        T.envMap.value = U;
        let R = this._cubeSize;
        BH(d, 0, 0, 3 * R, 2 * R), D.setRenderTarget(d), D.render(P, GP)
    }
    _applyPMREM(U) {
        let d = this._renderer,
            D = d.autoClear;
        d.autoClear = !1;
        let $ = this._lodPlanes.length;
        for (let H = 1; H < $; H++) {
            let P = Math.sqrt(this._sigmas[H] * this._sigmas[H] - this._sigmas[H - 1] * this._sigmas[H - 1]),
                T = YQ[($ - H - 1) % YQ.length];
            this._blur(U, H - 1, H, P, T)
        }
        d.autoClear = D
    }
    _blur(U, d, D, $, H) {
        let P = this._pingPongRenderTarget;
        this._halfBlur(U, P, d, D, $, "latitudinal", H), this._halfBlur(P, U, D, D, $, "longitudinal", H)
    }
    _halfBlur(U, d, D, $, H, P, T) {
        let R = this._renderer,
            J = this._blurMaterial;
        if (P !== "latitudinal" && P !== "longitudinal") console.error("blur direction must be either latitudinal or longitudinal!");
        let Q = 3,
            M = new _U(this._lodPlanes[$], J),
            S = J.uniforms,
            B = this._sizeLods[D] - 1,
            L = isFinite(H) ? Math.PI / (2 * B) : 2 * Math.PI / (2 * Q$ - 1),
            E = H / L,
            k = isFinite(H) ? 1 + Math.floor(Q * E) : Q$;
        if (k > Q$) console.warn(`sigmaRadians, ${H}, is too large and will clip, as it requested ${k} samples when the maximum is set to ${Q$}`);
        let A = [],
            j = 0;
        for (let Y = 0; Y < Q$; ++Y) {
            let f = Y / E,
                G = Math.exp(-f * f / 2);
            if (A.push(G), Y === 0) j += G;
            else if (Y < k) j += 2 * G
        }
        for (let Y = 0; Y < A.length; Y++) A[Y] = A[Y] / j;
        if (S.envMap.value = U.texture, S.samples.value = k, S.weights.value = A, S.latitudinal.value = P === "latitudinal", T) S.poleAxis.value = T;
        let {
            _lodMax: C
        } = this;
        S.dTheta.value = L, S.mipInt.value = C - D;
        let I = this._sizeLods[$],
            Z = 3 * I * ($ > C - _$ ? $ - C + _$ : 0),
            a = 4 * (this._cubeSize - I);
        BH(d, Z, a, 3 * I, 2 * I), R.setRenderTarget(d), R.render(M, GP)
    }
}

function nL(U) {
    let d = [],
        D = [],
        $ = [],
        H = U,
        P = U - _$ + 1 + ZQ.length;
    for (let T = 0; T < P; T++) {
        let R = Math.pow(2, H);
        D.push(R);
        let J = 1 / R;
        if (T > U - _$) J = ZQ[T - U + _$ - 1];
        else if (T === 0) J = 0;
        $.push(J);
        let Q = 1 / (R - 2),
            M = -Q,
            S = 1 + Q,
            B = [M, M, S, M, S, S, M, M, S, S, M, S],
            L = 6,
            E = 6,
            k = 3,
            A = 2,
            j = 1,
            C = new Float32Array(k * E * L),
            I = new Float32Array(A * E * L),
            Z = new Float32Array(j * E * L);
        for (let Y = 0; Y < L; Y++) {
            let f = Y % 3 * 2 / 3 - 1,
                G = Y > 2 ? 0 : -1,
                X = [f, G, 0, f + 0.6666666666666666, G, 0, f + 0.6666666666666666, G + 1, 0, f, G, 0, f + 0.6666666666666666, G + 1, 0, f, G + 1, 0];
            C.set(X, k * E * Y), I.set(B, A * E * Y);
            let F = [Y, Y, Y, Y, Y, Y];
            Z.set(F, j * E * Y)
        }
        let a = new Fd;
        if (a.setAttribute("position", new Wd(C, k)), a.setAttribute("uv", new Wd(I, A)), a.setAttribute("faceIndex", new Wd(Z, j)), d.push(a), H > _$) H--
    }
    return {
        lodPlanes: d,
        sizeLods: D,
        sigmas: $
    }
}

function XQ(U, d, D) {
    let $ = new oD(U, d, D);
    return $.texture.mapping = 306, $.texture.name = "PMREM.cubeUv", $.scissorTest = !0, $
}

function BH(U, d, D, $, H) {
    U.viewport.set(d, D, $, H), U.scissor.set(d, D, $, H)
}

function sL(U, d, D) {
    let $ = new Float32Array(Q$),
        H = new i(0, 1, 0);
    return new _D({
        name: "SphericalGaussianBlur",
        defines: {
            n: Q$,
            CUBEUV_TEXEL_WIDTH: 1 / d,
            CUBEUV_TEXEL_HEIGHT: 1 / D,
            CUBEUV_MAX_MIP: `${U}.0`
        },
        uniforms: {
            envMap: {
                value: null
            },
            samples: {
                value: 1
            },
            weights: {
                value: $
            },
            latitudinal: {
                value: !1
            },
            dTheta: {
                value: 0
            },
            mipInt: {
                value: 0
            },
            poleAxis: {
                value: H
            }
        },
        vertexShader: RT(),
        fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,
        blending: 0,
        depthTest: !1,
        depthWrite: !1
    })
}

function VQ() {
    return new _D({
        name: "EquirectangularToCubeUV",
        uniforms: {
            envMap: {
                value: null
            }
        },
        vertexShader: RT(),
        fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,
        blending: 0,
        depthTest: !1,
        depthWrite: !1
    })
}

function FQ() {
    return new _D({
        name: "CubemapToCubeUV",
        uniforms: {
            envMap: {
                value: null
            },
            flipEnvMap: {
                value: -1
            }
        },
        vertexShader: RT(),
        fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,
        blending: 0,
        depthTest: !1,
        depthWrite: !1
    })
}

function RT() {
    return `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`
}

function xL(U) {
    let d = new WeakMap,
        D = null;

    function $(R) {
        if (R && R.isTexture) {
            let J = R.mapping,
                Q = J === 303 || J === 304,
                M = J === 301 || J === 302;
            if (Q || M) {
                let S = d.get(R),
                    B = S !== void 0 ? S.texture.pmremVersion : 0;
                if (R.isRenderTargetTexture && R.pmremVersion !== B) {
                    if (D === null) D = new eP(U);
                    return S = Q ? D.fromEquirectangular(R, S) : D.fromCubemap(R, S), S.texture.pmremVersion = R.pmremVersion, d.set(R, S), S.texture
                } else if (S !== void 0) return S.texture;
                else {
                    let L = R.image;
                    if (Q && L && L.height > 0 || M && L && H(L)) {
                        if (D === null) D = new eP(U);
                        return S = Q ? D.fromEquirectangular(R) : D.fromCubemap(R), S.texture.pmremVersion = R.pmremVersion, d.set(R, S), R.addEventListener("dispose", P), S.texture
                    } else return null
                }
            }
        }
        return R
    }

    function H(R) {
        let J = 0,
            Q = 6;
        for (let M = 0; M < Q; M++)
            if (R[M] !== void 0) J++;
        return J === Q
    }

    function P(R) {
        let J = R.target;
        J.removeEventListener("dispose", P);
        let Q = d.get(J);
        if (Q !== void 0) d.delete(J), Q.dispose()
    }

    function T() {
        if (d = new WeakMap, D !== null) D.dispose(), D = null
    }
    return {
        get: $,
        dispose: T
    }
}

function rL(U) {
    let d = {};

    function D($) {
        if (d[$] !== void 0) return d[$];
        let H;
        switch ($) {
            case "WEBGL_depth_texture":
                H = U.getExtension("WEBGL_depth_texture") || U.getExtension("MOZ_WEBGL_depth_texture") || U.getExtension("WEBKIT_WEBGL_depth_texture");
                break;
            case "EXT_texture_filter_anisotropic":
                H = U.getExtension("EXT_texture_filter_anisotropic") || U.getExtension("MOZ_EXT_texture_filter_anisotropic") || U.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
                break;
            case "WEBGL_compressed_texture_s3tc":
                H = U.getExtension("WEBGL_compressed_texture_s3tc") || U.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || U.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
                break;
            case "WEBGL_compressed_texture_pvrtc":
                H = U.getExtension("WEBGL_compressed_texture_pvrtc") || U.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
                break;
            default:
                H = U.getExtension($)
        }
        return d[$] = H, H
    }
    return {
        has: function($) {
            return D($) !== null
        },
        init: function() {
            D("EXT_color_buffer_float"), D("WEBGL_clip_cull_distance"), D("OES_texture_float_linear"), D("EXT_color_buffer_half_float"), D("WEBGL_multisampled_render_to_texture"), D("WEBGL_render_shared_exponent")
        },
        get: function($) {
            let H = D($);
            if (H === null) J0("THREE.WebGLRenderer: " + $ + " extension not supported.");
            return H
        }
    }
}

function tL(U, d, D, $) {
    let H = {},
        P = new WeakMap;

    function T(S) {
        let B = S.target;
        if (B.index !== null) d.remove(B.index);
        for (let E in B.attributes) d.remove(B.attributes[E]);
        for (let E in B.morphAttributes) {
            let k = B.morphAttributes[E];
            for (let A = 0, j = k.length; A < j; A++) d.remove(k[A])
        }
        B.removeEventListener("dispose", T), delete H[B.id];
        let L = P.get(B);
        if (L) d.remove(L), P.delete(B);
        if ($.releaseStatesOfGeometry(B), B.isInstancedBufferGeometry === !0) delete B._maxInstanceCount;
        D.memory.geometries--
    }

    function R(S, B) {
        if (H[B.id] === !0) return B;
        return B.addEventListener("dispose", T), H[B.id] = !0, D.memory.geometries++, B
    }

    function J(S) {
        let B = S.attributes;
        for (let E in B) d.update(B[E], U.ARRAY_BUFFER);
        let L = S.morphAttributes;
        for (let E in L) {
            let k = L[E];
            for (let A = 0, j = k.length; A < j; A++) d.update(k[A], U.ARRAY_BUFFER)
        }
    }

    function Q(S) {
        let B = [],
            L = S.index,
            E = S.attributes.position,
            k = 0;
        if (L !== null) {
            let C = L.array;
            k = L.version;
            for (let I = 0, Z = C.length; I < Z; I += 3) {
                let a = C[I + 0],
                    Y = C[I + 1],
                    f = C[I + 2];
                B.push(a, Y, Y, f, f, a)
            }
        } else if (E !== void 0) {
            let C = E.array;
            k = E.version;
            for (let I = 0, Z = C.length / 3 - 1; I < Z; I += 3) {
                let a = I + 0,
                    Y = I + 1,
                    f = I + 2;
                B.push(a, Y, Y, f, f, a)
            }
        } else return;
        let A = new((T4(B)) ? HT : $T)(B, 1);
        A.version = k;
        let j = P.get(S);
        if (j) d.remove(j);
        P.set(S, A)
    }

    function M(S) {
        let B = P.get(S);
        if (B) {
            let L = S.index;
            if (L !== null) {
                if (B.version < L.version) Q(S)
            }
        } else Q(S);
        return P.get(S)
    }
    return {
        get: R,
        update: J,
        getWireframeAttribute: M
    }
}

function UA(U, d, D) {
    let $;

    function H(B) {
        $ = B
    }
    let P, T;

    function R(B) {
        P = B.type, T = B.bytesPerElement
    }

    function J(B, L) {
        U.drawElements($, L, P, B * T), D.update(L, $, 1)
    }

    function Q(B, L, E) {
        if (E === 0) return;
        U.drawElementsInstanced($, L, P, B * T, E), D.update(L, $, E)
    }

    function M(B, L, E) {
        if (E === 0) return;
        d.get("WEBGL_multi_draw").multiDrawElementsWEBGL($, L, 0, P, B, 0, E);
        let A = 0;
        for (let j = 0; j < E; j++) A += L[j];
        D.update(A, $, 1)
    }

    function S(B, L, E, k) {
        if (E === 0) return;
        let A = d.get("WEBGL_multi_draw");
        if (A === null)
            for (let j = 0; j < B.length; j++) Q(B[j] / T, L[j], k[j]);
        else {
            A.multiDrawElementsInstancedWEBGL($, L, 0, P, B, 0, k, 0, E);
            let j = 0;
            for (let C = 0; C < E; C++) j += L[C] * k[C];
            D.update(j, $, 1)
        }
    }
    this.setMode = H, this.setIndex = R, this.render = J, this.renderInstances = Q, this.renderMultiDraw = M, this.renderMultiDrawInstances = S
}

function dA(U) {
    let d = {
            geometries: 0,
            textures: 0
        },
        D = {
            frame: 0,
            calls: 0,
            triangles: 0,
            points: 0,
            lines: 0
        };

    function $(P, T, R) {
        switch (D.calls++, T) {
            case U.TRIANGLES:
                D.triangles += R * (P / 3);
                break;
            case U.LINES:
                D.lines += R * (P / 2);
                break;
            case U.LINE_STRIP:
                D.lines += R * (P - 1);
                break;
            case U.LINE_LOOP:
                D.lines += R * P;
                break;
            case U.POINTS:
                D.points += R * P;
                break;
            default:
                console.error("THREE.WebGLInfo: Unknown draw mode:", T);
                break
        }
    }

    function H() {
        D.calls = 0, D.triangles = 0, D.points = 0, D.lines = 0
    }
    return {
        memory: d,
        render: D,
        programs: null,
        autoReset: !0,
        reset: H,
        update: $
    }
}

function DA(U, d, D) {
    let $ = new WeakMap,
        H = new ad;

    function P(T, R, J) {
        let Q = T.morphTargetInfluences,
            M = R.morphAttributes.position || R.morphAttributes.normal || R.morphAttributes.color,
            S = M !== void 0 ? M.length : 0,
            B = $.get(R);
        if (B === void 0 || B.count !== S) {
            let X = function() {
                f.dispose(), $.delete(R), R.removeEventListener("dispose", X)
            };
            if (B !== void 0) B.texture.dispose();
            let L = R.morphAttributes.position !== void 0,
                E = R.morphAttributes.normal !== void 0,
                k = R.morphAttributes.color !== void 0,
                A = R.morphAttributes.position || [],
                j = R.morphAttributes.normal || [],
                C = R.morphAttributes.color || [],
                I = 0;
            if (L === !0) I = 1;
            if (E === !0) I = 2;
            if (k === !0) I = 3;
            let Z = R.attributes.position.count * I,
                a = 1;
            if (Z > d.maxTextureSize) a = Math.ceil(Z / d.maxTextureSize), Z = d.maxTextureSize;
            let Y = new Float32Array(Z * a * 4 * S),
                f = new DT(Y, Z, a, S);
            f.type = 1015, f.needsUpdate = !0;
            let G = I * 4;
            for (let F = 0; F < S; F++) {
                let O = A[F],
                    N = j[F],
                    z = C[F],
                    w = Z * a * 4 * F;
                for (let l = 0; l < O.count; l++) {
                    let c = l * G;
                    if (L === !0) H.fromBufferAttribute(O, l), Y[w + c + 0] = H.x, Y[w + c + 1] = H.y, Y[w + c + 2] = H.z, Y[w + c + 3] = 0;
                    if (E === !0) H.fromBufferAttribute(N, l), Y[w + c + 4] = H.x, Y[w + c + 5] = H.y, Y[w + c + 6] = H.z, Y[w + c + 7] = 0;
                    if (k === !0) H.fromBufferAttribute(z, l), Y[w + c + 8] = H.x, Y[w + c + 9] = H.y, Y[w + c + 10] = H.z, Y[w + c + 11] = z.itemSize === 4 ? H.w : 1
                }
            }
            B = {
                count: S,
                texture: f,
                size: new dU(Z, a)
            }, $.set(R, B), R.addEventListener("dispose", X)
        }
        if (T.isInstancedMesh === !0 && T.morphTexture !== null) J.getUniforms().setValue(U, "morphTexture", T.morphTexture, D);
        else {
            let L = 0;
            for (let k = 0; k < Q.length; k++) L += Q[k];
            let E = R.morphTargetsRelative ? 1 : 1 - L;
            J.getUniforms().setValue(U, "morphTargetBaseInfluence", E), J.getUniforms().setValue(U, "morphTargetInfluences", Q)
        }
        J.getUniforms().setValue(U, "morphTargetsTexture", B.texture, D), J.getUniforms().setValue(U, "morphTargetsTextureSize", B.size)
    }
    return {
        update: P
    }
}

function $A(U, d, D, $) {
    let H = new WeakMap;

    function P(J) {
        let Q = $.render.frame,
            M = J.geometry,
            S = d.get(J, M);
        if (H.get(S) !== Q) d.update(S), H.set(S, Q);
        if (J.isInstancedMesh) {
            if (J.hasEventListener("dispose", R) === !1) J.addEventListener("dispose", R);
            if (H.get(J) !== Q) {
                if (D.update(J.instanceMatrix, U.ARRAY_BUFFER), J.instanceColor !== null) D.update(J.instanceColor, U.ARRAY_BUFFER);
                H.set(J, Q)
            }
        }
        if (J.isSkinnedMesh) {
            let B = J.skeleton;
            if (H.get(B) !== Q) B.update(), H.set(B, Q)
        }
        return S
    }

    function T() {
        H = new WeakMap
    }

    function R(J) {
        let Q = J.target;
        if (Q.removeEventListener("dispose", R), D.remove(Q.instanceMatrix), Q.instanceColor !== null) D.remove(Q.instanceColor)
    }
    return {
        update: P,
        dispose: T
    }
}
class QT extends _d {
    constructor(U, d, D, $, H, P, T, R, J, Q = 1026) {
        if (Q !== 1026 && Q !== 1027) throw Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
        if (D === void 0 && Q === 1026) D = 1014;
        if (D === void 0 && Q === 1027) D = 1020;
        super(null, $, H, P, T, R, Q, D, J);
        this.isDepthTexture = !0, this.image = {
            width: U,
            height: d
        }, this.magFilter = T !== void 0 ? T : 1003, this.minFilter = R !== void 0 ? R : 1003, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null
    }
    copy(U) {
        return super.copy(U), this.compareFunction = U.compareFunction, this
    }
    toJSON(U) {
        let d = super.toJSON(U);
        if (this.compareFunction !== null) d.compareFunction = this.compareFunction;
        return d
    }
}
var j4 = new _d,
    CQ = new QT(1, 1),
    E4 = new DT,
    I4 = new S4,
    k4 = new TT,
    KQ = [],
    fQ = [],
    hQ = new Float32Array(16),
    bQ = new Float32Array(9),
    iQ = new Float32Array(4);

function g$(U, d, D) {
    let $ = U[0];
    if ($ <= 0 || $ > 0) return U;
    let H = d * D,
        P = KQ[H];
    if (P === void 0) P = new Float32Array(H), KQ[H] = P;
    if (d !== 0) {
        $.toArray(P, 0);
        for (let T = 1, R = 0; T !== d; ++T) R += D, U[T].toArray(P, R)
    }
    return P
}

function Cd(U, d) {
    if (U.length !== d.length) return !1;
    for (let D = 0, $ = U.length; D < $; D++)
        if (U[D] !== d[D]) return !1;
    return !0
}

function Kd(U, d) {
    for (let D = 0, $ = d.length; D < $; D++) U[D] = d[D]
}

function bH(U, d) {
    let D = fQ[d];
    if (D === void 0) D = new Int32Array(d), fQ[d] = D;
    for (let $ = 0; $ !== d; ++$) D[$] = U.allocateTextureUnit();
    return D
}

function HA(U, d) {
    let D = this.cache;
    if (D[0] === d) return;
    U.uniform1f(this.addr, d), D[0] = d
}

function PA(U, d) {
    let D = this.cache;
    if (d.x !== void 0) {
        if (D[0] !== d.x || D[1] !== d.y) U.uniform2f(this.addr, d.x, d.y), D[0] = d.x, D[1] = d.y
    } else {
        if (Cd(D, d)) return;
        U.uniform2fv(this.addr, d), Kd(D, d)
    }
}

function TA(U, d) {
    let D = this.cache;
    if (d.x !== void 0) {
        if (D[0] !== d.x || D[1] !== d.y || D[2] !== d.z) U.uniform3f(this.addr, d.x, d.y, d.z), D[0] = d.x, D[1] = d.y, D[2] = d.z
    } else if (d.r !== void 0) {
        if (D[0] !== d.r || D[1] !== d.g || D[2] !== d.b) U.uniform3f(this.addr, d.r, d.g, d.b), D[0] = d.r, D[1] = d.g, D[2] = d.b
    } else {
        if (Cd(D, d)) return;
        U.uniform3fv(this.addr, d), Kd(D, d)
    }
}

function RA(U, d) {
    let D = this.cache;
    if (d.x !== void 0) {
        if (D[0] !== d.x || D[1] !== d.y || D[2] !== d.z || D[3] !== d.w) U.uniform4f(this.addr, d.x, d.y, d.z, d.w), D[0] = d.x, D[1] = d.y, D[2] = d.z, D[3] = d.w
    } else {
        if (Cd(D, d)) return;
        U.uniform4fv(this.addr, d), Kd(D, d)
    }
}

function QA(U, d) {
    let D = this.cache,
        $ = d.elements;
    if ($ === void 0) {
        if (Cd(D, d)) return;
        U.uniformMatrix2fv(this.addr, !1, d), Kd(D, d)
    } else {
        if (Cd(D, $)) return;
        iQ.set($), U.uniformMatrix2fv(this.addr, !1, iQ), Kd(D, $)
    }
}

function SA(U, d) {
    let D = this.cache,
        $ = d.elements;
    if ($ === void 0) {
        if (Cd(D, d)) return;
        U.uniformMatrix3fv(this.addr, !1, d), Kd(D, d)
    } else {
        if (Cd(D, $)) return;
        bQ.set($), U.uniformMatrix3fv(this.addr, !1, bQ), Kd(D, $)
    }
}

function JA(U, d) {
    let D = this.cache,
        $ = d.elements;
    if ($ === void 0) {
        if (Cd(D, d)) return;
        U.uniformMatrix4fv(this.addr, !1, d), Kd(D, d)
    } else {
        if (Cd(D, $)) return;
        hQ.set($), U.uniformMatrix4fv(this.addr, !1, hQ), Kd(D, $)
    }
}

function MA(U, d) {
    let D = this.cache;
    if (D[0] === d) return;
    U.uniform1i(this.addr, d), D[0] = d
}

function BA(U, d) {
    let D = this.cache;
    if (d.x !== void 0) {
        if (D[0] !== d.x || D[1] !== d.y) U.uniform2i(this.addr, d.x, d.y), D[0] = d.x, D[1] = d.y
    } else {
        if (Cd(D, d)) return;
        U.uniform2iv(this.addr, d), Kd(D, d)
    }
}

function LA(U, d) {
    let D = this.cache;
    if (d.x !== void 0) {
        if (D[0] !== d.x || D[1] !== d.y || D[2] !== d.z) U.uniform3i(this.addr, d.x, d.y, d.z), D[0] = d.x, D[1] = d.y, D[2] = d.z
    } else {
        if (Cd(D, d)) return;
        U.uniform3iv(this.addr, d), Kd(D, d)
    }
}

function AA(U, d) {
    let D = this.cache;
    if (d.x !== void 0) {
        if (D[0] !== d.x || D[1] !== d.y || D[2] !== d.z || D[3] !== d.w) U.uniform4i(this.addr, d.x, d.y, d.z, d.w), D[0] = d.x, D[1] = d.y, D[2] = d.z, D[3] = d.w
    } else {
        if (Cd(D, d)) return;
        U.uniform4iv(this.addr, d), Kd(D, d)
    }
}

function jA(U, d) {
    let D = this.cache;
    if (D[0] === d) return;
    U.uniform1ui(this.addr, d), D[0] = d
}

function EA(U, d) {
    let D = this.cache;
    if (d.x !== void 0) {
        if (D[0] !== d.x || D[1] !== d.y) U.uniform2ui(this.addr, d.x, d.y), D[0] = d.x, D[1] = d.y
    } else {
        if (Cd(D, d)) return;
        U.uniform2uiv(this.addr, d), Kd(D, d)
    }
}

function IA(U, d) {
    let D = this.cache;
    if (d.x !== void 0) {
        if (D[0] !== d.x || D[1] !== d.y || D[2] !== d.z) U.uniform3ui(this.addr, d.x, d.y, d.z), D[0] = d.x, D[1] = d.y, D[2] = d.z
    } else {
        if (Cd(D, d)) return;
        U.uniform3uiv(this.addr, d), Kd(D, d)
    }
}

function kA(U, d) {
    let D = this.cache;
    if (d.x !== void 0) {
        if (D[0] !== d.x || D[1] !== d.y || D[2] !== d.z || D[3] !== d.w) U.uniform4ui(this.addr, d.x, d.y, d.z, d.w), D[0] = d.x, D[1] = d.y, D[2] = d.z, D[3] = d.w
    } else {
        if (Cd(D, d)) return;
        U.uniform4uiv(this.addr, d), Kd(D, d)
    }
}

function ZA(U, d, D) {
    let $ = this.cache,
        H = D.allocateTextureUnit();
    if ($[0] !== H) U.uniform1i(this.addr, H), $[0] = H;
    let P;
    if (this.type === U.SAMPLER_2D_SHADOW) CQ.compareFunction = 515, P = CQ;
    else P = j4;
    D.setTexture2D(d || P, H)
}

function aA(U, d, D) {
    let $ = this.cache,
        H = D.allocateTextureUnit();
    if ($[0] !== H) U.uniform1i(this.addr, H), $[0] = H;
    D.setTexture3D(d || I4, H)
}

function YA(U, d, D) {
    let $ = this.cache,
        H = D.allocateTextureUnit();
    if ($[0] !== H) U.uniform1i(this.addr, H), $[0] = H;
    D.setTextureCube(d || k4, H)
}

function XA(U, d, D) {
    let $ = this.cache,
        H = D.allocateTextureUnit();
    if ($[0] !== H) U.uniform1i(this.addr, H), $[0] = H;
    D.setTexture2DArray(d || E4, H)
}

function VA(U) {
    switch (U) {
        case 5126:
            return HA;
        case 35664:
            return PA;
        case 35665:
            return TA;
        case 35666:
            return RA;
        case 35674:
            return QA;
        case 35675:
            return SA;
        case 35676:
            return JA;
        case 5124:
        case 35670:
            return MA;
        case 35667:
        case 35671:
            return BA;
        case 35668:
        case 35672:
            return LA;
        case 35669:
        case 35673:
            return AA;
        case 5125:
            return jA;
        case 36294:
            return EA;
        case 36295:
            return IA;
        case 36296:
            return kA;
        case 35678:
        case 36198:
        case 36298:
        case 36306:
        case 35682:
            return ZA;
        case 35679:
        case 36299:
        case 36307:
            return aA;
        case 35680:
        case 36300:
        case 36308:
        case 36293:
            return YA;
        case 36289:
        case 36303:
        case 36311:
        case 36292:
            return XA
    }
}

function FA(U, d) {
    U.uniform1fv(this.addr, d)
}

function CA(U, d) {
    let D = g$(d, this.size, 2);
    U.uniform2fv(this.addr, D)
}

function KA(U, d) {
    let D = g$(d, this.size, 3);
    U.uniform3fv(this.addr, D)
}

function fA(U, d) {
    let D = g$(d, this.size, 4);
    U.uniform4fv(this.addr, D)
}

function hA(U, d) {
    let D = g$(d, this.size, 4);
    U.uniformMatrix2fv(this.addr, !1, D)
}

function bA(U, d) {
    let D = g$(d, this.size, 9);
    U.uniformMatrix3fv(this.addr, !1, D)
}

function iA(U, d) {
    let D = g$(d, this.size, 16);
    U.uniformMatrix4fv(this.addr, !1, D)
}

function OA(U, d) {
    U.uniform1iv(this.addr, d)
}

function WA(U, d) {
    U.uniform2iv(this.addr, d)
}

function GA(U, d) {
    U.uniform3iv(this.addr, d)
}

function mA(U, d) {
    U.uniform4iv(this.addr, d)
}

function _A(U, d) {
    U.uniform1uiv(this.addr, d)
}

function uA(U, d) {
    U.uniform2uiv(this.addr, d)
}

function NA(U, d) {
    U.uniform3uiv(this.addr, d)
}

function zA(U, d) {
    U.uniform4uiv(this.addr, d)
}

function qA(U, d, D) {
    let $ = this.cache,
        H = d.length,
        P = bH(D, H);
    if (!Cd($, P)) U.uniform1iv(this.addr, P), Kd($, P);
    for (let T = 0; T !== H; ++T) D.setTexture2D(d[T] || j4, P[T])
}

function pA(U, d, D) {
    let $ = this.cache,
        H = d.length,
        P = bH(D, H);
    if (!Cd($, P)) U.uniform1iv(this.addr, P), Kd($, P);
    for (let T = 0; T !== H; ++T) D.setTexture3D(d[T] || I4, P[T])
}

function gA(U, d, D) {
    let $ = this.cache,
        H = d.length,
        P = bH(D, H);
    if (!Cd($, P)) U.uniform1iv(this.addr, P), Kd($, P);
    for (let T = 0; T !== H; ++T) D.setTextureCube(d[T] || k4, P[T])
}

function wA(U, d, D) {
    let $ = this.cache,
        H = d.length,
        P = bH(D, H);
    if (!Cd($, P)) U.uniform1iv(this.addr, P), Kd($, P);
    for (let T = 0; T !== H; ++T) D.setTexture2DArray(d[T] || E4, P[T])
}

function cA(U) {
    switch (U) {
        case 5126:
            return FA;
        case 35664:
            return CA;
        case 35665:
            return KA;
        case 35666:
            return fA;
        case 35674:
            return hA;
        case 35675:
            return bA;
        case 35676:
            return iA;
        case 5124:
        case 35670:
            return OA;
        case 35667:
        case 35671:
            return WA;
        case 35668:
        case 35672:
            return GA;
        case 35669:
        case 35673:
            return mA;
        case 5125:
            return _A;
        case 36294:
            return uA;
        case 36295:
            return NA;
        case 36296:
            return zA;
        case 35678:
        case 36198:
        case 36298:
        case 36306:
        case 35682:
            return qA;
        case 35679:
        case 36299:
        case 36307:
            return pA;
        case 35680:
        case 36300:
        case 36308:
        case 36293:
            return gA;
        case 36289:
        case 36303:
        case 36311:
        case 36292:
            return wA
    }
}
class Z4 {
    constructor(U, d, D) {
        this.id = U, this.addr = D, this.cache = [], this.type = d.type, this.setValue = VA(d.type)
    }
}
class a4 {
    constructor(U, d, D) {
        this.id = U, this.addr = D, this.cache = [], this.type = d.type, this.size = d.size, this.setValue = cA(d.type)
    }
}
class Y4 {
    constructor(U) {
        this.id = U, this.seq = [], this.map = {}
    }
    setValue(U, d, D) {
        let $ = this.seq;
        for (let H = 0, P = $.length; H !== P; ++H) {
            let T = $[H];
            T.setValue(U, d[T.id], D)
        }
    }
}
var zP = /(\w+)(\])?(\[|\.)?/g;

function OQ(U, d) {
    U.seq.push(d), U.map[d.id] = d
}

function eA(U, d, D) {
    let $ = U.name,
        H = $.length;
    zP.lastIndex = 0;
    while (!0) {
        let P = zP.exec($),
            T = zP.lastIndex,
            R = P[1],
            J = P[2] === "]",
            Q = P[3];
        if (J) R = R | 0;
        if (Q === void 0 || Q === "[" && T + 2 === H) {
            OQ(D, Q === void 0 ? new Z4(R, U, d) : new a4(R, U, d));
            break
        } else {
            let S = D.map[R];
            if (S === void 0) S = new Y4(R), OQ(D, S);
            D = S
        }
    }
}
class A0 {
    constructor(U, d) {
        this.seq = [], this.map = {};
        let D = U.getProgramParameter(d, U.ACTIVE_UNIFORMS);
        for (let $ = 0; $ < D; ++$) {
            let H = U.getActiveUniform(d, $),
                P = U.getUniformLocation(d, H.name);
            eA(H, P, this)
        }
    }
    setValue(U, d, D, $) {
        let H = this.map[d];
        if (H !== void 0) H.setValue(U, D, $)
    }
    setOptional(U, d, D) {
        let $ = d[D];
        if ($ !== void 0) this.setValue(U, D, $)
    }
    static upload(U, d, D, $) {
        for (let H = 0, P = d.length; H !== P; ++H) {
            let T = d[H],
                R = D[T.id];
            if (R.needsUpdate !== !1) T.setValue(U, R.value, $)
        }
    }
    static seqWithValue(U, d) {
        let D = [];
        for (let $ = 0, H = U.length; $ !== H; ++$) {
            let P = U[$];
            if (P.id in d) D.push(P)
        }
        return D
    }
}

function WQ(U, d, D) {
    let $ = U.createShader(d);
    return U.shaderSource($, D), U.compileShader($), $
}
var vA = 37297,
    lA = 0;

function yA(U, d) {
    let D = U.split(`
`),
        $ = [],
        H = Math.max(d - 6, 0),
        P = Math.min(d + 6, D.length);
    for (let T = H; T < P; T++) {
        let R = T + 1;
        $.push(`${R===d?">":" "} ${R}: ${D[T]}`)
    }
    return $.join(`
`)
}
var GQ = new vU;

function oA(U) {
    dd._getMatrix(GQ, dd.workingColorSpace, U);
    let d = `mat3( ${GQ.elements.map((D)=>D.toFixed(4))} )`;
    switch (dd.getTransfer(U)) {
        case "linear":
            return [d, "LinearTransferOETF"];
        case "srgb":
            return [d, "sRGBTransferOETF"];
        default:
            return console.warn("THREE.WebGLProgram: Unsupported color space: ", U), [d, "LinearTransferOETF"]
    }
}

function mQ(U, d, D) {
    let $ = U.getShaderParameter(d, U.COMPILE_STATUS),
        H = U.getShaderInfoLog(d).trim();
    if ($ && H === "") return "";
    let P = /ERROR: 0:(\d+)/.exec(H);
    if (P) {
        let T = parseInt(P[1]);
        return D.toUpperCase() + `

` + H + `

` + yA(U.getShaderSource(d), T)
    } else return H
}

function nA(U, d) {
    let D = oA(d);
    return [`vec4 ${U}( vec4 value ) {`, `	return ${D[1]}( vec4( value.rgb * ${D[0]}, value.a ) );`, "}"].join(`
`)
}

function sA(U, d) {
    let D;
    switch (d) {
        case 1:
            D = "Linear";
            break;
        case 2:
            D = "Reinhard";
            break;
        case 3:
            D = "Cineon";
            break;
        case 4:
            D = "ACESFilmic";
            break;
        case 6:
            D = "AgX";
            break;
        case 7:
            D = "Neutral";
            break;
        case 5:
            D = "Custom";
            break;
        default:
            console.warn("THREE.WebGLProgram: Unsupported toneMapping:", d), D = "Linear"
    }
    return "vec3 " + U + "( vec3 color ) { return " + D + "ToneMapping( color ); }"
}
var LH = new i;

function xA() {
    dd.getLuminanceCoefficients(LH);
    let U = LH.x.toFixed(4),
        d = LH.y.toFixed(4),
        D = LH.z.toFixed(4);
    return ["float luminance( const in vec3 rgb ) {", `	const vec3 weights = vec3( ${U}, ${d}, ${D} );`, "\treturn dot( weights, rgb );", "}"].join(`
`)
}

function rA(U) {
    return [U.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "", U.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""].filter(M0).join(`
`)
}

function tA(U) {
    let d = [];
    for (let D in U) {
        let $ = U[D];
        if ($ === !1) continue;
        d.push("#define " + D + " " + $)
    }
    return d.join(`
`)
}

function Uj(U, d) {
    let D = {},
        $ = U.getProgramParameter(d, U.ACTIVE_ATTRIBUTES);
    for (let H = 0; H < $; H++) {
        let P = U.getActiveAttrib(d, H),
            T = P.name,
            R = 1;
        if (P.type === U.FLOAT_MAT2) R = 2;
        if (P.type === U.FLOAT_MAT3) R = 3;
        if (P.type === U.FLOAT_MAT4) R = 4;
        D[T] = {
            type: P.type,
            location: U.getAttribLocation(d, T),
            locationSize: R
        }
    }
    return D
}

function M0(U) {
    return U !== ""
}

function _Q(U, d) {
    let D = d.numSpotLightShadows + d.numSpotLightMaps - d.numSpotLightShadowsWithMaps;
    return U.replace(/NUM_DIR_LIGHTS/g, d.numDirLights).replace(/NUM_SPOT_LIGHTS/g, d.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, d.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, D).replace(/NUM_RECT_AREA_LIGHTS/g, d.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, d.numPointLights).replace(/NUM_HEMI_LIGHTS/g, d.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, d.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, d.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, d.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, d.numPointLightShadows)
}

function uQ(U, d) {
    return U.replace(/NUM_CLIPPING_PLANES/g, d.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, d.numClippingPlanes - d.numClipIntersection)
}
var dj = /^[ \t]*#include +<([\w\d./]+)>/gm;

function vP(U) {
    return U.replace(dj, $j)
}
var Dj = new Map;

function $j(U, d) {
    let D = yU[d];
    if (D === void 0) {
        let $ = Dj.get(d);
        if ($ !== void 0) D = yU[$], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', d, $);
        else throw Error("Can not resolve #include <" + d + ">")
    }
    return vP(D)
}
var Hj = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;

function NQ(U) {
    return U.replace(Hj, Pj)
}

function Pj(U, d, D, $) {
    let H = "";
    for (let P = parseInt(d); P < parseInt(D); P++) H += $.replace(/\[\s*i\s*\]/g, "[ " + P + " ]").replace(/UNROLLED_LOOP_INDEX/g, P);
    return H
}

function zQ(U) {
    let d = `precision ${U.precision} float;
	precision ${U.precision} int;
	precision ${U.precision} sampler2D;
	precision ${U.precision} samplerCube;
	precision ${U.precision} sampler3D;
	precision ${U.precision} sampler2DArray;
	precision ${U.precision} sampler2DShadow;
	precision ${U.precision} samplerCubeShadow;
	precision ${U.precision} sampler2DArrayShadow;
	precision ${U.precision} isampler2D;
	precision ${U.precision} isampler3D;
	precision ${U.precision} isamplerCube;
	precision ${U.precision} isampler2DArray;
	precision ${U.precision} usampler2D;
	precision ${U.precision} usampler3D;
	precision ${U.precision} usamplerCube;
	precision ${U.precision} usampler2DArray;
	`;
    if (U.precision === "highp") d += `
#define HIGH_PRECISION`;
    else if (U.precision === "mediump") d += `
#define MEDIUM_PRECISION`;
    else if (U.precision === "lowp") d += `
#define LOW_PRECISION`;
    return d
}

function Tj(U) {
    let d = "SHADOWMAP_TYPE_BASIC";
    if (U.shadowMapType === 1) d = "SHADOWMAP_TYPE_PCF";
    else if (U.shadowMapType === 2) d = "SHADOWMAP_TYPE_PCF_SOFT";
    else if (U.shadowMapType === 3) d = "SHADOWMAP_TYPE_VSM";
    return d
}

function Rj(U) {
    let d = "ENVMAP_TYPE_CUBE";
    if (U.envMap) switch (U.envMapMode) {
        case 301:
        case 302:
            d = "ENVMAP_TYPE_CUBE";
            break;
        case 306:
            d = "ENVMAP_TYPE_CUBE_UV";
            break
    }
    return d
}

function Qj(U) {
    let d = "ENVMAP_MODE_REFLECTION";
    if (U.envMap) switch (U.envMapMode) {
        case 302:
            d = "ENVMAP_MODE_REFRACTION";
            break
    }
    return d
}

function Sj(U) {
    let d = "ENVMAP_BLENDING_NONE";
    if (U.envMap) switch (U.combine) {
        case 0:
            d = "ENVMAP_BLENDING_MULTIPLY";
            break;
        case 1:
            d = "ENVMAP_BLENDING_MIX";
            break;
        case 2:
            d = "ENVMAP_BLENDING_ADD";
            break
    }
    return d
}

function Jj(U) {
    let d = U.envMapCubeUVHeight;
    if (d === null) return null;
    let D = Math.log2(d) - 2,
        $ = 1 / d;
    return {
        texelWidth: 1 / (3 * Math.max(Math.pow(2, D), 112)),
        texelHeight: $,
        maxMip: D
    }
}

function Mj(U, d, D, $) {
    let H = U.getContext(),
        P = D.defines,
        T = D.vertexShader,
        R = D.fragmentShader,
        J = Tj(D),
        Q = Rj(D),
        M = Qj(D),
        S = Sj(D),
        B = Jj(D),
        L = rA(D),
        E = tA(P),
        k = H.createProgram(),
        A, j, C = D.glslVersion ? "#version " + D.glslVersion + `
` : "";
    if (D.isRawShaderMaterial) {
        if (A = ["#define SHADER_TYPE " + D.shaderType, "#define SHADER_NAME " + D.shaderName, E].filter(M0).join(`
`), A.length > 0) A += `
`;
        if (j = ["#define SHADER_TYPE " + D.shaderType, "#define SHADER_NAME " + D.shaderName, E].filter(M0).join(`
`), j.length > 0) j += `
`
    } else A = [zQ(D), "#define SHADER_TYPE " + D.shaderType, "#define SHADER_NAME " + D.shaderName, E, D.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "", D.batching ? "#define USE_BATCHING" : "", D.batchingColor ? "#define USE_BATCHING_COLOR" : "", D.instancing ? "#define USE_INSTANCING" : "", D.instancingColor ? "#define USE_INSTANCING_COLOR" : "", D.instancingMorph ? "#define USE_INSTANCING_MORPH" : "", D.useFog && D.fog ? "#define USE_FOG" : "", D.useFog && D.fogExp2 ? "#define FOG_EXP2" : "", D.map ? "#define USE_MAP" : "", D.envMap ? "#define USE_ENVMAP" : "", D.envMap ? "#define " + M : "", D.lightMap ? "#define USE_LIGHTMAP" : "", D.aoMap ? "#define USE_AOMAP" : "", D.bumpMap ? "#define USE_BUMPMAP" : "", D.normalMap ? "#define USE_NORMALMAP" : "", D.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", D.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", D.displacementMap ? "#define USE_DISPLACEMENTMAP" : "", D.emissiveMap ? "#define USE_EMISSIVEMAP" : "", D.anisotropy ? "#define USE_ANISOTROPY" : "", D.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "", D.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", D.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", D.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", D.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", D.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", D.specularMap ? "#define USE_SPECULARMAP" : "", D.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", D.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", D.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", D.metalnessMap ? "#define USE_METALNESSMAP" : "", D.alphaMap ? "#define USE_ALPHAMAP" : "", D.alphaHash ? "#define USE_ALPHAHASH" : "", D.transmission ? "#define USE_TRANSMISSION" : "", D.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", D.thicknessMap ? "#define USE_THICKNESSMAP" : "", D.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", D.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", D.mapUv ? "#define MAP_UV " + D.mapUv : "", D.alphaMapUv ? "#define ALPHAMAP_UV " + D.alphaMapUv : "", D.lightMapUv ? "#define LIGHTMAP_UV " + D.lightMapUv : "", D.aoMapUv ? "#define AOMAP_UV " + D.aoMapUv : "", D.emissiveMapUv ? "#define EMISSIVEMAP_UV " + D.emissiveMapUv : "", D.bumpMapUv ? "#define BUMPMAP_UV " + D.bumpMapUv : "", D.normalMapUv ? "#define NORMALMAP_UV " + D.normalMapUv : "", D.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + D.displacementMapUv : "", D.metalnessMapUv ? "#define METALNESSMAP_UV " + D.metalnessMapUv : "", D.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + D.roughnessMapUv : "", D.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + D.anisotropyMapUv : "", D.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + D.clearcoatMapUv : "", D.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + D.clearcoatNormalMapUv : "", D.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + D.clearcoatRoughnessMapUv : "", D.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + D.iridescenceMapUv : "", D.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + D.iridescenceThicknessMapUv : "", D.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + D.sheenColorMapUv : "", D.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + D.sheenRoughnessMapUv : "", D.specularMapUv ? "#define SPECULARMAP_UV " + D.specularMapUv : "", D.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + D.specularColorMapUv : "", D.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + D.specularIntensityMapUv : "", D.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + D.transmissionMapUv : "", D.thicknessMapUv ? "#define THICKNESSMAP_UV " + D.thicknessMapUv : "", D.vertexTangents && D.flatShading === !1 ? "#define USE_TANGENT" : "", D.vertexColors ? "#define USE_COLOR" : "", D.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", D.vertexUv1s ? "#define USE_UV1" : "", D.vertexUv2s ? "#define USE_UV2" : "", D.vertexUv3s ? "#define USE_UV3" : "", D.pointsUvs ? "#define USE_POINTS_UV" : "", D.flatShading ? "#define FLAT_SHADED" : "", D.skinning ? "#define USE_SKINNING" : "", D.morphTargets ? "#define USE_MORPHTARGETS" : "", D.morphNormals && D.flatShading === !1 ? "#define USE_MORPHNORMALS" : "", D.morphColors ? "#define USE_MORPHCOLORS" : "", D.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + D.morphTextureStride : "", D.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + D.morphTargetsCount : "", D.doubleSided ? "#define DOUBLE_SIDED" : "", D.flipSided ? "#define FLIP_SIDED" : "", D.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", D.shadowMapEnabled ? "#define " + J : "", D.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", D.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "", D.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", D.reverseDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "", "uniform mat4 modelMatrix;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform mat4 viewMatrix;", "uniform mat3 normalMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", "#ifdef USE_INSTANCING", "\tattribute mat4 instanceMatrix;", "#endif", "#ifdef USE_INSTANCING_COLOR", "\tattribute vec3 instanceColor;", "#endif", "#ifdef USE_INSTANCING_MORPH", "\tuniform sampler2D morphTexture;", "#endif", "attribute vec3 position;", "attribute vec3 normal;", "attribute vec2 uv;", "#ifdef USE_UV1", "\tattribute vec2 uv1;", "#endif", "#ifdef USE_UV2", "\tattribute vec2 uv2;", "#endif", "#ifdef USE_UV3", "\tattribute vec2 uv3;", "#endif", "#ifdef USE_TANGENT", "\tattribute vec4 tangent;", "#endif", "#if defined( USE_COLOR_ALPHA )", "\tattribute vec4 color;", "#elif defined( USE_COLOR )", "\tattribute vec3 color;", "#endif", "#ifdef USE_SKINNING", "\tattribute vec4 skinIndex;", "\tattribute vec4 skinWeight;", "#endif", `
`].filter(M0).join(`
`), j = [zQ(D), "#define SHADER_TYPE " + D.shaderType, "#define SHADER_NAME " + D.shaderName, E, D.useFog && D.fog ? "#define USE_FOG" : "", D.useFog && D.fogExp2 ? "#define FOG_EXP2" : "", D.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "", D.map ? "#define USE_MAP" : "", D.matcap ? "#define USE_MATCAP" : "", D.envMap ? "#define USE_ENVMAP" : "", D.envMap ? "#define " + Q : "", D.envMap ? "#define " + M : "", D.envMap ? "#define " + S : "", B ? "#define CUBEUV_TEXEL_WIDTH " + B.texelWidth : "", B ? "#define CUBEUV_TEXEL_HEIGHT " + B.texelHeight : "", B ? "#define CUBEUV_MAX_MIP " + B.maxMip + ".0" : "", D.lightMap ? "#define USE_LIGHTMAP" : "", D.aoMap ? "#define USE_AOMAP" : "", D.bumpMap ? "#define USE_BUMPMAP" : "", D.normalMap ? "#define USE_NORMALMAP" : "", D.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", D.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", D.emissiveMap ? "#define USE_EMISSIVEMAP" : "", D.anisotropy ? "#define USE_ANISOTROPY" : "", D.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "", D.clearcoat ? "#define USE_CLEARCOAT" : "", D.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", D.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", D.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", D.dispersion ? "#define USE_DISPERSION" : "", D.iridescence ? "#define USE_IRIDESCENCE" : "", D.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", D.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", D.specularMap ? "#define USE_SPECULARMAP" : "", D.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", D.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", D.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", D.metalnessMap ? "#define USE_METALNESSMAP" : "", D.alphaMap ? "#define USE_ALPHAMAP" : "", D.alphaTest ? "#define USE_ALPHATEST" : "", D.alphaHash ? "#define USE_ALPHAHASH" : "", D.sheen ? "#define USE_SHEEN" : "", D.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", D.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", D.transmission ? "#define USE_TRANSMISSION" : "", D.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", D.thicknessMap ? "#define USE_THICKNESSMAP" : "", D.vertexTangents && D.flatShading === !1 ? "#define USE_TANGENT" : "", D.vertexColors || D.instancingColor || D.batchingColor ? "#define USE_COLOR" : "", D.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", D.vertexUv1s ? "#define USE_UV1" : "", D.vertexUv2s ? "#define USE_UV2" : "", D.vertexUv3s ? "#define USE_UV3" : "", D.pointsUvs ? "#define USE_POINTS_UV" : "", D.gradientMap ? "#define USE_GRADIENTMAP" : "", D.flatShading ? "#define FLAT_SHADED" : "", D.doubleSided ? "#define DOUBLE_SIDED" : "", D.flipSided ? "#define FLIP_SIDED" : "", D.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", D.shadowMapEnabled ? "#define " + J : "", D.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "", D.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "", D.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "", D.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "", D.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", D.reverseDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "", "uniform mat4 viewMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", D.toneMapping !== 0 ? "#define TONE_MAPPING" : "", D.toneMapping !== 0 ? yU.tonemapping_pars_fragment : "", D.toneMapping !== 0 ? sA("toneMapping", D.toneMapping) : "", D.dithering ? "#define DITHERING" : "", D.opaque ? "#define OPAQUE" : "", yU.colorspace_pars_fragment, nA("linearToOutputTexel", D.outputColorSpace), xA(), D.useDepthPacking ? "#define DEPTH_PACKING " + D.depthPacking : "", `
`].filter(M0).join(`
`);
    if (T = vP(T), T = _Q(T, D), T = uQ(T, D), R = vP(R), R = _Q(R, D), R = uQ(R, D), T = NQ(T), R = NQ(R), D.isRawShaderMaterial !== !0) C = `#version 300 es
`, A = [L, "#define attribute in", "#define varying out", "#define texture2D texture"].join(`
`) + `
` + A, j = ["#define varying in", D.glslVersion === "300 es" ? "" : "layout(location = 0) out highp vec4 pc_fragColor;", D.glslVersion === "300 es" ? "" : "#define gl_FragColor pc_fragColor", "#define gl_FragDepthEXT gl_FragDepth", "#define texture2D texture", "#define textureCube texture", "#define texture2DProj textureProj", "#define texture2DLodEXT textureLod", "#define texture2DProjLodEXT textureProjLod", "#define textureCubeLodEXT textureLod", "#define texture2DGradEXT textureGrad", "#define texture2DProjGradEXT textureProjGrad", "#define textureCubeGradEXT textureGrad"].join(`
`) + `
` + j;
    let I = C + A + T,
        Z = C + j + R,
        a = WQ(H, H.VERTEX_SHADER, I),
        Y = WQ(H, H.FRAGMENT_SHADER, Z);
    if (H.attachShader(k, a), H.attachShader(k, Y), D.index0AttributeName !== void 0) H.bindAttribLocation(k, 0, D.index0AttributeName);
    else if (D.morphTargets === !0) H.bindAttribLocation(k, 0, "position");
    H.linkProgram(k);

    function f(O) {
        if (U.debug.checkShaderErrors) {
            let N = H.getProgramInfoLog(k).trim(),
                z = H.getShaderInfoLog(a).trim(),
                w = H.getShaderInfoLog(Y).trim(),
                l = !0,
                c = !0;
            if (H.getProgramParameter(k, H.LINK_STATUS) === !1)
                if (l = !1, typeof U.debug.onShaderError === "function") U.debug.onShaderError(H, k, a, Y);
                else {
                    let y = mQ(H, a, "vertex"),
                        W = mQ(H, Y, "fragment");
                    console.error("THREE.WebGLProgram: Shader Error " + H.getError() + " - VALIDATE_STATUS " + H.getProgramParameter(k, H.VALIDATE_STATUS) + `

Material Name: ` + O.name + `
Material Type: ` + O.type + `

Program Info Log: ` + N + `
` + y + `
` + W)
                }
            else if (N !== "") console.warn("THREE.WebGLProgram: Program Info Log:", N);
            else if (z === "" || w === "") c = !1;
            if (c) O.diagnostics = {
                runnable: l,
                programLog: N,
                vertexShader: {
                    log: z,
                    prefix: A
                },
                fragmentShader: {
                    log: w,
                    prefix: j
                }
            }
        }
        H.deleteShader(a), H.deleteShader(Y), G = new A0(H, k), X = Uj(H, k)
    }
    let G;
    this.getUniforms = function() {
        if (G === void 0) f(this);
        return G
    };
    let X;
    this.getAttributes = function() {
        if (X === void 0) f(this);
        return X
    };
    let F = D.rendererExtensionParallelShaderCompile === !1;
    return this.isReady = function() {
        if (F === !1) F = H.getProgramParameter(k, vA);
        return F
    }, this.destroy = function() {
        $.releaseStatesOfProgram(this), H.deleteProgram(k), this.program = void 0
    }, this.type = D.shaderType, this.name = D.shaderName, this.id = lA++, this.cacheKey = d, this.usedTimes = 1, this.program = k, this.vertexShader = a, this.fragmentShader = Y, this
}
var Bj = 0;
class X4 {
    constructor() {
        this.shaderCache = new Map, this.materialCache = new Map
    }
    update(U) {
        let {
            vertexShader: d,
            fragmentShader: D
        } = U, $ = this._getShaderStage(d), H = this._getShaderStage(D), P = this._getShaderCacheForMaterial(U);
        if (P.has($) === !1) P.add($), $.usedTimes++;
        if (P.has(H) === !1) P.add(H), H.usedTimes++;
        return this
    }
    remove(U) {
        let d = this.materialCache.get(U);
        for (let D of d)
            if (D.usedTimes--, D.usedTimes === 0) this.shaderCache.delete(D.code);
        return this.materialCache.delete(U), this
    }
    getVertexShaderID(U) {
        return this._getShaderStage(U.vertexShader).id
    }
    getFragmentShaderID(U) {
        return this._getShaderStage(U.fragmentShader).id
    }
    dispose() {
        this.shaderCache.clear(), this.materialCache.clear()
    }
    _getShaderCacheForMaterial(U) {
        let d = this.materialCache,
            D = d.get(U);
        if (D === void 0) D = new Set, d.set(U, D);
        return D
    }
    _getShaderStage(U) {
        let d = this.shaderCache,
            D = d.get(U);
        if (D === void 0) D = new V4(U), d.set(U, D);
        return D
    }
}
class V4 {
    constructor(U) {
        this.id = Bj++, this.code = U, this.usedTimes = 0
    }
}

function Lj(U, d, D, $, H, P, T) {
    let R = new fH,
        J = new X4,
        Q = new Set,
        M = [],
        S = H.logarithmicDepthBuffer,
        B = H.vertexTextures,
        L = H.precision,
        E = {
            MeshDepthMaterial: "depth",
            MeshDistanceMaterial: "distanceRGBA",
            MeshNormalMaterial: "normal",
            MeshBasicMaterial: "basic",
            MeshLambertMaterial: "lambert",
            MeshPhongMaterial: "phong",
            MeshToonMaterial: "toon",
            MeshStandardMaterial: "physical",
            MeshPhysicalMaterial: "physical",
            MeshMatcapMaterial: "matcap",
            LineBasicMaterial: "basic",
            LineDashedMaterial: "dashed",
            PointsMaterial: "points",
            ShadowMaterial: "shadow",
            SpriteMaterial: "sprite"
        };

    function k(X) {
        if (Q.add(X), X === 0) return "uv";
        return `uv${X}`
    }

    function A(X, F, O, N, z) {
        let w = N.fog,
            l = z.geometry,
            c = X.isMeshStandardMaterial ? N.environment : null,
            y = (X.isMeshStandardMaterial ? D : d).get(X.envMap || c),
            W = !!y && y.mapping === 306 ? y.image.height : null,
            UU = E[X.type];
        if (X.precision !== null) {
            if (L = H.getMaxPrecision(X.precision), L !== X.precision) console.warn("THREE.WebGLProgram.getParameters:", X.precision, "not supported, using", L, "instead.")
        }
        let PU = l.morphAttributes.position || l.morphAttributes.normal || l.morphAttributes.color,
            iU = PU !== void 0 ? PU.length : 0,
            wU = 0;
        if (l.morphAttributes.position !== void 0) wU = 1;
        if (l.morphAttributes.normal !== void 0) wU = 2;
        if (l.morphAttributes.color !== void 0) wU = 3;
        let o, $U, FU, XU;
        if (UU) {
            let Hd = ID[UU];
            o = Hd.vertexShader, $U = Hd.fragmentShader
        } else o = X.vertexShader, $U = X.fragmentShader, J.update(X), FU = J.getVertexShaderID(X), XU = J.getFragmentShaderID(X);
        let JU = U.getRenderTarget(),
            mU = U.state.buffers.depth.getReversed(),
            nU = z.isInstancedMesh === !0,
            uU = z.isBatchedMesh === !0,
            r = !!X.map,
            SU = !!X.matcap,
            b = !!y,
            YU = !!X.aoMap,
            TU = !!X.lightMap,
            CU = !!X.bumpMap,
            DU = !!X.normalMap,
            NU = !!X.displacementMap,
            kU = !!X.emissiveMap,
            VU = !!X.metalnessMap,
            h = !!X.roughnessMap,
            V = X.anisotropy > 0,
            q = X.clearcoat > 0,
            s = X.dispersion > 0,
            t = X.iridescence > 0,
            v = X.sheen > 0,
            WU = X.transmission > 0,
            BU = V && !!X.anisotropyMap,
            IU = q && !!X.clearcoatMap,
            pU = q && !!X.clearcoatNormalMap,
            RU = q && !!X.clearcoatRoughnessMap,
            ZU = t && !!X.iridescenceMap,
            xU = t && !!X.iridescenceThicknessMap,
            zU = v && !!X.sheenColorMap,
            aU = v && !!X.sheenRoughnessMap,
            cU = !!X.specularMap,
            sU = !!X.specularColorMap,
            Ed = !!X.specularIntensityMap,
            m = WU && !!X.transmissionMap,
            HU = WU && !!X.thicknessMap,
            n = !!X.gradientMap,
            x = !!X.alphaMap,
            EU = X.alphaTest > 0,
            AU = !!X.alphaHash,
            lU = !!X.extensions,
            Zd = 0;
        if (X.toneMapped) {
            if (JU === null || JU.isXRRenderTarget === !0) Zd = U.toneMapping
        }
        let Od = {
            shaderID: UU,
            shaderType: X.type,
            shaderName: X.name,
            vertexShader: o,
            fragmentShader: $U,
            defines: X.defines,
            customVertexShaderID: FU,
            customFragmentShaderID: XU,
            isRawShaderMaterial: X.isRawShaderMaterial === !0,
            glslVersion: X.glslVersion,
            precision: L,
            batching: uU,
            batchingColor: uU && z._colorsTexture !== null,
            instancing: nU,
            instancingColor: nU && z.instanceColor !== null,
            instancingMorph: nU && z.morphTexture !== null,
            supportsVertexTextures: B,
            outputColorSpace: JU === null ? U.outputColorSpace : JU.isXRRenderTarget === !0 ? JU.texture.colorSpace : "srgb-linear",
            alphaToCoverage: !!X.alphaToCoverage,
            map: r,
            matcap: SU,
            envMap: b,
            envMapMode: b && y.mapping,
            envMapCubeUVHeight: W,
            aoMap: YU,
            lightMap: TU,
            bumpMap: CU,
            normalMap: DU,
            displacementMap: B && NU,
            emissiveMap: kU,
            normalMapObjectSpace: DU && X.normalMapType === 1,
            normalMapTangentSpace: DU && X.normalMapType === 0,
            metalnessMap: VU,
            roughnessMap: h,
            anisotropy: V,
            anisotropyMap: BU,
            clearcoat: q,
            clearcoatMap: IU,
            clearcoatNormalMap: pU,
            clearcoatRoughnessMap: RU,
            dispersion: s,
            iridescence: t,
            iridescenceMap: ZU,
            iridescenceThicknessMap: xU,
            sheen: v,
            sheenColorMap: zU,
            sheenRoughnessMap: aU,
            specularMap: cU,
            specularColorMap: sU,
            specularIntensityMap: Ed,
            transmission: WU,
            transmissionMap: m,
            thicknessMap: HU,
            gradientMap: n,
            opaque: X.transparent === !1 && X.blending === 1 && X.alphaToCoverage === !1,
            alphaMap: x,
            alphaTest: EU,
            alphaHash: AU,
            combine: X.combine,
            mapUv: r && k(X.map.channel),
            aoMapUv: YU && k(X.aoMap.channel),
            lightMapUv: TU && k(X.lightMap.channel),
            bumpMapUv: CU && k(X.bumpMap.channel),
            normalMapUv: DU && k(X.normalMap.channel),
            displacementMapUv: NU && k(X.displacementMap.channel),
            emissiveMapUv: kU && k(X.emissiveMap.channel),
            metalnessMapUv: VU && k(X.metalnessMap.channel),
            roughnessMapUv: h && k(X.roughnessMap.channel),
            anisotropyMapUv: BU && k(X.anisotropyMap.channel),
            clearcoatMapUv: IU && k(X.clearcoatMap.channel),
            clearcoatNormalMapUv: pU && k(X.clearcoatNormalMap.channel),
            clearcoatRoughnessMapUv: RU && k(X.clearcoatRoughnessMap.channel),
            iridescenceMapUv: ZU && k(X.iridescenceMap.channel),
            iridescenceThicknessMapUv: xU && k(X.iridescenceThicknessMap.channel),
            sheenColorMapUv: zU && k(X.sheenColorMap.channel),
            sheenRoughnessMapUv: aU && k(X.sheenRoughnessMap.channel),
            specularMapUv: cU && k(X.specularMap.channel),
            specularColorMapUv: sU && k(X.specularColorMap.channel),
            specularIntensityMapUv: Ed && k(X.specularIntensityMap.channel),
            transmissionMapUv: m && k(X.transmissionMap.channel),
            thicknessMapUv: HU && k(X.thicknessMap.channel),
            alphaMapUv: x && k(X.alphaMap.channel),
            vertexTangents: !!l.attributes.tangent && (DU || V),
            vertexColors: X.vertexColors,
            vertexAlphas: X.vertexColors === !0 && !!l.attributes.color && l.attributes.color.itemSize === 4,
            pointsUvs: z.isPoints === !0 && !!l.attributes.uv && (r || x),
            fog: !!w,
            useFog: X.fog === !0,
            fogExp2: !!w && w.isFogExp2,
            flatShading: X.flatShading === !0,
            sizeAttenuation: X.sizeAttenuation === !0,
            logarithmicDepthBuffer: S,
            reverseDepthBuffer: mU,
            skinning: z.isSkinnedMesh === !0,
            morphTargets: l.morphAttributes.position !== void 0,
            morphNormals: l.morphAttributes.normal !== void 0,
            morphColors: l.morphAttributes.color !== void 0,
            morphTargetsCount: iU,
            morphTextureStride: wU,
            numDirLights: F.directional.length,
            numPointLights: F.point.length,
            numSpotLights: F.spot.length,
            numSpotLightMaps: F.spotLightMap.length,
            numRectAreaLights: F.rectArea.length,
            numHemiLights: F.hemi.length,
            numDirLightShadows: F.directionalShadowMap.length,
            numPointLightShadows: F.pointShadowMap.length,
            numSpotLightShadows: F.spotShadowMap.length,
            numSpotLightShadowsWithMaps: F.numSpotLightShadowsWithMaps,
            numLightProbes: F.numLightProbes,
            numClippingPlanes: T.numPlanes,
            numClipIntersection: T.numIntersection,
            dithering: X.dithering,
            shadowMapEnabled: U.shadowMap.enabled && O.length > 0,
            shadowMapType: U.shadowMap.type,
            toneMapping: Zd,
            decodeVideoTexture: r && X.map.isVideoTexture === !0 && dd.getTransfer(X.map.colorSpace) === "srgb",
            decodeVideoTextureEmissive: kU && X.emissiveMap.isVideoTexture === !0 && dd.getTransfer(X.emissiveMap.colorSpace) === "srgb",
            premultipliedAlpha: X.premultipliedAlpha,
            doubleSided: X.side === 2,
            flipSided: X.side === 1,
            useDepthPacking: X.depthPacking >= 0,
            depthPacking: X.depthPacking || 0,
            index0AttributeName: X.index0AttributeName,
            extensionClipCullDistance: lU && X.extensions.clipCullDistance === !0 && $.has("WEBGL_clip_cull_distance"),
            extensionMultiDraw: (lU && X.extensions.multiDraw === !0 || uU) && $.has("WEBGL_multi_draw"),
            rendererExtensionParallelShaderCompile: $.has("KHR_parallel_shader_compile"),
            customProgramCacheKey: X.customProgramCacheKey()
        };
        return Od.vertexUv1s = Q.has(1), Od.vertexUv2s = Q.has(2), Od.vertexUv3s = Q.has(3), Q.clear(), Od
    }

    function j(X) {
        let F = [];
        if (X.shaderID) F.push(X.shaderID);
        else F.push(X.customVertexShaderID), F.push(X.customFragmentShaderID);
        if (X.defines !== void 0)
            for (let O in X.defines) F.push(O), F.push(X.defines[O]);
        if (X.isRawShaderMaterial === !1) C(F, X), I(F, X), F.push(U.outputColorSpace);
        return F.push(X.customProgramCacheKey), F.join()
    }

    function C(X, F) {
        X.push(F.precision), X.push(F.outputColorSpace), X.push(F.envMapMode), X.push(F.envMapCubeUVHeight), X.push(F.mapUv), X.push(F.alphaMapUv), X.push(F.lightMapUv), X.push(F.aoMapUv), X.push(F.bumpMapUv), X.push(F.normalMapUv), X.push(F.displacementMapUv), X.push(F.emissiveMapUv), X.push(F.metalnessMapUv), X.push(F.roughnessMapUv), X.push(F.anisotropyMapUv), X.push(F.clearcoatMapUv), X.push(F.clearcoatNormalMapUv), X.push(F.clearcoatRoughnessMapUv), X.push(F.iridescenceMapUv), X.push(F.iridescenceThicknessMapUv), X.push(F.sheenColorMapUv), X.push(F.sheenRoughnessMapUv), X.push(F.specularMapUv), X.push(F.specularColorMapUv), X.push(F.specularIntensityMapUv), X.push(F.transmissionMapUv), X.push(F.thicknessMapUv), X.push(F.combine), X.push(F.fogExp2), X.push(F.sizeAttenuation), X.push(F.morphTargetsCount), X.push(F.morphAttributeCount), X.push(F.numDirLights), X.push(F.numPointLights), X.push(F.numSpotLights), X.push(F.numSpotLightMaps), X.push(F.numHemiLights), X.push(F.numRectAreaLights), X.push(F.numDirLightShadows), X.push(F.numPointLightShadows), X.push(F.numSpotLightShadows), X.push(F.numSpotLightShadowsWithMaps), X.push(F.numLightProbes), X.push(F.shadowMapType), X.push(F.toneMapping), X.push(F.numClippingPlanes), X.push(F.numClipIntersection), X.push(F.depthPacking)
    }

    function I(X, F) {
        if (R.disableAll(), F.supportsVertexTextures) R.enable(0);
        if (F.instancing) R.enable(1);
        if (F.instancingColor) R.enable(2);
        if (F.instancingMorph) R.enable(3);
        if (F.matcap) R.enable(4);
        if (F.envMap) R.enable(5);
        if (F.normalMapObjectSpace) R.enable(6);
        if (F.normalMapTangentSpace) R.enable(7);
        if (F.clearcoat) R.enable(8);
        if (F.iridescence) R.enable(9);
        if (F.alphaTest) R.enable(10);
        if (F.vertexColors) R.enable(11);
        if (F.vertexAlphas) R.enable(12);
        if (F.vertexUv1s) R.enable(13);
        if (F.vertexUv2s) R.enable(14);
        if (F.vertexUv3s) R.enable(15);
        if (F.vertexTangents) R.enable(16);
        if (F.anisotropy) R.enable(17);
        if (F.alphaHash) R.enable(18);
        if (F.batching) R.enable(19);
        if (F.dispersion) R.enable(20);
        if (F.batchingColor) R.enable(21);
        if (X.push(R.mask), R.disableAll(), F.fog) R.enable(0);
        if (F.useFog) R.enable(1);
        if (F.flatShading) R.enable(2);
        if (F.logarithmicDepthBuffer) R.enable(3);
        if (F.reverseDepthBuffer) R.enable(4);
        if (F.skinning) R.enable(5);
        if (F.morphTargets) R.enable(6);
        if (F.morphNormals) R.enable(7);
        if (F.morphColors) R.enable(8);
        if (F.premultipliedAlpha) R.enable(9);
        if (F.shadowMapEnabled) R.enable(10);
        if (F.doubleSided) R.enable(11);
        if (F.flipSided) R.enable(12);
        if (F.useDepthPacking) R.enable(13);
        if (F.dithering) R.enable(14);
        if (F.transmission) R.enable(15);
        if (F.sheen) R.enable(16);
        if (F.opaque) R.enable(17);
        if (F.pointsUvs) R.enable(18);
        if (F.decodeVideoTexture) R.enable(19);
        if (F.decodeVideoTextureEmissive) R.enable(20);
        if (F.alphaToCoverage) R.enable(21);
        X.push(R.mask)
    }

    function Z(X) {
        let F = E[X.type],
            O;
        if (F) {
            let N = ID[F];
            O = $M.clone(N.uniforms)
        } else O = X.uniforms;
        return O
    }

    function a(X, F) {
        let O;
        for (let N = 0, z = M.length; N < z; N++) {
            let w = M[N];
            if (w.cacheKey === F) {
                O = w, ++O.usedTimes;
                break
            }
        }
        if (O === void 0) O = new Mj(U, F, X, P), M.push(O);
        return O
    }

    function Y(X) {
        if (--X.usedTimes === 0) {
            let F = M.indexOf(X);
            M[F] = M[M.length - 1], M.pop(), X.destroy()
        }
    }

    function f(X) {
        J.remove(X)
    }

    function G() {
        J.dispose()
    }
    return {
        getParameters: A,
        getProgramCacheKey: j,
        getUniforms: Z,
        acquireProgram: a,
        releaseProgram: Y,
        releaseShaderCache: f,
        programs: M,
        dispose: G
    }
}

function Aj() {
    let U = new WeakMap;

    function d(T) {
        return U.has(T)
    }

    function D(T) {
        let R = U.get(T);
        if (R === void 0) R = {}, U.set(T, R);
        return R
    }

    function $(T) {
        U.delete(T)
    }

    function H(T, R, J) {
        U.get(T)[R] = J
    }

    function P() {
        U = new WeakMap
    }
    return {
        has: d,
        get: D,
        remove: $,
        update: H,
        dispose: P
    }
}

function jj(U, d) {
    if (U.groupOrder !== d.groupOrder) return U.groupOrder - d.groupOrder;
    else if (U.renderOrder !== d.renderOrder) return U.renderOrder - d.renderOrder;
    else if (U.material.id !== d.material.id) return U.material.id - d.material.id;
    else if (U.z !== d.z) return U.z - d.z;
    else return U.id - d.id
}

function qQ(U, d) {
    if (U.groupOrder !== d.groupOrder) return U.groupOrder - d.groupOrder;
    else if (U.renderOrder !== d.renderOrder) return U.renderOrder - d.renderOrder;
    else if (U.z !== d.z) return d.z - U.z;
    else return U.id - d.id
}

function pQ() {
    let U = [],
        d = 0,
        D = [],
        $ = [],
        H = [];

    function P() {
        d = 0, D.length = 0, $.length = 0, H.length = 0
    }

    function T(S, B, L, E, k, A) {
        let j = U[d];
        if (j === void 0) j = {
            id: S.id,
            object: S,
            geometry: B,
            material: L,
            groupOrder: E,
            renderOrder: S.renderOrder,
            z: k,
            group: A
        }, U[d] = j;
        else j.id = S.id, j.object = S, j.geometry = B, j.material = L, j.groupOrder = E, j.renderOrder = S.renderOrder, j.z = k, j.group = A;
        return d++, j
    }

    function R(S, B, L, E, k, A) {
        let j = T(S, B, L, E, k, A);
        if (L.transmission > 0) $.push(j);
        else if (L.transparent === !0) H.push(j);
        else D.push(j)
    }

    function J(S, B, L, E, k, A) {
        let j = T(S, B, L, E, k, A);
        if (L.transmission > 0) $.unshift(j);
        else if (L.transparent === !0) H.unshift(j);
        else D.unshift(j)
    }

    function Q(S, B) {
        if (D.length > 1) D.sort(S || jj);
        if ($.length > 1) $.sort(B || qQ);
        if (H.length > 1) H.sort(B || qQ)
    }

    function M() {
        for (let S = d, B = U.length; S < B; S++) {
            let L = U[S];
            if (L.id === null) break;
            L.id = null, L.object = null, L.geometry = null, L.material = null, L.group = null
        }
    }
    return {
        opaque: D,
        transmissive: $,
        transparent: H,
        init: P,
        push: R,
        unshift: J,
        finish: M,
        sort: Q
    }
}

function Ej() {
    let U = new WeakMap;

    function d($, H) {
        let P = U.get($),
            T;
        if (P === void 0) T = new pQ, U.set($, [T]);
        else if (H >= P.length) T = new pQ, P.push(T);
        else T = P[H];
        return T
    }

    function D() {
        U = new WeakMap
    }
    return {
        get: d,
        dispose: D
    }
}

function Ij() {
    let U = {};
    return {
        get: function(d) {
            if (U[d.id] !== void 0) return U[d.id];
            let D;
            switch (d.type) {
                case "DirectionalLight":
                    D = {
                        direction: new i,
                        color: new KU
                    };
                    break;
                case "SpotLight":
                    D = {
                        position: new i,
                        direction: new i,
                        color: new KU,
                        distance: 0,
                        coneCos: 0,
                        penumbraCos: 0,
                        decay: 0
                    };
                    break;
                case "PointLight":
                    D = {
                        position: new i,
                        color: new KU,
                        distance: 0,
                        decay: 0
                    };
                    break;
                case "HemisphereLight":
                    D = {
                        direction: new i,
                        skyColor: new KU,
                        groundColor: new KU
                    };
                    break;
                case "RectAreaLight":
                    D = {
                        color: new KU,
                        position: new i,
                        halfWidth: new i,
                        halfHeight: new i
                    };
                    break
            }
            return U[d.id] = D, D
        }
    }
}

function kj() {
    let U = {};
    return {
        get: function(d) {
            if (U[d.id] !== void 0) return U[d.id];
            let D;
            switch (d.type) {
                case "DirectionalLight":
                    D = {
                        shadowIntensity: 1,
                        shadowBias: 0,
                        shadowNormalBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new dU
                    };
                    break;
                case "SpotLight":
                    D = {
                        shadowIntensity: 1,
                        shadowBias: 0,
                        shadowNormalBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new dU
                    };
                    break;
                case "PointLight":
                    D = {
                        shadowIntensity: 1,
                        shadowBias: 0,
                        shadowNormalBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new dU,
                        shadowCameraNear: 1,
                        shadowCameraFar: 1000
                    };
                    break
            }
            return U[d.id] = D, D
        }
    }
}
var Zj = 0;

function aj(U, d) {
    return (d.castShadow ? 2 : 0) - (U.castShadow ? 2 : 0) + (d.map ? 1 : 0) - (U.map ? 1 : 0)
}

function Yj(U) {
    let d = new Ij,
        D = kj(),
        $ = {
            version: 0,
            hash: {
                directionalLength: -1,
                pointLength: -1,
                spotLength: -1,
                rectAreaLength: -1,
                hemiLength: -1,
                numDirectionalShadows: -1,
                numPointShadows: -1,
                numSpotShadows: -1,
                numSpotMaps: -1,
                numLightProbes: -1
            },
            ambient: [0, 0, 0],
            probe: [],
            directional: [],
            directionalShadow: [],
            directionalShadowMap: [],
            directionalShadowMatrix: [],
            spot: [],
            spotLightMap: [],
            spotShadow: [],
            spotShadowMap: [],
            spotLightMatrix: [],
            rectArea: [],
            rectAreaLTC1: null,
            rectAreaLTC2: null,
            point: [],
            pointShadow: [],
            pointShadowMap: [],
            pointShadowMatrix: [],
            hemi: [],
            numSpotLightShadowsWithMaps: 0,
            numLightProbes: 0
        };
    for (let Q = 0; Q < 9; Q++) $.probe.push(new i);
    let H = new i,
        P = new Dd,
        T = new Dd;

    function R(Q) {
        let M = 0,
            S = 0,
            B = 0;
        for (let X = 0; X < 9; X++) $.probe[X].set(0, 0, 0);
        let L = 0,
            E = 0,
            k = 0,
            A = 0,
            j = 0,
            C = 0,
            I = 0,
            Z = 0,
            a = 0,
            Y = 0,
            f = 0;
        Q.sort(aj);
        for (let X = 0, F = Q.length; X < F; X++) {
            let O = Q[X],
                N = O.color,
                z = O.intensity,
                w = O.distance,
                l = O.shadow && O.shadow.map ? O.shadow.map.texture : null;
            if (O.isAmbientLight) M += N.r * z, S += N.g * z, B += N.b * z;
            else if (O.isLightProbe) {
                for (let c = 0; c < 9; c++) $.probe[c].addScaledVector(O.sh.coefficients[c], z);
                f++
            } else if (O.isDirectionalLight) {
                let c = d.get(O);
                if (c.color.copy(O.color).multiplyScalar(O.intensity), O.castShadow) {
                    let y = O.shadow,
                        W = D.get(O);
                    W.shadowIntensity = y.intensity, W.shadowBias = y.bias, W.shadowNormalBias = y.normalBias, W.shadowRadius = y.radius, W.shadowMapSize = y.mapSize, $.directionalShadow[L] = W, $.directionalShadowMap[L] = l, $.directionalShadowMatrix[L] = O.shadow.matrix, C++
                }
                $.directional[L] = c, L++
            } else if (O.isSpotLight) {
                let c = d.get(O);
                c.position.setFromMatrixPosition(O.matrixWorld), c.color.copy(N).multiplyScalar(z), c.distance = w, c.coneCos = Math.cos(O.angle), c.penumbraCos = Math.cos(O.angle * (1 - O.penumbra)), c.decay = O.decay, $.spot[k] = c;
                let y = O.shadow;
                if (O.map) {
                    if ($.spotLightMap[a] = O.map, a++, y.updateMatrices(O), O.castShadow) Y++
                }
                if ($.spotLightMatrix[k] = y.matrix, O.castShadow) {
                    let W = D.get(O);
                    W.shadowIntensity = y.intensity, W.shadowBias = y.bias, W.shadowNormalBias = y.normalBias, W.shadowRadius = y.radius, W.shadowMapSize = y.mapSize, $.spotShadow[k] = W, $.spotShadowMap[k] = l, Z++
                }
                k++
            } else if (O.isRectAreaLight) {
                let c = d.get(O);
                c.color.copy(N).multiplyScalar(z), c.halfWidth.set(O.width * 0.5, 0, 0), c.halfHeight.set(0, O.height * 0.5, 0), $.rectArea[A] = c, A++
            } else if (O.isPointLight) {
                let c = d.get(O);
                if (c.color.copy(O.color).multiplyScalar(O.intensity), c.distance = O.distance, c.decay = O.decay, O.castShadow) {
                    let y = O.shadow,
                        W = D.get(O);
                    W.shadowIntensity = y.intensity, W.shadowBias = y.bias, W.shadowNormalBias = y.normalBias, W.shadowRadius = y.radius, W.shadowMapSize = y.mapSize, W.shadowCameraNear = y.camera.near, W.shadowCameraFar = y.camera.far, $.pointShadow[E] = W, $.pointShadowMap[E] = l, $.pointShadowMatrix[E] = O.shadow.matrix, I++
                }
                $.point[E] = c, E++
            } else if (O.isHemisphereLight) {
                let c = d.get(O);
                c.skyColor.copy(O.color).multiplyScalar(z), c.groundColor.copy(O.groundColor).multiplyScalar(z), $.hemi[j] = c, j++
            }
        }
        if (A > 0)
            if (U.has("OES_texture_float_linear") === !0) $.rectAreaLTC1 = MU.LTC_FLOAT_1, $.rectAreaLTC2 = MU.LTC_FLOAT_2;
            else $.rectAreaLTC1 = MU.LTC_HALF_1, $.rectAreaLTC2 = MU.LTC_HALF_2;
        $.ambient[0] = M, $.ambient[1] = S, $.ambient[2] = B;
        let G = $.hash;
        if (G.directionalLength !== L || G.pointLength !== E || G.spotLength !== k || G.rectAreaLength !== A || G.hemiLength !== j || G.numDirectionalShadows !== C || G.numPointShadows !== I || G.numSpotShadows !== Z || G.numSpotMaps !== a || G.numLightProbes !== f) $.directional.length = L, $.spot.length = k, $.rectArea.length = A, $.point.length = E, $.hemi.length = j, $.directionalShadow.length = C, $.directionalShadowMap.length = C, $.pointShadow.length = I, $.pointShadowMap.length = I, $.spotShadow.length = Z, $.spotShadowMap.length = Z, $.directionalShadowMatrix.length = C, $.pointShadowMatrix.length = I, $.spotLightMatrix.length = Z + a - Y, $.spotLightMap.length = a, $.numSpotLightShadowsWithMaps = Y, $.numLightProbes = f, G.directionalLength = L, G.pointLength = E, G.spotLength = k, G.rectAreaLength = A, G.hemiLength = j, G.numDirectionalShadows = C, G.numPointShadows = I, G.numSpotShadows = Z, G.numSpotMaps = a, G.numLightProbes = f, $.version = Zj++
    }

    function J(Q, M) {
        let S = 0,
            B = 0,
            L = 0,
            E = 0,
            k = 0,
            A = M.matrixWorldInverse;
        for (let j = 0, C = Q.length; j < C; j++) {
            let I = Q[j];
            if (I.isDirectionalLight) {
                let Z = $.directional[S];
                Z.direction.setFromMatrixPosition(I.matrixWorld), H.setFromMatrixPosition(I.target.matrixWorld), Z.direction.sub(H), Z.direction.transformDirection(A), S++
            } else if (I.isSpotLight) {
                let Z = $.spot[L];
                Z.position.setFromMatrixPosition(I.matrixWorld), Z.position.applyMatrix4(A), Z.direction.setFromMatrixPosition(I.matrixWorld), H.setFromMatrixPosition(I.target.matrixWorld), Z.direction.sub(H), Z.direction.transformDirection(A), L++
            } else if (I.isRectAreaLight) {
                let Z = $.rectArea[E];
                Z.position.setFromMatrixPosition(I.matrixWorld), Z.position.applyMatrix4(A), T.identity(), P.copy(I.matrixWorld), P.premultiply(A), T.extractRotation(P), Z.halfWidth.set(I.width * 0.5, 0, 0), Z.halfHeight.set(0, I.height * 0.5, 0), Z.halfWidth.applyMatrix4(T), Z.halfHeight.applyMatrix4(T), E++
            } else if (I.isPointLight) {
                let Z = $.point[B];
                Z.position.setFromMatrixPosition(I.matrixWorld), Z.position.applyMatrix4(A), B++
            } else if (I.isHemisphereLight) {
                let Z = $.hemi[k];
                Z.direction.setFromMatrixPosition(I.matrixWorld), Z.direction.transformDirection(A), k++
            }
        }
    }
    return {
        setup: R,
        setupView: J,
        state: $
    }
}

function gQ(U) {
    let d = new Yj(U),
        D = [],
        $ = [];

    function H(M) {
        Q.camera = M, D.length = 0, $.length = 0
    }

    function P(M) {
        D.push(M)
    }

    function T(M) {
        $.push(M)
    }

    function R() {
        d.setup(D)
    }

    function J(M) {
        d.setupView(D, M)
    }
    let Q = {
        lightsArray: D,
        shadowsArray: $,
        camera: null,
        lights: d,
        transmissionRenderTarget: {}
    };
    return {
        init: H,
        state: Q,
        setupLights: R,
        setupLightsView: J,
        pushLight: P,
        pushShadow: T
    }
}

function Xj(U) {
    let d = new WeakMap;

    function D(H, P = 0) {
        let T = d.get(H),
            R;
        if (T === void 0) R = new gQ(U), d.set(H, [R]);
        else if (P >= T.length) R = new gQ(U), T.push(R);
        else R = T[P];
        return R
    }

    function $() {
        d = new WeakMap
    }
    return {
        get: D,
        dispose: $
    }
}
class F4 extends uD {
    static get type() {
        return "MeshDepthMaterial"
    }
    constructor(U) {
        super();
        this.isMeshDepthMaterial = !0, this.depthPacking = 3200, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(U)
    }
    copy(U) {
        return super.copy(U), this.depthPacking = U.depthPacking, this.map = U.map, this.alphaMap = U.alphaMap, this.displacementMap = U.displacementMap, this.displacementScale = U.displacementScale, this.displacementBias = U.displacementBias, this.wireframe = U.wireframe, this.wireframeLinewidth = U.wireframeLinewidth, this
    }
}
class C4 extends uD {
    static get type() {
        return "MeshDistanceMaterial"
    }
    constructor(U) {
        super();
        this.isMeshDistanceMaterial = !0, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(U)
    }
    copy(U) {
        return super.copy(U), this.map = U.map, this.alphaMap = U.alphaMap, this.displacementMap = U.displacementMap, this.displacementScale = U.displacementScale, this.displacementBias = U.displacementBias, this
    }
}
var Vj = `void main() {
	gl_Position = vec4( position, 1.0 );
}`,
    Fj = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;

function Cj(U, d, D) {
    let $ = new hH,
        H = new dU,
        P = new dU,
        T = new ad,
        R = new F4({
            depthPacking: 3201
        }),
        J = new C4,
        Q = {},
        M = D.maxTextureSize,
        S = {
            [0]: 1,
            [1]: 0,
            [2]: 2
        },
        B = new _D({
            defines: {
                VSM_SAMPLES: 8
            },
            uniforms: {
                shadow_pass: {
                    value: null
                },
                resolution: {
                    value: new dU
                },
                radius: {
                    value: 4
                }
            },
            vertexShader: Vj,
            fragmentShader: Fj
        }),
        L = B.clone();
    L.defines.HORIZONTAL_PASS = 1;
    let E = new Fd;
    E.setAttribute("position", new Wd(new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]), 3));
    let k = new _U(E, B),
        A = this;
    this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = 1;
    let j = this.type;
    this.render = function(Y, f, G) {
        if (A.enabled === !1) return;
        if (A.autoUpdate === !1 && A.needsUpdate === !1) return;
        if (Y.length === 0) return;
        let X = U.getRenderTarget(),
            F = U.getActiveCubeFace(),
            O = U.getActiveMipmapLevel(),
            N = U.state;
        N.setBlending(0), N.buffers.color.setClear(1, 1, 1, 1), N.buffers.depth.setTest(!0), N.setScissorTest(!1);
        let z = j !== 3 && this.type === 3,
            w = j === 3 && this.type !== 3;
        for (let l = 0, c = Y.length; l < c; l++) {
            let y = Y[l],
                W = y.shadow;
            if (W === void 0) {
                console.warn("THREE.WebGLShadowMap:", y, "has no shadow.");
                continue
            }
            if (W.autoUpdate === !1 && W.needsUpdate === !1) continue;
            H.copy(W.mapSize);
            let UU = W.getFrameExtents();
            if (H.multiply(UU), P.copy(W.mapSize), H.x > M || H.y > M) {
                if (H.x > M) P.x = Math.floor(M / UU.x), H.x = P.x * UU.x, W.mapSize.x = P.x;
                if (H.y > M) P.y = Math.floor(M / UU.y), H.y = P.y * UU.y, W.mapSize.y = P.y
            }
            if (W.map === null || z === !0 || w === !0) {
                let iU = this.type !== 3 ? {
                    minFilter: 1003,
                    magFilter: 1003
                } : {};
                if (W.map !== null) W.map.dispose();
                W.map = new oD(H.x, H.y, iU), W.map.texture.name = y.name + ".shadowMap", W.camera.updateProjectionMatrix()
            }
            U.setRenderTarget(W.map), U.clear();
            let PU = W.getViewportCount();
            for (let iU = 0; iU < PU; iU++) {
                let wU = W.getViewport(iU);
                T.set(P.x * wU.x, P.y * wU.y, P.x * wU.z, P.y * wU.w), N.viewport(T), W.updateMatrices(y, iU), $ = W.getFrustum(), Z(f, G, W.camera, y, this.type)
            }
            if (W.isPointLightShadow !== !0 && this.type === 3) C(W, G);
            W.needsUpdate = !1
        }
        j = this.type, A.needsUpdate = !1, U.setRenderTarget(X, F, O)
    };

    function C(Y, f) {
        let G = d.update(k);
        if (B.defines.VSM_SAMPLES !== Y.blurSamples) B.defines.VSM_SAMPLES = Y.blurSamples, L.defines.VSM_SAMPLES = Y.blurSamples, B.needsUpdate = !0, L.needsUpdate = !0;
        if (Y.mapPass === null) Y.mapPass = new oD(H.x, H.y);
        B.uniforms.shadow_pass.value = Y.map.texture, B.uniforms.resolution.value = Y.mapSize, B.uniforms.radius.value = Y.radius, U.setRenderTarget(Y.mapPass), U.clear(), U.renderBufferDirect(f, null, G, B, k, null), L.uniforms.shadow_pass.value = Y.mapPass.texture, L.uniforms.resolution.value = Y.mapSize, L.uniforms.radius.value = Y.radius, U.setRenderTarget(Y.map), U.clear(), U.renderBufferDirect(f, null, G, L, k, null)
    }

    function I(Y, f, G, X) {
        let F = null,
            O = G.isPointLight === !0 ? Y.customDistanceMaterial : Y.customDepthMaterial;
        if (O !== void 0) F = O;
        else if (F = G.isPointLight === !0 ? J : R, U.localClippingEnabled && f.clipShadows === !0 && Array.isArray(f.clippingPlanes) && f.clippingPlanes.length !== 0 || f.displacementMap && f.displacementScale !== 0 || f.alphaMap && f.alphaTest > 0 || f.map && f.alphaTest > 0) {
            let N = F.uuid,
                z = f.uuid,
                w = Q[N];
            if (w === void 0) w = {}, Q[N] = w;
            let l = w[z];
            if (l === void 0) l = F.clone(), w[z] = l, f.addEventListener("dispose", a);
            F = l
        }
        if (F.visible = f.visible, F.wireframe = f.wireframe, X === 3) F.side = f.shadowSide !== null ? f.shadowSide : f.side;
        else F.side = f.shadowSide !== null ? f.shadowSide : S[f.side];
        if (F.alphaMap = f.alphaMap, F.alphaTest = f.alphaTest, F.map = f.map, F.clipShadows = f.clipShadows, F.clippingPlanes = f.clippingPlanes, F.clipIntersection = f.clipIntersection, F.displacementMap = f.displacementMap, F.displacementScale = f.displacementScale, F.displacementBias = f.displacementBias, F.wireframeLinewidth = f.wireframeLinewidth, F.linewidth = f.linewidth, G.isPointLight === !0 && F.isMeshDistanceMaterial === !0) {
            let N = U.properties.get(F);
            N.light = G
        }
        return F
    }

    function Z(Y, f, G, X, F) {
        if (Y.visible === !1) return;
        if (Y.layers.test(f.layers) && (Y.isMesh || Y.isLine || Y.isPoints)) {
            if ((Y.castShadow || Y.receiveShadow && F === 3) && (!Y.frustumCulled || $.intersectsObject(Y))) {
                Y.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse, Y.matrixWorld);
                let z = d.update(Y),
                    w = Y.material;
                if (Array.isArray(w)) {
                    let l = z.groups;
                    for (let c = 0, y = l.length; c < y; c++) {
                        let W = l[c],
                            UU = w[W.materialIndex];
                        if (UU && UU.visible) {
                            let PU = I(Y, UU, X, F);
                            Y.onBeforeShadow(U, Y, f, G, z, PU, W), U.renderBufferDirect(G, null, z, PU, Y, W), Y.onAfterShadow(U, Y, f, G, z, PU, W)
                        }
                    }
                } else if (w.visible) {
                    let l = I(Y, w, X, F);
                    Y.onBeforeShadow(U, Y, f, G, z, l, null), U.renderBufferDirect(G, null, z, l, Y, null), Y.onAfterShadow(U, Y, f, G, z, l, null)
                }
            }
        }
        let N = Y.children;
        for (let z = 0, w = N.length; z < w; z++) Z(N[z], f, G, X, F)
    }

    function a(Y) {
        Y.target.removeEventListener("dispose", a);
        for (let G in Q) {
            let X = Q[G],
                F = Y.target.uuid;
            if (F in X) X[F].dispose(), delete X[F]
        }
    }
}
var Kj = {
    [0]: 1,
    [2]: 6,
    [4]: 7,
    [3]: 5,
    [1]: 0,
    [6]: 2,
    [7]: 4,
    [5]: 3
};

function fj(U, d) {
    function D() {
        let m = !1,
            HU = new ad,
            n = null,
            x = new ad(0, 0, 0, 0);
        return {
            setMask: function(EU) {
                if (n !== EU && !m) U.colorMask(EU, EU, EU, EU), n = EU
            },
            setLocked: function(EU) {
                m = EU
            },
            setClear: function(EU, AU, lU, Zd, Od) {
                if (Od === !0) EU *= Zd, AU *= Zd, lU *= Zd;
                if (HU.set(EU, AU, lU, Zd), x.equals(HU) === !1) U.clearColor(EU, AU, lU, Zd), x.copy(HU)
            },
            reset: function() {
                m = !1, n = null, x.set(-1, 0, 0, 0)
            }
        }
    }

    function $() {
        let m = !1,
            HU = !1,
            n = null,
            x = null,
            EU = null;
        return {
            setReversed: function(AU) {
                if (HU !== AU) {
                    let lU = d.get("EXT_clip_control");
                    if (HU) lU.clipControlEXT(lU.LOWER_LEFT_EXT, lU.ZERO_TO_ONE_EXT);
                    else lU.clipControlEXT(lU.LOWER_LEFT_EXT, lU.NEGATIVE_ONE_TO_ONE_EXT);
                    let Zd = EU;
                    EU = null, this.setClear(Zd)
                }
                HU = AU
            },
            getReversed: function() {
                return HU
            },
            setTest: function(AU) {
                if (AU) JU(U.DEPTH_TEST);
                else mU(U.DEPTH_TEST)
            },
            setMask: function(AU) {
                if (n !== AU && !m) U.depthMask(AU), n = AU
            },
            setFunc: function(AU) {
                if (HU) AU = Kj[AU];
                if (x !== AU) {
                    switch (AU) {
                        case 0:
                            U.depthFunc(U.NEVER);
                            break;
                        case 1:
                            U.depthFunc(U.ALWAYS);
                            break;
                        case 2:
                            U.depthFunc(U.LESS);
                            break;
                        case 3:
                            U.depthFunc(U.LEQUAL);
                            break;
                        case 4:
                            U.depthFunc(U.EQUAL);
                            break;
                        case 5:
                            U.depthFunc(U.GEQUAL);
                            break;
                        case 6:
                            U.depthFunc(U.GREATER);
                            break;
                        case 7:
                            U.depthFunc(U.NOTEQUAL);
                            break;
                        default:
                            U.depthFunc(U.LEQUAL)
                    }
                    x = AU
                }
            },
            setLocked: function(AU) {
                m = AU
            },
            setClear: function(AU) {
                if (EU !== AU) {
                    if (HU) AU = 1 - AU;
                    U.clearDepth(AU), EU = AU
                }
            },
            reset: function() {
                m = !1, n = null, x = null, EU = null, HU = !1
            }
        }
    }

    function H() {
        let m = !1,
            HU = null,
            n = null,
            x = null,
            EU = null,
            AU = null,
            lU = null,
            Zd = null,
            Od = null;
        return {
            setTest: function(Hd) {
                if (!m)
                    if (Hd) JU(U.STENCIL_TEST);
                    else mU(U.STENCIL_TEST)
            },
            setMask: function(Hd) {
                if (HU !== Hd && !m) U.stencilMask(Hd), HU = Hd
            },
            setFunc: function(Hd, CD, BD) {
                if (n !== Hd || x !== CD || EU !== BD) U.stencilFunc(Hd, CD, BD), n = Hd, x = CD, EU = BD
            },
            setOp: function(Hd, CD, BD) {
                if (AU !== Hd || lU !== CD || Zd !== BD) U.stencilOp(Hd, CD, BD), AU = Hd, lU = CD, Zd = BD
            },
            setLocked: function(Hd) {
                m = Hd
            },
            setClear: function(Hd) {
                if (Od !== Hd) U.clearStencil(Hd), Od = Hd
            },
            reset: function() {
                m = !1, HU = null, n = null, x = null, EU = null, AU = null, lU = null, Zd = null, Od = null
            }
        }
    }
    let P = new D,
        T = new $,
        R = new H,
        J = new WeakMap,
        Q = new WeakMap,
        M = {},
        S = {},
        B = new WeakMap,
        L = [],
        E = null,
        k = !1,
        A = null,
        j = null,
        C = null,
        I = null,
        Z = null,
        a = null,
        Y = null,
        f = new KU(0, 0, 0),
        G = 0,
        X = !1,
        F = null,
        O = null,
        N = null,
        z = null,
        w = null,
        l = U.getParameter(U.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
        c = !1,
        y = 0,
        W = U.getParameter(U.VERSION);
    if (W.indexOf("WebGL") !== -1) y = parseFloat(/^WebGL (\d)/.exec(W)[1]), c = y >= 1;
    else if (W.indexOf("OpenGL ES") !== -1) y = parseFloat(/^OpenGL ES (\d)/.exec(W)[1]), c = y >= 2;
    let UU = null,
        PU = {},
        iU = U.getParameter(U.SCISSOR_BOX),
        wU = U.getParameter(U.VIEWPORT),
        o = new ad().fromArray(iU),
        $U = new ad().fromArray(wU);

    function FU(m, HU, n, x) {
        let EU = new Uint8Array(4),
            AU = U.createTexture();
        U.bindTexture(m, AU), U.texParameteri(m, U.TEXTURE_MIN_FILTER, U.NEAREST), U.texParameteri(m, U.TEXTURE_MAG_FILTER, U.NEAREST);
        for (let lU = 0; lU < n; lU++)
            if (m === U.TEXTURE_3D || m === U.TEXTURE_2D_ARRAY) U.texImage3D(HU, 0, U.RGBA, 1, 1, x, 0, U.RGBA, U.UNSIGNED_BYTE, EU);
            else U.texImage2D(HU + lU, 0, U.RGBA, 1, 1, 0, U.RGBA, U.UNSIGNED_BYTE, EU);
        return AU
    }
    let XU = {};
    XU[U.TEXTURE_2D] = FU(U.TEXTURE_2D, U.TEXTURE_2D, 1), XU[U.TEXTURE_CUBE_MAP] = FU(U.TEXTURE_CUBE_MAP, U.TEXTURE_CUBE_MAP_POSITIVE_X, 6), XU[U.TEXTURE_2D_ARRAY] = FU(U.TEXTURE_2D_ARRAY, U.TEXTURE_2D_ARRAY, 1, 1), XU[U.TEXTURE_3D] = FU(U.TEXTURE_3D, U.TEXTURE_3D, 1, 1), P.setClear(0, 0, 0, 1), T.setClear(1), R.setClear(0), JU(U.DEPTH_TEST), T.setFunc(3), CU(!1), DU(1), JU(U.CULL_FACE), YU(0);

    function JU(m) {
        if (M[m] !== !0) U.enable(m), M[m] = !0
    }

    function mU(m) {
        if (M[m] !== !1) U.disable(m), M[m] = !1
    }

    function nU(m, HU) {
        if (S[m] !== HU) {
            if (U.bindFramebuffer(m, HU), S[m] = HU, m === U.DRAW_FRAMEBUFFER) S[U.FRAMEBUFFER] = HU;
            if (m === U.FRAMEBUFFER) S[U.DRAW_FRAMEBUFFER] = HU;
            return !0
        }
        return !1
    }

    function uU(m, HU) {
        let n = L,
            x = !1;
        if (m) {
            if (n = B.get(HU), n === void 0) n = [], B.set(HU, n);
            let EU = m.textures;
            if (n.length !== EU.length || n[0] !== U.COLOR_ATTACHMENT0) {
                for (let AU = 0, lU = EU.length; AU < lU; AU++) n[AU] = U.COLOR_ATTACHMENT0 + AU;
                n.length = EU.length, x = !0
            }
        } else if (n[0] !== U.BACK) n[0] = U.BACK, x = !0;
        if (x) U.drawBuffers(n)
    }

    function r(m) {
        if (E !== m) return U.useProgram(m), E = m, !0;
        return !1
    }
    let SU = {
        [100]: U.FUNC_ADD,
        [101]: U.FUNC_SUBTRACT,
        [102]: U.FUNC_REVERSE_SUBTRACT
    };
    SU[103] = U.MIN, SU[104] = U.MAX;
    let b = {
        [200]: U.ZERO,
        [201]: U.ONE,
        [202]: U.SRC_COLOR,
        [204]: U.SRC_ALPHA,
        [210]: U.SRC_ALPHA_SATURATE,
        [208]: U.DST_COLOR,
        [206]: U.DST_ALPHA,
        [203]: U.ONE_MINUS_SRC_COLOR,
        [205]: U.ONE_MINUS_SRC_ALPHA,
        [209]: U.ONE_MINUS_DST_COLOR,
        [207]: U.ONE_MINUS_DST_ALPHA,
        [211]: U.CONSTANT_COLOR,
        [212]: U.ONE_MINUS_CONSTANT_COLOR,
        [213]: U.CONSTANT_ALPHA,
        [214]: U.ONE_MINUS_CONSTANT_ALPHA
    };

    function YU(m, HU, n, x, EU, AU, lU, Zd, Od, Hd) {
        if (m === 0) {
            if (k === !0) mU(U.BLEND), k = !1;
            return
        }
        if (k === !1) JU(U.BLEND), k = !0;
        if (m !== 5) {
            if (m !== A || Hd !== X) {
                if (j !== 100 || Z !== 100) U.blendEquation(U.FUNC_ADD), j = 100, Z = 100;
                if (Hd) switch (m) {
                    case 1:
                        U.blendFuncSeparate(U.ONE, U.ONE_MINUS_SRC_ALPHA, U.ONE, U.ONE_MINUS_SRC_ALPHA);
                        break;
                    case 2:
                        U.blendFunc(U.ONE, U.ONE);
                        break;
                    case 3:
                        U.blendFuncSeparate(U.ZERO, U.ONE_MINUS_SRC_COLOR, U.ZERO, U.ONE);
                        break;
                    case 4:
                        U.blendFuncSeparate(U.ZERO, U.SRC_COLOR, U.ZERO, U.SRC_ALPHA);
                        break;
                    default:
                        console.error("THREE.WebGLState: Invalid blending: ", m);
                        break
                } else switch (m) {
                    case 1:
                        U.blendFuncSeparate(U.SRC_ALPHA, U.ONE_MINUS_SRC_ALPHA, U.ONE, U.ONE_MINUS_SRC_ALPHA);
                        break;
                    case 2:
                        U.blendFunc(U.SRC_ALPHA, U.ONE);
                        break;
                    case 3:
                        U.blendFuncSeparate(U.ZERO, U.ONE_MINUS_SRC_COLOR, U.ZERO, U.ONE);
                        break;
                    case 4:
                        U.blendFunc(U.ZERO, U.SRC_COLOR);
                        break;
                    default:
                        console.error("THREE.WebGLState: Invalid blending: ", m);
                        break
                }
                C = null, I = null, a = null, Y = null, f.set(0, 0, 0), G = 0, A = m, X = Hd
            }
            return
        }
        if (EU = EU || HU, AU = AU || n, lU = lU || x, HU !== j || EU !== Z) U.blendEquationSeparate(SU[HU], SU[EU]), j = HU, Z = EU;
        if (n !== C || x !== I || AU !== a || lU !== Y) U.blendFuncSeparate(b[n], b[x], b[AU], b[lU]), C = n, I = x, a = AU, Y = lU;
        if (Zd.equals(f) === !1 || Od !== G) U.blendColor(Zd.r, Zd.g, Zd.b, Od), f.copy(Zd), G = Od;
        A = m, X = !1
    }

    function TU(m, HU) {
        m.side === 2 ? mU(U.CULL_FACE) : JU(U.CULL_FACE);
        let n = m.side === 1;
        if (HU) n = !n;
        CU(n), m.blending === 1 && m.transparent === !1 ? YU(0) : YU(m.blending, m.blendEquation, m.blendSrc, m.blendDst, m.blendEquationAlpha, m.blendSrcAlpha, m.blendDstAlpha, m.blendColor, m.blendAlpha, m.premultipliedAlpha), T.setFunc(m.depthFunc), T.setTest(m.depthTest), T.setMask(m.depthWrite), P.setMask(m.colorWrite);
        let x = m.stencilWrite;
        if (R.setTest(x), x) R.setMask(m.stencilWriteMask), R.setFunc(m.stencilFunc, m.stencilRef, m.stencilFuncMask), R.setOp(m.stencilFail, m.stencilZFail, m.stencilZPass);
        kU(m.polygonOffset, m.polygonOffsetFactor, m.polygonOffsetUnits), m.alphaToCoverage === !0 ? JU(U.SAMPLE_ALPHA_TO_COVERAGE) : mU(U.SAMPLE_ALPHA_TO_COVERAGE)
    }

    function CU(m) {
        if (F !== m) {
            if (m) U.frontFace(U.CW);
            else U.frontFace(U.CCW);
            F = m
        }
    }

    function DU(m) {
        if (m !== 0) {
            if (JU(U.CULL_FACE), m !== O)
                if (m === 1) U.cullFace(U.BACK);
                else if (m === 2) U.cullFace(U.FRONT);
            else U.cullFace(U.FRONT_AND_BACK)
        } else mU(U.CULL_FACE);
        O = m
    }

    function NU(m) {
        if (m !== N) {
            if (c) U.lineWidth(m);
            N = m
        }
    }

    function kU(m, HU, n) {
        if (m) {
            if (JU(U.POLYGON_OFFSET_FILL), z !== HU || w !== n) U.polygonOffset(HU, n), z = HU, w = n
        } else mU(U.POLYGON_OFFSET_FILL)
    }

    function VU(m) {
        if (m) JU(U.SCISSOR_TEST);
        else mU(U.SCISSOR_TEST)
    }

    function h(m) {
        if (m === void 0) m = U.TEXTURE0 + l - 1;
        if (UU !== m) U.activeTexture(m), UU = m
    }

    function V(m, HU, n) {
        if (n === void 0)
            if (UU === null) n = U.TEXTURE0 + l - 1;
            else n = UU;
        let x = PU[n];
        if (x === void 0) x = {
            type: void 0,
            texture: void 0
        }, PU[n] = x;
        if (x.type !== m || x.texture !== HU) {
            if (UU !== n) U.activeTexture(n), UU = n;
            U.bindTexture(m, HU || XU[m]), x.type = m, x.texture = HU
        }
    }

    function q() {
        let m = PU[UU];
        if (m !== void 0 && m.type !== void 0) U.bindTexture(m.type, null), m.type = void 0, m.texture = void 0
    }

    function s() {
        try {
            U.compressedTexImage2D.apply(U, arguments)
        } catch (m) {
            console.error("THREE.WebGLState:", m)
        }
    }

    function t() {
        try {
            U.compressedTexImage3D.apply(U, arguments)
        } catch (m) {
            console.error("THREE.WebGLState:", m)
        }
    }

    function v() {
        try {
            U.texSubImage2D.apply(U, arguments)
        } catch (m) {
            console.error("THREE.WebGLState:", m)
        }
    }

    function WU() {
        try {
            U.texSubImage3D.apply(U, arguments)
        } catch (m) {
            console.error("THREE.WebGLState:", m)
        }
    }

    function BU() {
        try {
            U.compressedTexSubImage2D.apply(U, arguments)
        } catch (m) {
            console.error("THREE.WebGLState:", m)
        }
    }

    function IU() {
        try {
            U.compressedTexSubImage3D.apply(U, arguments)
        } catch (m) {
            console.error("THREE.WebGLState:", m)
        }
    }

    function pU() {
        try {
            U.texStorage2D.apply(U, arguments)
        } catch (m) {
            console.error("THREE.WebGLState:", m)
        }
    }

    function RU() {
        try {
            U.texStorage3D.apply(U, arguments)
        } catch (m) {
            console.error("THREE.WebGLState:", m)
        }
    }

    function ZU() {
        try {
            U.texImage2D.apply(U, arguments)
        } catch (m) {
            console.error("THREE.WebGLState:", m)
        }
    }

    function xU() {
        try {
            U.texImage3D.apply(U, arguments)
        } catch (m) {
            console.error("THREE.WebGLState:", m)
        }
    }

    function zU(m) {
        if (o.equals(m) === !1) U.scissor(m.x, m.y, m.z, m.w), o.copy(m)
    }

    function aU(m) {
        if ($U.equals(m) === !1) U.viewport(m.x, m.y, m.z, m.w), $U.copy(m)
    }

    function cU(m, HU) {
        let n = Q.get(HU);
        if (n === void 0) n = new WeakMap, Q.set(HU, n);
        let x = n.get(m);
        if (x === void 0) x = U.getUniformBlockIndex(HU, m.name), n.set(m, x)
    }

    function sU(m, HU) {
        let x = Q.get(HU).get(m);
        if (J.get(HU) !== x) U.uniformBlockBinding(HU, x, m.__bindingPointIndex), J.set(HU, x)
    }

    function Ed() {
        U.disable(U.BLEND), U.disable(U.CULL_FACE), U.disable(U.DEPTH_TEST), U.disable(U.POLYGON_OFFSET_FILL), U.disable(U.SCISSOR_TEST), U.disable(U.STENCIL_TEST), U.disable(U.SAMPLE_ALPHA_TO_COVERAGE), U.blendEquation(U.FUNC_ADD), U.blendFunc(U.ONE, U.ZERO), U.blendFuncSeparate(U.ONE, U.ZERO, U.ONE, U.ZERO), U.blendColor(0, 0, 0, 0), U.colorMask(!0, !0, !0, !0), U.clearColor(0, 0, 0, 0), U.depthMask(!0), U.depthFunc(U.LESS), T.setReversed(!1), U.clearDepth(1), U.stencilMask(4294967295), U.stencilFunc(U.ALWAYS, 0, 4294967295), U.stencilOp(U.KEEP, U.KEEP, U.KEEP), U.clearStencil(0), U.cullFace(U.BACK), U.frontFace(U.CCW), U.polygonOffset(0, 0), U.activeTexture(U.TEXTURE0), U.bindFramebuffer(U.FRAMEBUFFER, null), U.bindFramebuffer(U.DRAW_FRAMEBUFFER, null), U.bindFramebuffer(U.READ_FRAMEBUFFER, null), U.useProgram(null), U.lineWidth(1), U.scissor(0, 0, U.canvas.width, U.canvas.height), U.viewport(0, 0, U.canvas.width, U.canvas.height), M = {}, UU = null, PU = {}, S = {}, B = new WeakMap, L = [], E = null, k = !1, A = null, j = null, C = null, I = null, Z = null, a = null, Y = null, f = new KU(0, 0, 0), G = 0, X = !1, F = null, O = null, N = null, z = null, w = null, o.set(0, 0, U.canvas.width, U.canvas.height), $U.set(0, 0, U.canvas.width, U.canvas.height), P.reset(), T.reset(), R.reset()
    }
    return {
        buffers: {
            color: P,
            depth: T,
            stencil: R
        },
        enable: JU,
        disable: mU,
        bindFramebuffer: nU,
        drawBuffers: uU,
        useProgram: r,
        setBlending: YU,
        setMaterial: TU,
        setFlipSided: CU,
        setCullFace: DU,
        setLineWidth: NU,
        setPolygonOffset: kU,
        setScissorTest: VU,
        activeTexture: h,
        bindTexture: V,
        unbindTexture: q,
        compressedTexImage2D: s,
        compressedTexImage3D: t,
        texImage2D: ZU,
        texImage3D: xU,
        updateUBOMapping: cU,
        uniformBlockBinding: sU,
        texStorage2D: pU,
        texStorage3D: RU,
        texSubImage2D: v,
        texSubImage3D: WU,
        compressedTexSubImage2D: BU,
        compressedTexSubImage3D: IU,
        scissor: zU,
        viewport: aU,
        reset: Ed
    }
}

function wQ(U, d, D, $) {
    let H = hj($);
    switch (D) {
        case 1021:
            return U * d;
        case 1024:
            return U * d;
        case 1025:
            return U * d * 2;
        case 1028:
            return U * d / H.components * H.byteLength;
        case 1029:
            return U * d / H.components * H.byteLength;
        case 1030:
            return U * d * 2 / H.components * H.byteLength;
        case 1031:
            return U * d * 2 / H.components * H.byteLength;
        case 1022:
            return U * d * 3 / H.components * H.byteLength;
        case 1023:
            return U * d * 4 / H.components * H.byteLength;
        case 1033:
            return U * d * 4 / H.components * H.byteLength;
        case 33776:
        case 33777:
            return Math.floor((U + 3) / 4) * Math.floor((d + 3) / 4) * 8;
        case 33778:
        case 33779:
            return Math.floor((U + 3) / 4) * Math.floor((d + 3) / 4) * 16;
        case 35841:
        case 35843:
            return Math.max(U, 16) * Math.max(d, 8) / 4;
        case 35840:
        case 35842:
            return Math.max(U, 8) * Math.max(d, 8) / 2;
        case 36196:
        case 37492:
            return Math.floor((U + 3) / 4) * Math.floor((d + 3) / 4) * 8;
        case 37496:
            return Math.floor((U + 3) / 4) * Math.floor((d + 3) / 4) * 16;
        case 37808:
            return Math.floor((U + 3) / 4) * Math.floor((d + 3) / 4) * 16;
        case 37809:
            return Math.floor((U + 4) / 5) * Math.floor((d + 3) / 4) * 16;
        case 37810:
            return Math.floor((U + 4) / 5) * Math.floor((d + 4) / 5) * 16;
        case 37811:
            return Math.floor((U + 5) / 6) * Math.floor((d + 4) / 5) * 16;
        case 37812:
            return Math.floor((U + 5) / 6) * Math.floor((d + 5) / 6) * 16;
        case 37813:
            return Math.floor((U + 7) / 8) * Math.floor((d + 4) / 5) * 16;
        case 37814:
            return Math.floor((U + 7) / 8) * Math.floor((d + 5) / 6) * 16;
        case 37815:
            return Math.floor((U + 7) / 8) * Math.floor((d + 7) / 8) * 16;
        case 37816:
            return Math.floor((U + 9) / 10) * Math.floor((d + 4) / 5) * 16;
        case 37817:
            return Math.floor((U + 9) / 10) * Math.floor((d + 5) / 6) * 16;
        case 37818:
            return Math.floor((U + 9) / 10) * Math.floor((d + 7) / 8) * 16;
        case 37819:
            return Math.floor((U + 9) / 10) * Math.floor((d + 9) / 10) * 16;
        case 37820:
            return Math.floor((U + 11) / 12) * Math.floor((d + 9) / 10) * 16;
        case 37821:
            return Math.floor((U + 11) / 12) * Math.floor((d + 11) / 12) * 16;
        case 36492:
        case 36494:
        case 36495:
            return Math.ceil(U / 4) * Math.ceil(d / 4) * 16;
        case 36283:
        case 36284:
            return Math.ceil(U / 4) * Math.ceil(d / 4) * 8;
        case 36285:
        case 36286:
            return Math.ceil(U / 4) * Math.ceil(d / 4) * 16
    }
    throw Error(`Unable to determine texture byte length for ${D} format.`)
}

function hj(U) {
    switch (U) {
        case 1009:
        case 1010:
            return {
                byteLength: 1, components: 1
            };
        case 1012:
        case 1011:
        case 1016:
            return {
                byteLength: 2, components: 1
            };
        case 1017:
        case 1018:
            return {
                byteLength: 2, components: 4
            };
        case 1014:
        case 1013:
        case 1015:
            return {
                byteLength: 4, components: 1
            };
        case 35902:
            return {
                byteLength: 4, components: 3
            }
    }
    throw Error(`Unknown texture type ${U}.`)
}

function bj(U, d, D, $, H, P, T) {
    let R = d.has("WEBGL_multisampled_render_to_texture") ? d.get("WEBGL_multisampled_render_to_texture") : null,
        J = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent),
        Q = new dU,
        M = new WeakMap,
        S, B = new WeakMap,
        L = !1;
    try {
        L = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null
    } catch (h) {}

    function E(h, V) {
        return L ? new OffscreenCanvas(h, V) : CH("canvas")
    }

    function k(h, V, q) {
        let s = 1,
            t = VU(h);
        if (t.width > q || t.height > q) s = q / Math.max(t.width, t.height);
        if (s < 1)
            if (typeof HTMLImageElement < "u" && h instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && h instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && h instanceof ImageBitmap || typeof VideoFrame < "u" && h instanceof VideoFrame) {
                let v = Math.floor(s * t.width),
                    WU = Math.floor(s * t.height);
                if (S === void 0) S = E(v, WU);
                let BU = V ? E(v, WU) : S;
                return BU.width = v, BU.height = WU, BU.getContext("2d").drawImage(h, 0, 0, v, WU), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + t.width + "x" + t.height + ") to (" + v + "x" + WU + ")."), BU
            } else {
                if ("data" in h) console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + t.width + "x" + t.height + ").");
                return h
            } return h
    }

    function A(h) {
        return h.generateMipmaps
    }

    function j(h) {
        U.generateMipmap(h)
    }

    function C(h) {
        if (h.isWebGLCubeRenderTarget) return U.TEXTURE_CUBE_MAP;
        if (h.isWebGL3DRenderTarget) return U.TEXTURE_3D;
        if (h.isWebGLArrayRenderTarget || h.isCompressedArrayTexture) return U.TEXTURE_2D_ARRAY;
        return U.TEXTURE_2D
    }

    function I(h, V, q, s, t = !1) {
        if (h !== null) {
            if (U[h] !== void 0) return U[h];
            console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + h + "'")
        }
        let v = V;
        if (V === U.RED) {
            if (q === U.FLOAT) v = U.R32F;
            if (q === U.HALF_FLOAT) v = U.R16F;
            if (q === U.UNSIGNED_BYTE) v = U.R8
        }
        if (V === U.RED_INTEGER) {
            if (q === U.UNSIGNED_BYTE) v = U.R8UI;
            if (q === U.UNSIGNED_SHORT) v = U.R16UI;
            if (q === U.UNSIGNED_INT) v = U.R32UI;
            if (q === U.BYTE) v = U.R8I;
            if (q === U.SHORT) v = U.R16I;
            if (q === U.INT) v = U.R32I
        }
        if (V === U.RG) {
            if (q === U.FLOAT) v = U.RG32F;
            if (q === U.HALF_FLOAT) v = U.RG16F;
            if (q === U.UNSIGNED_BYTE) v = U.RG8
        }
        if (V === U.RG_INTEGER) {
            if (q === U.UNSIGNED_BYTE) v = U.RG8UI;
            if (q === U.UNSIGNED_SHORT) v = U.RG16UI;
            if (q === U.UNSIGNED_INT) v = U.RG32UI;
            if (q === U.BYTE) v = U.RG8I;
            if (q === U.SHORT) v = U.RG16I;
            if (q === U.INT) v = U.RG32I
        }
        if (V === U.RGB_INTEGER) {
            if (q === U.UNSIGNED_BYTE) v = U.RGB8UI;
            if (q === U.UNSIGNED_SHORT) v = U.RGB16UI;
            if (q === U.UNSIGNED_INT) v = U.RGB32UI;
            if (q === U.BYTE) v = U.RGB8I;
            if (q === U.SHORT) v = U.RGB16I;
            if (q === U.INT) v = U.RGB32I
        }
        if (V === U.RGBA_INTEGER) {
            if (q === U.UNSIGNED_BYTE) v = U.RGBA8UI;
            if (q === U.UNSIGNED_SHORT) v = U.RGBA16UI;
            if (q === U.UNSIGNED_INT) v = U.RGBA32UI;
            if (q === U.BYTE) v = U.RGBA8I;
            if (q === U.SHORT) v = U.RGBA16I;
            if (q === U.INT) v = U.RGBA32I
        }
        if (V === U.RGB) {
            if (q === U.UNSIGNED_INT_5_9_9_9_REV) v = U.RGB9_E5
        }
        if (V === U.RGBA) {
            let WU = t ? "linear" : dd.getTransfer(s);
            if (q === U.FLOAT) v = U.RGBA32F;
            if (q === U.HALF_FLOAT) v = U.RGBA16F;
            if (q === U.UNSIGNED_BYTE) v = WU === "srgb" ? U.SRGB8_ALPHA8 : U.RGBA8;
            if (q === U.UNSIGNED_SHORT_4_4_4_4) v = U.RGBA4;
            if (q === U.UNSIGNED_SHORT_5_5_5_1) v = U.RGB5_A1
        }
        if (v === U.R16F || v === U.R32F || v === U.RG16F || v === U.RG32F || v === U.RGBA16F || v === U.RGBA32F) d.get("EXT_color_buffer_float");
        return v
    }

    function Z(h, V) {
        let q;
        if (h) {
            if (V === null || V === 1014 || V === 1020) q = U.DEPTH24_STENCIL8;
            else if (V === 1015) q = U.DEPTH32F_STENCIL8;
            else if (V === 1012) q = U.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")
        } else if (V === null || V === 1014 || V === 1020) q = U.DEPTH_COMPONENT24;
        else if (V === 1015) q = U.DEPTH_COMPONENT32F;
        else if (V === 1012) q = U.DEPTH_COMPONENT16;
        return q
    }

    function a(h, V) {
        if (A(h) === !0 || h.isFramebufferTexture && h.minFilter !== 1003 && h.minFilter !== 1006) return Math.log2(Math.max(V.width, V.height)) + 1;
        else if (h.mipmaps !== void 0 && h.mipmaps.length > 0) return h.mipmaps.length;
        else if (h.isCompressedTexture && Array.isArray(h.image)) return V.mipmaps.length;
        else return 1
    }

    function Y(h) {
        let V = h.target;
        if (V.removeEventListener("dispose", Y), G(V), V.isVideoTexture) M.delete(V)
    }

    function f(h) {
        let V = h.target;
        V.removeEventListener("dispose", f), F(V)
    }

    function G(h) {
        let V = $.get(h);
        if (V.__webglInit === void 0) return;
        let q = h.source,
            s = B.get(q);
        if (s) {
            let t = s[V.__cacheKey];
            if (t.usedTimes--, t.usedTimes === 0) X(h);
            if (Object.keys(s).length === 0) B.delete(q)
        }
        $.remove(h)
    }

    function X(h) {
        let V = $.get(h);
        U.deleteTexture(V.__webglTexture);
        let q = h.source,
            s = B.get(q);
        delete s[V.__cacheKey], T.memory.textures--
    }

    function F(h) {
        let V = $.get(h);
        if (h.depthTexture) h.depthTexture.dispose(), $.remove(h.depthTexture);
        if (h.isWebGLCubeRenderTarget)
            for (let s = 0; s < 6; s++) {
                if (Array.isArray(V.__webglFramebuffer[s]))
                    for (let t = 0; t < V.__webglFramebuffer[s].length; t++) U.deleteFramebuffer(V.__webglFramebuffer[s][t]);
                else U.deleteFramebuffer(V.__webglFramebuffer[s]);
                if (V.__webglDepthbuffer) U.deleteRenderbuffer(V.__webglDepthbuffer[s])
            } else {
                if (Array.isArray(V.__webglFramebuffer))
                    for (let s = 0; s < V.__webglFramebuffer.length; s++) U.deleteFramebuffer(V.__webglFramebuffer[s]);
                else U.deleteFramebuffer(V.__webglFramebuffer);
                if (V.__webglDepthbuffer) U.deleteRenderbuffer(V.__webglDepthbuffer);
                if (V.__webglMultisampledFramebuffer) U.deleteFramebuffer(V.__webglMultisampledFramebuffer);
                if (V.__webglColorRenderbuffer) {
                    for (let s = 0; s < V.__webglColorRenderbuffer.length; s++)
                        if (V.__webglColorRenderbuffer[s]) U.deleteRenderbuffer(V.__webglColorRenderbuffer[s])
                }
                if (V.__webglDepthRenderbuffer) U.deleteRenderbuffer(V.__webglDepthRenderbuffer)
            }
        let q = h.textures;
        for (let s = 0, t = q.length; s < t; s++) {
            let v = $.get(q[s]);
            if (v.__webglTexture) U.deleteTexture(v.__webglTexture), T.memory.textures--;
            $.remove(q[s])
        }
        $.remove(h)
    }
    let O = 0;

    function N() {
        O = 0
    }

    function z() {
        let h = O;
        if (h >= H.maxTextures) console.warn("THREE.WebGLTextures: Trying to use " + h + " texture units while this GPU supports only " + H.maxTextures);
        return O += 1, h
    }

    function w(h) {
        let V = [];
        return V.push(h.wrapS), V.push(h.wrapT), V.push(h.wrapR || 0), V.push(h.magFilter), V.push(h.minFilter), V.push(h.anisotropy), V.push(h.internalFormat), V.push(h.format), V.push(h.type), V.push(h.generateMipmaps), V.push(h.premultiplyAlpha), V.push(h.flipY), V.push(h.unpackAlignment), V.push(h.colorSpace), V.join()
    }

    function l(h, V) {
        let q = $.get(h);
        if (h.isVideoTexture) NU(h);
        if (h.isRenderTargetTexture === !1 && h.version > 0 && q.__version !== h.version) {
            let s = h.image;
            if (s === null) console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
            else if (s.complete === !1) console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
            else {
                $U(q, h, V);
                return
            }
        }
        D.bindTexture(U.TEXTURE_2D, q.__webglTexture, U.TEXTURE0 + V)
    }

    function c(h, V) {
        let q = $.get(h);
        if (h.version > 0 && q.__version !== h.version) {
            $U(q, h, V);
            return
        }
        D.bindTexture(U.TEXTURE_2D_ARRAY, q.__webglTexture, U.TEXTURE0 + V)
    }

    function y(h, V) {
        let q = $.get(h);
        if (h.version > 0 && q.__version !== h.version) {
            $U(q, h, V);
            return
        }
        D.bindTexture(U.TEXTURE_3D, q.__webglTexture, U.TEXTURE0 + V)
    }

    function W(h, V) {
        let q = $.get(h);
        if (h.version > 0 && q.__version !== h.version) {
            FU(q, h, V);
            return
        }
        D.bindTexture(U.TEXTURE_CUBE_MAP, q.__webglTexture, U.TEXTURE0 + V)
    }
    let UU = {
            [1000]: U.REPEAT,
            [1001]: U.CLAMP_TO_EDGE,
            [1002]: U.MIRRORED_REPEAT
        },
        PU = {
            [1003]: U.NEAREST,
            [1004]: U.NEAREST_MIPMAP_NEAREST,
            [1005]: U.NEAREST_MIPMAP_LINEAR,
            [1006]: U.LINEAR,
            [1007]: U.LINEAR_MIPMAP_NEAREST,
            [1008]: U.LINEAR_MIPMAP_LINEAR
        },
        iU = {
            [512]: U.NEVER,
            [519]: U.ALWAYS,
            [513]: U.LESS,
            [515]: U.LEQUAL,
            [514]: U.EQUAL,
            [518]: U.GEQUAL,
            [516]: U.GREATER,
            [517]: U.NOTEQUAL
        };

    function wU(h, V) {
        if (V.type === 1015 && d.has("OES_texture_float_linear") === !1 && (V.magFilter === 1006 || V.magFilter === 1007 || V.magFilter === 1005 || V.magFilter === 1008 || V.minFilter === 1006 || V.minFilter === 1007 || V.minFilter === 1005 || V.minFilter === 1008)) console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");
        if (U.texParameteri(h, U.TEXTURE_WRAP_S, UU[V.wrapS]), U.texParameteri(h, U.TEXTURE_WRAP_T, UU[V.wrapT]), h === U.TEXTURE_3D || h === U.TEXTURE_2D_ARRAY) U.texParameteri(h, U.TEXTURE_WRAP_R, UU[V.wrapR]);
        if (U.texParameteri(h, U.TEXTURE_MAG_FILTER, PU[V.magFilter]), U.texParameteri(h, U.TEXTURE_MIN_FILTER, PU[V.minFilter]), V.compareFunction) U.texParameteri(h, U.TEXTURE_COMPARE_MODE, U.COMPARE_REF_TO_TEXTURE), U.texParameteri(h, U.TEXTURE_COMPARE_FUNC, iU[V.compareFunction]);
        if (d.has("EXT_texture_filter_anisotropic") === !0) {
            if (V.magFilter === 1003) return;
            if (V.minFilter !== 1005 && V.minFilter !== 1008) return;
            if (V.type === 1015 && d.has("OES_texture_float_linear") === !1) return;
            if (V.anisotropy > 1 || $.get(V).__currentAnisotropy) {
                let q = d.get("EXT_texture_filter_anisotropic");
                U.texParameterf(h, q.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(V.anisotropy, H.getMaxAnisotropy())), $.get(V).__currentAnisotropy = V.anisotropy
            }
        }
    }

    function o(h, V) {
        let q = !1;
        if (h.__webglInit === void 0) h.__webglInit = !0, V.addEventListener("dispose", Y);
        let s = V.source,
            t = B.get(s);
        if (t === void 0) t = {}, B.set(s, t);
        let v = w(V);
        if (v !== h.__cacheKey) {
            if (t[v] === void 0) t[v] = {
                texture: U.createTexture(),
                usedTimes: 0
            }, T.memory.textures++, q = !0;
            t[v].usedTimes++;
            let WU = t[h.__cacheKey];
            if (WU !== void 0) {
                if (t[h.__cacheKey].usedTimes--, WU.usedTimes === 0) X(V)
            }
            h.__cacheKey = v, h.__webglTexture = t[v].texture
        }
        return q
    }

    function $U(h, V, q) {
        let s = U.TEXTURE_2D;
        if (V.isDataArrayTexture || V.isCompressedArrayTexture) s = U.TEXTURE_2D_ARRAY;
        if (V.isData3DTexture) s = U.TEXTURE_3D;
        let t = o(h, V),
            v = V.source;
        D.bindTexture(s, h.__webglTexture, U.TEXTURE0 + q);
        let WU = $.get(v);
        if (v.version !== WU.__version || t === !0) {
            D.activeTexture(U.TEXTURE0 + q);
            let BU = dd.getPrimaries(dd.workingColorSpace),
                IU = V.colorSpace === "" ? null : dd.getPrimaries(V.colorSpace),
                pU = V.colorSpace === "" || BU === IU ? U.NONE : U.BROWSER_DEFAULT_WEBGL;
            U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL, V.flipY), U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL, V.premultiplyAlpha), U.pixelStorei(U.UNPACK_ALIGNMENT, V.unpackAlignment), U.pixelStorei(U.UNPACK_COLORSPACE_CONVERSION_WEBGL, pU);
            let RU = k(V.image, !1, H.maxTextureSize);
            RU = kU(V, RU);
            let ZU = P.convert(V.format, V.colorSpace),
                xU = P.convert(V.type),
                zU = I(V.internalFormat, ZU, xU, V.colorSpace, V.isVideoTexture);
            wU(s, V);
            let aU, cU = V.mipmaps,
                sU = V.isVideoTexture !== !0,
                Ed = WU.__version === void 0 || t === !0,
                m = v.dataReady,
                HU = a(V, RU);
            if (V.isDepthTexture) {
                if (zU = Z(V.format === 1027, V.type), Ed)
                    if (sU) D.texStorage2D(U.TEXTURE_2D, 1, zU, RU.width, RU.height);
                    else D.texImage2D(U.TEXTURE_2D, 0, zU, RU.width, RU.height, 0, ZU, xU, null)
            } else if (V.isDataTexture)
                if (cU.length > 0) {
                    if (sU && Ed) D.texStorage2D(U.TEXTURE_2D, HU, zU, cU[0].width, cU[0].height);
                    for (let n = 0, x = cU.length; n < x; n++)
                        if (aU = cU[n], sU) {
                            if (m) D.texSubImage2D(U.TEXTURE_2D, n, 0, 0, aU.width, aU.height, ZU, xU, aU.data)
                        } else D.texImage2D(U.TEXTURE_2D, n, zU, aU.width, aU.height, 0, ZU, xU, aU.data);
                    V.generateMipmaps = !1
                } else if (sU) {
                if (Ed) D.texStorage2D(U.TEXTURE_2D, HU, zU, RU.width, RU.height);
                if (m) D.texSubImage2D(U.TEXTURE_2D, 0, 0, 0, RU.width, RU.height, ZU, xU, RU.data)
            } else D.texImage2D(U.TEXTURE_2D, 0, zU, RU.width, RU.height, 0, ZU, xU, RU.data);
            else if (V.isCompressedTexture)
                if (V.isCompressedArrayTexture) {
                    if (sU && Ed) D.texStorage3D(U.TEXTURE_2D_ARRAY, HU, zU, cU[0].width, cU[0].height, RU.depth);
                    for (let n = 0, x = cU.length; n < x; n++)
                        if (aU = cU[n], V.format !== 1023)
                            if (ZU !== null)
                                if (sU) {
                                    if (m)
                                        if (V.layerUpdates.size > 0) {
                                            let EU = wQ(aU.width, aU.height, V.format, V.type);
                                            for (let AU of V.layerUpdates) {
                                                let lU = aU.data.subarray(AU * EU / aU.data.BYTES_PER_ELEMENT, (AU + 1) * EU / aU.data.BYTES_PER_ELEMENT);
                                                D.compressedTexSubImage3D(U.TEXTURE_2D_ARRAY, n, 0, 0, AU, aU.width, aU.height, 1, ZU, lU)
                                            }
                                            V.clearLayerUpdates()
                                        } else D.compressedTexSubImage3D(U.TEXTURE_2D_ARRAY, n, 0, 0, 0, aU.width, aU.height, RU.depth, ZU, aU.data)
                                } else D.compressedTexImage3D(U.TEXTURE_2D_ARRAY, n, zU, aU.width, aU.height, RU.depth, 0, aU.data, 0, 0);
                    else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
                    else if (sU) {
                        if (m) D.texSubImage3D(U.TEXTURE_2D_ARRAY, n, 0, 0, 0, aU.width, aU.height, RU.depth, ZU, xU, aU.data)
                    } else D.texImage3D(U.TEXTURE_2D_ARRAY, n, zU, aU.width, aU.height, RU.depth, 0, ZU, xU, aU.data)
                } else {
                    if (sU && Ed) D.texStorage2D(U.TEXTURE_2D, HU, zU, cU[0].width, cU[0].height);
                    for (let n = 0, x = cU.length; n < x; n++)
                        if (aU = cU[n], V.format !== 1023)
                            if (ZU !== null)
                                if (sU) {
                                    if (m) D.compressedTexSubImage2D(U.TEXTURE_2D, n, 0, 0, aU.width, aU.height, ZU, aU.data)
                                } else D.compressedTexImage2D(U.TEXTURE_2D, n, zU, aU.width, aU.height, 0, aU.data);
                    else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
                    else if (sU) {
                        if (m) D.texSubImage2D(U.TEXTURE_2D, n, 0, 0, aU.width, aU.height, ZU, xU, aU.data)
                    } else D.texImage2D(U.TEXTURE_2D, n, zU, aU.width, aU.height, 0, ZU, xU, aU.data)
                }
            else if (V.isDataArrayTexture)
                if (sU) {
                    if (Ed) D.texStorage3D(U.TEXTURE_2D_ARRAY, HU, zU, RU.width, RU.height, RU.depth);
                    if (m)
                        if (V.layerUpdates.size > 0) {
                            let n = wQ(RU.width, RU.height, V.format, V.type);
                            for (let x of V.layerUpdates) {
                                let EU = RU.data.subarray(x * n / RU.data.BYTES_PER_ELEMENT, (x + 1) * n / RU.data.BYTES_PER_ELEMENT);
                                D.texSubImage3D(U.TEXTURE_2D_ARRAY, 0, 0, 0, x, RU.width, RU.height, 1, ZU, xU, EU)
                            }
                            V.clearLayerUpdates()
                        } else D.texSubImage3D(U.TEXTURE_2D_ARRAY, 0, 0, 0, 0, RU.width, RU.height, RU.depth, ZU, xU, RU.data)
                } else D.texImage3D(U.TEXTURE_2D_ARRAY, 0, zU, RU.width, RU.height, RU.depth, 0, ZU, xU, RU.data);
            else if (V.isData3DTexture)
                if (sU) {
                    if (Ed) D.texStorage3D(U.TEXTURE_3D, HU, zU, RU.width, RU.height, RU.depth);
                    if (m) D.texSubImage3D(U.TEXTURE_3D, 0, 0, 0, 0, RU.width, RU.height, RU.depth, ZU, xU, RU.data)
                } else D.texImage3D(U.TEXTURE_3D, 0, zU, RU.width, RU.height, RU.depth, 0, ZU, xU, RU.data);
            else if (V.isFramebufferTexture) {
                if (Ed)
                    if (sU) D.texStorage2D(U.TEXTURE_2D, HU, zU, RU.width, RU.height);
                    else {
                        let {
                            width: n,
                            height: x
                        } = RU;
                        for (let EU = 0; EU < HU; EU++) D.texImage2D(U.TEXTURE_2D, EU, zU, n, x, 0, ZU, xU, null), n >>= 1, x >>= 1
                    }
            } else if (cU.length > 0) {
                if (sU && Ed) {
                    let n = VU(cU[0]);
                    D.texStorage2D(U.TEXTURE_2D, HU, zU, n.width, n.height)
                }
                for (let n = 0, x = cU.length; n < x; n++)
                    if (aU = cU[n], sU) {
                        if (m) D.texSubImage2D(U.TEXTURE_2D, n, 0, 0, ZU, xU, aU)
                    } else D.texImage2D(U.TEXTURE_2D, n, zU, ZU, xU, aU);
                V.generateMipmaps = !1
            } else if (sU) {
                if (Ed) {
                    let n = VU(RU);
                    D.texStorage2D(U.TEXTURE_2D, HU, zU, n.width, n.height)
                }
                if (m) D.texSubImage2D(U.TEXTURE_2D, 0, 0, 0, ZU, xU, RU)
            } else D.texImage2D(U.TEXTURE_2D, 0, zU, ZU, xU, RU);
            if (A(V)) j(s);
            if (WU.__version = v.version, V.onUpdate) V.onUpdate(V)
        }
        h.__version = V.version
    }

    function FU(h, V, q) {
        if (V.image.length !== 6) return;
        let s = o(h, V),
            t = V.source;
        D.bindTexture(U.TEXTURE_CUBE_MAP, h.__webglTexture, U.TEXTURE0 + q);
        let v = $.get(t);
        if (t.version !== v.__version || s === !0) {
            D.activeTexture(U.TEXTURE0 + q);
            let WU = dd.getPrimaries(dd.workingColorSpace),
                BU = V.colorSpace === "" ? null : dd.getPrimaries(V.colorSpace),
                IU = V.colorSpace === "" || WU === BU ? U.NONE : U.BROWSER_DEFAULT_WEBGL;
            U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL, V.flipY), U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL, V.premultiplyAlpha), U.pixelStorei(U.UNPACK_ALIGNMENT, V.unpackAlignment), U.pixelStorei(U.UNPACK_COLORSPACE_CONVERSION_WEBGL, IU);
            let pU = V.isCompressedTexture || V.image[0].isCompressedTexture,
                RU = V.image[0] && V.image[0].isDataTexture,
                ZU = [];
            for (let x = 0; x < 6; x++) {
                if (!pU && !RU) ZU[x] = k(V.image[x], !0, H.maxCubemapSize);
                else ZU[x] = RU ? V.image[x].image : V.image[x];
                ZU[x] = kU(V, ZU[x])
            }
            let xU = ZU[0],
                zU = P.convert(V.format, V.colorSpace),
                aU = P.convert(V.type),
                cU = I(V.internalFormat, zU, aU, V.colorSpace),
                sU = V.isVideoTexture !== !0,
                Ed = v.__version === void 0 || s === !0,
                m = t.dataReady,
                HU = a(V, xU);
            wU(U.TEXTURE_CUBE_MAP, V);
            let n;
            if (pU) {
                if (sU && Ed) D.texStorage2D(U.TEXTURE_CUBE_MAP, HU, cU, xU.width, xU.height);
                for (let x = 0; x < 6; x++) {
                    n = ZU[x].mipmaps;
                    for (let EU = 0; EU < n.length; EU++) {
                        let AU = n[EU];
                        if (V.format !== 1023)
                            if (zU !== null)
                                if (sU) {
                                    if (m) D.compressedTexSubImage2D(U.TEXTURE_CUBE_MAP_POSITIVE_X + x, EU, 0, 0, AU.width, AU.height, zU, AU.data)
                                } else D.compressedTexImage2D(U.TEXTURE_CUBE_MAP_POSITIVE_X + x, EU, cU, AU.width, AU.height, 0, AU.data);
                        else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");
                        else if (sU) {
                            if (m) D.texSubImage2D(U.TEXTURE_CUBE_MAP_POSITIVE_X + x, EU, 0, 0, AU.width, AU.height, zU, aU, AU.data)
                        } else D.texImage2D(U.TEXTURE_CUBE_MAP_POSITIVE_X + x, EU, cU, AU.width, AU.height, 0, zU, aU, AU.data)
                    }
                }
            } else {
                if (n = V.mipmaps, sU && Ed) {
                    if (n.length > 0) HU++;
                    let x = VU(ZU[0]);
                    D.texStorage2D(U.TEXTURE_CUBE_MAP, HU, cU, x.width, x.height)
                }
                for (let x = 0; x < 6; x++)
                    if (RU) {
                        if (sU) {
                            if (m) D.texSubImage2D(U.TEXTURE_CUBE_MAP_POSITIVE_X + x, 0, 0, 0, ZU[x].width, ZU[x].height, zU, aU, ZU[x].data)
                        } else D.texImage2D(U.TEXTURE_CUBE_MAP_POSITIVE_X + x, 0, cU, ZU[x].width, ZU[x].height, 0, zU, aU, ZU[x].data);
                        for (let EU = 0; EU < n.length; EU++) {
                            let lU = n[EU].image[x].image;
                            if (sU) {
                                if (m) D.texSubImage2D(U.TEXTURE_CUBE_MAP_POSITIVE_X + x, EU + 1, 0, 0, lU.width, lU.height, zU, aU, lU.data)
                            } else D.texImage2D(U.TEXTURE_CUBE_MAP_POSITIVE_X + x, EU + 1, cU, lU.width, lU.height, 0, zU, aU, lU.data)
                        }
                    } else {
                        if (sU) {
                            if (m) D.texSubImage2D(U.TEXTURE_CUBE_MAP_POSITIVE_X + x, 0, 0, 0, zU, aU, ZU[x])
                        } else D.texImage2D(U.TEXTURE_CUBE_MAP_POSITIVE_X + x, 0, cU, zU, aU, ZU[x]);
                        for (let EU = 0; EU < n.length; EU++) {
                            let AU = n[EU];
                            if (sU) {
                                if (m) D.texSubImage2D(U.TEXTURE_CUBE_MAP_POSITIVE_X + x, EU + 1, 0, 0, zU, aU, AU.image[x])
                            } else D.texImage2D(U.TEXTURE_CUBE_MAP_POSITIVE_X + x, EU + 1, cU, zU, aU, AU.image[x])
                        }
                    }
            }
            if (A(V)) j(U.TEXTURE_CUBE_MAP);
            if (v.__version = t.version, V.onUpdate) V.onUpdate(V)
        }
        h.__version = V.version
    }

    function XU(h, V, q, s, t, v) {
        let WU = P.convert(q.format, q.colorSpace),
            BU = P.convert(q.type),
            IU = I(q.internalFormat, WU, BU, q.colorSpace),
            pU = $.get(V),
            RU = $.get(q);
        if (RU.__renderTarget = V, !pU.__hasExternalTextures) {
            let ZU = Math.max(1, V.width >> v),
                xU = Math.max(1, V.height >> v);
            if (t === U.TEXTURE_3D || t === U.TEXTURE_2D_ARRAY) D.texImage3D(t, v, IU, ZU, xU, V.depth, 0, WU, BU, null);
            else D.texImage2D(t, v, IU, ZU, xU, 0, WU, BU, null)
        }
        if (D.bindFramebuffer(U.FRAMEBUFFER, h), DU(V)) R.framebufferTexture2DMultisampleEXT(U.FRAMEBUFFER, s, t, RU.__webglTexture, 0, CU(V));
        else if (t === U.TEXTURE_2D || t >= U.TEXTURE_CUBE_MAP_POSITIVE_X && t <= U.TEXTURE_CUBE_MAP_NEGATIVE_Z) U.framebufferTexture2D(U.FRAMEBUFFER, s, t, RU.__webglTexture, v);
        D.bindFramebuffer(U.FRAMEBUFFER, null)
    }

    function JU(h, V, q) {
        if (U.bindRenderbuffer(U.RENDERBUFFER, h), V.depthBuffer) {
            let s = V.depthTexture,
                t = s && s.isDepthTexture ? s.type : null,
                v = Z(V.stencilBuffer, t),
                WU = V.stencilBuffer ? U.DEPTH_STENCIL_ATTACHMENT : U.DEPTH_ATTACHMENT,
                BU = CU(V);
            if (DU(V)) R.renderbufferStorageMultisampleEXT(U.RENDERBUFFER, BU, v, V.width, V.height);
            else if (q) U.renderbufferStorageMultisample(U.RENDERBUFFER, BU, v, V.width, V.height);
            else U.renderbufferStorage(U.RENDERBUFFER, v, V.width, V.height);
            U.framebufferRenderbuffer(U.FRAMEBUFFER, WU, U.RENDERBUFFER, h)
        } else {
            let s = V.textures;
            for (let t = 0; t < s.length; t++) {
                let v = s[t],
                    WU = P.convert(v.format, v.colorSpace),
                    BU = P.convert(v.type),
                    IU = I(v.internalFormat, WU, BU, v.colorSpace),
                    pU = CU(V);
                if (q && DU(V) === !1) U.renderbufferStorageMultisample(U.RENDERBUFFER, pU, IU, V.width, V.height);
                else if (DU(V)) R.renderbufferStorageMultisampleEXT(U.RENDERBUFFER, pU, IU, V.width, V.height);
                else U.renderbufferStorage(U.RENDERBUFFER, IU, V.width, V.height)
            }
        }
        U.bindRenderbuffer(U.RENDERBUFFER, null)
    }

    function mU(h, V) {
        if (V && V.isWebGLCubeRenderTarget) throw Error("Depth Texture with cube render targets is not supported");
        if (D.bindFramebuffer(U.FRAMEBUFFER, h), !(V.depthTexture && V.depthTexture.isDepthTexture)) throw Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
        let s = $.get(V.depthTexture);
        if (s.__renderTarget = V, !s.__webglTexture || V.depthTexture.image.width !== V.width || V.depthTexture.image.height !== V.height) V.depthTexture.image.width = V.width, V.depthTexture.image.height = V.height, V.depthTexture.needsUpdate = !0;
        l(V.depthTexture, 0);
        let t = s.__webglTexture,
            v = CU(V);
        if (V.depthTexture.format === 1026)
            if (DU(V)) R.framebufferTexture2DMultisampleEXT(U.FRAMEBUFFER, U.DEPTH_ATTACHMENT, U.TEXTURE_2D, t, 0, v);
            else U.framebufferTexture2D(U.FRAMEBUFFER, U.DEPTH_ATTACHMENT, U.TEXTURE_2D, t, 0);
        else if (V.depthTexture.format === 1027)
            if (DU(V)) R.framebufferTexture2DMultisampleEXT(U.FRAMEBUFFER, U.DEPTH_STENCIL_ATTACHMENT, U.TEXTURE_2D, t, 0, v);
            else U.framebufferTexture2D(U.FRAMEBUFFER, U.DEPTH_STENCIL_ATTACHMENT, U.TEXTURE_2D, t, 0);
        else throw Error("Unknown depthTexture format")
    }

    function nU(h) {
        let V = $.get(h),
            q = h.isWebGLCubeRenderTarget === !0;
        if (V.__boundDepthTexture !== h.depthTexture) {
            let s = h.depthTexture;
            if (V.__depthDisposeCallback) V.__depthDisposeCallback();
            if (s) {
                let t = () => {
                    delete V.__boundDepthTexture, delete V.__depthDisposeCallback, s.removeEventListener("dispose", t)
                };
                s.addEventListener("dispose", t), V.__depthDisposeCallback = t
            }
            V.__boundDepthTexture = s
        }
        if (h.depthTexture && !V.__autoAllocateDepthBuffer) {
            if (q) throw Error("target.depthTexture not supported in Cube render targets");
            mU(V.__webglFramebuffer, h)
        } else if (q) {
            V.__webglDepthbuffer = [];
            for (let s = 0; s < 6; s++)
                if (D.bindFramebuffer(U.FRAMEBUFFER, V.__webglFramebuffer[s]), V.__webglDepthbuffer[s] === void 0) V.__webglDepthbuffer[s] = U.createRenderbuffer(), JU(V.__webglDepthbuffer[s], h, !1);
                else {
                    let t = h.stencilBuffer ? U.DEPTH_STENCIL_ATTACHMENT : U.DEPTH_ATTACHMENT,
                        v = V.__webglDepthbuffer[s];
                    U.bindRenderbuffer(U.RENDERBUFFER, v), U.framebufferRenderbuffer(U.FRAMEBUFFER, t, U.RENDERBUFFER, v)
                }
        } else if (D.bindFramebuffer(U.FRAMEBUFFER, V.__webglFramebuffer), V.__webglDepthbuffer === void 0) V.__webglDepthbuffer = U.createRenderbuffer(), JU(V.__webglDepthbuffer, h, !1);
        else {
            let s = h.stencilBuffer ? U.DEPTH_STENCIL_ATTACHMENT : U.DEPTH_ATTACHMENT,
                t = V.__webglDepthbuffer;
            U.bindRenderbuffer(U.RENDERBUFFER, t), U.framebufferRenderbuffer(U.FRAMEBUFFER, s, U.RENDERBUFFER, t)
        }
        D.bindFramebuffer(U.FRAMEBUFFER, null)
    }

    function uU(h, V, q) {
        let s = $.get(h);
        if (V !== void 0) XU(s.__webglFramebuffer, h, h.texture, U.COLOR_ATTACHMENT0, U.TEXTURE_2D, 0);
        if (q !== void 0) nU(h)
    }

    function r(h) {
        let V = h.texture,
            q = $.get(h),
            s = $.get(V);
        h.addEventListener("dispose", f);
        let t = h.textures,
            v = h.isWebGLCubeRenderTarget === !0,
            WU = t.length > 1;
        if (!WU) {
            if (s.__webglTexture === void 0) s.__webglTexture = U.createTexture();
            s.__version = V.version, T.memory.textures++
        }
        if (v) {
            q.__webglFramebuffer = [];
            for (let BU = 0; BU < 6; BU++)
                if (V.mipmaps && V.mipmaps.length > 0) {
                    q.__webglFramebuffer[BU] = [];
                    for (let IU = 0; IU < V.mipmaps.length; IU++) q.__webglFramebuffer[BU][IU] = U.createFramebuffer()
                } else q.__webglFramebuffer[BU] = U.createFramebuffer()
        } else {
            if (V.mipmaps && V.mipmaps.length > 0) {
                q.__webglFramebuffer = [];
                for (let BU = 0; BU < V.mipmaps.length; BU++) q.__webglFramebuffer[BU] = U.createFramebuffer()
            } else q.__webglFramebuffer = U.createFramebuffer();
            if (WU)
                for (let BU = 0, IU = t.length; BU < IU; BU++) {
                    let pU = $.get(t[BU]);
                    if (pU.__webglTexture === void 0) pU.__webglTexture = U.createTexture(), T.memory.textures++
                }
            if (h.samples > 0 && DU(h) === !1) {
                q.__webglMultisampledFramebuffer = U.createFramebuffer(), q.__webglColorRenderbuffer = [], D.bindFramebuffer(U.FRAMEBUFFER, q.__webglMultisampledFramebuffer);
                for (let BU = 0; BU < t.length; BU++) {
                    let IU = t[BU];
                    q.__webglColorRenderbuffer[BU] = U.createRenderbuffer(), U.bindRenderbuffer(U.RENDERBUFFER, q.__webglColorRenderbuffer[BU]);
                    let pU = P.convert(IU.format, IU.colorSpace),
                        RU = P.convert(IU.type),
                        ZU = I(IU.internalFormat, pU, RU, IU.colorSpace, h.isXRRenderTarget === !0),
                        xU = CU(h);
                    U.renderbufferStorageMultisample(U.RENDERBUFFER, xU, ZU, h.width, h.height), U.framebufferRenderbuffer(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0 + BU, U.RENDERBUFFER, q.__webglColorRenderbuffer[BU])
                }
                if (U.bindRenderbuffer(U.RENDERBUFFER, null), h.depthBuffer) q.__webglDepthRenderbuffer = U.createRenderbuffer(), JU(q.__webglDepthRenderbuffer, h, !0);
                D.bindFramebuffer(U.FRAMEBUFFER, null)
            }
        }
        if (v) {
            D.bindTexture(U.TEXTURE_CUBE_MAP, s.__webglTexture), wU(U.TEXTURE_CUBE_MAP, V);
            for (let BU = 0; BU < 6; BU++)
                if (V.mipmaps && V.mipmaps.length > 0)
                    for (let IU = 0; IU < V.mipmaps.length; IU++) XU(q.__webglFramebuffer[BU][IU], h, V, U.COLOR_ATTACHMENT0, U.TEXTURE_CUBE_MAP_POSITIVE_X + BU, IU);
                else XU(q.__webglFramebuffer[BU], h, V, U.COLOR_ATTACHMENT0, U.TEXTURE_CUBE_MAP_POSITIVE_X + BU, 0);
            if (A(V)) j(U.TEXTURE_CUBE_MAP);
            D.unbindTexture()
        } else if (WU) {
            for (let BU = 0, IU = t.length; BU < IU; BU++) {
                let pU = t[BU],
                    RU = $.get(pU);
                if (D.bindTexture(U.TEXTURE_2D, RU.__webglTexture), wU(U.TEXTURE_2D, pU), XU(q.__webglFramebuffer, h, pU, U.COLOR_ATTACHMENT0 + BU, U.TEXTURE_2D, 0), A(pU)) j(U.TEXTURE_2D)
            }
            D.unbindTexture()
        } else {
            let BU = U.TEXTURE_2D;
            if (h.isWebGL3DRenderTarget || h.isWebGLArrayRenderTarget) BU = h.isWebGL3DRenderTarget ? U.TEXTURE_3D : U.TEXTURE_2D_ARRAY;
            if (D.bindTexture(BU, s.__webglTexture), wU(BU, V), V.mipmaps && V.mipmaps.length > 0)
                for (let IU = 0; IU < V.mipmaps.length; IU++) XU(q.__webglFramebuffer[IU], h, V, U.COLOR_ATTACHMENT0, BU, IU);
            else XU(q.__webglFramebuffer, h, V, U.COLOR_ATTACHMENT0, BU, 0);
            if (A(V)) j(BU);
            D.unbindTexture()
        }
        if (h.depthBuffer) nU(h)
    }

    function SU(h) {
        let V = h.textures;
        for (let q = 0, s = V.length; q < s; q++) {
            let t = V[q];
            if (A(t)) {
                let v = C(h),
                    WU = $.get(t).__webglTexture;
                D.bindTexture(v, WU), j(v), D.unbindTexture()
            }
        }
    }
    let b = [],
        YU = [];

    function TU(h) {
        if (h.samples > 0) {
            if (DU(h) === !1) {
                let {
                    textures: V,
                    width: q,
                    height: s
                } = h, t = U.COLOR_BUFFER_BIT, v = h.stencilBuffer ? U.DEPTH_STENCIL_ATTACHMENT : U.DEPTH_ATTACHMENT, WU = $.get(h), BU = V.length > 1;
                if (BU)
                    for (let IU = 0; IU < V.length; IU++) D.bindFramebuffer(U.FRAMEBUFFER, WU.__webglMultisampledFramebuffer), U.framebufferRenderbuffer(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0 + IU, U.RENDERBUFFER, null), D.bindFramebuffer(U.FRAMEBUFFER, WU.__webglFramebuffer), U.framebufferTexture2D(U.DRAW_FRAMEBUFFER, U.COLOR_ATTACHMENT0 + IU, U.TEXTURE_2D, null, 0);
                D.bindFramebuffer(U.READ_FRAMEBUFFER, WU.__webglMultisampledFramebuffer), D.bindFramebuffer(U.DRAW_FRAMEBUFFER, WU.__webglFramebuffer);
                for (let IU = 0; IU < V.length; IU++) {
                    if (h.resolveDepthBuffer) {
                        if (h.depthBuffer) t |= U.DEPTH_BUFFER_BIT;
                        if (h.stencilBuffer && h.resolveStencilBuffer) t |= U.STENCIL_BUFFER_BIT
                    }
                    if (BU) {
                        U.framebufferRenderbuffer(U.READ_FRAMEBUFFER, U.COLOR_ATTACHMENT0, U.RENDERBUFFER, WU.__webglColorRenderbuffer[IU]);
                        let pU = $.get(V[IU]).__webglTexture;
                        U.framebufferTexture2D(U.DRAW_FRAMEBUFFER, U.COLOR_ATTACHMENT0, U.TEXTURE_2D, pU, 0)
                    }
                    if (U.blitFramebuffer(0, 0, q, s, 0, 0, q, s, t, U.NEAREST), J === !0) {
                        if (b.length = 0, YU.length = 0, b.push(U.COLOR_ATTACHMENT0 + IU), h.depthBuffer && h.resolveDepthBuffer === !1) b.push(v), YU.push(v), U.invalidateFramebuffer(U.DRAW_FRAMEBUFFER, YU);
                        U.invalidateFramebuffer(U.READ_FRAMEBUFFER, b)
                    }
                }
                if (D.bindFramebuffer(U.READ_FRAMEBUFFER, null), D.bindFramebuffer(U.DRAW_FRAMEBUFFER, null), BU)
                    for (let IU = 0; IU < V.length; IU++) {
                        D.bindFramebuffer(U.FRAMEBUFFER, WU.__webglMultisampledFramebuffer), U.framebufferRenderbuffer(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0 + IU, U.RENDERBUFFER, WU.__webglColorRenderbuffer[IU]);
                        let pU = $.get(V[IU]).__webglTexture;
                        D.bindFramebuffer(U.FRAMEBUFFER, WU.__webglFramebuffer), U.framebufferTexture2D(U.DRAW_FRAMEBUFFER, U.COLOR_ATTACHMENT0 + IU, U.TEXTURE_2D, pU, 0)
                    }
                D.bindFramebuffer(U.DRAW_FRAMEBUFFER, WU.__webglMultisampledFramebuffer)
            } else if (h.depthBuffer && h.resolveDepthBuffer === !1 && J) {
                let V = h.stencilBuffer ? U.DEPTH_STENCIL_ATTACHMENT : U.DEPTH_ATTACHMENT;
                U.invalidateFramebuffer(U.DRAW_FRAMEBUFFER, [V])
            }
        }
    }

    function CU(h) {
        return Math.min(H.maxSamples, h.samples)
    }

    function DU(h) {
        let V = $.get(h);
        return h.samples > 0 && d.has("WEBGL_multisampled_render_to_texture") === !0 && V.__useRenderToTexture !== !1
    }

    function NU(h) {
        let V = T.render.frame;
        if (M.get(h) !== V) M.set(h, V), h.update()
    }

    function kU(h, V) {
        let {
            colorSpace: q,
            format: s,
            type: t
        } = h;
        if (h.isCompressedTexture === !0 || h.isVideoTexture === !0) return V;
        if (q !== "srgb-linear" && q !== "")
            if (dd.getTransfer(q) === "srgb") {
                if (s !== 1023 || t !== 1009) console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")
            } else console.error("THREE.WebGLTextures: Unsupported texture color space:", q);
        return V
    }

    function VU(h) {
        if (typeof HTMLImageElement < "u" && h instanceof HTMLImageElement) Q.width = h.naturalWidth || h.width, Q.height = h.naturalHeight || h.height;
        else if (typeof VideoFrame < "u" && h instanceof VideoFrame) Q.width = h.displayWidth, Q.height = h.displayHeight;
        else Q.width = h.width, Q.height = h.height;
        return Q
    }
    this.allocateTextureUnit = z, this.resetTextureUnits = N, this.setTexture2D = l, this.setTexture2DArray = c, this.setTexture3D = y, this.setTextureCube = W, this.rebindTextures = uU, this.setupRenderTarget = r, this.updateRenderTargetMipmap = SU, this.updateMultisampleRenderTarget = TU, this.setupDepthRenderbuffer = nU, this.setupFrameBufferTexture = XU, this.useMultisampledRTT = DU
}

function ij(U, d) {
    function D($, H = "") {
        let P, T = dd.getTransfer(H);
        if ($ === 1009) return U.UNSIGNED_BYTE;
        if ($ === 1017) return U.UNSIGNED_SHORT_4_4_4_4;
        if ($ === 1018) return U.UNSIGNED_SHORT_5_5_5_1;
        if ($ === 35902) return U.UNSIGNED_INT_5_9_9_9_REV;
        if ($ === 1010) return U.BYTE;
        if ($ === 1011) return U.SHORT;
        if ($ === 1012) return U.UNSIGNED_SHORT;
        if ($ === 1013) return U.INT;
        if ($ === 1014) return U.UNSIGNED_INT;
        if ($ === 1015) return U.FLOAT;
        if ($ === 1016) return U.HALF_FLOAT;
        if ($ === 1021) return U.ALPHA;
        if ($ === 1022) return U.RGB;
        if ($ === 1023) return U.RGBA;
        if ($ === 1024) return U.LUMINANCE;
        if ($ === 1025) return U.LUMINANCE_ALPHA;
        if ($ === 1026) return U.DEPTH_COMPONENT;
        if ($ === 1027) return U.DEPTH_STENCIL;
        if ($ === 1028) return U.RED;
        if ($ === 1029) return U.RED_INTEGER;
        if ($ === 1030) return U.RG;
        if ($ === 1031) return U.RG_INTEGER;
        if ($ === 1033) return U.RGBA_INTEGER;
        if ($ === 33776 || $ === 33777 || $ === 33778 || $ === 33779)
            if (T === "srgb")
                if (P = d.get("WEBGL_compressed_texture_s3tc_srgb"), P !== null) {
                    if ($ === 33776) return P.COMPRESSED_SRGB_S3TC_DXT1_EXT;
                    if ($ === 33777) return P.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
                    if ($ === 33778) return P.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
                    if ($ === 33779) return P.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT
                } else return null;
        else if (P = d.get("WEBGL_compressed_texture_s3tc"), P !== null) {
            if ($ === 33776) return P.COMPRESSED_RGB_S3TC_DXT1_EXT;
            if ($ === 33777) return P.COMPRESSED_RGBA_S3TC_DXT1_EXT;
            if ($ === 33778) return P.COMPRESSED_RGBA_S3TC_DXT3_EXT;
            if ($ === 33779) return P.COMPRESSED_RGBA_S3TC_DXT5_EXT
        } else return null;
        if ($ === 35840 || $ === 35841 || $ === 35842 || $ === 35843)
            if (P = d.get("WEBGL_compressed_texture_pvrtc"), P !== null) {
                if ($ === 35840) return P.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
                if ($ === 35841) return P.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
                if ($ === 35842) return P.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
                if ($ === 35843) return P.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG
            } else return null;
        if ($ === 36196 || $ === 37492 || $ === 37496)
            if (P = d.get("WEBGL_compressed_texture_etc"), P !== null) {
                if ($ === 36196 || $ === 37492) return T === "srgb" ? P.COMPRESSED_SRGB8_ETC2 : P.COMPRESSED_RGB8_ETC2;
                if ($ === 37496) return T === "srgb" ? P.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : P.COMPRESSED_RGBA8_ETC2_EAC
            } else return null;
        if ($ === 37808 || $ === 37809 || $ === 37810 || $ === 37811 || $ === 37812 || $ === 37813 || $ === 37814 || $ === 37815 || $ === 37816 || $ === 37817 || $ === 37818 || $ === 37819 || $ === 37820 || $ === 37821)
            if (P = d.get("WEBGL_compressed_texture_astc"), P !== null) {
                if ($ === 37808) return T === "srgb" ? P.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : P.COMPRESSED_RGBA_ASTC_4x4_KHR;
                if ($ === 37809) return T === "srgb" ? P.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : P.COMPRESSED_RGBA_ASTC_5x4_KHR;
                if ($ === 37810) return T === "srgb" ? P.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : P.COMPRESSED_RGBA_ASTC_5x5_KHR;
                if ($ === 37811) return T === "srgb" ? P.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : P.COMPRESSED_RGBA_ASTC_6x5_KHR;
                if ($ === 37812) return T === "srgb" ? P.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : P.COMPRESSED_RGBA_ASTC_6x6_KHR;
                if ($ === 37813) return T === "srgb" ? P.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : P.COMPRESSED_RGBA_ASTC_8x5_KHR;
                if ($ === 37814) return T === "srgb" ? P.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : P.COMPRESSED_RGBA_ASTC_8x6_KHR;
                if ($ === 37815) return T === "srgb" ? P.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : P.COMPRESSED_RGBA_ASTC_8x8_KHR;
                if ($ === 37816) return T === "srgb" ? P.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : P.COMPRESSED_RGBA_ASTC_10x5_KHR;
                if ($ === 37817) return T === "srgb" ? P.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : P.COMPRESSED_RGBA_ASTC_10x6_KHR;
                if ($ === 37818) return T === "srgb" ? P.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : P.COMPRESSED_RGBA_ASTC_10x8_KHR;
                if ($ === 37819) return T === "srgb" ? P.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : P.COMPRESSED_RGBA_ASTC_10x10_KHR;
                if ($ === 37820) return T === "srgb" ? P.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : P.COMPRESSED_RGBA_ASTC_12x10_KHR;
                if ($ === 37821) return T === "srgb" ? P.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : P.COMPRESSED_RGBA_ASTC_12x12_KHR
            } else return null;
        if ($ === 36492 || $ === 36494 || $ === 36495)
            if (P = d.get("EXT_texture_compression_bptc"), P !== null) {
                if ($ === 36492) return T === "srgb" ? P.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : P.COMPRESSED_RGBA_BPTC_UNORM_EXT;
                if ($ === 36494) return P.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
                if ($ === 36495) return P.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT
            } else return null;
        if ($ === 36283 || $ === 36284 || $ === 36285 || $ === 36286)
            if (P = d.get("EXT_texture_compression_rgtc"), P !== null) {
                if ($ === 36492) return P.COMPRESSED_RED_RGTC1_EXT;
                if ($ === 36284) return P.COMPRESSED_SIGNED_RED_RGTC1_EXT;
                if ($ === 36285) return P.COMPRESSED_RED_GREEN_RGTC2_EXT;
                if ($ === 36286) return P.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT
            } else return null;
        if ($ === 1020) return U.UNSIGNED_INT_24_8;
        return U[$] !== void 0 ? U[$] : null
    }
    return {
        convert: D
    }
}
class K4 extends wd {
    constructor(U = []) {
        super();
        this.isArrayCamera = !0, this.cameras = U
    }
}
class Ld extends Xd {
    constructor() {
        super();
        this.isGroup = !0, this.type = "Group"
    }
}
var Oj = {
    type: "move"
};
class FH {
    constructor() {
        this._targetRay = null, this._grip = null, this._hand = null
    }
    getHandSpace() {
        if (this._hand === null) this._hand = new Ld, this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = {
            pinching: !1
        };
        return this._hand
    }
    getTargetRaySpace() {
        if (this._targetRay === null) this._targetRay = new Ld, this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new i, this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new i;
        return this._targetRay
    }
    getGripSpace() {
        if (this._grip === null) this._grip = new Ld, this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new i, this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new i;
        return this._grip
    }
    dispatchEvent(U) {
        if (this._targetRay !== null) this._targetRay.dispatchEvent(U);
        if (this._grip !== null) this._grip.dispatchEvent(U);
        if (this._hand !== null) this._hand.dispatchEvent(U);
        return this
    }
    connect(U) {
        if (U && U.hand) {
            let d = this._hand;
            if (d)
                for (let D of U.hand.values()) this._getHandJoint(d, D)
        }
        return this.dispatchEvent({
            type: "connected",
            data: U
        }), this
    }
    disconnect(U) {
        if (this.dispatchEvent({
                type: "disconnected",
                data: U
            }), this._targetRay !== null) this._targetRay.visible = !1;
        if (this._grip !== null) this._grip.visible = !1;
        if (this._hand !== null) this._hand.visible = !1;
        return this
    }
    update(U, d, D) {
        let $ = null,
            H = null,
            P = null,
            T = this._targetRay,
            R = this._grip,
            J = this._hand;
        if (U && d.session.visibilityState !== "visible-blurred") {
            if (J && U.hand) {
                P = !0;
                for (let E of U.hand.values()) {
                    let k = d.getJointPose(E, D),
                        A = this._getHandJoint(J, E);
                    if (k !== null) A.matrix.fromArray(k.transform.matrix), A.matrix.decompose(A.position, A.rotation, A.scale), A.matrixWorldNeedsUpdate = !0, A.jointRadius = k.radius;
                    A.visible = k !== null
                }
                let Q = J.joints["index-finger-tip"],
                    M = J.joints["thumb-tip"],
                    S = Q.position.distanceTo(M.position),
                    B = 0.02,
                    L = 0.005;
                if (J.inputState.pinching && S > B + L) J.inputState.pinching = !1, this.dispatchEvent({
                    type: "pinchend",
                    handedness: U.handedness,
                    target: this
                });
                else if (!J.inputState.pinching && S <= B - L) J.inputState.pinching = !0, this.dispatchEvent({
                    type: "pinchstart",
                    handedness: U.handedness,
                    target: this
                })
            } else if (R !== null && U.gripSpace) {
                if (H = d.getPose(U.gripSpace, D), H !== null) {
                    if (R.matrix.fromArray(H.transform.matrix), R.matrix.decompose(R.position, R.rotation, R.scale), R.matrixWorldNeedsUpdate = !0, H.linearVelocity) R.hasLinearVelocity = !0, R.linearVelocity.copy(H.linearVelocity);
                    else R.hasLinearVelocity = !1;
                    if (H.angularVelocity) R.hasAngularVelocity = !0, R.angularVelocity.copy(H.angularVelocity);
                    else R.hasAngularVelocity = !1
                }
            }
            if (T !== null) {
                if ($ = d.getPose(U.targetRaySpace, D), $ === null && H !== null) $ = H;
                if ($ !== null) {
                    if (T.matrix.fromArray($.transform.matrix), T.matrix.decompose(T.position, T.rotation, T.scale), T.matrixWorldNeedsUpdate = !0, $.linearVelocity) T.hasLinearVelocity = !0, T.linearVelocity.copy($.linearVelocity);
                    else T.hasLinearVelocity = !1;
                    if ($.angularVelocity) T.hasAngularVelocity = !0, T.angularVelocity.copy($.angularVelocity);
                    else T.hasAngularVelocity = !1;
                    this.dispatchEvent(Oj)
                }
            }
        }
        if (T !== null) T.visible = $ !== null;
        if (R !== null) R.visible = H !== null;
        if (J !== null) J.visible = P !== null;
        return this
    }
    _getHandJoint(U, d) {
        if (U.joints[d.jointName] === void 0) {
            let D = new Ld;
            D.matrixAutoUpdate = !1, D.visible = !1, U.joints[d.jointName] = D, U.add(D)
        }
        return U.joints[d.jointName]
    }
}
var Wj = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`,
    Gj = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;
class f4 {
    constructor() {
        this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0
    }
    init(U, d, D) {
        if (this.texture === null) {
            let $ = new _d,
                H = U.properties.get($);
            if (H.__webglTexture = d.texture, d.depthNear != D.depthNear || d.depthFar != D.depthFar) this.depthNear = d.depthNear, this.depthFar = d.depthFar;
            this.texture = $
        }
    }
    getMesh(U) {
        if (this.texture !== null) {
            if (this.mesh === null) {
                let d = U.cameras[0].viewport,
                    D = new _D({
                        vertexShader: Wj,
                        fragmentShader: Gj,
                        uniforms: {
                            depthColor: {
                                value: this.texture
                            },
                            depthWidth: {
                                value: d.z
                            },
                            depthHeight: {
                                value: d.w
                            }
                        }
                    });
                this.mesh = new _U(new p$(20, 20), D)
            }
        }
        return this.mesh
    }
    reset() {
        this.texture = null, this.mesh = null
    }
    getDepthTexture() {
        return this.texture
    }
}
class h4 extends nD {
    constructor(U, d) {
        super();
        let D = this,
            $ = null,
            H = 1,
            P = null,
            T = "local-floor",
            R = 1,
            J = null,
            Q = null,
            M = null,
            S = null,
            B = null,
            L = null,
            E = new f4,
            k = d.getContextAttributes(),
            A = null,
            j = null,
            C = [],
            I = [],
            Z = new dU,
            a = null,
            Y = new wd;
        Y.viewport = new ad;
        let f = new wd;
        f.viewport = new ad;
        let G = [Y, f],
            X = new K4,
            F = null,
            O = null;
        this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(o) {
            let $U = C[o];
            if ($U === void 0) $U = new FH, C[o] = $U;
            return $U.getTargetRaySpace()
        }, this.getControllerGrip = function(o) {
            let $U = C[o];
            if ($U === void 0) $U = new FH, C[o] = $U;
            return $U.getGripSpace()
        }, this.getHand = function(o) {
            let $U = C[o];
            if ($U === void 0) $U = new FH, C[o] = $U;
            return $U.getHandSpace()
        };

        function N(o) {
            let $U = I.indexOf(o.inputSource);
            if ($U === -1) return;
            let FU = C[$U];
            if (FU !== void 0) FU.update(o.inputSource, o.frame, J || P), FU.dispatchEvent({
                type: o.type,
                data: o.inputSource
            })
        }

        function z() {
            $.removeEventListener("select", N), $.removeEventListener("selectstart", N), $.removeEventListener("selectend", N), $.removeEventListener("squeeze", N), $.removeEventListener("squeezestart", N), $.removeEventListener("squeezeend", N), $.removeEventListener("end", z), $.removeEventListener("inputsourceschange", w);
            for (let o = 0; o < C.length; o++) {
                let $U = I[o];
                if ($U === null) continue;
                I[o] = null, C[o].disconnect($U)
            }
            F = null, O = null, E.reset(), U.setRenderTarget(A), B = null, S = null, M = null, $ = null, j = null, wU.stop(), D.isPresenting = !1, U.setPixelRatio(a), U.setSize(Z.width, Z.height, !1), D.dispatchEvent({
                type: "sessionend"
            })
        }
        this.setFramebufferScaleFactor = function(o) {
            if (H = o, D.isPresenting === !0) console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")
        }, this.setReferenceSpaceType = function(o) {
            if (T = o, D.isPresenting === !0) console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")
        }, this.getReferenceSpace = function() {
            return J || P
        }, this.setReferenceSpace = function(o) {
            J = o
        }, this.getBaseLayer = function() {
            return S !== null ? S : B
        }, this.getBinding = function() {
            return M
        }, this.getFrame = function() {
            return L
        }, this.getSession = function() {
            return $
        }, this.setSession = async function(o) {
            if ($ = o, $ !== null) {
                if (A = U.getRenderTarget(), $.addEventListener("select", N), $.addEventListener("selectstart", N), $.addEventListener("selectend", N), $.addEventListener("squeeze", N), $.addEventListener("squeezestart", N), $.addEventListener("squeezeend", N), $.addEventListener("end", z), $.addEventListener("inputsourceschange", w), k.xrCompatible !== !0) await d.makeXRCompatible();
                if (a = U.getPixelRatio(), U.getSize(Z), $.renderState.layers === void 0) {
                    let $U = {
                        antialias: k.antialias,
                        alpha: !0,
                        depth: k.depth,
                        stencil: k.stencil,
                        framebufferScaleFactor: H
                    };
                    B = new XRWebGLLayer($, d, $U), $.updateRenderState({
                        baseLayer: B
                    }), U.setPixelRatio(1), U.setSize(B.framebufferWidth, B.framebufferHeight, !1), j = new oD(B.framebufferWidth, B.framebufferHeight, {
                        format: 1023,
                        type: 1009,
                        colorSpace: U.outputColorSpace,
                        stencilBuffer: k.stencil
                    })
                } else {
                    let $U = null,
                        FU = null,
                        XU = null;
                    if (k.depth) XU = k.stencil ? d.DEPTH24_STENCIL8 : d.DEPTH_COMPONENT24, $U = k.stencil ? 1027 : 1026, FU = k.stencil ? 1020 : 1014;
                    let JU = {
                        colorFormat: d.RGBA8,
                        depthFormat: XU,
                        scaleFactor: H
                    };
                    M = new XRWebGLBinding($, d), S = M.createProjectionLayer(JU), $.updateRenderState({
                        layers: [S]
                    }), U.setPixelRatio(1), U.setSize(S.textureWidth, S.textureHeight, !1), j = new oD(S.textureWidth, S.textureHeight, {
                        format: 1023,
                        type: 1009,
                        depthTexture: new QT(S.textureWidth, S.textureHeight, FU, void 0, void 0, void 0, void 0, void 0, void 0, $U),
                        stencilBuffer: k.stencil,
                        colorSpace: U.outputColorSpace,
                        samples: k.antialias ? 4 : 0,
                        resolveDepthBuffer: S.ignoreDepthValues === !1
                    })
                }
                j.isXRRenderTarget = !0, this.setFoveation(R), J = null, P = await $.requestReferenceSpace(T), wU.setContext($), wU.start(), D.isPresenting = !0, D.dispatchEvent({
                    type: "sessionstart"
                })
            }
        }, this.getEnvironmentBlendMode = function() {
            if ($ !== null) return $.environmentBlendMode
        }, this.getDepthTexture = function() {
            return E.getDepthTexture()
        };

        function w(o) {
            for (let $U = 0; $U < o.removed.length; $U++) {
                let FU = o.removed[$U],
                    XU = I.indexOf(FU);
                if (XU >= 0) I[XU] = null, C[XU].disconnect(FU)
            }
            for (let $U = 0; $U < o.added.length; $U++) {
                let FU = o.added[$U],
                    XU = I.indexOf(FU);
                if (XU === -1) {
                    for (let mU = 0; mU < C.length; mU++)
                        if (mU >= I.length) {
                            I.push(FU), XU = mU;
                            break
                        } else if (I[mU] === null) {
                        I[mU] = FU, XU = mU;
                        break
                    }
                    if (XU === -1) break
                }
                let JU = C[XU];
                if (JU) JU.connect(FU)
            }
        }
        let l = new i,
            c = new i;

        function y(o, $U, FU) {
            l.setFromMatrixPosition($U.matrixWorld), c.setFromMatrixPosition(FU.matrixWorld);
            let XU = l.distanceTo(c),
                JU = $U.projectionMatrix.elements,
                mU = FU.projectionMatrix.elements,
                nU = JU[14] / (JU[10] - 1),
                uU = JU[14] / (JU[10] + 1),
                r = (JU[9] + 1) / JU[5],
                SU = (JU[9] - 1) / JU[5],
                b = (JU[8] - 1) / JU[0],
                YU = (mU[8] + 1) / mU[0],
                TU = nU * b,
                CU = nU * YU,
                DU = XU / (-b + YU),
                NU = DU * -b;
            if ($U.matrixWorld.decompose(o.position, o.quaternion, o.scale), o.translateX(NU), o.translateZ(DU), o.matrixWorld.compose(o.position, o.quaternion, o.scale), o.matrixWorldInverse.copy(o.matrixWorld).invert(), JU[10] === -1) o.projectionMatrix.copy($U.projectionMatrix), o.projectionMatrixInverse.copy($U.projectionMatrixInverse);
            else {
                let kU = nU + DU,
                    VU = uU + DU,
                    h = TU - NU,
                    V = CU + (XU - NU),
                    q = r * uU / VU * kU,
                    s = SU * uU / VU * kU;
                o.projectionMatrix.makePerspective(h, V, q, s, kU, VU), o.projectionMatrixInverse.copy(o.projectionMatrix).invert()
            }
        }

        function W(o, $U) {
            if ($U === null) o.matrixWorld.copy(o.matrix);
            else o.matrixWorld.multiplyMatrices($U.matrixWorld, o.matrix);
            o.matrixWorldInverse.copy(o.matrixWorld).invert()
        }
        this.updateCamera = function(o) {
            if ($ === null) return;
            let {
                near: $U,
                far: FU
            } = o;
            if (E.texture !== null) {
                if (E.depthNear > 0) $U = E.depthNear;
                if (E.depthFar > 0) FU = E.depthFar
            }
            if (X.near = f.near = Y.near = $U, X.far = f.far = Y.far = FU, F !== X.near || O !== X.far) $.updateRenderState({
                depthNear: X.near,
                depthFar: X.far
            }), F = X.near, O = X.far;
            Y.layers.mask = o.layers.mask | 2, f.layers.mask = o.layers.mask | 4, X.layers.mask = Y.layers.mask | f.layers.mask;
            let XU = o.parent,
                JU = X.cameras;
            W(X, XU);
            for (let mU = 0; mU < JU.length; mU++) W(JU[mU], XU);
            if (JU.length === 2) y(X, Y, f);
            else X.projectionMatrix.copy(Y.projectionMatrix);
            UU(o, X, XU)
        };

        function UU(o, $U, FU) {
            if (FU === null) o.matrix.copy($U.matrixWorld);
            else o.matrix.copy(FU.matrixWorld), o.matrix.invert(), o.matrix.multiply($U.matrixWorld);
            if (o.matrix.decompose(o.position, o.quaternion, o.scale), o.updateMatrixWorld(!0), o.projectionMatrix.copy($U.projectionMatrix), o.projectionMatrixInverse.copy($U.projectionMatrixInverse), o.isPerspectiveCamera) o.fov = k0 * 2 * Math.atan(1 / o.projectionMatrix.elements[5]), o.zoom = 1
        }
        this.getCamera = function() {
            return X
        }, this.getFoveation = function() {
            if (S === null && B === null) return;
            return R
        }, this.setFoveation = function(o) {
            if (R = o, S !== null) S.fixedFoveation = o;
            if (B !== null && B.fixedFoveation !== void 0) B.fixedFoveation = o
        }, this.hasDepthSensing = function() {
            return E.texture !== null
        }, this.getDepthSensingMesh = function() {
            return E.getMesh(X)
        };
        let PU = null;

        function iU(o, $U) {
            if (Q = $U.getViewerPose(J || P), L = $U, Q !== null) {
                let FU = Q.views;
                if (B !== null) U.setRenderTargetFramebuffer(j, B.framebuffer), U.setRenderTarget(j);
                let XU = !1;
                if (FU.length !== X.cameras.length) X.cameras.length = 0, XU = !0;
                for (let mU = 0; mU < FU.length; mU++) {
                    let nU = FU[mU],
                        uU = null;
                    if (B !== null) uU = B.getViewport(nU);
                    else {
                        let SU = M.getViewSubImage(S, nU);
                        if (uU = SU.viewport, mU === 0) U.setRenderTargetTextures(j, SU.colorTexture, S.ignoreDepthValues ? void 0 : SU.depthStencilTexture), U.setRenderTarget(j)
                    }
                    let r = G[mU];
                    if (r === void 0) r = new wd, r.layers.enable(mU), r.viewport = new ad, G[mU] = r;
                    if (r.matrix.fromArray(nU.transform.matrix), r.matrix.decompose(r.position, r.quaternion, r.scale), r.projectionMatrix.fromArray(nU.projectionMatrix), r.projectionMatrixInverse.copy(r.projectionMatrix).invert(), r.viewport.set(uU.x, uU.y, uU.width, uU.height), mU === 0) X.matrix.copy(r.matrix), X.matrix.decompose(X.position, X.quaternion, X.scale);
                    if (XU === !0) X.cameras.push(r)
                }
                let JU = $.enabledFeatures;
                if (JU && JU.includes("depth-sensing")) {
                    let mU = M.getDepthInformation(FU[0]);
                    if (mU && mU.isValid && mU.texture) E.init(U, mU, $.renderState)
                }
            }
            for (let FU = 0; FU < C.length; FU++) {
                let XU = I[FU],
                    JU = C[FU];
                if (XU !== null && JU !== void 0) JU.update(XU, $U, J || P)
            }
            if (PU) PU(o, $U);
            if ($U.detectedPlanes) D.dispatchEvent({
                type: "planesdetected",
                data: $U
            });
            L = null
        }
        let wU = new A4;
        wU.setAnimationLoop(iU), this.setAnimationLoop = function(o) {
            PU = o
        }, this.dispose = function() {}
    }
}
var T$ = new QD,
    mj = new Dd;

function _j(U, d) {
    function D(A, j) {
        if (A.matrixAutoUpdate === !0) A.updateMatrix();
        j.value.copy(A.matrix)
    }

    function $(A, j) {
        if (j.color.getRGB(A.fogColor.value, M4(U)), j.isFog) A.fogNear.value = j.near, A.fogFar.value = j.far;
        else if (j.isFogExp2) A.fogDensity.value = j.density
    }

    function H(A, j, C, I, Z) {
        if (j.isMeshBasicMaterial) P(A, j);
        else if (j.isMeshLambertMaterial) P(A, j);
        else if (j.isMeshToonMaterial) P(A, j), S(A, j);
        else if (j.isMeshPhongMaterial) P(A, j), M(A, j);
        else if (j.isMeshStandardMaterial) {
            if (P(A, j), B(A, j), j.isMeshPhysicalMaterial) L(A, j, Z)
        } else if (j.isMeshMatcapMaterial) P(A, j), E(A, j);
        else if (j.isMeshDepthMaterial) P(A, j);
        else if (j.isMeshDistanceMaterial) P(A, j), k(A, j);
        else if (j.isMeshNormalMaterial) P(A, j);
        else if (j.isLineBasicMaterial) {
            if (T(A, j), j.isLineDashedMaterial) R(A, j)
        } else if (j.isPointsMaterial) J(A, j, C, I);
        else if (j.isSpriteMaterial) Q(A, j);
        else if (j.isShadowMaterial) A.color.value.copy(j.color), A.opacity.value = j.opacity;
        else if (j.isShaderMaterial) j.uniformsNeedUpdate = !1
    }

    function P(A, j) {
        if (A.opacity.value = j.opacity, j.color) A.diffuse.value.copy(j.color);
        if (j.emissive) A.emissive.value.copy(j.emissive).multiplyScalar(j.emissiveIntensity);
        if (j.map) A.map.value = j.map, D(j.map, A.mapTransform);
        if (j.alphaMap) A.alphaMap.value = j.alphaMap, D(j.alphaMap, A.alphaMapTransform);
        if (j.bumpMap) {
            if (A.bumpMap.value = j.bumpMap, D(j.bumpMap, A.bumpMapTransform), A.bumpScale.value = j.bumpScale, j.side === 1) A.bumpScale.value *= -1
        }
        if (j.normalMap) {
            if (A.normalMap.value = j.normalMap, D(j.normalMap, A.normalMapTransform), A.normalScale.value.copy(j.normalScale), j.side === 1) A.normalScale.value.negate()
        }
        if (j.displacementMap) A.displacementMap.value = j.displacementMap, D(j.displacementMap, A.displacementMapTransform), A.displacementScale.value = j.displacementScale, A.displacementBias.value = j.displacementBias;
        if (j.emissiveMap) A.emissiveMap.value = j.emissiveMap, D(j.emissiveMap, A.emissiveMapTransform);
        if (j.specularMap) A.specularMap.value = j.specularMap, D(j.specularMap, A.specularMapTransform);
        if (j.alphaTest > 0) A.alphaTest.value = j.alphaTest;
        let C = d.get(j),
            I = C.envMap,
            Z = C.envMapRotation;
        if (I) {
            if (A.envMap.value = I, T$.copy(Z), T$.x *= -1, T$.y *= -1, T$.z *= -1, I.isCubeTexture && I.isRenderTargetTexture === !1) T$.y *= -1, T$.z *= -1;
            A.envMapRotation.value.setFromMatrix4(mj.makeRotationFromEuler(T$)), A.flipEnvMap.value = I.isCubeTexture && I.isRenderTargetTexture === !1 ? -1 : 1, A.reflectivity.value = j.reflectivity, A.ior.value = j.ior, A.refractionRatio.value = j.refractionRatio
        }
        if (j.lightMap) A.lightMap.value = j.lightMap, A.lightMapIntensity.value = j.lightMapIntensity, D(j.lightMap, A.lightMapTransform);
        if (j.aoMap) A.aoMap.value = j.aoMap, A.aoMapIntensity.value = j.aoMapIntensity, D(j.aoMap, A.aoMapTransform)
    }

    function T(A, j) {
        if (A.diffuse.value.copy(j.color), A.opacity.value = j.opacity, j.map) A.map.value = j.map, D(j.map, A.mapTransform)
    }

    function R(A, j) {
        A.dashSize.value = j.dashSize, A.totalSize.value = j.dashSize + j.gapSize, A.scale.value = j.scale
    }

    function J(A, j, C, I) {
        if (A.diffuse.value.copy(j.color), A.opacity.value = j.opacity, A.size.value = j.size * C, A.scale.value = I * 0.5, j.map) A.map.value = j.map, D(j.map, A.uvTransform);
        if (j.alphaMap) A.alphaMap.value = j.alphaMap, D(j.alphaMap, A.alphaMapTransform);
        if (j.alphaTest > 0) A.alphaTest.value = j.alphaTest
    }

    function Q(A, j) {
        if (A.diffuse.value.copy(j.color), A.opacity.value = j.opacity, A.rotation.value = j.rotation, j.map) A.map.value = j.map, D(j.map, A.mapTransform);
        if (j.alphaMap) A.alphaMap.value = j.alphaMap, D(j.alphaMap, A.alphaMapTransform);
        if (j.alphaTest > 0) A.alphaTest.value = j.alphaTest
    }

    function M(A, j) {
        A.specular.value.copy(j.specular), A.shininess.value = Math.max(j.shininess, 0.0001)
    }

    function S(A, j) {
        if (j.gradientMap) A.gradientMap.value = j.gradientMap
    }

    function B(A, j) {
        if (A.metalness.value = j.metalness, j.metalnessMap) A.metalnessMap.value = j.metalnessMap, D(j.metalnessMap, A.metalnessMapTransform);
        if (A.roughness.value = j.roughness, j.roughnessMap) A.roughnessMap.value = j.roughnessMap, D(j.roughnessMap, A.roughnessMapTransform);
        if (j.envMap) A.envMapIntensity.value = j.envMapIntensity
    }

    function L(A, j, C) {
        if (A.ior.value = j.ior, j.sheen > 0) {
            if (A.sheenColor.value.copy(j.sheenColor).multiplyScalar(j.sheen), A.sheenRoughness.value = j.sheenRoughness, j.sheenColorMap) A.sheenColorMap.value = j.sheenColorMap, D(j.sheenColorMap, A.sheenColorMapTransform);
            if (j.sheenRoughnessMap) A.sheenRoughnessMap.value = j.sheenRoughnessMap, D(j.sheenRoughnessMap, A.sheenRoughnessMapTransform)
        }
        if (j.clearcoat > 0) {
            if (A.clearcoat.value = j.clearcoat, A.clearcoatRoughness.value = j.clearcoatRoughness, j.clearcoatMap) A.clearcoatMap.value = j.clearcoatMap, D(j.clearcoatMap, A.clearcoatMapTransform);
            if (j.clearcoatRoughnessMap) A.clearcoatRoughnessMap.value = j.clearcoatRoughnessMap, D(j.clearcoatRoughnessMap, A.clearcoatRoughnessMapTransform);
            if (j.clearcoatNormalMap) {
                if (A.clearcoatNormalMap.value = j.clearcoatNormalMap, D(j.clearcoatNormalMap, A.clearcoatNormalMapTransform), A.clearcoatNormalScale.value.copy(j.clearcoatNormalScale), j.side === 1) A.clearcoatNormalScale.value.negate()
            }
        }
        if (j.dispersion > 0) A.dispersion.value = j.dispersion;
        if (j.iridescence > 0) {
            if (A.iridescence.value = j.iridescence, A.iridescenceIOR.value = j.iridescenceIOR, A.iridescenceThicknessMinimum.value = j.iridescenceThicknessRange[0], A.iridescenceThicknessMaximum.value = j.iridescenceThicknessRange[1], j.iridescenceMap) A.iridescenceMap.value = j.iridescenceMap, D(j.iridescenceMap, A.iridescenceMapTransform);
            if (j.iridescenceThicknessMap) A.iridescenceThicknessMap.value = j.iridescenceThicknessMap, D(j.iridescenceThicknessMap, A.iridescenceThicknessMapTransform)
        }
        if (j.transmission > 0) {
            if (A.transmission.value = j.transmission, A.transmissionSamplerMap.value = C.texture, A.transmissionSamplerSize.value.set(C.width, C.height), j.transmissionMap) A.transmissionMap.value = j.transmissionMap, D(j.transmissionMap, A.transmissionMapTransform);
            if (A.thickness.value = j.thickness, j.thicknessMap) A.thicknessMap.value = j.thicknessMap, D(j.thicknessMap, A.thicknessMapTransform);
            A.attenuationDistance.value = j.attenuationDistance, A.attenuationColor.value.copy(j.attenuationColor)
        }
        if (j.anisotropy > 0) {
            if (A.anisotropyVector.value.set(j.anisotropy * Math.cos(j.anisotropyRotation), j.anisotropy * Math.sin(j.anisotropyRotation)), j.anisotropyMap) A.anisotropyMap.value = j.anisotropyMap, D(j.anisotropyMap, A.anisotropyMapTransform)
        }
        if (A.specularIntensity.value = j.specularIntensity, A.specularColor.value.copy(j.specularColor), j.specularColorMap) A.specularColorMap.value = j.specularColorMap, D(j.specularColorMap, A.specularColorMapTransform);
        if (j.specularIntensityMap) A.specularIntensityMap.value = j.specularIntensityMap, D(j.specularIntensityMap, A.specularIntensityMapTransform)
    }

    function E(A, j) {
        if (j.matcap) A.matcap.value = j.matcap
    }

    function k(A, j) {
        let C = d.get(j).light;
        A.referencePosition.value.setFromMatrixPosition(C.matrixWorld), A.nearDistance.value = C.shadow.camera.near, A.farDistance.value = C.shadow.camera.far
    }
    return {
        refreshFogUniforms: $,
        refreshMaterialUniforms: H
    }
}

function uj(U, d, D, $) {
    let H = {},
        P = {},
        T = [],
        R = U.getParameter(U.MAX_UNIFORM_BUFFER_BINDINGS);

    function J(C, I) {
        let Z = I.program;
        $.uniformBlockBinding(C, Z)
    }

    function Q(C, I) {
        let Z = H[C.id];
        if (Z === void 0) E(C), Z = M(C), H[C.id] = Z, C.addEventListener("dispose", A);
        let a = I.program;
        $.updateUBOMapping(C, a);
        let Y = d.render.frame;
        if (P[C.id] !== Y) B(C), P[C.id] = Y
    }

    function M(C) {
        let I = S();
        C.__bindingPointIndex = I;
        let Z = U.createBuffer(),
            a = C.__size,
            Y = C.usage;
        return U.bindBuffer(U.UNIFORM_BUFFER, Z), U.bufferData(U.UNIFORM_BUFFER, a, Y), U.bindBuffer(U.UNIFORM_BUFFER, null), U.bindBufferBase(U.UNIFORM_BUFFER, I, Z), Z
    }

    function S() {
        for (let C = 0; C < R; C++)
            if (T.indexOf(C) === -1) return T.push(C), C;
        return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0
    }

    function B(C) {
        let I = H[C.id],
            Z = C.uniforms,
            a = C.__cache;
        U.bindBuffer(U.UNIFORM_BUFFER, I);
        for (let Y = 0, f = Z.length; Y < f; Y++) {
            let G = Array.isArray(Z[Y]) ? Z[Y] : [Z[Y]];
            for (let X = 0, F = G.length; X < F; X++) {
                let O = G[X];
                if (L(O, Y, X, a) === !0) {
                    let N = O.__offset,
                        z = Array.isArray(O.value) ? O.value : [O.value],
                        w = 0;
                    for (let l = 0; l < z.length; l++) {
                        let c = z[l],
                            y = k(c);
                        if (typeof c === "number" || typeof c === "boolean") O.__data[0] = c, U.bufferSubData(U.UNIFORM_BUFFER, N + w, O.__data);
                        else if (c.isMatrix3) O.__data[0] = c.elements[0], O.__data[1] = c.elements[1], O.__data[2] = c.elements[2], O.__data[3] = 0, O.__data[4] = c.elements[3], O.__data[5] = c.elements[4], O.__data[6] = c.elements[5], O.__data[7] = 0, O.__data[8] = c.elements[6], O.__data[9] = c.elements[7], O.__data[10] = c.elements[8], O.__data[11] = 0;
                        else c.toArray(O.__data, w), w += y.storage / Float32Array.BYTES_PER_ELEMENT
                    }
                    U.bufferSubData(U.UNIFORM_BUFFER, N, O.__data)
                }
            }
        }
        U.bindBuffer(U.UNIFORM_BUFFER, null)
    }

    function L(C, I, Z, a) {
        let Y = C.value,
            f = I + "_" + Z;
        if (a[f] === void 0) {
            if (typeof Y === "number" || typeof Y === "boolean") a[f] = Y;
            else a[f] = Y.clone();
            return !0
        } else {
            let G = a[f];
            if (typeof Y === "number" || typeof Y === "boolean") {
                if (G !== Y) return a[f] = Y, !0
            } else if (G.equals(Y) === !1) return G.copy(Y), !0
        }
        return !1
    }

    function E(C) {
        let I = C.uniforms,
            Z = 0,
            a = 16;
        for (let f = 0, G = I.length; f < G; f++) {
            let X = Array.isArray(I[f]) ? I[f] : [I[f]];
            for (let F = 0, O = X.length; F < O; F++) {
                let N = X[F],
                    z = Array.isArray(N.value) ? N.value : [N.value];
                for (let w = 0, l = z.length; w < l; w++) {
                    let c = z[w],
                        y = k(c),
                        W = Z % a,
                        UU = W % y.boundary,
                        PU = W + UU;
                    if (Z += UU, PU !== 0 && a - PU < y.storage) Z += a - PU;
                    N.__data = new Float32Array(y.storage / Float32Array.BYTES_PER_ELEMENT), N.__offset = Z, Z += y.storage
                }
            }
        }
        let Y = Z % a;
        if (Y > 0) Z += a - Y;
        return C.__size = Z, C.__cache = {}, this
    }

    function k(C) {
        let I = {
            boundary: 0,
            storage: 0
        };
        if (typeof C === "number" || typeof C === "boolean") I.boundary = 4, I.storage = 4;
        else if (C.isVector2) I.boundary = 8, I.storage = 8;
        else if (C.isVector3 || C.isColor) I.boundary = 16, I.storage = 12;
        else if (C.isVector4) I.boundary = 16, I.storage = 16;
        else if (C.isMatrix3) I.boundary = 48, I.storage = 48;
        else if (C.isMatrix4) I.boundary = 64, I.storage = 64;
        else if (C.isTexture) console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.");
        else console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", C);
        return I
    }

    function A(C) {
        let I = C.target;
        I.removeEventListener("dispose", A);
        let Z = T.indexOf(I.__bindingPointIndex);
        T.splice(Z, 1), U.deleteBuffer(H[I.id]), delete H[I.id], delete P[I.id]
    }

    function j() {
        for (let C in H) U.deleteBuffer(H[C]);
        T = [], H = {}, P = {}
    }
    return {
        bind: J,
        update: Q,
        dispose: j
    }
}
class ST {
    constructor(U = {}) {
        let {
            canvas: d = pJ(),
            context: D = null,
            depth: $ = !0,
            stencil: H = !1,
            alpha: P = !1,
            antialias: T = !1,
            premultipliedAlpha: R = !0,
            preserveDrawingBuffer: J = !1,
            powerPreference: Q = "default",
            failIfMajorPerformanceCaveat: M = !1,
            reverseDepthBuffer: S = !1
        } = U;
        this.isWebGLRenderer = !0;
        let B;
        if (D !== null) {
            if (typeof WebGLRenderingContext < "u" && D instanceof WebGLRenderingContext) throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
            B = D.getContextAttributes().alpha
        } else B = P;
        let L = new Uint32Array(4),
            E = new Int32Array(4),
            k = null,
            A = null,
            j = [],
            C = [];
        this.domElement = d, this.debug = {
            checkShaderErrors: !0,
            onShaderError: null
        }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this._outputColorSpace = "srgb", this.toneMapping = 0, this.toneMappingExposure = 1;
        let I = this,
            Z = !1,
            a = 0,
            Y = 0,
            f = null,
            G = -1,
            X = null,
            F = new ad,
            O = new ad,
            N = null,
            z = new KU(0),
            w = 0,
            l = d.width,
            c = d.height,
            y = 1,
            W = null,
            UU = null,
            PU = new ad(0, 0, l, c),
            iU = new ad(0, 0, l, c),
            wU = !1,
            o = new hH,
            $U = !1,
            FU = !1,
            XU = new Dd,
            JU = new Dd,
            mU = new i,
            nU = new ad,
            uU = {
                background: null,
                fog: null,
                environment: null,
                overrideMaterial: null,
                isScene: !0
            },
            r = !1;

        function SU() {
            return f === null ? y : 1
        }
        let b = D;

        function YU(K, u) {
            return d.getContext(K, u)
        }
        try {
            let K = {
                alpha: !0,
                depth: $,
                stencil: H,
                antialias: T,
                premultipliedAlpha: R,
                preserveDrawingBuffer: J,
                powerPreference: Q,
                failIfMajorPerformanceCaveat: M
            };
            if ("setAttribute" in d) d.setAttribute("data-engine", "three.js r170");
            if (d.addEventListener("webglcontextlost", n, !1), d.addEventListener("webglcontextrestored", x, !1), d.addEventListener("webglcontextcreationerror", EU, !1), b === null) {
                if (b = YU("webgl2", K), b === null)
                    if (YU("webgl2")) throw Error("Error creating WebGL context with your selected attributes.");
                    else throw Error("Error creating WebGL context.")
            }
        } catch (K) {
            throw console.error("THREE.WebGLRenderer: " + K.message), K
        }
        let TU, CU, DU, NU, kU, VU, h, V, q, s, t, v, WU, BU, IU, pU, RU, ZU, xU, zU, aU, cU, sU, Ed;

        function m() {
            if (TU = new rL(b), TU.init(), cU = new ij(b, TU), CU = new lL(b, TU, U, cU), DU = new fj(b, TU), CU.reverseDepthBuffer && S) DU.buffers.depth.setReversed(!0);
            NU = new dA(b), kU = new Aj, VU = new bj(b, TU, DU, kU, CU, cU, NU), h = new oL(I), V = new xL(I), q = new QM(b), sU = new eL(b, q), s = new tL(b, q, NU, sU), t = new $A(b, s, q, NU), xU = new DA(b, CU, VU), pU = new yL(kU), v = new Lj(I, h, V, TU, CU, sU, pU), WU = new _j(I, kU), BU = new Ej, IU = new Xj(TU), ZU = new cL(I, h, V, DU, t, B, R), RU = new Cj(I, t, CU), Ed = new uj(b, NU, CU, DU), zU = new vL(b, TU, NU), aU = new UA(b, TU, NU), NU.programs = v.programs, I.capabilities = CU, I.extensions = TU, I.properties = kU, I.renderLists = BU, I.shadowMap = RU, I.state = DU, I.info = NU
        }
        m();
        let HU = new h4(I, b);
        this.xr = HU, this.getContext = function() {
            return b
        }, this.getContextAttributes = function() {
            return b.getContextAttributes()
        }, this.forceContextLoss = function() {
            let K = TU.get("WEBGL_lose_context");
            if (K) K.loseContext()
        }, this.forceContextRestore = function() {
            let K = TU.get("WEBGL_lose_context");
            if (K) K.restoreContext()
        }, this.getPixelRatio = function() {
            return y
        }, this.setPixelRatio = function(K) {
            if (K === void 0) return;
            y = K, this.setSize(l, c, !1)
        }, this.getSize = function(K) {
            return K.set(l, c)
        }, this.setSize = function(K, u, p = !0) {
            if (HU.isPresenting) {
                console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
                return
            }
            if (l = K, c = u, d.width = Math.floor(K * y), d.height = Math.floor(u * y), p === !0) d.style.width = K + "px", d.style.height = u + "px";
            this.setViewport(0, 0, K, u)
        }, this.getDrawingBufferSize = function(K) {
            return K.set(l * y, c * y).floor()
        }, this.setDrawingBufferSize = function(K, u, p) {
            l = K, c = u, y = p, d.width = Math.floor(K * p), d.height = Math.floor(u * p), this.setViewport(0, 0, K, u)
        }, this.getCurrentViewport = function(K) {
            return K.copy(F)
        }, this.getViewport = function(K) {
            return K.copy(PU)
        }, this.setViewport = function(K, u, p, g) {
            if (K.isVector4) PU.set(K.x, K.y, K.z, K.w);
            else PU.set(K, u, p, g);
            DU.viewport(F.copy(PU).multiplyScalar(y).round())
        }, this.getScissor = function(K) {
            return K.copy(iU)
        }, this.setScissor = function(K, u, p, g) {
            if (K.isVector4) iU.set(K.x, K.y, K.z, K.w);
            else iU.set(K, u, p, g);
            DU.scissor(O.copy(iU).multiplyScalar(y).round())
        }, this.getScissorTest = function() {
            return wU
        }, this.setScissorTest = function(K) {
            DU.setScissorTest(wU = K)
        }, this.setOpaqueSort = function(K) {
            W = K
        }, this.setTransparentSort = function(K) {
            UU = K
        }, this.getClearColor = function(K) {
            return K.copy(ZU.getClearColor())
        }, this.setClearColor = function() {
            ZU.setClearColor.apply(ZU, arguments)
        }, this.getClearAlpha = function() {
            return ZU.getClearAlpha()
        }, this.setClearAlpha = function() {
            ZU.setClearAlpha.apply(ZU, arguments)
        }, this.clear = function(K = !0, u = !0, p = !0) {
            let g = 0;
            if (K) {
                let _ = !1;
                if (f !== null) {
                    let QU = f.texture.format;
                    _ = QU === 1033 || QU === 1031 || QU === 1029
                }
                if (_) {
                    let QU = f.texture.type,
                        jU = QU === 1009 || QU === 1014 || QU === 1012 || QU === 1020 || QU === 1017 || QU === 1018,
                        fU = ZU.getClearColor(),
                        hU = ZU.getClearAlpha(),
                        gU = fU.r,
                        eU = fU.g,
                        bU = fU.b;
                    if (jU) L[0] = gU, L[1] = eU, L[2] = bU, L[3] = hU, b.clearBufferuiv(b.COLOR, 0, L);
                    else E[0] = gU, E[1] = eU, E[2] = bU, E[3] = hU, b.clearBufferiv(b.COLOR, 0, E)
                } else g |= b.COLOR_BUFFER_BIT
            }
            if (u) g |= b.DEPTH_BUFFER_BIT;
            if (p) g |= b.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295);
            b.clear(g)
        }, this.clearColor = function() {
            this.clear(!0, !1, !1)
        }, this.clearDepth = function() {
            this.clear(!1, !0, !1)
        }, this.clearStencil = function() {
            this.clear(!1, !1, !0)
        }, this.dispose = function() {
            d.removeEventListener("webglcontextlost", n, !1), d.removeEventListener("webglcontextrestored", x, !1), d.removeEventListener("webglcontextcreationerror", EU, !1), BU.dispose(), IU.dispose(), kU.dispose(), h.dispose(), V.dispose(), t.dispose(), sU.dispose(), Ed.dispose(), v.dispose(), HU.dispose(), HU.removeEventListener("sessionstart", BD), HU.removeEventListener("sessionend", zT), tD.stop()
        };

        function n(K) {
            K.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), Z = !0
        }

        function x() {
            console.log("THREE.WebGLRenderer: Context Restored."), Z = !1;
            let K = NU.autoReset,
                u = RU.enabled,
                p = RU.autoUpdate,
                g = RU.needsUpdate,
                _ = RU.type;
            m(), NU.autoReset = K, RU.enabled = u, RU.autoUpdate = p, RU.needsUpdate = g, RU.type = _
        }

        function EU(K) {
            console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", K.statusMessage)
        }

        function AU(K) {
            let u = K.target;
            u.removeEventListener("dispose", AU), lU(u)
        }

        function lU(K) {
            Zd(K), kU.remove(K)
        }

        function Zd(K) {
            let u = kU.get(K).programs;
            if (u !== void 0) {
                if (u.forEach(function(p) {
                        v.releaseProgram(p)
                    }), K.isShaderMaterial) v.releaseShaderCache(K)
            }
        }
        this.renderBufferDirect = function(K, u, p, g, _, QU) {
            if (u === null) u = uU;
            let jU = _.isMesh && _.matrixWorld.determinant() < 0,
                fU = CS(K, u, p, g, _);
            DU.setMaterial(g, jU);
            let hU = p.index,
                gU = 1;
            if (g.wireframe === !0) {
                if (hU = s.getWireframeAttribute(p), hU === void 0) return;
                gU = 2
            }
            let eU = p.drawRange,
                bU = p.attributes.position,
                $d = eU.start * gU,
                Bd = (eU.start + eU.count) * gU;
            if (QU !== null) $d = Math.max($d, QU.start * gU), Bd = Math.min(Bd, (QU.start + QU.count) * gU);
            if (hU !== null) $d = Math.max($d, 0), Bd = Math.min(Bd, hU.count);
            else if (bU !== void 0 && bU !== null) $d = Math.max($d, 0), Bd = Math.min(Bd, bU.count);
            let Ad = Bd - $d;
            if (Ad < 0 || Ad === 1 / 0) return;
            sU.setup(_, g, fU, p, hU);
            let gd, Pd = zU;
            if (hU !== null) gd = q.get(hU), Pd = aU, Pd.setIndex(gd);
            if (_.isMesh)
                if (g.wireframe === !0) DU.setLineWidth(g.wireframeLinewidth * SU()), Pd.setMode(b.LINES);
                else Pd.setMode(b.TRIANGLES);
            else if (_.isLine) {
                let OU = g.linewidth;
                if (OU === void 0) OU = 1;
                if (DU.setLineWidth(OU * SU()), _.isLineSegments) Pd.setMode(b.LINES);
                else if (_.isLineLoop) Pd.setMode(b.LINE_LOOP);
                else Pd.setMode(b.LINE_STRIP)
            } else if (_.isPoints) Pd.setMode(b.POINTS);
            else if (_.isSprite) Pd.setMode(b.TRIANGLES);
            if (_.isBatchedMesh)
                if (_._multiDrawInstances !== null) Pd.renderMultiDrawInstances(_._multiDrawStarts, _._multiDrawCounts, _._multiDrawCount, _._multiDrawInstances);
                else if (!TU.get("WEBGL_multi_draw")) {
                let {
                    _multiDrawStarts: OU,
                    _multiDrawCounts: KD,
                    _multiDrawCount: Td
                } = _, $D = hU ? q.get(hU).bytesPerElement : 1, A$ = kU.get(g).currentProgram.getUniforms();
                for (let vd = 0; vd < Td; vd++) A$.setValue(b, "_gl_DrawID", vd), Pd.render(OU[vd] / $D, KD[vd])
            } else Pd.renderMultiDraw(_._multiDrawStarts, _._multiDrawCounts, _._multiDrawCount);
            else if (_.isInstancedMesh) Pd.renderInstances($d, Ad, _.count);
            else if (p.isInstancedBufferGeometry) {
                let OU = p._maxInstanceCount !== void 0 ? p._maxInstanceCount : 1 / 0,
                    KD = Math.min(p.instanceCount, OU);
                Pd.renderInstances($d, Ad, KD)
            } else Pd.render($d, Ad)
        };

        function Od(K, u, p) {
            if (K.transparent === !0 && K.side === 2 && K.forceSinglePass === !1) K.side = 1, K.needsUpdate = !0, w0(K, u, p), K.side = 0, K.needsUpdate = !0, w0(K, u, p), K.side = 2;
            else w0(K, u, p)
        }
        this.compile = function(K, u, p = null) {
            if (p === null) p = K;
            if (A = IU.get(p), A.init(u), C.push(A), p.traverseVisible(function(_) {
                    if (_.isLight && _.layers.test(u.layers)) {
                        if (A.pushLight(_), _.castShadow) A.pushShadow(_)
                    }
                }), K !== p) K.traverseVisible(function(_) {
                if (_.isLight && _.layers.test(u.layers)) {
                    if (A.pushLight(_), _.castShadow) A.pushShadow(_)
                }
            });
            A.setupLights();
            let g = new Set;
            return K.traverse(function(_) {
                if (!(_.isMesh || _.isPoints || _.isLine || _.isSprite)) return;
                let QU = _.material;
                if (QU)
                    if (Array.isArray(QU))
                        for (let jU = 0; jU < QU.length; jU++) {
                            let fU = QU[jU];
                            Od(fU, p, _), g.add(fU)
                        } else Od(QU, p, _), g.add(QU)
            }), C.pop(), A = null, g
        }, this.compileAsync = function(K, u, p = null) {
            let g = this.compile(K, u, p);
            return new Promise((_) => {
                function QU() {
                    if (g.forEach(function(jU) {
                            if (kU.get(jU).currentProgram.isReady()) g.delete(jU)
                        }), g.size === 0) {
                        _(K);
                        return
                    }
                    setTimeout(QU, 10)
                }
                if (TU.get("KHR_parallel_shader_compile") !== null) QU();
                else setTimeout(QU, 10)
            })
        };
        let Hd = null;

        function CD(K) {
            if (Hd) Hd(K)
        }

        function BD() {
            tD.stop()
        }

        function zT() {
            tD.start()
        }
        let tD = new A4;
        if (tD.setAnimationLoop(CD), typeof self < "u") tD.setContext(self);
        this.setAnimationLoop = function(K) {
            Hd = K, HU.setAnimationLoop(K), K === null ? tD.stop() : tD.start()
        }, HU.addEventListener("sessionstart", BD), HU.addEventListener("sessionend", zT), this.render = function(K, u) {
            if (u !== void 0 && u.isCamera !== !0) {
                console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
                return
            }
            if (Z === !0) return;
            if (K.matrixWorldAutoUpdate === !0) K.updateMatrixWorld();
            if (u.parent === null && u.matrixWorldAutoUpdate === !0) u.updateMatrixWorld();
            if (HU.enabled === !0 && HU.isPresenting === !0) {
                if (HU.cameraAutoUpdate === !0) HU.updateCamera(u);
                u = HU.getCamera()
            }
            if (K.isScene === !0) K.onBeforeRender(I, K, u, f);
            if (A = IU.get(K, C.length), A.init(u), C.push(A), JU.multiplyMatrices(u.projectionMatrix, u.matrixWorldInverse), o.setFromProjectionMatrix(JU), FU = this.localClippingEnabled, $U = pU.init(this.clippingPlanes, FU), k = BU.get(K, j.length), k.init(), j.push(k), HU.enabled === !0 && HU.isPresenting === !0) {
                let QU = I.xr.getDepthSensingMesh();
                if (QU !== null) tH(QU, u, -1 / 0, I.sortObjects)
            }
            if (tH(K, u, 0, I.sortObjects), k.finish(), I.sortObjects === !0) k.sort(W, UU);
            if (r = HU.enabled === !1 || HU.isPresenting === !1 || HU.hasDepthSensing() === !1, r) ZU.addToRenderList(k, K);
            if (this.info.render.frame++, $U === !0) pU.beginShadows();
            let p = A.state.shadowsArray;
            if (RU.render(p, K, u), $U === !0) pU.endShadows();
            if (this.info.autoReset === !0) this.info.reset();
            let {
                opaque: g,
                transmissive: _
            } = k;
            if (A.setupLights(), u.isArrayCamera) {
                let QU = u.cameras;
                if (_.length > 0)
                    for (let jU = 0, fU = QU.length; jU < fU; jU++) {
                        let hU = QU[jU];
                        pT(g, _, K, hU)
                    }
                if (r) ZU.render(K);
                for (let jU = 0, fU = QU.length; jU < fU; jU++) {
                    let hU = QU[jU];
                    qT(k, K, hU, hU.viewport)
                }
            } else {
                if (_.length > 0) pT(g, _, K, u);
                if (r) ZU.render(K);
                qT(k, K, u)
            }
            if (f !== null) VU.updateMultisampleRenderTarget(f), VU.updateRenderTargetMipmap(f);
            if (K.isScene === !0) K.onAfterRender(I, K, u);
            if (sU.resetDefaultState(), G = -1, X = null, C.pop(), C.length > 0) {
                if (A = C[C.length - 1], $U === !0) pU.setGlobalState(I.clippingPlanes, A.state.camera)
            } else A = null;
            if (j.pop(), j.length > 0) k = j[j.length - 1];
            else k = null
        };

        function tH(K, u, p, g) {
            if (K.visible === !1) return;
            if (K.layers.test(u.layers)) {
                if (K.isGroup) p = K.renderOrder;
                else if (K.isLOD) {
                    if (K.autoUpdate === !0) K.update(u)
                } else if (K.isLight) {
                    if (A.pushLight(K), K.castShadow) A.pushShadow(K)
                } else if (K.isSprite) {
                    if (!K.frustumCulled || o.intersectsSprite(K)) {
                        if (g) nU.setFromMatrixPosition(K.matrixWorld).applyMatrix4(JU);
                        let jU = t.update(K),
                            fU = K.material;
                        if (fU.visible) k.push(K, jU, fU, p, nU.z, null)
                    }
                } else if (K.isMesh || K.isLine || K.isPoints) {
                    if (!K.frustumCulled || o.intersectsObject(K)) {
                        let jU = t.update(K),
                            fU = K.material;
                        if (g) {
                            if (K.boundingSphere !== void 0) {
                                if (K.boundingSphere === null) K.computeBoundingSphere();
                                nU.copy(K.boundingSphere.center)
                            } else {
                                if (jU.boundingSphere === null) jU.computeBoundingSphere();
                                nU.copy(jU.boundingSphere.center)
                            }
                            nU.applyMatrix4(K.matrixWorld).applyMatrix4(JU)
                        }
                        if (Array.isArray(fU)) {
                            let hU = jU.groups;
                            for (let gU = 0, eU = hU.length; gU < eU; gU++) {
                                let bU = hU[gU],
                                    $d = fU[bU.materialIndex];
                                if ($d && $d.visible) k.push(K, jU, $d, p, nU.z, bU)
                            }
                        } else if (fU.visible) k.push(K, jU, fU, p, nU.z, null)
                    }
                }
            }
            let QU = K.children;
            for (let jU = 0, fU = QU.length; jU < fU; jU++) tH(QU[jU], u, p, g)
        }

        function qT(K, u, p, g) {
            let {
                opaque: _,
                transmissive: QU,
                transparent: jU
            } = K;
            if (A.setupLightsView(p), $U === !0) pU.setGlobalState(I.clippingPlanes, p);
            if (g) DU.viewport(F.copy(g));
            if (_.length > 0) g0(_, u, p);
            if (QU.length > 0) g0(QU, u, p);
            if (jU.length > 0) g0(jU, u, p);
            DU.buffers.depth.setTest(!0), DU.buffers.depth.setMask(!0), DU.buffers.color.setMask(!0), DU.setPolygonOffset(!1)
        }

        function pT(K, u, p, g) {
            if ((p.isScene === !0 ? p.overrideMaterial : null) !== null) return;
            if (A.state.transmissionRenderTarget[g.id] === void 0) A.state.transmissionRenderTarget[g.id] = new oD(1, 1, {
                generateMipmaps: !0,
                type: TU.has("EXT_color_buffer_half_float") || TU.has("EXT_color_buffer_float") ? 1016 : 1009,
                minFilter: 1008,
                samples: 4,
                stencilBuffer: H,
                resolveDepthBuffer: !1,
                resolveStencilBuffer: !1,
                colorSpace: dd.workingColorSpace
            });
            let QU = A.state.transmissionRenderTarget[g.id],
                jU = g.viewport || F;
            QU.setSize(jU.z, jU.w);
            let fU = I.getRenderTarget();
            if (I.setRenderTarget(QU), I.getClearColor(z), w = I.getClearAlpha(), w < 1) I.setClearColor(16777215, 0.5);
            if (I.clear(), r) ZU.render(p);
            let hU = I.toneMapping;
            I.toneMapping = 0;
            let gU = g.viewport;
            if (g.viewport !== void 0) g.viewport = void 0;
            if (A.setupLightsView(g), $U === !0) pU.setGlobalState(I.clippingPlanes, g);
            if (g0(K, p, g), VU.updateMultisampleRenderTarget(QU), VU.updateRenderTargetMipmap(QU), TU.has("WEBGL_multisampled_render_to_texture") === !1) {
                let eU = !1;
                for (let bU = 0, $d = u.length; bU < $d; bU++) {
                    let Bd = u[bU],
                        Ad = Bd.object,
                        gd = Bd.geometry,
                        Pd = Bd.material,
                        OU = Bd.group;
                    if (Pd.side === 2 && Ad.layers.test(g.layers)) {
                        let KD = Pd.side;
                        Pd.side = 1, Pd.needsUpdate = !0, gT(Ad, p, g, gd, Pd, OU), Pd.side = KD, Pd.needsUpdate = !0, eU = !0
                    }
                }
                if (eU === !0) VU.updateMultisampleRenderTarget(QU), VU.updateRenderTargetMipmap(QU)
            }
            if (I.setRenderTarget(fU), I.setClearColor(z, w), gU !== void 0) g.viewport = gU;
            I.toneMapping = hU
        }

        function g0(K, u, p) {
            let g = u.isScene === !0 ? u.overrideMaterial : null;
            for (let _ = 0, QU = K.length; _ < QU; _++) {
                let jU = K[_],
                    fU = jU.object,
                    hU = jU.geometry,
                    gU = g === null ? jU.material : g,
                    eU = jU.group;
                if (fU.layers.test(p.layers)) gT(fU, u, p, hU, gU, eU)
            }
        }

        function gT(K, u, p, g, _, QU) {
            if (K.onBeforeRender(I, u, p, g, _, QU), K.modelViewMatrix.multiplyMatrices(p.matrixWorldInverse, K.matrixWorld), K.normalMatrix.getNormalMatrix(K.modelViewMatrix), _.onBeforeRender(I, u, p, g, K, QU), _.transparent === !0 && _.side === 2 && _.forceSinglePass === !1) _.side = 1, _.needsUpdate = !0, I.renderBufferDirect(p, u, g, _, K, QU), _.side = 0, _.needsUpdate = !0, I.renderBufferDirect(p, u, g, _, K, QU), _.side = 2;
            else I.renderBufferDirect(p, u, g, _, K, QU);
            K.onAfterRender(I, u, p, g, _, QU)
        }

        function w0(K, u, p) {
            if (u.isScene !== !0) u = uU;
            let g = kU.get(K),
                _ = A.state.lights,
                QU = A.state.shadowsArray,
                jU = _.state.version,
                fU = v.getParameters(K, _.state, QU, u, p),
                hU = v.getProgramCacheKey(fU),
                gU = g.programs;
            if (g.environment = K.isMeshStandardMaterial ? u.environment : null, g.fog = u.fog, g.envMap = (K.isMeshStandardMaterial ? V : h).get(K.envMap || g.environment), g.envMapRotation = g.environment !== null && K.envMap === null ? u.environmentRotation : K.envMapRotation, gU === void 0) K.addEventListener("dispose", AU), gU = new Map, g.programs = gU;
            let eU = gU.get(hU);
            if (eU !== void 0) {
                if (g.currentProgram === eU && g.lightsStateVersion === jU) return cT(K, fU), eU
            } else fU.uniforms = v.getUniforms(K), K.onBeforeCompile(fU, I), eU = v.acquireProgram(fU, hU), gU.set(hU, eU), g.uniforms = fU.uniforms;
            let bU = g.uniforms;
            if (!K.isShaderMaterial && !K.isRawShaderMaterial || K.clipping === !0) bU.clippingPlanes = pU.uniform;
            if (cT(K, fU), g.needsLights = fS(K), g.lightsStateVersion = jU, g.needsLights) bU.ambientLightColor.value = _.state.ambient, bU.lightProbe.value = _.state.probe, bU.directionalLights.value = _.state.directional, bU.directionalLightShadows.value = _.state.directionalShadow, bU.spotLights.value = _.state.spot, bU.spotLightShadows.value = _.state.spotShadow, bU.rectAreaLights.value = _.state.rectArea, bU.ltc_1.value = _.state.rectAreaLTC1, bU.ltc_2.value = _.state.rectAreaLTC2, bU.pointLights.value = _.state.point, bU.pointLightShadows.value = _.state.pointShadow, bU.hemisphereLights.value = _.state.hemi, bU.directionalShadowMap.value = _.state.directionalShadowMap, bU.directionalShadowMatrix.value = _.state.directionalShadowMatrix, bU.spotShadowMap.value = _.state.spotShadowMap, bU.spotLightMatrix.value = _.state.spotLightMatrix, bU.spotLightMap.value = _.state.spotLightMap, bU.pointShadowMap.value = _.state.pointShadowMap, bU.pointShadowMatrix.value = _.state.pointShadowMatrix;
            return g.currentProgram = eU, g.uniformsList = null, eU
        }

        function wT(K) {
            if (K.uniformsList === null) {
                let u = K.currentProgram.getUniforms();
                K.uniformsList = A0.seqWithValue(u.seq, K.uniforms)
            }
            return K.uniformsList
        }

        function cT(K, u) {
            let p = kU.get(K);
            p.outputColorSpace = u.outputColorSpace, p.batching = u.batching, p.batchingColor = u.batchingColor, p.instancing = u.instancing, p.instancingColor = u.instancingColor, p.instancingMorph = u.instancingMorph, p.skinning = u.skinning, p.morphTargets = u.morphTargets, p.morphNormals = u.morphNormals, p.morphColors = u.morphColors, p.morphTargetsCount = u.morphTargetsCount, p.numClippingPlanes = u.numClippingPlanes, p.numIntersection = u.numClipIntersection, p.vertexAlphas = u.vertexAlphas, p.vertexTangents = u.vertexTangents, p.toneMapping = u.toneMapping
        }

        function CS(K, u, p, g, _) {
            if (u.isScene !== !0) u = uU;
            VU.resetTextureUnits();
            let QU = u.fog,
                jU = g.isMeshStandardMaterial ? u.environment : null,
                fU = f === null ? I.outputColorSpace : f.isXRRenderTarget === !0 ? f.texture.colorSpace : "srgb-linear",
                hU = (g.isMeshStandardMaterial ? V : h).get(g.envMap || jU),
                gU = g.vertexColors === !0 && !!p.attributes.color && p.attributes.color.itemSize === 4,
                eU = !!p.attributes.tangent && (!!g.normalMap || g.anisotropy > 0),
                bU = !!p.morphAttributes.position,
                $d = !!p.morphAttributes.normal,
                Bd = !!p.morphAttributes.color,
                Ad = 0;
            if (g.toneMapped) {
                if (f === null || f.isXRRenderTarget === !0) Ad = I.toneMapping
            }
            let gd = p.morphAttributes.position || p.morphAttributes.normal || p.morphAttributes.color,
                Pd = gd !== void 0 ? gd.length : 0,
                OU = kU.get(g),
                KD = A.state.lights;
            if ($U === !0) {
                if (FU === !0 || K !== X) {
                    let xd = K === X && g.id === G;
                    pU.setState(g, K, xd)
                }
            }
            let Td = !1;
            if (g.version === OU.__version) {
                if (OU.needsLights && OU.lightsStateVersion !== KD.state.version) Td = !0;
                else if (OU.outputColorSpace !== fU) Td = !0;
                else if (_.isBatchedMesh && OU.batching === !1) Td = !0;
                else if (!_.isBatchedMesh && OU.batching === !0) Td = !0;
                else if (_.isBatchedMesh && OU.batchingColor === !0 && _.colorTexture === null) Td = !0;
                else if (_.isBatchedMesh && OU.batchingColor === !1 && _.colorTexture !== null) Td = !0;
                else if (_.isInstancedMesh && OU.instancing === !1) Td = !0;
                else if (!_.isInstancedMesh && OU.instancing === !0) Td = !0;
                else if (_.isSkinnedMesh && OU.skinning === !1) Td = !0;
                else if (!_.isSkinnedMesh && OU.skinning === !0) Td = !0;
                else if (_.isInstancedMesh && OU.instancingColor === !0 && _.instanceColor === null) Td = !0;
                else if (_.isInstancedMesh && OU.instancingColor === !1 && _.instanceColor !== null) Td = !0;
                else if (_.isInstancedMesh && OU.instancingMorph === !0 && _.morphTexture === null) Td = !0;
                else if (_.isInstancedMesh && OU.instancingMorph === !1 && _.morphTexture !== null) Td = !0;
                else if (OU.envMap !== hU) Td = !0;
                else if (g.fog === !0 && OU.fog !== QU) Td = !0;
                else if (OU.numClippingPlanes !== void 0 && (OU.numClippingPlanes !== pU.numPlanes || OU.numIntersection !== pU.numIntersection)) Td = !0;
                else if (OU.vertexAlphas !== gU) Td = !0;
                else if (OU.vertexTangents !== eU) Td = !0;
                else if (OU.morphTargets !== bU) Td = !0;
                else if (OU.morphNormals !== $d) Td = !0;
                else if (OU.morphColors !== Bd) Td = !0;
                else if (OU.toneMapping !== Ad) Td = !0;
                else if (OU.morphTargetsCount !== Pd) Td = !0
            } else Td = !0, OU.__version = g.version;
            let $D = OU.currentProgram;
            if (Td === !0) $D = w0(g, u, _);
            let A$ = !1,
                vd = !1,
                s$ = !1,
                jd = $D.getUniforms(),
                LD = OU.uniforms;
            if (DU.useProgram($D.program)) A$ = !0, vd = !0, s$ = !0;
            if (g.id !== G) G = g.id, vd = !0;
            if (A$ || X !== K) {
                if (DU.buffers.depth.getReversed()) XU.copy(K.projectionMatrix), wJ(XU), cJ(XU), jd.setValue(b, "projectionMatrix", XU);
                else jd.setValue(b, "projectionMatrix", K.projectionMatrix);
                jd.setValue(b, "viewMatrix", K.matrixWorldInverse);
                let pD = jd.map.cameraPosition;
                if (pD !== void 0) pD.setValue(b, mU.setFromMatrixPosition(K.matrixWorld));
                if (CU.logarithmicDepthBuffer) jd.setValue(b, "logDepthBufFC", 2 / (Math.log(K.far + 1) / Math.LN2));
                if (g.isMeshPhongMaterial || g.isMeshToonMaterial || g.isMeshLambertMaterial || g.isMeshBasicMaterial || g.isMeshStandardMaterial || g.isShaderMaterial) jd.setValue(b, "isOrthographic", K.isOrthographicCamera === !0);
                if (X !== K) X = K, vd = !0, s$ = !0
            }
            if (_.isSkinnedMesh) {
                jd.setOptional(b, _, "bindMatrix"), jd.setOptional(b, _, "bindMatrixInverse");
                let xd = _.skeleton;
                if (xd) {
                    if (xd.boneTexture === null) xd.computeBoneTexture();
                    jd.setValue(b, "boneTexture", xd.boneTexture, VU)
                }
            }
            if (_.isBatchedMesh) {
                if (jd.setOptional(b, _, "batchingTexture"), jd.setValue(b, "batchingTexture", _._matricesTexture, VU), jd.setOptional(b, _, "batchingIdTexture"), jd.setValue(b, "batchingIdTexture", _._indirectTexture, VU), jd.setOptional(b, _, "batchingColorTexture"), _._colorsTexture !== null) jd.setValue(b, "batchingColorTexture", _._colorsTexture, VU)
            }
            let x$ = p.morphAttributes;
            if (x$.position !== void 0 || x$.normal !== void 0 || x$.color !== void 0) xU.update(_, p, $D);
            if (vd || OU.receiveShadow !== _.receiveShadow) OU.receiveShadow = _.receiveShadow, jd.setValue(b, "receiveShadow", _.receiveShadow);
            if (g.isMeshGouraudMaterial && g.envMap !== null) LD.envMap.value = hU, LD.flipEnvMap.value = hU.isCubeTexture && hU.isRenderTargetTexture === !1 ? -1 : 1;
            if (g.isMeshStandardMaterial && g.envMap === null && u.environment !== null) LD.envMapIntensity.value = u.environmentIntensity;
            if (vd) {
                if (jd.setValue(b, "toneMappingExposure", I.toneMappingExposure), OU.needsLights) KS(LD, s$);
                if (QU && g.fog === !0) WU.refreshFogUniforms(LD, QU);
                WU.refreshMaterialUniforms(LD, g, y, c, A.state.transmissionRenderTarget[K.id]), A0.upload(b, wT(OU), LD, VU)
            }
            if (g.isShaderMaterial && g.uniformsNeedUpdate === !0) A0.upload(b, wT(OU), LD, VU), g.uniformsNeedUpdate = !1;
            if (g.isSpriteMaterial) jd.setValue(b, "center", _.center);
            if (jd.setValue(b, "modelViewMatrix", _.modelViewMatrix), jd.setValue(b, "normalMatrix", _.normalMatrix), jd.setValue(b, "modelMatrix", _.matrixWorld), g.isShaderMaterial || g.isRawShaderMaterial) {
                let xd = g.uniformsGroups;
                for (let pD = 0, gD = xd.length; pD < gD; pD++) {
                    let eT = xd[pD];
                    Ed.update(eT, $D), Ed.bind(eT, $D)
                }
            }
            return $D
        }

        function KS(K, u) {
            K.ambientLightColor.needsUpdate = u, K.lightProbe.needsUpdate = u, K.directionalLights.needsUpdate = u, K.directionalLightShadows.needsUpdate = u, K.pointLights.needsUpdate = u, K.pointLightShadows.needsUpdate = u, K.spotLights.needsUpdate = u, K.spotLightShadows.needsUpdate = u, K.rectAreaLights.needsUpdate = u, K.hemisphereLights.needsUpdate = u
        }

        function fS(K) {
            return K.isMeshLambertMaterial || K.isMeshToonMaterial || K.isMeshPhongMaterial || K.isMeshStandardMaterial || K.isShadowMaterial || K.isShaderMaterial && K.lights === !0
        }
        if (this.getActiveCubeFace = function() {
                return a
            }, this.getActiveMipmapLevel = function() {
                return Y
            }, this.getRenderTarget = function() {
                return f
            }, this.setRenderTargetTextures = function(K, u, p) {
                kU.get(K.texture).__webglTexture = u, kU.get(K.depthTexture).__webglTexture = p;
                let g = kU.get(K);
                if (g.__hasExternalTextures = !0, g.__autoAllocateDepthBuffer = p === void 0, !g.__autoAllocateDepthBuffer) {
                    if (TU.has("WEBGL_multisampled_render_to_texture") === !0) console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), g.__useRenderToTexture = !1
                }
            }, this.setRenderTargetFramebuffer = function(K, u) {
                let p = kU.get(K);
                p.__webglFramebuffer = u, p.__useDefaultFramebuffer = u === void 0
            }, this.setRenderTarget = function(K, u = 0, p = 0) {
                f = K, a = u, Y = p;
                let g = !0,
                    _ = null,
                    QU = !1,
                    jU = !1;
                if (K) {
                    let hU = kU.get(K);
                    if (hU.__useDefaultFramebuffer !== void 0) DU.bindFramebuffer(b.FRAMEBUFFER, null), g = !1;
                    else if (hU.__webglFramebuffer === void 0) VU.setupRenderTarget(K);
                    else if (hU.__hasExternalTextures) VU.rebindTextures(K, kU.get(K.texture).__webglTexture, kU.get(K.depthTexture).__webglTexture);
                    else if (K.depthBuffer) {
                        let bU = K.depthTexture;
                        if (hU.__boundDepthTexture !== bU) {
                            if (bU !== null && kU.has(bU) && (K.width !== bU.image.width || K.height !== bU.image.height)) throw Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
                            VU.setupDepthRenderbuffer(K)
                        }
                    }
                    let gU = K.texture;
                    if (gU.isData3DTexture || gU.isDataArrayTexture || gU.isCompressedArrayTexture) jU = !0;
                    let eU = kU.get(K).__webglFramebuffer;
                    if (K.isWebGLCubeRenderTarget) {
                        if (Array.isArray(eU[u])) _ = eU[u][p];
                        else _ = eU[u];
                        QU = !0
                    } else if (K.samples > 0 && VU.useMultisampledRTT(K) === !1) _ = kU.get(K).__webglMultisampledFramebuffer;
                    else if (Array.isArray(eU)) _ = eU[p];
                    else _ = eU;
                    F.copy(K.viewport), O.copy(K.scissor), N = K.scissorTest
                } else F.copy(PU).multiplyScalar(y).floor(), O.copy(iU).multiplyScalar(y).floor(), N = wU;
                if (DU.bindFramebuffer(b.FRAMEBUFFER, _) && g) DU.drawBuffers(K, _);
                if (DU.viewport(F), DU.scissor(O), DU.setScissorTest(N), QU) {
                    let hU = kU.get(K.texture);
                    b.framebufferTexture2D(b.FRAMEBUFFER, b.COLOR_ATTACHMENT0, b.TEXTURE_CUBE_MAP_POSITIVE_X + u, hU.__webglTexture, p)
                } else if (jU) {
                    let hU = kU.get(K.texture),
                        gU = u || 0;
                    b.framebufferTextureLayer(b.FRAMEBUFFER, b.COLOR_ATTACHMENT0, hU.__webglTexture, p || 0, gU)
                }
                G = -1
            }, this.readRenderTargetPixels = function(K, u, p, g, _, QU, jU) {
                if (!(K && K.isWebGLRenderTarget)) {
                    console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
                    return
                }
                let fU = kU.get(K).__webglFramebuffer;
                if (K.isWebGLCubeRenderTarget && jU !== void 0) fU = fU[jU];
                if (fU) {
                    DU.bindFramebuffer(b.FRAMEBUFFER, fU);
                    try {
                        let hU = K.texture,
                            gU = hU.format,
                            eU = hU.type;
                        if (!CU.textureFormatReadable(gU)) {
                            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
                            return
                        }
                        if (!CU.textureTypeReadable(eU)) {
                            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
                            return
                        }
                        if (u >= 0 && u <= K.width - g && (p >= 0 && p <= K.height - _)) b.readPixels(u, p, g, _, cU.convert(gU), cU.convert(eU), QU)
                    } finally {
                        let hU = f !== null ? kU.get(f).__webglFramebuffer : null;
                        DU.bindFramebuffer(b.FRAMEBUFFER, hU)
                    }
                }
            }, this.readRenderTargetPixelsAsync = async function(K, u, p, g, _, QU, jU) {
                if (!(K && K.isWebGLRenderTarget)) throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
                let fU = kU.get(K).__webglFramebuffer;
                if (K.isWebGLCubeRenderTarget && jU !== void 0) fU = fU[jU];
                if (fU) {
                    let hU = K.texture,
                        gU = hU.format,
                        eU = hU.type;
                    if (!CU.textureFormatReadable(gU)) throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
                    if (!CU.textureTypeReadable(eU)) throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
                    if (u >= 0 && u <= K.width - g && (p >= 0 && p <= K.height - _)) {
                        DU.bindFramebuffer(b.FRAMEBUFFER, fU);
                        let bU = b.createBuffer();
                        b.bindBuffer(b.PIXEL_PACK_BUFFER, bU), b.bufferData(b.PIXEL_PACK_BUFFER, QU.byteLength, b.STREAM_READ), b.readPixels(u, p, g, _, cU.convert(gU), cU.convert(eU), 0);
                        let $d = f !== null ? kU.get(f).__webglFramebuffer : null;
                        DU.bindFramebuffer(b.FRAMEBUFFER, $d);
                        let Bd = b.fenceSync(b.SYNC_GPU_COMMANDS_COMPLETE, 0);
                        return b.flush(), await gJ(b, Bd, 4), b.bindBuffer(b.PIXEL_PACK_BUFFER, bU), b.getBufferSubData(b.PIXEL_PACK_BUFFER, 0, QU), b.deleteBuffer(bU), b.deleteSync(Bd), QU
                    } else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")
                }
            }, this.copyFramebufferToTexture = function(K, u = null, p = 0) {
                if (K.isTexture !== !0) J0("WebGLRenderer: copyFramebufferToTexture function signature has changed."), u = arguments[0] || null, K = arguments[1];
                let g = Math.pow(2, -p),
                    _ = Math.floor(K.image.width * g),
                    QU = Math.floor(K.image.height * g),
                    jU = u !== null ? u.x : 0,
                    fU = u !== null ? u.y : 0;
                VU.setTexture2D(K, 0), b.copyTexSubImage2D(b.TEXTURE_2D, p, 0, 0, jU, fU, _, QU), DU.unbindTexture()
            }, this.copyTextureToTexture = function(K, u, p = null, g = null, _ = 0) {
                if (K.isTexture !== !0) J0("WebGLRenderer: copyTextureToTexture function signature has changed."), g = arguments[0] || null, K = arguments[1], u = arguments[2], _ = arguments[3] || 0, p = null;
                let QU, jU, fU, hU, gU, eU, bU, $d, Bd, Ad = K.isCompressedTexture ? K.mipmaps[_] : K.image;
                if (p !== null) QU = p.max.x - p.min.x, jU = p.max.y - p.min.y, fU = p.isBox3 ? p.max.z - p.min.z : 1, hU = p.min.x, gU = p.min.y, eU = p.isBox3 ? p.min.z : 0;
                else QU = Ad.width, jU = Ad.height, fU = Ad.depth || 1, hU = 0, gU = 0, eU = 0;
                if (g !== null) bU = g.x, $d = g.y, Bd = g.z;
                else bU = 0, $d = 0, Bd = 0;
                let gd = cU.convert(u.format),
                    Pd = cU.convert(u.type),
                    OU;
                if (u.isData3DTexture) VU.setTexture3D(u, 0), OU = b.TEXTURE_3D;
                else if (u.isDataArrayTexture || u.isCompressedArrayTexture) VU.setTexture2DArray(u, 0), OU = b.TEXTURE_2D_ARRAY;
                else VU.setTexture2D(u, 0), OU = b.TEXTURE_2D;
                b.pixelStorei(b.UNPACK_FLIP_Y_WEBGL, u.flipY), b.pixelStorei(b.UNPACK_PREMULTIPLY_ALPHA_WEBGL, u.premultiplyAlpha), b.pixelStorei(b.UNPACK_ALIGNMENT, u.unpackAlignment);
                let KD = b.getParameter(b.UNPACK_ROW_LENGTH),
                    Td = b.getParameter(b.UNPACK_IMAGE_HEIGHT),
                    $D = b.getParameter(b.UNPACK_SKIP_PIXELS),
                    A$ = b.getParameter(b.UNPACK_SKIP_ROWS),
                    vd = b.getParameter(b.UNPACK_SKIP_IMAGES);
                b.pixelStorei(b.UNPACK_ROW_LENGTH, Ad.width), b.pixelStorei(b.UNPACK_IMAGE_HEIGHT, Ad.height), b.pixelStorei(b.UNPACK_SKIP_PIXELS, hU), b.pixelStorei(b.UNPACK_SKIP_ROWS, gU), b.pixelStorei(b.UNPACK_SKIP_IMAGES, eU);
                let s$ = K.isDataArrayTexture || K.isData3DTexture,
                    jd = u.isDataArrayTexture || u.isData3DTexture;
                if (K.isRenderTargetTexture || K.isDepthTexture) {
                    let LD = kU.get(K),
                        x$ = kU.get(u),
                        xd = kU.get(LD.__renderTarget),
                        pD = kU.get(x$.__renderTarget);
                    DU.bindFramebuffer(b.READ_FRAMEBUFFER, xd.__webglFramebuffer), DU.bindFramebuffer(b.DRAW_FRAMEBUFFER, pD.__webglFramebuffer);
                    for (let gD = 0; gD < fU; gD++) {
                        if (s$) b.framebufferTextureLayer(b.READ_FRAMEBUFFER, b.COLOR_ATTACHMENT0, kU.get(K).__webglTexture, _, eU + gD);
                        if (K.isDepthTexture) {
                            if (jd) b.framebufferTextureLayer(b.DRAW_FRAMEBUFFER, b.COLOR_ATTACHMENT0, kU.get(u).__webglTexture, _, Bd + gD);
                            b.blitFramebuffer(hU, gU, QU, jU, bU, $d, QU, jU, b.DEPTH_BUFFER_BIT, b.NEAREST)
                        } else if (jd) b.copyTexSubImage3D(OU, _, bU, $d, Bd + gD, hU, gU, QU, jU);
                        else b.copyTexSubImage2D(OU, _, bU, $d, Bd + gD, hU, gU, QU, jU)
                    }
                    DU.bindFramebuffer(b.READ_FRAMEBUFFER, null), DU.bindFramebuffer(b.DRAW_FRAMEBUFFER, null)
                } else if (jd)
                    if (K.isDataTexture || K.isData3DTexture) b.texSubImage3D(OU, _, bU, $d, Bd, QU, jU, fU, gd, Pd, Ad.data);
                    else if (u.isCompressedArrayTexture) b.compressedTexSubImage3D(OU, _, bU, $d, Bd, QU, jU, fU, gd, Ad.data);
                else b.texSubImage3D(OU, _, bU, $d, Bd, QU, jU, fU, gd, Pd, Ad);
                else if (K.isDataTexture) b.texSubImage2D(b.TEXTURE_2D, _, bU, $d, QU, jU, gd, Pd, Ad.data);
                else if (K.isCompressedTexture) b.compressedTexSubImage2D(b.TEXTURE_2D, _, bU, $d, Ad.width, Ad.height, gd, Ad.data);
                else b.texSubImage2D(b.TEXTURE_2D, _, bU, $d, QU, jU, gd, Pd, Ad);
                if (b.pixelStorei(b.UNPACK_ROW_LENGTH, KD), b.pixelStorei(b.UNPACK_IMAGE_HEIGHT, Td), b.pixelStorei(b.UNPACK_SKIP_PIXELS, $D), b.pixelStorei(b.UNPACK_SKIP_ROWS, A$), b.pixelStorei(b.UNPACK_SKIP_IMAGES, vd), _ === 0 && u.generateMipmaps) b.generateMipmap(OU);
                DU.unbindTexture()
            }, this.copyTextureToTexture3D = function(K, u, p = null, g = null, _ = 0) {
                if (K.isTexture !== !0) J0("WebGLRenderer: copyTextureToTexture3D function signature has changed."), p = arguments[0] || null, g = arguments[1] || null, K = arguments[2], u = arguments[3], _ = arguments[4] || 0;
                return J0('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'), this.copyTextureToTexture(K, u, p, g, _)
            }, this.initRenderTarget = function(K) {
                if (kU.get(K).__webglFramebuffer === void 0) VU.setupRenderTarget(K)
            }, this.initTexture = function(K) {
                if (K.isCubeTexture) VU.setTextureCube(K, 0);
                else if (K.isData3DTexture) VU.setTexture3D(K, 0);
                else if (K.isDataArrayTexture || K.isCompressedArrayTexture) VU.setTexture2DArray(K, 0);
                else VU.setTexture2D(K, 0);
                DU.unbindTexture()
            }, this.resetState = function() {
                a = 0, Y = 0, f = null, DU.reset(), sU.reset()
            }, typeof __THREE_DEVTOOLS__ < "u") __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
            detail: this
        }))
    }
    get coordinateSystem() {
        return 2000
    }
    get outputColorSpace() {
        return this._outputColorSpace
    }
    set outputColorSpace(U) {
        this._outputColorSpace = U;
        let d = this.getContext();
        d.drawingBufferColorspace = dd._getDrawingBufferColorSpace(U), d.unpackColorSpace = dd._getUnpackColorSpace()
    }
}
class iH {
    constructor(U, d = 1, D = 1000) {
        this.isFog = !0, this.name = "", this.color = new KU(U), this.near = d, this.far = D
    }
    clone() {
        return new iH(this.color, this.near, this.far)
    }
    toJSON() {
        return {
            type: "Fog",
            name: this.name,
            color: this.color.getHex(),
            near: this.near,
            far: this.far
        }
    }
}
class JT extends Xd {
    constructor() {
        super();
        if (this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new QD, this.environmentIntensity = 1, this.environmentRotation = new QD, this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u") __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
            detail: this
        }))
    }
    copy(U, d) {
        if (super.copy(U, d), U.background !== null) this.background = U.background.clone();
        if (U.environment !== null) this.environment = U.environment.clone();
        if (U.fog !== null) this.fog = U.fog.clone();
        if (this.backgroundBlurriness = U.backgroundBlurriness, this.backgroundIntensity = U.backgroundIntensity, this.backgroundRotation.copy(U.backgroundRotation), this.environmentIntensity = U.environmentIntensity, this.environmentRotation.copy(U.environmentRotation), U.overrideMaterial !== null) this.overrideMaterial = U.overrideMaterial.clone();
        return this.matrixAutoUpdate = U.matrixAutoUpdate, this
    }
    toJSON(U) {
        let d = super.toJSON(U);
        if (this.fog !== null) d.object.fog = this.fog.toJSON();
        if (this.backgroundBlurriness > 0) d.object.backgroundBlurriness = this.backgroundBlurriness;
        if (this.backgroundIntensity !== 1) d.object.backgroundIntensity = this.backgroundIntensity;
        if (d.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1) d.object.environmentIntensity = this.environmentIntensity;
        return d.object.environmentRotation = this.environmentRotation.toArray(), d
    }
}
class b4 {
    constructor(U, d) {
        this.isInterleavedBuffer = !0, this.array = U, this.stride = d, this.count = U !== void 0 ? U.length / d : 0, this.usage = 35044, this.updateRanges = [], this.version = 0, this.uuid = kD()
    }
    onUploadCallback() {}
    set needsUpdate(U) {
        if (U === !0) this.version++
    }
    setUsage(U) {
        return this.usage = U, this
    }
    addUpdateRange(U, d) {
        this.updateRanges.push({
            start: U,
            count: d
        })
    }
    clearUpdateRanges() {
        this.updateRanges.length = 0
    }
    copy(U) {
        return this.array = new U.array.constructor(U.array), this.count = U.count, this.stride = U.stride, this.usage = U.usage, this
    }
    copyAt(U, d, D) {
        U *= this.stride, D *= d.stride;
        for (let $ = 0, H = this.stride; $ < H; $++) this.array[U + $] = d.array[D + $];
        return this
    }
    set(U, d = 0) {
        return this.array.set(U, d), this
    }
    clone(U) {
        if (U.arrayBuffers === void 0) U.arrayBuffers = {};
        if (this.array.buffer._uuid === void 0) this.array.buffer._uuid = kD();
        if (U.arrayBuffers[this.array.buffer._uuid] === void 0) U.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer;
        let d = new this.array.constructor(U.arrayBuffers[this.array.buffer._uuid]),
            D = new this.constructor(d, this.stride);
        return D.setUsage(this.usage), D
    }
    onUpload(U) {
        return this.onUploadCallback = U, this
    }
    toJSON(U) {
        if (U.arrayBuffers === void 0) U.arrayBuffers = {};
        if (this.array.buffer._uuid === void 0) this.array.buffer._uuid = kD();
        if (U.arrayBuffers[this.array.buffer._uuid] === void 0) U.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer));
        return {
            uuid: this.uuid,
            buffer: this.array.buffer._uuid,
            type: this.array.constructor.name,
            stride: this.stride
        }
    }
}
var ud = new i;
class KH {
    constructor(U, d, D, $ = !1) {
        this.isInterleavedBufferAttribute = !0, this.name = "", this.data = U, this.itemSize = d, this.offset = D, this.normalized = $
    }
    get count() {
        return this.data.count
    }
    get array() {
        return this.data.array
    }
    set needsUpdate(U) {
        this.data.needsUpdate = U
    }
    applyMatrix4(U) {
        for (let d = 0, D = this.data.count; d < D; d++) ud.fromBufferAttribute(this, d), ud.applyMatrix4(U), this.setXYZ(d, ud.x, ud.y, ud.z);
        return this
    }
    applyNormalMatrix(U) {
        for (let d = 0, D = this.count; d < D; d++) ud.fromBufferAttribute(this, d), ud.applyNormalMatrix(U), this.setXYZ(d, ud.x, ud.y, ud.z);
        return this
    }
    transformDirection(U) {
        for (let d = 0, D = this.count; d < D; d++) ud.fromBufferAttribute(this, d), ud.transformDirection(U), this.setXYZ(d, ud.x, ud.y, ud.z);
        return this
    }
    getComponent(U, d) {
        let D = this.array[U * this.data.stride + this.offset + d];
        if (this.normalized) D = RD(D, this.array);
        return D
    }
    setComponent(U, d, D) {
        if (this.normalized) D = Qd(D, this.array);
        return this.data.array[U * this.data.stride + this.offset + d] = D, this
    }
    setX(U, d) {
        if (this.normalized) d = Qd(d, this.array);
        return this.data.array[U * this.data.stride + this.offset] = d, this
    }
    setY(U, d) {
        if (this.normalized) d = Qd(d, this.array);
        return this.data.array[U * this.data.stride + this.offset + 1] = d, this
    }
    setZ(U, d) {
        if (this.normalized) d = Qd(d, this.array);
        return this.data.array[U * this.data.stride + this.offset + 2] = d, this
    }
    setW(U, d) {
        if (this.normalized) d = Qd(d, this.array);
        return this.data.array[U * this.data.stride + this.offset + 3] = d, this
    }
    getX(U) {
        let d = this.data.array[U * this.data.stride + this.offset];
        if (this.normalized) d = RD(d, this.array);
        return d
    }
    getY(U) {
        let d = this.data.array[U * this.data.stride + this.offset + 1];
        if (this.normalized) d = RD(d, this.array);
        return d
    }
    getZ(U) {
        let d = this.data.array[U * this.data.stride + this.offset + 2];
        if (this.normalized) d = RD(d, this.array);
        return d
    }
    getW(U) {
        let d = this.data.array[U * this.data.stride + this.offset + 3];
        if (this.normalized) d = RD(d, this.array);
        return d
    }
    setXY(U, d, D) {
        if (U = U * this.data.stride + this.offset, this.normalized) d = Qd(d, this.array), D = Qd(D, this.array);
        return this.data.array[U + 0] = d, this.data.array[U + 1] = D, this
    }
    setXYZ(U, d, D, $) {
        if (U = U * this.data.stride + this.offset, this.normalized) d = Qd(d, this.array), D = Qd(D, this.array), $ = Qd($, this.array);
        return this.data.array[U + 0] = d, this.data.array[U + 1] = D, this.data.array[U + 2] = $, this
    }
    setXYZW(U, d, D, $, H) {
        if (U = U * this.data.stride + this.offset, this.normalized) d = Qd(d, this.array), D = Qd(D, this.array), $ = Qd($, this.array), H = Qd(H, this.array);
        return this.data.array[U + 0] = d, this.data.array[U + 1] = D, this.data.array[U + 2] = $, this.data.array[U + 3] = H, this
    }
    clone(U) {
        if (U === void 0) {
            console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
            let d = [];
            for (let D = 0; D < this.count; D++) {
                let $ = D * this.data.stride + this.offset;
                for (let H = 0; H < this.itemSize; H++) d.push(this.data.array[$ + H])
            }
            return new Wd(new this.array.constructor(d), this.itemSize, this.normalized)
        } else {
            if (U.interleavedBuffers === void 0) U.interleavedBuffers = {};
            if (U.interleavedBuffers[this.data.uuid] === void 0) U.interleavedBuffers[this.data.uuid] = this.data.clone(U);
            return new KH(U.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized)
        }
    }
    toJSON(U) {
        if (U === void 0) {
            console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
            let d = [];
            for (let D = 0; D < this.count; D++) {
                let $ = D * this.data.stride + this.offset;
                for (let H = 0; H < this.itemSize; H++) d.push(this.data.array[$ + H])
            }
            return {
                itemSize: this.itemSize,
                type: this.array.constructor.name,
                array: d,
                normalized: this.normalized
            }
        } else {
            if (U.interleavedBuffers === void 0) U.interleavedBuffers = {};
            if (U.interleavedBuffers[this.data.uuid] === void 0) U.interleavedBuffers[this.data.uuid] = this.data.toJSON(U);
            return {
                isInterleavedBufferAttribute: !0,
                itemSize: this.itemSize,
                data: this.data.uuid,
                offset: this.offset,
                normalized: this.normalized
            }
        }
    }
}
class w$ extends uD {
    static get type() {
        return "SpriteMaterial"
    }
    constructor(U) {
        super();
        this.isSpriteMaterial = !0, this.color = new KU(16777215), this.map = null, this.alphaMap = null, this.rotation = 0, this.sizeAttenuation = !0, this.transparent = !0, this.fog = !0, this.setValues(U)
    }
    copy(U) {
        return super.copy(U), this.color.copy(U.color), this.map = U.map, this.alphaMap = U.alphaMap, this.rotation = U.rotation, this.sizeAttenuation = U.sizeAttenuation, this.fog = U.fog, this
    }
}
var i$, P0 = new i,
    O$ = new i,
    W$ = new i,
    G$ = new dU,
    T0 = new dU,
    i4 = new Dd,
    AH = new i,
    R0 = new i,
    jH = new i,
    cQ = new dU,
    qP = new dU,
    eQ = new dU;
class OH extends Xd {
    constructor(U = new w$) {
        super();
        if (this.isSprite = !0, this.type = "Sprite", i$ === void 0) {
            i$ = new Fd;
            let d = new Float32Array([-0.5, -0.5, 0, 0, 0, 0.5, -0.5, 0, 1, 0, 0.5, 0.5, 0, 1, 1, -0.5, 0.5, 0, 0, 1]),
                D = new b4(d, 5);
            i$.setIndex([0, 1, 2, 0, 2, 3]), i$.setAttribute("position", new KH(D, 3, 0, !1)), i$.setAttribute("uv", new KH(D, 2, 3, !1))
        }
        this.geometry = i$, this.material = U, this.center = new dU(0.5, 0.5)
    }
    raycast(U, d) {
        if (U.camera === null) console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.');
        if (O$.setFromMatrixScale(this.matrixWorld), i4.copy(U.camera.matrixWorld), this.modelViewMatrix.multiplyMatrices(U.camera.matrixWorldInverse, this.matrixWorld), W$.setFromMatrixPosition(this.modelViewMatrix), U.camera.isPerspectiveCamera && this.material.sizeAttenuation === !1) O$.multiplyScalar(-W$.z);
        let D = this.material.rotation,
            $, H;
        if (D !== 0) H = Math.cos(D), $ = Math.sin(D);
        let P = this.center;
        EH(AH.set(-0.5, -0.5, 0), W$, P, O$, $, H), EH(R0.set(0.5, -0.5, 0), W$, P, O$, $, H), EH(jH.set(0.5, 0.5, 0), W$, P, O$, $, H), cQ.set(0, 0), qP.set(1, 0), eQ.set(1, 1);
        let T = U.ray.intersectTriangle(AH, R0, jH, !1, P0);
        if (T === null) {
            if (EH(R0.set(-0.5, 0.5, 0), W$, P, O$, $, H), qP.set(0, 1), T = U.ray.intersectTriangle(AH, jH, R0, !1, P0), T === null) return
        }
        let R = U.ray.origin.distanceTo(P0);
        if (R < U.near || R > U.far) return;
        d.push({
            distance: R,
            point: P0.clone(),
            uv: td.getInterpolation(P0, AH, R0, jH, cQ, qP, eQ, new dU),
            face: null,
            object: this
        })
    }
    copy(U, d) {
        if (super.copy(U, d), U.center !== void 0) this.center.copy(U.center);
        return this.material = U.material, this
    }
}

function EH(U, d, D, $, H, P) {
    if (G$.subVectors(U, D).addScalar(0.5).multiply($), H !== void 0) T0.x = P * G$.x - H * G$.y, T0.y = H * G$.x + P * G$.y;
    else T0.copy(G$);
    U.copy(d), U.x += T0.x, U.y += T0.y, U.applyMatrix4(i4)
}
class O4 extends _d {
    constructor(U = null, d = 1, D = 1, $, H, P, T, R, J = 1003, Q = 1003, M, S) {
        super(null, P, T, R, J, Q, $, H, M, S);
        this.isDataTexture = !0, this.image = {
            data: U,
            width: d,
            height: D
        }, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1
    }
}
class lP extends Wd {
    constructor(U, d, D, $ = 1) {
        super(U, d, D);
        this.isInstancedBufferAttribute = !0, this.meshPerAttribute = $
    }
    copy(U) {
        return super.copy(U), this.meshPerAttribute = U.meshPerAttribute, this
    }
    toJSON() {
        let U = super.toJSON();
        return U.meshPerAttribute = this.meshPerAttribute, U.isInstancedBufferAttribute = !0, U
    }
}
var m$ = new Dd,
    vQ = new Dd,
    IH = [],
    lQ = new sD,
    Nj = new Dd,
    Q0 = new _U,
    S0 = new J$;
class xD extends _U {
    constructor(U, d, D) {
        super(U, d);
        this.isInstancedMesh = !0, this.instanceMatrix = new lP(new Float32Array(D * 16), 16), this.instanceColor = null, this.morphTexture = null, this.count = D, this.boundingBox = null, this.boundingSphere = null;
        for (let $ = 0; $ < D; $++) this.setMatrixAt($, Nj)
    }
    computeBoundingBox() {
        let U = this.geometry,
            d = this.count;
        if (this.boundingBox === null) this.boundingBox = new sD;
        if (U.boundingBox === null) U.computeBoundingBox();
        this.boundingBox.makeEmpty();
        for (let D = 0; D < d; D++) this.getMatrixAt(D, m$), lQ.copy(U.boundingBox).applyMatrix4(m$), this.boundingBox.union(lQ)
    }
    computeBoundingSphere() {
        let U = this.geometry,
            d = this.count;
        if (this.boundingSphere === null) this.boundingSphere = new J$;
        if (U.boundingSphere === null) U.computeBoundingSphere();
        this.boundingSphere.makeEmpty();
        for (let D = 0; D < d; D++) this.getMatrixAt(D, m$), S0.copy(U.boundingSphere).applyMatrix4(m$), this.boundingSphere.union(S0)
    }
    copy(U, d) {
        if (super.copy(U, d), this.instanceMatrix.copy(U.instanceMatrix), U.morphTexture !== null) this.morphTexture = U.morphTexture.clone();
        if (U.instanceColor !== null) this.instanceColor = U.instanceColor.clone();
        if (this.count = U.count, U.boundingBox !== null) this.boundingBox = U.boundingBox.clone();
        if (U.boundingSphere !== null) this.boundingSphere = U.boundingSphere.clone();
        return this
    }
    getColorAt(U, d) {
        d.fromArray(this.instanceColor.array, U * 3)
    }
    getMatrixAt(U, d) {
        d.fromArray(this.instanceMatrix.array, U * 16)
    }
    getMorphAt(U, d) {
        let D = d.morphTargetInfluences,
            $ = this.morphTexture.source.data.data,
            H = D.length + 1,
            P = U * H + 1;
        for (let T = 0; T < D.length; T++) D[T] = $[P + T]
    }
    raycast(U, d) {
        let D = this.matrixWorld,
            $ = this.count;
        if (Q0.geometry = this.geometry, Q0.material = this.material, Q0.material === void 0) return;
        if (this.boundingSphere === null) this.computeBoundingSphere();
        if (S0.copy(this.boundingSphere), S0.applyMatrix4(D), U.ray.intersectsSphere(S0) === !1) return;
        for (let H = 0; H < $; H++) {
            this.getMatrixAt(H, m$), vQ.multiplyMatrices(D, m$), Q0.matrixWorld = vQ, Q0.raycast(U, IH);
            for (let P = 0, T = IH.length; P < T; P++) {
                let R = IH[P];
                R.instanceId = H, R.object = this, d.push(R)
            }
            IH.length = 0
        }
    }
    setColorAt(U, d) {
        if (this.instanceColor === null) this.instanceColor = new lP(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3);
        d.toArray(this.instanceColor.array, U * 3)
    }
    setMatrixAt(U, d) {
        d.toArray(this.instanceMatrix.array, U * 16)
    }
    setMorphAt(U, d) {
        let D = d.morphTargetInfluences,
            $ = D.length + 1;
        if (this.morphTexture === null) this.morphTexture = new O4(new Float32Array($ * this.count), $, this.count, 1028, 1015);
        let H = this.morphTexture.source.data.data,
            P = 0;
        for (let J = 0; J < D.length; J++) P += D[J];
        let T = this.geometry.morphTargetsRelative ? 1 : 1 - P,
            R = $ * U;
        H[R] = T, H.set(D, R + 1)
    }
    updateMorphTargets() {}
    dispose() {
        if (this.dispatchEvent({
                type: "dispose"
            }), this.morphTexture !== null) this.morphTexture.dispose(), this.morphTexture = null;
        return this
    }
}
class c$ extends uD {
    static get type() {
        return "PointsMaterial"
    }
    constructor(U) {
        super();
        this.isPointsMaterial = !0, this.color = new KU(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = !0, this.fog = !0, this.setValues(U)
    }
    copy(U) {
        return super.copy(U), this.color.copy(U.color), this.map = U.map, this.alphaMap = U.alphaMap, this.size = U.size, this.sizeAttenuation = U.sizeAttenuation, this.fog = U.fog, this
    }
}
var yQ = new Dd,
    yP = new q$,
    kH = new J$,
    ZH = new i;
class C0 extends Xd {
    constructor(U = new Fd, d = new c$) {
        super();
        this.isPoints = !0, this.type = "Points", this.geometry = U, this.material = d, this.updateMorphTargets()
    }
    copy(U, d) {
        return super.copy(U, d), this.material = Array.isArray(U.material) ? U.material.slice() : U.material, this.geometry = U.geometry, this
    }
    raycast(U, d) {
        let D = this.geometry,
            $ = this.matrixWorld,
            H = U.params.Points.threshold,
            P = D.drawRange;
        if (D.boundingSphere === null) D.computeBoundingSphere();
        if (kH.copy(D.boundingSphere), kH.applyMatrix4($), kH.radius += H, U.ray.intersectsSphere(kH) === !1) return;
        yQ.copy($).invert(), yP.copy(U.ray).applyMatrix4(yQ);
        let T = H / ((this.scale.x + this.scale.y + this.scale.z) / 3),
            R = T * T,
            J = D.index,
            M = D.attributes.position;
        if (J !== null) {
            let S = Math.max(0, P.start),
                B = Math.min(J.count, P.start + P.count);
            for (let L = S, E = B; L < E; L++) {
                let k = J.getX(L);
                ZH.fromBufferAttribute(M, k), oQ(ZH, k, R, $, U, d, this)
            }
        } else {
            let S = Math.max(0, P.start),
                B = Math.min(M.count, P.start + P.count);
            for (let L = S, E = B; L < E; L++) ZH.fromBufferAttribute(M, L), oQ(ZH, L, R, $, U, d, this)
        }
    }
    updateMorphTargets() {
        let d = this.geometry.morphAttributes,
            D = Object.keys(d);
        if (D.length > 0) {
            let $ = d[D[0]];
            if ($ !== void 0) {
                this.morphTargetInfluences = [], this.morphTargetDictionary = {};
                for (let H = 0, P = $.length; H < P; H++) {
                    let T = $[H].name || String(H);
                    this.morphTargetInfluences.push(0), this.morphTargetDictionary[T] = H
                }
            }
        }
    }
}

function oQ(U, d, D, $, H, P, T) {
    let R = yP.distanceSqToPoint(U);
    if (R < D) {
        let J = new i;
        yP.closestPointToPoint(U, J), J.applyMatrix4($);
        let Q = H.ray.origin.distanceTo(J);
        if (Q < H.near || Q > H.far) return;
        P.push({
            distance: Q,
            distanceToRay: Math.sqrt(R),
            point: J,
            index: d,
            face: null,
            faceIndex: null,
            barycoord: null,
            object: T
        })
    }
}
class e$ extends _d {
    constructor(U, d, D, $, H, P, T, R, J) {
        super(U, d, D, $, H, P, T, R, J);
        this.isCanvasTexture = !0, this.needsUpdate = !0
    }
}
class MD {
    constructor() {
        this.type = "Curve", this.arcLengthDivisions = 200
    }
    getPoint() {
        return console.warn("THREE.Curve: .getPoint() not implemented."), null
    }
    getPointAt(U, d) {
        let D = this.getUtoTmapping(U);
        return this.getPoint(D, d)
    }
    getPoints(U = 5) {
        let d = [];
        for (let D = 0; D <= U; D++) d.push(this.getPoint(D / U));
        return d
    }
    getSpacedPoints(U = 5) {
        let d = [];
        for (let D = 0; D <= U; D++) d.push(this.getPointAt(D / U));
        return d
    }
    getLength() {
        let U = this.getLengths();
        return U[U.length - 1]
    }
    getLengths(U = this.arcLengthDivisions) {
        if (this.cacheArcLengths && this.cacheArcLengths.length === U + 1 && !this.needsUpdate) return this.cacheArcLengths;
        this.needsUpdate = !1;
        let d = [],
            D, $ = this.getPoint(0),
            H = 0;
        d.push(0);
        for (let P = 1; P <= U; P++) D = this.getPoint(P / U), H += D.distanceTo($), d.push(H), $ = D;
        return this.cacheArcLengths = d, d
    }
    updateArcLengths() {
        this.needsUpdate = !0, this.getLengths()
    }
    getUtoTmapping(U, d) {
        let D = this.getLengths(),
            $ = 0,
            H = D.length,
            P;
        if (d) P = d;
        else P = U * D[H - 1];
        let T = 0,
            R = H - 1,
            J;
        while (T <= R)
            if ($ = Math.floor(T + (R - T) / 2), J = D[$] - P, J < 0) T = $ + 1;
            else if (J > 0) R = $ - 1;
        else {
            R = $;
            break
        }
        if ($ = R, D[$] === P) return $ / (H - 1);
        let Q = D[$],
            S = D[$ + 1] - Q,
            B = (P - Q) / S;
        return ($ + B) / (H - 1)
    }
    getTangent(U, d) {
        let $ = U - 0.0001,
            H = U + 0.0001;
        if ($ < 0) $ = 0;
        if (H > 1) H = 1;
        let P = this.getPoint($),
            T = this.getPoint(H),
            R = d || (P.isVector2 ? new dU : new i);
        return R.copy(T).sub(P).normalize(), R
    }
    getTangentAt(U, d) {
        let D = this.getUtoTmapping(U);
        return this.getTangent(D, d)
    }
    computeFrenetFrames(U, d) {
        let D = new i,
            $ = [],
            H = [],
            P = [],
            T = new i,
            R = new Dd;
        for (let B = 0; B <= U; B++) {
            let L = B / U;
            $[B] = this.getTangentAt(L, new i)
        }
        H[0] = new i, P[0] = new i;
        let J = Number.MAX_VALUE,
            Q = Math.abs($[0].x),
            M = Math.abs($[0].y),
            S = Math.abs($[0].z);
        if (Q <= J) J = Q, D.set(1, 0, 0);
        if (M <= J) J = M, D.set(0, 1, 0);
        if (S <= J) D.set(0, 0, 1);
        T.crossVectors($[0], D).normalize(), H[0].crossVectors($[0], T), P[0].crossVectors($[0], H[0]);
        for (let B = 1; B <= U; B++) {
            if (H[B] = H[B - 1].clone(), P[B] = P[B - 1].clone(), T.crossVectors($[B - 1], $[B]), T.length() > Number.EPSILON) {
                T.normalize();
                let L = Math.acos(bd($[B - 1].dot($[B]), -1, 1));
                H[B].applyMatrix4(R.makeRotationAxis(T, L))
            }
            P[B].crossVectors($[B], H[B])
        }
        if (d === !0) {
            let B = Math.acos(bd(H[0].dot(H[U]), -1, 1));
            if (B /= U, $[0].dot(T.crossVectors(H[0], H[U])) > 0) B = -B;
            for (let L = 1; L <= U; L++) H[L].applyMatrix4(R.makeRotationAxis($[L], B * L)), P[L].crossVectors($[L], H[L])
        }
        return {
            tangents: $,
            normals: H,
            binormals: P
        }
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(U) {
        return this.arcLengthDivisions = U.arcLengthDivisions, this
    }
    toJSON() {
        let U = {
            metadata: {
                version: 4.6,
                type: "Curve",
                generator: "Curve.toJSON"
            }
        };
        return U.arcLengthDivisions = this.arcLengthDivisions, U.type = this.type, U
    }
    fromJSON(U) {
        return this.arcLengthDivisions = U.arcLengthDivisions, this
    }
}
class WH extends MD {
    constructor(U = 0, d = 0, D = 1, $ = 1, H = 0, P = Math.PI * 2, T = !1, R = 0) {
        super();
        this.isEllipseCurve = !0, this.type = "EllipseCurve", this.aX = U, this.aY = d, this.xRadius = D, this.yRadius = $, this.aStartAngle = H, this.aEndAngle = P, this.aClockwise = T, this.aRotation = R
    }
    getPoint(U, d = new dU) {
        let D = d,
            $ = Math.PI * 2,
            H = this.aEndAngle - this.aStartAngle,
            P = Math.abs(H) < Number.EPSILON;
        while (H < 0) H += $;
        while (H > $) H -= $;
        if (H < Number.EPSILON)
            if (P) H = 0;
            else H = $;
        if (this.aClockwise === !0 && !P)
            if (H === $) H = -$;
            else H = H - $;
        let T = this.aStartAngle + U * H,
            R = this.aX + this.xRadius * Math.cos(T),
            J = this.aY + this.yRadius * Math.sin(T);
        if (this.aRotation !== 0) {
            let Q = Math.cos(this.aRotation),
                M = Math.sin(this.aRotation),
                S = R - this.aX,
                B = J - this.aY;
            R = S * Q - B * M + this.aX, J = S * M + B * Q + this.aY
        }
        return D.set(R, J)
    }
    copy(U) {
        return super.copy(U), this.aX = U.aX, this.aY = U.aY, this.xRadius = U.xRadius, this.yRadius = U.yRadius, this.aStartAngle = U.aStartAngle, this.aEndAngle = U.aEndAngle, this.aClockwise = U.aClockwise, this.aRotation = U.aRotation, this
    }
    toJSON() {
        let U = super.toJSON();
        return U.aX = this.aX, U.aY = this.aY, U.xRadius = this.xRadius, U.yRadius = this.yRadius, U.aStartAngle = this.aStartAngle, U.aEndAngle = this.aEndAngle, U.aClockwise = this.aClockwise, U.aRotation = this.aRotation, U
    }
    fromJSON(U) {
        return super.fromJSON(U), this.aX = U.aX, this.aY = U.aY, this.xRadius = U.xRadius, this.yRadius = U.yRadius, this.aStartAngle = U.aStartAngle, this.aEndAngle = U.aEndAngle, this.aClockwise = U.aClockwise, this.aRotation = U.aRotation, this
    }
}
class W4 extends WH {
    constructor(U, d, D, $, H, P) {
        super(U, d, D, D, $, H, P);
        this.isArcCurve = !0, this.type = "ArcCurve"
    }
}

function MT() {
    let U = 0,
        d = 0,
        D = 0,
        $ = 0;

    function H(P, T, R, J) {
        U = P, d = R, D = -3 * P + 3 * T - 2 * R - J, $ = 2 * P - 2 * T + R + J
    }
    return {
        initCatmullRom: function(P, T, R, J, Q) {
            H(T, R, Q * (R - P), Q * (J - T))
        },
        initNonuniformCatmullRom: function(P, T, R, J, Q, M, S) {
            let B = (T - P) / Q - (R - P) / (Q + M) + (R - T) / M,
                L = (R - T) / M - (J - T) / (M + S) + (J - R) / S;
            B *= M, L *= M, H(T, R, B, L)
        },
        calc: function(P) {
            let T = P * P,
                R = T * P;
            return U + d * P + D * T + $ * R
        }
    }
}
var aH = new i,
    pP = new MT,
    gP = new MT,
    wP = new MT;
class G4 extends MD {
    constructor(U = [], d = !1, D = "centripetal", $ = 0.5) {
        super();
        this.isCatmullRomCurve3 = !0, this.type = "CatmullRomCurve3", this.points = U, this.closed = d, this.curveType = D, this.tension = $
    }
    getPoint(U, d = new i) {
        let D = d,
            $ = this.points,
            H = $.length,
            P = (H - (this.closed ? 0 : 1)) * U,
            T = Math.floor(P),
            R = P - T;
        if (this.closed) T += T > 0 ? 0 : (Math.floor(Math.abs(T) / H) + 1) * H;
        else if (R === 0 && T === H - 1) T = H - 2, R = 1;
        let J, Q;
        if (this.closed || T > 0) J = $[(T - 1) % H];
        else aH.subVectors($[0], $[1]).add($[0]), J = aH;
        let M = $[T % H],
            S = $[(T + 1) % H];
        if (this.closed || T + 2 < H) Q = $[(T + 2) % H];
        else aH.subVectors($[H - 1], $[H - 2]).add($[H - 1]), Q = aH;
        if (this.curveType === "centripetal" || this.curveType === "chordal") {
            let B = this.curveType === "chordal" ? 0.5 : 0.25,
                L = Math.pow(J.distanceToSquared(M), B),
                E = Math.pow(M.distanceToSquared(S), B),
                k = Math.pow(S.distanceToSquared(Q), B);
            if (E < 0.0001) E = 1;
            if (L < 0.0001) L = E;
            if (k < 0.0001) k = E;
            pP.initNonuniformCatmullRom(J.x, M.x, S.x, Q.x, L, E, k), gP.initNonuniformCatmullRom(J.y, M.y, S.y, Q.y, L, E, k), wP.initNonuniformCatmullRom(J.z, M.z, S.z, Q.z, L, E, k)
        } else if (this.curveType === "catmullrom") pP.initCatmullRom(J.x, M.x, S.x, Q.x, this.tension), gP.initCatmullRom(J.y, M.y, S.y, Q.y, this.tension), wP.initCatmullRom(J.z, M.z, S.z, Q.z, this.tension);
        return D.set(pP.calc(R), gP.calc(R), wP.calc(R)), D
    }
    copy(U) {
        super.copy(U), this.points = [];
        for (let d = 0, D = U.points.length; d < D; d++) {
            let $ = U.points[d];
            this.points.push($.clone())
        }
        return this.closed = U.closed, this.curveType = U.curveType, this.tension = U.tension, this
    }
    toJSON() {
        let U = super.toJSON();
        U.points = [];
        for (let d = 0, D = this.points.length; d < D; d++) {
            let $ = this.points[d];
            U.points.push($.toArray())
        }
        return U.closed = this.closed, U.curveType = this.curveType, U.tension = this.tension, U
    }
    fromJSON(U) {
        super.fromJSON(U), this.points = [];
        for (let d = 0, D = U.points.length; d < D; d++) {
            let $ = U.points[d];
            this.points.push(new i().fromArray($))
        }
        return this.closed = U.closed, this.curveType = U.curveType, this.tension = U.tension, this
    }
}

function nQ(U, d, D, $, H) {
    let P = ($ - d) * 0.5,
        T = (H - D) * 0.5,
        R = U * U,
        J = U * R;
    return (2 * D - 2 * $ + P + T) * J + (-3 * D + 3 * $ - 2 * P - T) * R + P * U + D
}

function zj(U, d) {
    let D = 1 - U;
    return D * D * d
}

function qj(U, d) {
    return 2 * (1 - U) * U * d
}

function pj(U, d) {
    return U * U * d
}

function j0(U, d, D, $) {
    return zj(U, d) + qj(U, D) + pj(U, $)
}

function gj(U, d) {
    let D = 1 - U;
    return D * D * D * d
}

function wj(U, d) {
    let D = 1 - U;
    return 3 * D * D * U * d
}

function cj(U, d) {
    return 3 * (1 - U) * U * U * d
}

function ej(U, d) {
    return U * U * U * d
}

function E0(U, d, D, $, H) {
    return gj(U, d) + wj(U, D) + cj(U, $) + ej(U, H)
}
class BT extends MD {
    constructor(U = new dU, d = new dU, D = new dU, $ = new dU) {
        super();
        this.isCubicBezierCurve = !0, this.type = "CubicBezierCurve", this.v0 = U, this.v1 = d, this.v2 = D, this.v3 = $
    }
    getPoint(U, d = new dU) {
        let D = d,
            $ = this.v0,
            H = this.v1,
            P = this.v2,
            T = this.v3;
        return D.set(E0(U, $.x, H.x, P.x, T.x), E0(U, $.y, H.y, P.y, T.y)), D
    }
    copy(U) {
        return super.copy(U), this.v0.copy(U.v0), this.v1.copy(U.v1), this.v2.copy(U.v2), this.v3.copy(U.v3), this
    }
    toJSON() {
        let U = super.toJSON();
        return U.v0 = this.v0.toArray(), U.v1 = this.v1.toArray(), U.v2 = this.v2.toArray(), U.v3 = this.v3.toArray(), U
    }
    fromJSON(U) {
        return super.fromJSON(U), this.v0.fromArray(U.v0), this.v1.fromArray(U.v1), this.v2.fromArray(U.v2), this.v3.fromArray(U.v3), this
    }
}
class m4 extends MD {
    constructor(U = new i, d = new i, D = new i, $ = new i) {
        super();
        this.isCubicBezierCurve3 = !0, this.type = "CubicBezierCurve3", this.v0 = U, this.v1 = d, this.v2 = D, this.v3 = $
    }
    getPoint(U, d = new i) {
        let D = d,
            $ = this.v0,
            H = this.v1,
            P = this.v2,
            T = this.v3;
        return D.set(E0(U, $.x, H.x, P.x, T.x), E0(U, $.y, H.y, P.y, T.y), E0(U, $.z, H.z, P.z, T.z)), D
    }
    copy(U) {
        return super.copy(U), this.v0.copy(U.v0), this.v1.copy(U.v1), this.v2.copy(U.v2), this.v3.copy(U.v3), this
    }
    toJSON() {
        let U = super.toJSON();
        return U.v0 = this.v0.toArray(), U.v1 = this.v1.toArray(), U.v2 = this.v2.toArray(), U.v3 = this.v3.toArray(), U
    }
    fromJSON(U) {
        return super.fromJSON(U), this.v0.fromArray(U.v0), this.v1.fromArray(U.v1), this.v2.fromArray(U.v2), this.v3.fromArray(U.v3), this
    }
}
class LT extends MD {
    constructor(U = new dU, d = new dU) {
        super();
        this.isLineCurve = !0, this.type = "LineCurve", this.v1 = U, this.v2 = d
    }
    getPoint(U, d = new dU) {
        let D = d;
        if (U === 1) D.copy(this.v2);
        else D.copy(this.v2).sub(this.v1), D.multiplyScalar(U).add(this.v1);
        return D
    }
    getPointAt(U, d) {
        return this.getPoint(U, d)
    }
    getTangent(U, d = new dU) {
        return d.subVectors(this.v2, this.v1).normalize()
    }
    getTangentAt(U, d) {
        return this.getTangent(U, d)
    }
    copy(U) {
        return super.copy(U), this.v1.copy(U.v1), this.v2.copy(U.v2), this
    }
    toJSON() {
        let U = super.toJSON();
        return U.v1 = this.v1.toArray(), U.v2 = this.v2.toArray(), U
    }
    fromJSON(U) {
        return super.fromJSON(U), this.v1.fromArray(U.v1), this.v2.fromArray(U.v2), this
    }
}
class _4 extends MD {
    constructor(U = new i, d = new i) {
        super();
        this.isLineCurve3 = !0, this.type = "LineCurve3", this.v1 = U, this.v2 = d
    }
    getPoint(U, d = new i) {
        let D = d;
        if (U === 1) D.copy(this.v2);
        else D.copy(this.v2).sub(this.v1), D.multiplyScalar(U).add(this.v1);
        return D
    }
    getPointAt(U, d) {
        return this.getPoint(U, d)
    }
    getTangent(U, d = new i) {
        return d.subVectors(this.v2, this.v1).normalize()
    }
    getTangentAt(U, d) {
        return this.getTangent(U, d)
    }
    copy(U) {
        return super.copy(U), this.v1.copy(U.v1), this.v2.copy(U.v2), this
    }
    toJSON() {
        let U = super.toJSON();
        return U.v1 = this.v1.toArray(), U.v2 = this.v2.toArray(), U
    }
    fromJSON(U) {
        return super.fromJSON(U), this.v1.fromArray(U.v1), this.v2.fromArray(U.v2), this
    }
}
class AT extends MD {
    constructor(U = new dU, d = new dU, D = new dU) {
        super();
        this.isQuadraticBezierCurve = !0, this.type = "QuadraticBezierCurve", this.v0 = U, this.v1 = d, this.v2 = D
    }
    getPoint(U, d = new dU) {
        let D = d,
            $ = this.v0,
            H = this.v1,
            P = this.v2;
        return D.set(j0(U, $.x, H.x, P.x), j0(U, $.y, H.y, P.y)), D
    }
    copy(U) {
        return super.copy(U), this.v0.copy(U.v0), this.v1.copy(U.v1), this.v2.copy(U.v2), this
    }
    toJSON() {
        let U = super.toJSON();
        return U.v0 = this.v0.toArray(), U.v1 = this.v1.toArray(), U.v2 = this.v2.toArray(), U
    }
    fromJSON(U) {
        return super.fromJSON(U), this.v0.fromArray(U.v0), this.v1.fromArray(U.v1), this.v2.fromArray(U.v2), this
    }
}
class u4 extends MD {
    constructor(U = new i, d = new i, D = new i) {
        super();
        this.isQuadraticBezierCurve3 = !0, this.type = "QuadraticBezierCurve3", this.v0 = U, this.v1 = d, this.v2 = D
    }
    getPoint(U, d = new i) {
        let D = d,
            $ = this.v0,
            H = this.v1,
            P = this.v2;
        return D.set(j0(U, $.x, H.x, P.x), j0(U, $.y, H.y, P.y), j0(U, $.z, H.z, P.z)), D
    }
    copy(U) {
        return super.copy(U), this.v0.copy(U.v0), this.v1.copy(U.v1), this.v2.copy(U.v2), this
    }
    toJSON() {
        let U = super.toJSON();
        return U.v0 = this.v0.toArray(), U.v1 = this.v1.toArray(), U.v2 = this.v2.toArray(), U
    }
    fromJSON(U) {
        return super.fromJSON(U), this.v0.fromArray(U.v0), this.v1.fromArray(U.v1), this.v2.fromArray(U.v2), this
    }
}
class jT extends MD {
    constructor(U = []) {
        super();
        this.isSplineCurve = !0, this.type = "SplineCurve", this.points = U
    }
    getPoint(U, d = new dU) {
        let D = d,
            $ = this.points,
            H = ($.length - 1) * U,
            P = Math.floor(H),
            T = H - P,
            R = $[P === 0 ? P : P - 1],
            J = $[P],
            Q = $[P > $.length - 2 ? $.length - 1 : P + 1],
            M = $[P > $.length - 3 ? $.length - 1 : P + 2];
        return D.set(nQ(T, R.x, J.x, Q.x, M.x), nQ(T, R.y, J.y, Q.y, M.y)), D
    }
    copy(U) {
        super.copy(U), this.points = [];
        for (let d = 0, D = U.points.length; d < D; d++) {
            let $ = U.points[d];
            this.points.push($.clone())
        }
        return this
    }
    toJSON() {
        let U = super.toJSON();
        U.points = [];
        for (let d = 0, D = this.points.length; d < D; d++) {
            let $ = this.points[d];
            U.points.push($.toArray())
        }
        return U
    }
    fromJSON(U) {
        super.fromJSON(U), this.points = [];
        for (let d = 0, D = U.points.length; d < D; d++) {
            let $ = U.points[d];
            this.points.push(new dU().fromArray($))
        }
        return this
    }
}
var oP = Object.freeze({
    __proto__: null,
    ArcCurve: W4,
    CatmullRomCurve3: G4,
    CubicBezierCurve: BT,
    CubicBezierCurve3: m4,
    EllipseCurve: WH,
    LineCurve: LT,
    LineCurve3: _4,
    QuadraticBezierCurve: AT,
    QuadraticBezierCurve3: u4,
    SplineCurve: jT
});
class N4 extends MD {
    constructor() {
        super();
        this.type = "CurvePath", this.curves = [], this.autoClose = !1
    }
    add(U) {
        this.curves.push(U)
    }
    closePath() {
        let U = this.curves[0].getPoint(0),
            d = this.curves[this.curves.length - 1].getPoint(1);
        if (!U.equals(d)) {
            let D = U.isVector2 === !0 ? "LineCurve" : "LineCurve3";
            this.curves.push(new oP[D](d, U))
        }
        return this
    }
    getPoint(U, d) {
        let D = U * this.getLength(),
            $ = this.getCurveLengths(),
            H = 0;
        while (H < $.length) {
            if ($[H] >= D) {
                let P = $[H] - D,
                    T = this.curves[H],
                    R = T.getLength(),
                    J = R === 0 ? 0 : 1 - P / R;
                return T.getPointAt(J, d)
            }
            H++
        }
        return null
    }
    getLength() {
        let U = this.getCurveLengths();
        return U[U.length - 1]
    }
    updateArcLengths() {
        this.needsUpdate = !0, this.cacheLengths = null, this.getCurveLengths()
    }
    getCurveLengths() {
        if (this.cacheLengths && this.cacheLengths.length === this.curves.length) return this.cacheLengths;
        let U = [],
            d = 0;
        for (let D = 0, $ = this.curves.length; D < $; D++) d += this.curves[D].getLength(), U.push(d);
        return this.cacheLengths = U, U
    }
    getSpacedPoints(U = 40) {
        let d = [];
        for (let D = 0; D <= U; D++) d.push(this.getPoint(D / U));
        if (this.autoClose) d.push(d[0]);
        return d
    }
    getPoints(U = 12) {
        let d = [],
            D;
        for (let $ = 0, H = this.curves; $ < H.length; $++) {
            let P = H[$],
                T = P.isEllipseCurve ? U * 2 : P.isLineCurve || P.isLineCurve3 ? 1 : P.isSplineCurve ? U * P.points.length : U,
                R = P.getPoints(T);
            for (let J = 0; J < R.length; J++) {
                let Q = R[J];
                if (D && D.equals(Q)) continue;
                d.push(Q), D = Q
            }
        }
        if (this.autoClose && d.length > 1 && !d[d.length - 1].equals(d[0])) d.push(d[0]);
        return d
    }
    copy(U) {
        super.copy(U), this.curves = [];
        for (let d = 0, D = U.curves.length; d < D; d++) {
            let $ = U.curves[d];
            this.curves.push($.clone())
        }
        return this.autoClose = U.autoClose, this
    }
    toJSON() {
        let U = super.toJSON();
        U.autoClose = this.autoClose, U.curves = [];
        for (let d = 0, D = this.curves.length; d < D; d++) {
            let $ = this.curves[d];
            U.curves.push($.toJSON())
        }
        return U
    }
    fromJSON(U) {
        super.fromJSON(U), this.autoClose = U.autoClose, this.curves = [];
        for (let d = 0, D = U.curves.length; d < D; d++) {
            let $ = U.curves[d];
            this.curves.push(new oP[$.type]().fromJSON($))
        }
        return this
    }
}
class nP extends N4 {
    constructor(U) {
        super();
        if (this.type = "Path", this.currentPoint = new dU, U) this.setFromPoints(U)
    }
    setFromPoints(U) {
        this.moveTo(U[0].x, U[0].y);
        for (let d = 1, D = U.length; d < D; d++) this.lineTo(U[d].x, U[d].y);
        return this
    }
    moveTo(U, d) {
        return this.currentPoint.set(U, d), this
    }
    lineTo(U, d) {
        let D = new LT(this.currentPoint.clone(), new dU(U, d));
        return this.curves.push(D), this.currentPoint.set(U, d), this
    }
    quadraticCurveTo(U, d, D, $) {
        let H = new AT(this.currentPoint.clone(), new dU(U, d), new dU(D, $));
        return this.curves.push(H), this.currentPoint.set(D, $), this
    }
    bezierCurveTo(U, d, D, $, H, P) {
        let T = new BT(this.currentPoint.clone(), new dU(U, d), new dU(D, $), new dU(H, P));
        return this.curves.push(T), this.currentPoint.set(H, P), this
    }
    splineThru(U) {
        let d = [this.currentPoint.clone()].concat(U),
            D = new jT(d);
        return this.curves.push(D), this.currentPoint.copy(U[U.length - 1]), this
    }
    arc(U, d, D, $, H, P) {
        let T = this.currentPoint.x,
            R = this.currentPoint.y;
        return this.absarc(U + T, d + R, D, $, H, P), this
    }
    absarc(U, d, D, $, H, P) {
        return this.absellipse(U, d, D, D, $, H, P), this
    }
    ellipse(U, d, D, $, H, P, T, R) {
        let J = this.currentPoint.x,
            Q = this.currentPoint.y;
        return this.absellipse(U + J, d + Q, D, $, H, P, T, R), this
    }
    absellipse(U, d, D, $, H, P, T, R) {
        let J = new WH(U, d, D, $, H, P, T, R);
        if (this.curves.length > 0) {
            let M = J.getPoint(0);
            if (!M.equals(this.currentPoint)) this.lineTo(M.x, M.y)
        }
        this.curves.push(J);
        let Q = J.getPoint(1);
        return this.currentPoint.copy(Q), this
    }
    copy(U) {
        return super.copy(U), this.currentPoint.copy(U.currentPoint), this
    }
    toJSON() {
        let U = super.toJSON();
        return U.currentPoint = this.currentPoint.toArray(), U
    }
    fromJSON(U) {
        return super.fromJSON(U), this.currentPoint.fromArray(U.currentPoint), this
    }
}
class GH extends Fd {
    constructor(U = 1, d = 32, D = 0, $ = Math.PI * 2) {
        super();
        this.type = "CircleGeometry", this.parameters = {
            radius: U,
            segments: d,
            thetaStart: D,
            thetaLength: $
        }, d = Math.max(3, d);
        let H = [],
            P = [],
            T = [],
            R = [],
            J = new i,
            Q = new dU;
        P.push(0, 0, 0), T.push(0, 0, 1), R.push(0.5, 0.5);
        for (let M = 0, S = 3; M <= d; M++, S += 3) {
            let B = D + M / d * $;
            J.x = U * Math.cos(B), J.y = U * Math.sin(B), P.push(J.x, J.y, J.z), T.push(0, 0, 1), Q.x = (P[S] / U + 1) / 2, Q.y = (P[S + 1] / U + 1) / 2, R.push(Q.x, Q.y)
        }
        for (let M = 1; M <= d; M++) H.push(M, M + 1, 0);
        this.setIndex(H), this.setAttribute("position", new Rd(P, 3)), this.setAttribute("normal", new Rd(T, 3)), this.setAttribute("uv", new Rd(R, 2))
    }
    copy(U) {
        return super.copy(U), this.parameters = Object.assign({}, U.parameters), this
    }
    static fromJSON(U) {
        return new GH(U.radius, U.segments, U.thetaStart, U.thetaLength)
    }
}
class cd extends Fd {
    constructor(U = 1, d = 1, D = 1, $ = 32, H = 1, P = !1, T = 0, R = Math.PI * 2) {
        super();
        this.type = "CylinderGeometry", this.parameters = {
            radiusTop: U,
            radiusBottom: d,
            height: D,
            radialSegments: $,
            heightSegments: H,
            openEnded: P,
            thetaStart: T,
            thetaLength: R
        };
        let J = this;
        $ = Math.floor($), H = Math.floor(H);
        let Q = [],
            M = [],
            S = [],
            B = [],
            L = 0,
            E = [],
            k = D / 2,
            A = 0;
        if (j(), P === !1) {
            if (U > 0) C(!0);
            if (d > 0) C(!1)
        }
        this.setIndex(Q), this.setAttribute("position", new Rd(M, 3)), this.setAttribute("normal", new Rd(S, 3)), this.setAttribute("uv", new Rd(B, 2));

        function j() {
            let I = new i,
                Z = new i,
                a = 0,
                Y = (d - U) / D;
            for (let f = 0; f <= H; f++) {
                let G = [],
                    X = f / H,
                    F = X * (d - U) + U;
                for (let O = 0; O <= $; O++) {
                    let N = O / $,
                        z = N * R + T,
                        w = Math.sin(z),
                        l = Math.cos(z);
                    Z.x = F * w, Z.y = -X * D + k, Z.z = F * l, M.push(Z.x, Z.y, Z.z), I.set(w, Y, l).normalize(), S.push(I.x, I.y, I.z), B.push(N, 1 - X), G.push(L++)
                }
                E.push(G)
            }
            for (let f = 0; f < $; f++)
                for (let G = 0; G < H; G++) {
                    let X = E[G][f],
                        F = E[G + 1][f],
                        O = E[G + 1][f + 1],
                        N = E[G][f + 1];
                    if (U > 0 || G !== 0) Q.push(X, F, N), a += 3;
                    if (d > 0 || G !== H - 1) Q.push(F, O, N), a += 3
                }
            J.addGroup(A, a, 0), A += a
        }

        function C(I) {
            let Z = L,
                a = new dU,
                Y = new i,
                f = 0,
                G = I === !0 ? U : d,
                X = I === !0 ? 1 : -1;
            for (let O = 1; O <= $; O++) M.push(0, k * X, 0), S.push(0, X, 0), B.push(0.5, 0.5), L++;
            let F = L;
            for (let O = 0; O <= $; O++) {
                let z = O / $ * R + T,
                    w = Math.cos(z),
                    l = Math.sin(z);
                Y.x = G * l, Y.y = k * X, Y.z = G * w, M.push(Y.x, Y.y, Y.z), S.push(0, X, 0), a.x = w * 0.5 + 0.5, a.y = l * 0.5 * X + 0.5, B.push(a.x, a.y), L++
            }
            for (let O = 0; O < $; O++) {
                let N = Z + O,
                    z = F + O;
                if (I === !0) Q.push(z, z + 1, N);
                else Q.push(z + 1, z, N);
                f += 3
            }
            J.addGroup(A, f, I === !0 ? 1 : 2), A += f
        }
    }
    copy(U) {
        return super.copy(U), this.parameters = Object.assign({}, U.parameters), this
    }
    static fromJSON(U) {
        return new cd(U.radiusTop, U.radiusBottom, U.height, U.radialSegments, U.heightSegments, U.openEnded, U.thetaStart, U.thetaLength)
    }
}
class M$ extends cd {
    constructor(U = 1, d = 1, D = 32, $ = 1, H = !1, P = 0, T = Math.PI * 2) {
        super(0, U, d, D, $, H, P, T);
        this.type = "ConeGeometry", this.parameters = {
            radius: U,
            height: d,
            radialSegments: D,
            heightSegments: $,
            openEnded: H,
            thetaStart: P,
            thetaLength: T
        }
    }
    static fromJSON(U) {
        return new M$(U.radius, U.height, U.radialSegments, U.heightSegments, U.openEnded, U.thetaStart, U.thetaLength)
    }
}
class mH extends Fd {
    constructor(U = [], d = [], D = 1, $ = 0) {
        super();
        this.type = "PolyhedronGeometry", this.parameters = {
            vertices: U,
            indices: d,
            radius: D,
            detail: $
        };
        let H = [],
            P = [];
        if (T($), J(D), Q(), this.setAttribute("position", new Rd(H, 3)), this.setAttribute("normal", new Rd(H.slice(), 3)), this.setAttribute("uv", new Rd(P, 2)), $ === 0) this.computeVertexNormals();
        else this.normalizeNormals();

        function T(j) {
            let C = new i,
                I = new i,
                Z = new i;
            for (let a = 0; a < d.length; a += 3) B(d[a + 0], C), B(d[a + 1], I), B(d[a + 2], Z), R(C, I, Z, j)
        }

        function R(j, C, I, Z) {
            let a = Z + 1,
                Y = [];
            for (let f = 0; f <= a; f++) {
                Y[f] = [];
                let G = j.clone().lerp(I, f / a),
                    X = C.clone().lerp(I, f / a),
                    F = a - f;
                for (let O = 0; O <= F; O++)
                    if (O === 0 && f === a) Y[f][O] = G;
                    else Y[f][O] = G.clone().lerp(X, O / F)
            }
            for (let f = 0; f < a; f++)
                for (let G = 0; G < 2 * (a - f) - 1; G++) {
                    let X = Math.floor(G / 2);
                    if (G % 2 === 0) S(Y[f][X + 1]), S(Y[f + 1][X]), S(Y[f][X]);
                    else S(Y[f][X + 1]), S(Y[f + 1][X + 1]), S(Y[f + 1][X])
                }
        }

        function J(j) {
            let C = new i;
            for (let I = 0; I < H.length; I += 3) C.x = H[I + 0], C.y = H[I + 1], C.z = H[I + 2], C.normalize().multiplyScalar(j), H[I + 0] = C.x, H[I + 1] = C.y, H[I + 2] = C.z
        }

        function Q() {
            let j = new i;
            for (let C = 0; C < H.length; C += 3) {
                j.x = H[C + 0], j.y = H[C + 1], j.z = H[C + 2];
                let I = k(j) / 2 / Math.PI + 0.5,
                    Z = A(j) / Math.PI + 0.5;
                P.push(I, 1 - Z)
            }
            L(), M()
        }

        function M() {
            for (let j = 0; j < P.length; j += 6) {
                let C = P[j + 0],
                    I = P[j + 2],
                    Z = P[j + 4],
                    a = Math.max(C, I, Z),
                    Y = Math.min(C, I, Z);
                if (a > 0.9 && Y < 0.1) {
                    if (C < 0.2) P[j + 0] += 1;
                    if (I < 0.2) P[j + 2] += 1;
                    if (Z < 0.2) P[j + 4] += 1
                }
            }
        }

        function S(j) {
            H.push(j.x, j.y, j.z)
        }

        function B(j, C) {
            let I = j * 3;
            C.x = U[I + 0], C.y = U[I + 1], C.z = U[I + 2]
        }

        function L() {
            let j = new i,
                C = new i,
                I = new i,
                Z = new i,
                a = new dU,
                Y = new dU,
                f = new dU;
            for (let G = 0, X = 0; G < H.length; G += 9, X += 6) {
                j.set(H[G + 0], H[G + 1], H[G + 2]), C.set(H[G + 3], H[G + 4], H[G + 5]), I.set(H[G + 6], H[G + 7], H[G + 8]), a.set(P[X + 0], P[X + 1]), Y.set(P[X + 2], P[X + 3]), f.set(P[X + 4], P[X + 5]), Z.copy(j).add(C).add(I).divideScalar(3);
                let F = k(Z);
                E(a, X + 0, j, F), E(Y, X + 2, C, F), E(f, X + 4, I, F)
            }
        }

        function E(j, C, I, Z) {
            if (Z < 0 && j.x === 1) P[C] = j.x - 1;
            if (I.x === 0 && I.z === 0) P[C] = Z / 2 / Math.PI + 0.5
        }

        function k(j) {
            return Math.atan2(j.z, -j.x)
        }

        function A(j) {
            return Math.atan2(-j.y, Math.sqrt(j.x * j.x + j.z * j.z))
        }
    }
    copy(U) {
        return super.copy(U), this.parameters = Object.assign({}, U.parameters), this
    }
    static fromJSON(U) {
        return new mH(U.vertices, U.indices, U.radius, U.details)
    }
}
class _H extends mH {
    constructor(U = 1, d = 0) {
        let D = (1 + Math.sqrt(5)) / 2,
            $ = 1 / D,
            H = [-1, -1, -1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, -1, -1, 1, -1, 1, 1, 1, -1, 1, 1, 1, 0, -$, -D, 0, -$, D, 0, $, -D, 0, $, D, -$, -D, 0, -$, D, 0, $, -D, 0, $, D, 0, -D, 0, -$, D, 0, -$, -D, 0, $, D, 0, $],
            P = [3, 11, 7, 3, 7, 15, 3, 15, 13, 7, 19, 17, 7, 17, 6, 7, 6, 15, 17, 4, 8, 17, 8, 10, 17, 10, 6, 8, 0, 16, 8, 16, 2, 8, 2, 10, 0, 12, 1, 0, 1, 18, 0, 18, 16, 6, 10, 2, 6, 2, 13, 6, 13, 15, 2, 16, 18, 2, 18, 3, 2, 3, 13, 18, 1, 9, 18, 9, 11, 18, 11, 3, 4, 14, 12, 4, 12, 0, 4, 0, 8, 11, 9, 5, 11, 5, 19, 11, 19, 7, 19, 5, 14, 19, 14, 4, 19, 4, 17, 1, 12, 14, 1, 14, 5, 1, 5, 9];
        super(H, P, U, d);
        this.type = "DodecahedronGeometry", this.parameters = {
            radius: U,
            detail: d
        }
    }
    static fromJSON(U) {
        return new _H(U.radius, U.detail)
    }
}
class uH extends nP {
    constructor(U) {
        super(U);
        this.uuid = kD(), this.type = "Shape", this.holes = []
    }
    getPointsHoles(U) {
        let d = [];
        for (let D = 0, $ = this.holes.length; D < $; D++) d[D] = this.holes[D].getPoints(U);
        return d
    }
    extractPoints(U) {
        return {
            shape: this.getPoints(U),
            holes: this.getPointsHoles(U)
        }
    }
    copy(U) {
        super.copy(U), this.holes = [];
        for (let d = 0, D = U.holes.length; d < D; d++) {
            let $ = U.holes[d];
            this.holes.push($.clone())
        }
        return this
    }
    toJSON() {
        let U = super.toJSON();
        U.uuid = this.uuid, U.holes = [];
        for (let d = 0, D = this.holes.length; d < D; d++) {
            let $ = this.holes[d];
            U.holes.push($.toJSON())
        }
        return U
    }
    fromJSON(U) {
        super.fromJSON(U), this.uuid = U.uuid, this.holes = [];
        for (let d = 0, D = U.holes.length; d < D; d++) {
            let $ = U.holes[d];
            this.holes.push(new nP().fromJSON($))
        }
        return this
    }
}
var vj = {
    triangulate: function(U, d, D = 2) {
        let $ = d && d.length,
            H = $ ? d[0] * D : U.length,
            P = z4(U, 0, H, D, !0),
            T = [];
        if (!P || P.next === P.prev) return T;
        let R, J, Q, M, S, B, L;
        if ($) P = sj(U, d, P, D);
        if (U.length > 80 * D) {
            R = Q = U[0], J = M = U[1];
            for (let E = D; E < H; E += D) {
                if (S = U[E], B = U[E + 1], S < R) R = S;
                if (B < J) J = B;
                if (S > Q) Q = S;
                if (B > M) M = B
            }
            L = Math.max(Q - R, M - J), L = L !== 0 ? 32767 / L : 0
        }
        return Z0(P, T, D, R, J, L, 0), T
    }
};

function z4(U, d, D, $, H) {
    let P, T;
    if (H === RE(U, d, D, $) > 0)
        for (P = d; P < D; P += $) T = sQ(P, U[P], U[P + 1], T);
    else
        for (P = D - $; P >= d; P -= $) T = sQ(P, U[P], U[P + 1], T);
    if (T && NH(T, T.next)) Y0(T), T = T.next;
    return T
}

function S$(U, d) {
    if (!U) return U;
    if (!d) d = U;
    let D = U,
        $;
    do
        if ($ = !1, !D.steiner && (NH(D, D.next) || kd(D.prev, D, D.next) === 0)) {
            if (Y0(D), D = d = D.prev, D === D.next) break;
            $ = !0
        } else D = D.next; while ($ || D !== d);
    return d
}

function Z0(U, d, D, $, H, P, T) {
    if (!U) return;
    if (!T && P) dE(U, $, H, P);
    let R = U,
        J, Q;
    while (U.prev !== U.next) {
        if (J = U.prev, Q = U.next, P ? yj(U, $, H, P) : lj(U)) {
            d.push(J.i / D | 0), d.push(U.i / D | 0), d.push(Q.i / D | 0), Y0(U), U = Q.next, R = Q.next;
            continue
        }
        if (U = Q, U === R) {
            if (!T) Z0(S$(U), d, D, $, H, P, 1);
            else if (T === 1) U = oj(S$(U), d, D), Z0(U, d, D, $, H, P, 2);
            else if (T === 2) nj(U, d, D, $, H, P);
            break
        }
    }
}

function lj(U) {
    let d = U.prev,
        D = U,
        $ = U.next;
    if (kd(d, D, $) >= 0) return !1;
    let H = d.x,
        P = D.x,
        T = $.x,
        R = d.y,
        J = D.y,
        Q = $.y,
        M = H < P ? H < T ? H : T : P < T ? P : T,
        S = R < J ? R < Q ? R : Q : J < Q ? J : Q,
        B = H > P ? H > T ? H : T : P > T ? P : T,
        L = R > J ? R > Q ? R : Q : J > Q ? J : Q,
        E = $.next;
    while (E !== d) {
        if (E.x >= M && E.x <= B && E.y >= S && E.y <= L && u$(H, R, P, J, T, Q, E.x, E.y) && kd(E.prev, E, E.next) >= 0) return !1;
        E = E.next
    }
    return !0
}

function yj(U, d, D, $) {
    let H = U.prev,
        P = U,
        T = U.next;
    if (kd(H, P, T) >= 0) return !1;
    let R = H.x,
        J = P.x,
        Q = T.x,
        M = H.y,
        S = P.y,
        B = T.y,
        L = R < J ? R < Q ? R : Q : J < Q ? J : Q,
        E = M < S ? M < B ? M : B : S < B ? S : B,
        k = R > J ? R > Q ? R : Q : J > Q ? J : Q,
        A = M > S ? M > B ? M : B : S > B ? S : B,
        j = sP(L, E, d, D, $),
        C = sP(k, A, d, D, $),
        I = U.prevZ,
        Z = U.nextZ;
    while (I && I.z >= j && Z && Z.z <= C) {
        if (I.x >= L && I.x <= k && I.y >= E && I.y <= A && I !== H && I !== T && u$(R, M, J, S, Q, B, I.x, I.y) && kd(I.prev, I, I.next) >= 0) return !1;
        if (I = I.prevZ, Z.x >= L && Z.x <= k && Z.y >= E && Z.y <= A && Z !== H && Z !== T && u$(R, M, J, S, Q, B, Z.x, Z.y) && kd(Z.prev, Z, Z.next) >= 0) return !1;
        Z = Z.nextZ
    }
    while (I && I.z >= j) {
        if (I.x >= L && I.x <= k && I.y >= E && I.y <= A && I !== H && I !== T && u$(R, M, J, S, Q, B, I.x, I.y) && kd(I.prev, I, I.next) >= 0) return !1;
        I = I.prevZ
    }
    while (Z && Z.z <= C) {
        if (Z.x >= L && Z.x <= k && Z.y >= E && Z.y <= A && Z !== H && Z !== T && u$(R, M, J, S, Q, B, Z.x, Z.y) && kd(Z.prev, Z, Z.next) >= 0) return !1;
        Z = Z.nextZ
    }
    return !0
}

function oj(U, d, D) {
    let $ = U;
    do {
        let H = $.prev,
            P = $.next.next;
        if (!NH(H, P) && q4(H, $, $.next, P) && a0(H, P) && a0(P, H)) d.push(H.i / D | 0), d.push($.i / D | 0), d.push(P.i / D | 0), Y0($), Y0($.next), $ = U = P;
        $ = $.next
    } while ($ !== U);
    return S$($)
}

function nj(U, d, D, $, H, P) {
    let T = U;
    do {
        let R = T.next.next;
        while (R !== T.prev) {
            if (T.i !== R.i && HE(T, R)) {
                let J = p4(T, R);
                T = S$(T, T.next), J = S$(J, J.next), Z0(T, d, D, $, H, P, 0), Z0(J, d, D, $, H, P, 0);
                return
            }
            R = R.next
        }
        T = T.next
    } while (T !== U)
}

function sj(U, d, D, $) {
    let H = [],
        P, T, R, J, Q;
    for (P = 0, T = d.length; P < T; P++) {
        if (R = d[P] * $, J = P < T - 1 ? d[P + 1] * $ : U.length, Q = z4(U, R, J, $, !1), Q === Q.next) Q.steiner = !0;
        H.push($E(Q))
    }
    H.sort(xj);
    for (P = 0; P < H.length; P++) D = rj(H[P], D);
    return D
}

function xj(U, d) {
    return U.x - d.x
}

function rj(U, d) {
    let D = tj(U, d);
    if (!D) return d;
    let $ = p4(D, U);
    return S$($, $.next), S$(D, D.next)
}

function tj(U, d) {
    let D = d,
        $ = -1 / 0,
        H, P = U.x,
        T = U.y;
    do {
        if (T <= D.y && T >= D.next.y && D.next.y !== D.y) {
            let B = D.x + (T - D.y) * (D.next.x - D.x) / (D.next.y - D.y);
            if (B <= P && B > $) {
                if ($ = B, H = D.x < D.next.x ? D : D.next, B === P) return H
            }
        }
        D = D.next
    } while (D !== d);
    if (!H) return null;
    let R = H,
        J = H.x,
        Q = H.y,
        M = 1 / 0,
        S;
    D = H;
    do {
        if (P >= D.x && D.x >= J && P !== D.x && u$(T < Q ? P : $, T, J, Q, T < Q ? $ : P, T, D.x, D.y)) {
            if (S = Math.abs(T - D.y) / (P - D.x), a0(D, U) && (S < M || S === M && (D.x > H.x || D.x === H.x && UE(H, D)))) H = D, M = S
        }
        D = D.next
    } while (D !== R);
    return H
}

function UE(U, d) {
    return kd(U.prev, U, d.prev) < 0 && kd(d.next, U, U.next) < 0
}

function dE(U, d, D, $) {
    let H = U;
    do {
        if (H.z === 0) H.z = sP(H.x, H.y, d, D, $);
        H.prevZ = H.prev, H.nextZ = H.next, H = H.next
    } while (H !== U);
    H.prevZ.nextZ = null, H.prevZ = null, DE(H)
}

function DE(U) {
    let d, D, $, H, P, T, R, J, Q = 1;
    do {
        D = U, U = null, P = null, T = 0;
        while (D) {
            T++, $ = D, R = 0;
            for (d = 0; d < Q; d++)
                if (R++, $ = $.nextZ, !$) break;
            J = Q;
            while (R > 0 || J > 0 && $) {
                if (R !== 0 && (J === 0 || !$ || D.z <= $.z)) H = D, D = D.nextZ, R--;
                else H = $, $ = $.nextZ, J--;
                if (P) P.nextZ = H;
                else U = H;
                H.prevZ = P, P = H
            }
            D = $
        }
        P.nextZ = null, Q *= 2
    } while (T > 1);
    return U
}

function sP(U, d, D, $, H) {
    return U = (U - D) * H | 0, d = (d - $) * H | 0, U = (U | U << 8) & 16711935, U = (U | U << 4) & 252645135, U = (U | U << 2) & 858993459, U = (U | U << 1) & 1431655765, d = (d | d << 8) & 16711935, d = (d | d << 4) & 252645135, d = (d | d << 2) & 858993459, d = (d | d << 1) & 1431655765, U | d << 1
}

function $E(U) {
    let d = U,
        D = U;
    do {
        if (d.x < D.x || d.x === D.x && d.y < D.y) D = d;
        d = d.next
    } while (d !== U);
    return D
}

function u$(U, d, D, $, H, P, T, R) {
    return (H - T) * (d - R) >= (U - T) * (P - R) && (U - T) * ($ - R) >= (D - T) * (d - R) && (D - T) * (P - R) >= (H - T) * ($ - R)
}

function HE(U, d) {
    return U.next.i !== d.i && U.prev.i !== d.i && !PE(U, d) && (a0(U, d) && a0(d, U) && TE(U, d) && (kd(U.prev, U, d.prev) || kd(U, d.prev, d)) || NH(U, d) && kd(U.prev, U, U.next) > 0 && kd(d.prev, d, d.next) > 0)
}

function kd(U, d, D) {
    return (d.y - U.y) * (D.x - d.x) - (d.x - U.x) * (D.y - d.y)
}

function NH(U, d) {
    return U.x === d.x && U.y === d.y
}

function q4(U, d, D, $) {
    let H = XH(kd(U, d, D)),
        P = XH(kd(U, d, $)),
        T = XH(kd(D, $, U)),
        R = XH(kd(D, $, d));
    if (H !== P && T !== R) return !0;
    if (H === 0 && YH(U, D, d)) return !0;
    if (P === 0 && YH(U, $, d)) return !0;
    if (T === 0 && YH(D, U, $)) return !0;
    if (R === 0 && YH(D, d, $)) return !0;
    return !1
}

function YH(U, d, D) {
    return d.x <= Math.max(U.x, D.x) && d.x >= Math.min(U.x, D.x) && d.y <= Math.max(U.y, D.y) && d.y >= Math.min(U.y, D.y)
}

function XH(U) {
    return U > 0 ? 1 : U < 0 ? -1 : 0
}

function PE(U, d) {
    let D = U;
    do {
        if (D.i !== U.i && D.next.i !== U.i && D.i !== d.i && D.next.i !== d.i && q4(D, D.next, U, d)) return !0;
        D = D.next
    } while (D !== U);
    return !1
}

function a0(U, d) {
    return kd(U.prev, U, U.next) < 0 ? kd(U, d, U.next) >= 0 && kd(U, U.prev, d) >= 0 : kd(U, d, U.prev) < 0 || kd(U, U.next, d) < 0
}

function TE(U, d) {
    let D = U,
        $ = !1,
        H = (U.x + d.x) / 2,
        P = (U.y + d.y) / 2;
    do {
        if (D.y > P !== D.next.y > P && D.next.y !== D.y && H < (D.next.x - D.x) * (P - D.y) / (D.next.y - D.y) + D.x) $ = !$;
        D = D.next
    } while (D !== U);
    return $
}

function p4(U, d) {
    let D = new xP(U.i, U.x, U.y),
        $ = new xP(d.i, d.x, d.y),
        H = U.next,
        P = d.prev;
    return U.next = d, d.prev = U, D.next = H, H.prev = D, $.next = D, D.prev = $, P.next = $, $.prev = P, $
}

function sQ(U, d, D, $) {
    let H = new xP(U, d, D);
    if (!$) H.prev = H, H.next = H;
    else H.next = $.next, H.prev = $, $.next.prev = H, $.next = H;
    return H
}

function Y0(U) {
    if (U.next.prev = U.prev, U.prev.next = U.next, U.prevZ) U.prevZ.nextZ = U.nextZ;
    if (U.nextZ) U.nextZ.prevZ = U.prevZ
}

function xP(U, d, D) {
    this.i = U, this.x = d, this.y = D, this.prev = null, this.next = null, this.z = 0, this.prevZ = null, this.nextZ = null, this.steiner = !1
}

function RE(U, d, D, $) {
    let H = 0;
    for (let P = d, T = D - $; P < D; P += $) H += (U[T] - U[P]) * (U[P + 1] + U[T + 1]), T = P;
    return H
}
class I0 {
    static area(U) {
        let d = U.length,
            D = 0;
        for (let $ = d - 1, H = 0; H < d; $ = H++) D += U[$].x * U[H].y - U[H].x * U[$].y;
        return D * 0.5
    }
    static isClockWise(U) {
        return I0.area(U) < 0
    }
    static triangulateShape(U, d) {
        let D = [],
            $ = [],
            H = [];
        xQ(U), rQ(D, U);
        let P = U.length;
        d.forEach(xQ);
        for (let R = 0; R < d.length; R++) $.push(P), P += d[R].length, rQ(D, d[R]);
        let T = vj.triangulate(D, $);
        for (let R = 0; R < T.length; R += 3) H.push(T.slice(R, R + 3));
        return H
    }
}

function xQ(U) {
    let d = U.length;
    if (d > 2 && U[d - 1].equals(U[0])) U.pop()
}

function rQ(U, d) {
    for (let D = 0; D < d.length; D++) U.push(d[D].x), U.push(d[D].y)
}
class zH extends Fd {
    constructor(U = new uH([new dU(0.5, 0.5), new dU(-0.5, 0.5), new dU(-0.5, -0.5), new dU(0.5, -0.5)]), d = {}) {
        super();
        this.type = "ExtrudeGeometry", this.parameters = {
            shapes: U,
            options: d
        }, U = Array.isArray(U) ? U : [U];
        let D = this,
            $ = [],
            H = [];
        for (let T = 0, R = U.length; T < R; T++) {
            let J = U[T];
            P(J)
        }
        this.setAttribute("position", new Rd($, 3)), this.setAttribute("uv", new Rd(H, 2)), this.computeVertexNormals();

        function P(T) {
            let R = [],
                J = d.curveSegments !== void 0 ? d.curveSegments : 12,
                Q = d.steps !== void 0 ? d.steps : 1,
                M = d.depth !== void 0 ? d.depth : 1,
                S = d.bevelEnabled !== void 0 ? d.bevelEnabled : !0,
                B = d.bevelThickness !== void 0 ? d.bevelThickness : 0.2,
                L = d.bevelSize !== void 0 ? d.bevelSize : B - 0.1,
                E = d.bevelOffset !== void 0 ? d.bevelOffset : 0,
                k = d.bevelSegments !== void 0 ? d.bevelSegments : 3,
                A = d.extrudePath,
                j = d.UVGenerator !== void 0 ? d.UVGenerator : QE,
                C, I = !1,
                Z, a, Y, f;
            if (A) C = A.getSpacedPoints(Q), I = !0, S = !1, Z = A.computeFrenetFrames(Q, !1), a = new i, Y = new i, f = new i;
            if (!S) k = 0, B = 0, L = 0, E = 0;
            let G = T.extractPoints(J),
                X = G.shape,
                F = G.holes;
            if (!I0.isClockWise(X)) {
                X = X.reverse();
                for (let r = 0, SU = F.length; r < SU; r++) {
                    let b = F[r];
                    if (I0.isClockWise(b)) F[r] = b.reverse()
                }
            }
            let N = I0.triangulateShape(X, F),
                z = X;
            for (let r = 0, SU = F.length; r < SU; r++) {
                let b = F[r];
                X = X.concat(b)
            }

            function w(r, SU, b) {
                if (!SU) console.error("THREE.ExtrudeGeometry: vec does not exist");
                return r.clone().addScaledVector(SU, b)
            }
            let l = X.length,
                c = N.length;

            function y(r, SU, b) {
                let YU, TU, CU, DU = r.x - SU.x,
                    NU = r.y - SU.y,
                    kU = b.x - r.x,
                    VU = b.y - r.y,
                    h = DU * DU + NU * NU,
                    V = DU * VU - NU * kU;
                if (Math.abs(V) > Number.EPSILON) {
                    let q = Math.sqrt(h),
                        s = Math.sqrt(kU * kU + VU * VU),
                        t = SU.x - NU / q,
                        v = SU.y + DU / q,
                        WU = b.x - VU / s,
                        BU = b.y + kU / s,
                        IU = ((WU - t) * VU - (BU - v) * kU) / (DU * VU - NU * kU);
                    YU = t + DU * IU - r.x, TU = v + NU * IU - r.y;
                    let pU = YU * YU + TU * TU;
                    if (pU <= 2) return new dU(YU, TU);
                    else CU = Math.sqrt(pU / 2)
                } else {
                    let q = !1;
                    if (DU > Number.EPSILON) {
                        if (kU > Number.EPSILON) q = !0
                    } else if (DU < -Number.EPSILON) {
                        if (kU < -Number.EPSILON) q = !0
                    } else if (Math.sign(NU) === Math.sign(VU)) q = !0;
                    if (q) YU = -NU, TU = DU, CU = Math.sqrt(h);
                    else YU = DU, TU = NU, CU = Math.sqrt(h / 2)
                }
                return new dU(YU / CU, TU / CU)
            }
            let W = [];
            for (let r = 0, SU = z.length, b = SU - 1, YU = r + 1; r < SU; r++, b++, YU++) {
                if (b === SU) b = 0;
                if (YU === SU) YU = 0;
                W[r] = y(z[r], z[b], z[YU])
            }
            let UU = [],
                PU, iU = W.concat();
            for (let r = 0, SU = F.length; r < SU; r++) {
                let b = F[r];
                PU = [];
                for (let YU = 0, TU = b.length, CU = TU - 1, DU = YU + 1; YU < TU; YU++, CU++, DU++) {
                    if (CU === TU) CU = 0;
                    if (DU === TU) DU = 0;
                    PU[YU] = y(b[YU], b[CU], b[DU])
                }
                UU.push(PU), iU = iU.concat(PU)
            }
            for (let r = 0; r < k; r++) {
                let SU = r / k,
                    b = B * Math.cos(SU * Math.PI / 2),
                    YU = L * Math.sin(SU * Math.PI / 2) + E;
                for (let TU = 0, CU = z.length; TU < CU; TU++) {
                    let DU = w(z[TU], W[TU], YU);
                    XU(DU.x, DU.y, -b)
                }
                for (let TU = 0, CU = F.length; TU < CU; TU++) {
                    let DU = F[TU];
                    PU = UU[TU];
                    for (let NU = 0, kU = DU.length; NU < kU; NU++) {
                        let VU = w(DU[NU], PU[NU], YU);
                        XU(VU.x, VU.y, -b)
                    }
                }
            }
            let wU = L + E;
            for (let r = 0; r < l; r++) {
                let SU = S ? w(X[r], iU[r], wU) : X[r];
                if (!I) XU(SU.x, SU.y, 0);
                else Y.copy(Z.normals[0]).multiplyScalar(SU.x), a.copy(Z.binormals[0]).multiplyScalar(SU.y), f.copy(C[0]).add(Y).add(a), XU(f.x, f.y, f.z)
            }
            for (let r = 1; r <= Q; r++)
                for (let SU = 0; SU < l; SU++) {
                    let b = S ? w(X[SU], iU[SU], wU) : X[SU];
                    if (!I) XU(b.x, b.y, M / Q * r);
                    else Y.copy(Z.normals[r]).multiplyScalar(b.x), a.copy(Z.binormals[r]).multiplyScalar(b.y), f.copy(C[r]).add(Y).add(a), XU(f.x, f.y, f.z)
                }
            for (let r = k - 1; r >= 0; r--) {
                let SU = r / k,
                    b = B * Math.cos(SU * Math.PI / 2),
                    YU = L * Math.sin(SU * Math.PI / 2) + E;
                for (let TU = 0, CU = z.length; TU < CU; TU++) {
                    let DU = w(z[TU], W[TU], YU);
                    XU(DU.x, DU.y, M + b)
                }
                for (let TU = 0, CU = F.length; TU < CU; TU++) {
                    let DU = F[TU];
                    PU = UU[TU];
                    for (let NU = 0, kU = DU.length; NU < kU; NU++) {
                        let VU = w(DU[NU], PU[NU], YU);
                        if (!I) XU(VU.x, VU.y, M + b);
                        else XU(VU.x, VU.y + C[Q - 1].y, C[Q - 1].x + b)
                    }
                }
            }
            o(), $U();

            function o() {
                let r = $.length / 3;
                if (S) {
                    let SU = 0,
                        b = l * SU;
                    for (let YU = 0; YU < c; YU++) {
                        let TU = N[YU];
                        JU(TU[2] + b, TU[1] + b, TU[0] + b)
                    }
                    SU = Q + k * 2, b = l * SU;
                    for (let YU = 0; YU < c; YU++) {
                        let TU = N[YU];
                        JU(TU[0] + b, TU[1] + b, TU[2] + b)
                    }
                } else {
                    for (let SU = 0; SU < c; SU++) {
                        let b = N[SU];
                        JU(b[2], b[1], b[0])
                    }
                    for (let SU = 0; SU < c; SU++) {
                        let b = N[SU];
                        JU(b[0] + l * Q, b[1] + l * Q, b[2] + l * Q)
                    }
                }
                D.addGroup(r, $.length / 3 - r, 0)
            }

            function $U() {
                let r = $.length / 3,
                    SU = 0;
                FU(z, SU), SU += z.length;
                for (let b = 0, YU = F.length; b < YU; b++) {
                    let TU = F[b];
                    FU(TU, SU), SU += TU.length
                }
                D.addGroup(r, $.length / 3 - r, 1)
            }

            function FU(r, SU) {
                let b = r.length;
                while (--b >= 0) {
                    let YU = b,
                        TU = b - 1;
                    if (TU < 0) TU = r.length - 1;
                    for (let CU = 0, DU = Q + k * 2; CU < DU; CU++) {
                        let NU = l * CU,
                            kU = l * (CU + 1),
                            VU = SU + YU + NU,
                            h = SU + TU + NU,
                            V = SU + TU + kU,
                            q = SU + YU + kU;
                        mU(VU, h, V, q)
                    }
                }
            }

            function XU(r, SU, b) {
                R.push(r), R.push(SU), R.push(b)
            }

            function JU(r, SU, b) {
                nU(r), nU(SU), nU(b);
                let YU = $.length / 3,
                    TU = j.generateTopUV(D, $, YU - 3, YU - 2, YU - 1);
                uU(TU[0]), uU(TU[1]), uU(TU[2])
            }

            function mU(r, SU, b, YU) {
                nU(r), nU(SU), nU(YU), nU(SU), nU(b), nU(YU);
                let TU = $.length / 3,
                    CU = j.generateSideWallUV(D, $, TU - 6, TU - 3, TU - 2, TU - 1);
                uU(CU[0]), uU(CU[1]), uU(CU[3]), uU(CU[1]), uU(CU[2]), uU(CU[3])
            }

            function nU(r) {
                $.push(R[r * 3 + 0]), $.push(R[r * 3 + 1]), $.push(R[r * 3 + 2])
            }

            function uU(r) {
                H.push(r.x), H.push(r.y)
            }
        }
    }
    copy(U) {
        return super.copy(U), this.parameters = Object.assign({}, U.parameters), this
    }
    toJSON() {
        let U = super.toJSON(),
            d = this.parameters.shapes,
            D = this.parameters.options;
        return SE(d, D, U)
    }
    static fromJSON(U, d) {
        let D = [];
        for (let H = 0, P = U.shapes.length; H < P; H++) {
            let T = d[U.shapes[H]];
            D.push(T)
        }
        let $ = U.options.extrudePath;
        if ($ !== void 0) U.options.extrudePath = new oP[$.type]().fromJSON($);
        return new zH(D, U.options)
    }
}
var QE = {
    generateTopUV: function(U, d, D, $, H) {
        let P = d[D * 3],
            T = d[D * 3 + 1],
            R = d[$ * 3],
            J = d[$ * 3 + 1],
            Q = d[H * 3],
            M = d[H * 3 + 1];
        return [new dU(P, T), new dU(R, J), new dU(Q, M)]
    },
    generateSideWallUV: function(U, d, D, $, H, P) {
        let T = d[D * 3],
            R = d[D * 3 + 1],
            J = d[D * 3 + 2],
            Q = d[$ * 3],
            M = d[$ * 3 + 1],
            S = d[$ * 3 + 2],
            B = d[H * 3],
            L = d[H * 3 + 1],
            E = d[H * 3 + 2],
            k = d[P * 3],
            A = d[P * 3 + 1],
            j = d[P * 3 + 2];
        if (Math.abs(R - M) < Math.abs(T - Q)) return [new dU(T, 1 - J), new dU(Q, 1 - S), new dU(B, 1 - E), new dU(k, 1 - j)];
        else return [new dU(R, 1 - J), new dU(M, 1 - S), new dU(L, 1 - E), new dU(A, 1 - j)]
    }
};

function SE(U, d, D) {
    if (D.shapes = [], Array.isArray(U))
        for (let $ = 0, H = U.length; $ < H; $++) {
            let P = U[$];
            D.shapes.push(P.uuid)
        } else D.shapes.push(U.uuid);
    if (D.options = Object.assign({}, d), d.extrudePath !== void 0) D.options.extrudePath = d.extrudePath.toJSON();
    return D
}
class K0 extends mH {
    constructor(U = 1, d = 0) {
        let D = (1 + Math.sqrt(5)) / 2,
            $ = [-1, D, 0, 1, D, 0, -1, -D, 0, 1, -D, 0, 0, -1, D, 0, 1, D, 0, -1, -D, 0, 1, -D, D, 0, -1, D, 0, 1, -D, 0, -1, -D, 0, 1],
            H = [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1];
        super($, H, U, d);
        this.type = "IcosahedronGeometry", this.parameters = {
            radius: U,
            detail: d
        }
    }
    static fromJSON(U) {
        return new K0(U.radius, U.detail)
    }
}
class qH extends Fd {
    constructor(U = 0.5, d = 1, D = 32, $ = 1, H = 0, P = Math.PI * 2) {
        super();
        this.type = "RingGeometry", this.parameters = {
            innerRadius: U,
            outerRadius: d,
            thetaSegments: D,
            phiSegments: $,
            thetaStart: H,
            thetaLength: P
        }, D = Math.max(3, D), $ = Math.max(1, $);
        let T = [],
            R = [],
            J = [],
            Q = [],
            M = U,
            S = (d - U) / $,
            B = new i,
            L = new dU;
        for (let E = 0; E <= $; E++) {
            for (let k = 0; k <= D; k++) {
                let A = H + k / D * P;
                B.x = M * Math.cos(A), B.y = M * Math.sin(A), R.push(B.x, B.y, B.z), J.push(0, 0, 1), L.x = (B.x / d + 1) / 2, L.y = (B.y / d + 1) / 2, Q.push(L.x, L.y)
            }
            M += S
        }
        for (let E = 0; E < $; E++) {
            let k = E * (D + 1);
            for (let A = 0; A < D; A++) {
                let j = A + k,
                    C = j,
                    I = j + D + 1,
                    Z = j + D + 2,
                    a = j + 1;
                T.push(C, I, a), T.push(I, Z, a)
            }
        }
        this.setIndex(T), this.setAttribute("position", new Rd(R, 3)), this.setAttribute("normal", new Rd(J, 3)), this.setAttribute("uv", new Rd(Q, 2))
    }
    copy(U) {
        return super.copy(U), this.parameters = Object.assign({}, U.parameters), this
    }
    static fromJSON(U) {
        return new qH(U.innerRadius, U.outerRadius, U.thetaSegments, U.phiSegments, U.thetaStart, U.thetaLength)
    }
}
class pH extends Fd {
    constructor(U = 1, d = 32, D = 16, $ = 0, H = Math.PI * 2, P = 0, T = Math.PI) {
        super();
        this.type = "SphereGeometry", this.parameters = {
            radius: U,
            widthSegments: d,
            heightSegments: D,
            phiStart: $,
            phiLength: H,
            thetaStart: P,
            thetaLength: T
        }, d = Math.max(3, Math.floor(d)), D = Math.max(2, Math.floor(D));
        let R = Math.min(P + T, Math.PI),
            J = 0,
            Q = [],
            M = new i,
            S = new i,
            B = [],
            L = [],
            E = [],
            k = [];
        for (let A = 0; A <= D; A++) {
            let j = [],
                C = A / D,
                I = 0;
            if (A === 0 && P === 0) I = 0.5 / d;
            else if (A === D && R === Math.PI) I = -0.5 / d;
            for (let Z = 0; Z <= d; Z++) {
                let a = Z / d;
                M.x = -U * Math.cos($ + a * H) * Math.sin(P + C * T), M.y = U * Math.cos(P + C * T), M.z = U * Math.sin($ + a * H) * Math.sin(P + C * T), L.push(M.x, M.y, M.z), S.copy(M).normalize(), E.push(S.x, S.y, S.z), k.push(a + I, 1 - C), j.push(J++)
            }
            Q.push(j)
        }
        for (let A = 0; A < D; A++)
            for (let j = 0; j < d; j++) {
                let C = Q[A][j + 1],
                    I = Q[A][j],
                    Z = Q[A + 1][j],
                    a = Q[A + 1][j + 1];
                if (A !== 0 || P > 0) B.push(C, I, a);
                if (A !== D - 1 || R < Math.PI) B.push(I, Z, a)
            }
        this.setIndex(B), this.setAttribute("position", new Rd(L, 3)), this.setAttribute("normal", new Rd(E, 3)), this.setAttribute("uv", new Rd(k, 2))
    }
    copy(U) {
        return super.copy(U), this.parameters = Object.assign({}, U.parameters), this
    }
    static fromJSON(U) {
        return new pH(U.radius, U.widthSegments, U.heightSegments, U.phiStart, U.phiLength, U.thetaStart, U.thetaLength)
    }
}
class gH extends Fd {
    constructor(U = 1, d = 0.4, D = 12, $ = 48, H = Math.PI * 2) {
        super();
        this.type = "TorusGeometry", this.parameters = {
            radius: U,
            tube: d,
            radialSegments: D,
            tubularSegments: $,
            arc: H
        }, D = Math.floor(D), $ = Math.floor($);
        let P = [],
            T = [],
            R = [],
            J = [],
            Q = new i,
            M = new i,
            S = new i;
        for (let B = 0; B <= D; B++)
            for (let L = 0; L <= $; L++) {
                let E = L / $ * H,
                    k = B / D * Math.PI * 2;
                M.x = (U + d * Math.cos(k)) * Math.cos(E), M.y = (U + d * Math.cos(k)) * Math.sin(E), M.z = d * Math.sin(k), T.push(M.x, M.y, M.z), Q.x = U * Math.cos(E), Q.y = U * Math.sin(E), S.subVectors(M, Q).normalize(), R.push(S.x, S.y, S.z), J.push(L / $), J.push(B / D)
            }
        for (let B = 1; B <= D; B++)
            for (let L = 1; L <= $; L++) {
                let E = ($ + 1) * B + L - 1,
                    k = ($ + 1) * (B - 1) + L - 1,
                    A = ($ + 1) * (B - 1) + L,
                    j = ($ + 1) * B + L;
                P.push(E, k, j), P.push(k, A, j)
            }
        this.setIndex(P), this.setAttribute("position", new Rd(T, 3)), this.setAttribute("normal", new Rd(R, 3)), this.setAttribute("uv", new Rd(J, 2))
    }
    copy(U) {
        return super.copy(U), this.parameters = Object.assign({}, U.parameters), this
    }
    static fromJSON(U) {
        return new gH(U.radius, U.tube, U.radialSegments, U.tubularSegments, U.arc)
    }
}
class zD extends uD {
    static get type() {
        return "MeshStandardMaterial"
    }
    constructor(U) {
        super();
        this.isMeshStandardMaterial = !0, this.defines = {
            STANDARD: ""
        }, this.color = new KU(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new KU(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new dU(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new QD, this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(U)
    }
    copy(U) {
        return super.copy(U), this.defines = {
            STANDARD: ""
        }, this.color.copy(U.color), this.roughness = U.roughness, this.metalness = U.metalness, this.map = U.map, this.lightMap = U.lightMap, this.lightMapIntensity = U.lightMapIntensity, this.aoMap = U.aoMap, this.aoMapIntensity = U.aoMapIntensity, this.emissive.copy(U.emissive), this.emissiveMap = U.emissiveMap, this.emissiveIntensity = U.emissiveIntensity, this.bumpMap = U.bumpMap, this.bumpScale = U.bumpScale, this.normalMap = U.normalMap, this.normalMapType = U.normalMapType, this.normalScale.copy(U.normalScale), this.displacementMap = U.displacementMap, this.displacementScale = U.displacementScale, this.displacementBias = U.displacementBias, this.roughnessMap = U.roughnessMap, this.metalnessMap = U.metalnessMap, this.alphaMap = U.alphaMap, this.envMap = U.envMap, this.envMapRotation.copy(U.envMapRotation), this.envMapIntensity = U.envMapIntensity, this.wireframe = U.wireframe, this.wireframeLinewidth = U.wireframeLinewidth, this.wireframeLinecap = U.wireframeLinecap, this.wireframeLinejoin = U.wireframeLinejoin, this.flatShading = U.flatShading, this.fog = U.fog, this
    }
}
class zd extends uD {
    static get type() {
        return "MeshLambertMaterial"
    }
    constructor(U) {
        super();
        this.isMeshLambertMaterial = !0, this.color = new KU(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new KU(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new dU(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new QD, this.combine = 0, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(U)
    }
    copy(U) {
        return super.copy(U), this.color.copy(U.color), this.map = U.map, this.lightMap = U.lightMap, this.lightMapIntensity = U.lightMapIntensity, this.aoMap = U.aoMap, this.aoMapIntensity = U.aoMapIntensity, this.emissive.copy(U.emissive), this.emissiveMap = U.emissiveMap, this.emissiveIntensity = U.emissiveIntensity, this.bumpMap = U.bumpMap, this.bumpScale = U.bumpScale, this.normalMap = U.normalMap, this.normalMapType = U.normalMapType, this.normalScale.copy(U.normalScale), this.displacementMap = U.displacementMap, this.displacementScale = U.displacementScale, this.displacementBias = U.displacementBias, this.specularMap = U.specularMap, this.alphaMap = U.alphaMap, this.envMap = U.envMap, this.envMapRotation.copy(U.envMapRotation), this.combine = U.combine, this.reflectivity = U.reflectivity, this.refractionRatio = U.refractionRatio, this.wireframe = U.wireframe, this.wireframeLinewidth = U.wireframeLinewidth, this.wireframeLinecap = U.wireframeLinecap, this.wireframeLinejoin = U.wireframeLinejoin, this.flatShading = U.flatShading, this.fog = U.fog, this
    }
}

function VH(U, d, D) {
    if (!U || !D && U.constructor === d) return U;
    if (typeof d.BYTES_PER_ELEMENT === "number") return new d(U);
    return Array.prototype.slice.call(U)
}

function JE(U) {
    return ArrayBuffer.isView(U) && !(U instanceof DataView)
}
class f0 {
    constructor(U, d, D, $) {
        this.parameterPositions = U, this._cachedIndex = 0, this.resultBuffer = $ !== void 0 ? $ : new d.constructor(D), this.sampleValues = d, this.valueSize = D, this.settings = null, this.DefaultSettings_ = {}
    }
    evaluate(U) {
        let d = this.parameterPositions,
            D = this._cachedIndex,
            $ = d[D],
            H = d[D - 1];
        D: {
            U: {
                let P;d: {
                    $: if (!(U < $)) {
                        for (let T = D + 2;;) {
                            if ($ === void 0) {
                                if (U < H) break $;
                                return D = d.length, this._cachedIndex = D, this.copySampleValue_(D - 1)
                            }
                            if (D === T) break;
                            if (H = $, $ = d[++D], U < $) break U
                        }
                        P = d.length;
                        break d
                    }if (!(U >= H)) {
                        let T = d[1];
                        if (U < T) D = 2, H = T;
                        for (let R = D - 2;;) {
                            if (H === void 0) return this._cachedIndex = 0, this.copySampleValue_(0);
                            if (D === R) break;
                            if ($ = H, H = d[--D - 1], U >= H) break U
                        }
                        P = D, D = 0;
                        break d
                    }
                    break D
                }
                while (D < P) {
                    let T = D + P >>> 1;
                    if (U < d[T]) P = T;
                    else D = T + 1
                }
                if ($ = d[D], H = d[D - 1], H === void 0) return this._cachedIndex = 0,
                this.copySampleValue_(0);
                if ($ === void 0) return D = d.length,
                this._cachedIndex = D,
                this.copySampleValue_(D - 1)
            }
            this._cachedIndex = D,
            this.intervalChanged_(D, H, $)
        }
        return this.interpolate_(D, H, U, $)
    }
    getSettings_() {
        return this.settings || this.DefaultSettings_
    }
    copySampleValue_(U) {
        let d = this.resultBuffer,
            D = this.sampleValues,
            $ = this.valueSize,
            H = U * $;
        for (let P = 0; P !== $; ++P) d[P] = D[H + P];
        return d
    }
    interpolate_() {
        throw Error("call to abstract method")
    }
    intervalChanged_() {}
}
class g4 extends f0 {
    constructor(U, d, D, $) {
        super(U, d, D, $);
        this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, this._offsetNext = -0, this.DefaultSettings_ = {
            endingStart: 2400,
            endingEnd: 2400
        }
    }
    intervalChanged_(U, d, D) {
        let $ = this.parameterPositions,
            H = U - 2,
            P = U + 1,
            T = $[H],
            R = $[P];
        if (T === void 0) switch (this.getSettings_().endingStart) {
            case 2401:
                H = U, T = 2 * d - D;
                break;
            case 2402:
                H = $.length - 2, T = d + $[H] - $[H + 1];
                break;
            default:
                H = U, T = D
        }
        if (R === void 0) switch (this.getSettings_().endingEnd) {
            case 2401:
                P = U, R = 2 * D - d;
                break;
            case 2402:
                P = 1, R = D + $[1] - $[0];
                break;
            default:
                P = U - 1, R = d
        }
        let J = (D - d) * 0.5,
            Q = this.valueSize;
        this._weightPrev = J / (d - T), this._weightNext = J / (R - D), this._offsetPrev = H * Q, this._offsetNext = P * Q
    }
    interpolate_(U, d, D, $) {
        let H = this.resultBuffer,
            P = this.sampleValues,
            T = this.valueSize,
            R = U * T,
            J = R - T,
            Q = this._offsetPrev,
            M = this._offsetNext,
            S = this._weightPrev,
            B = this._weightNext,
            L = (D - d) / ($ - d),
            E = L * L,
            k = E * L,
            A = -S * k + 2 * S * E - S * L,
            j = (1 + S) * k + (-1.5 - 2 * S) * E + (-0.5 + S) * L + 1,
            C = (-1 - B) * k + (1.5 + B) * E + 0.5 * L,
            I = B * k - B * E;
        for (let Z = 0; Z !== T; ++Z) H[Z] = A * P[Q + Z] + j * P[J + Z] + C * P[R + Z] + I * P[M + Z];
        return H
    }
}
class w4 extends f0 {
    constructor(U, d, D, $) {
        super(U, d, D, $)
    }
    interpolate_(U, d, D, $) {
        let H = this.resultBuffer,
            P = this.sampleValues,
            T = this.valueSize,
            R = U * T,
            J = R - T,
            Q = (D - d) / ($ - d),
            M = 1 - Q;
        for (let S = 0; S !== T; ++S) H[S] = P[J + S] * M + P[R + S] * Q;
        return H
    }
}
class c4 extends f0 {
    constructor(U, d, D, $) {
        super(U, d, D, $)
    }
    interpolate_(U) {
        return this.copySampleValue_(U - 1)
    }
}
class ZD {
    constructor(U, d, D, $) {
        if (U === void 0) throw Error("THREE.KeyframeTrack: track name is undefined");
        if (d === void 0 || d.length === 0) throw Error("THREE.KeyframeTrack: no keyframes in track named " + U);
        this.name = U, this.times = VH(d, this.TimeBufferType), this.values = VH(D, this.ValueBufferType), this.setInterpolation($ || this.DefaultInterpolation)
    }
    static toJSON(U) {
        let d = U.constructor,
            D;
        if (d.toJSON !== this.toJSON) D = d.toJSON(U);
        else {
            D = {
                name: U.name,
                times: VH(U.times, Array),
                values: VH(U.values, Array)
            };
            let $ = U.getInterpolation();
            if ($ !== U.DefaultInterpolation) D.interpolation = $
        }
        return D.type = U.ValueTypeName, D
    }
    InterpolantFactoryMethodDiscrete(U) {
        return new c4(this.times, this.values, this.getValueSize(), U)
    }
    InterpolantFactoryMethodLinear(U) {
        return new w4(this.times, this.values, this.getValueSize(), U)
    }
    InterpolantFactoryMethodSmooth(U) {
        return new g4(this.times, this.values, this.getValueSize(), U)
    }
    setInterpolation(U) {
        let d;
        switch (U) {
            case 2300:
                d = this.InterpolantFactoryMethodDiscrete;
                break;
            case 2301:
                d = this.InterpolantFactoryMethodLinear;
                break;
            case 2302:
                d = this.InterpolantFactoryMethodSmooth;
                break
        }
        if (d === void 0) {
            let D = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
            if (this.createInterpolant === void 0)
                if (U !== this.DefaultInterpolation) this.setInterpolation(this.DefaultInterpolation);
                else throw Error(D);
            return console.warn("THREE.KeyframeTrack:", D), this
        }
        return this.createInterpolant = d, this
    }
    getInterpolation() {
        switch (this.createInterpolant) {
            case this.InterpolantFactoryMethodDiscrete:
                return 2300;
            case this.InterpolantFactoryMethodLinear:
                return 2301;
            case this.InterpolantFactoryMethodSmooth:
                return 2302
        }
    }
    getValueSize() {
        return this.values.length / this.times.length
    }
    shift(U) {
        if (U !== 0) {
            let d = this.times;
            for (let D = 0, $ = d.length; D !== $; ++D) d[D] += U
        }
        return this
    }
    scale(U) {
        if (U !== 1) {
            let d = this.times;
            for (let D = 0, $ = d.length; D !== $; ++D) d[D] *= U
        }
        return this
    }
    trim(U, d) {
        let D = this.times,
            $ = D.length,
            H = 0,
            P = $ - 1;
        while (H !== $ && D[H] < U) ++H;
        while (P !== -1 && D[P] > d) --P;
        if (++P, H !== 0 || P !== $) {
            if (H >= P) P = Math.max(P, 1), H = P - 1;
            let T = this.getValueSize();
            this.times = D.slice(H, P), this.values = this.values.slice(H * T, P * T)
        }
        return this
    }
    validate() {
        let U = !0,
            d = this.getValueSize();
        if (d - Math.floor(d) !== 0) console.error("THREE.KeyframeTrack: Invalid value size in track.", this), U = !1;
        let D = this.times,
            $ = this.values,
            H = D.length;
        if (H === 0) console.error("THREE.KeyframeTrack: Track is empty.", this), U = !1;
        let P = null;
        for (let T = 0; T !== H; T++) {
            let R = D[T];
            if (typeof R === "number" && isNaN(R)) {
                console.error("THREE.KeyframeTrack: Time is not a valid number.", this, T, R), U = !1;
                break
            }
            if (P !== null && P > R) {
                console.error("THREE.KeyframeTrack: Out of order keys.", this, T, R, P), U = !1;
                break
            }
            P = R
        }
        if ($ !== void 0) {
            if (JE($))
                for (let T = 0, R = $.length; T !== R; ++T) {
                    let J = $[T];
                    if (isNaN(J)) {
                        console.error("THREE.KeyframeTrack: Value is not a valid number.", this, T, J), U = !1;
                        break
                    }
                }
        }
        return U
    }
    optimize() {
        let U = this.times.slice(),
            d = this.values.slice(),
            D = this.getValueSize(),
            $ = this.getInterpolation() === 2302,
            H = U.length - 1,
            P = 1;
        for (let T = 1; T < H; ++T) {
            let R = !1,
                J = U[T],
                Q = U[T + 1];
            if (J !== Q && (T !== 1 || J !== U[0]))
                if (!$) {
                    let M = T * D,
                        S = M - D,
                        B = M + D;
                    for (let L = 0; L !== D; ++L) {
                        let E = d[M + L];
                        if (E !== d[S + L] || E !== d[B + L]) {
                            R = !0;
                            break
                        }
                    }
                } else R = !0;
            if (R) {
                if (T !== P) {
                    U[P] = U[T];
                    let M = T * D,
                        S = P * D;
                    for (let B = 0; B !== D; ++B) d[S + B] = d[M + B]
                }++P
            }
        }
        if (H > 0) {
            U[P] = U[H];
            for (let T = H * D, R = P * D, J = 0; J !== D; ++J) d[R + J] = d[T + J];
            ++P
        }
        if (P !== U.length) this.times = U.slice(0, P), this.values = d.slice(0, P * D);
        else this.times = U, this.values = d;
        return this
    }
    clone() {
        let U = this.times.slice(),
            d = this.values.slice(),
            $ = new this.constructor(this.name, U, d);
        return $.createInterpolant = this.createInterpolant, $
    }
}
ZD.prototype.TimeBufferType = Float32Array;
ZD.prototype.ValueBufferType = Float32Array;
ZD.prototype.DefaultInterpolation = 2301;
class v$ extends ZD {
    constructor(U, d, D) {
        super(U, d, D)
    }
}
v$.prototype.ValueTypeName = "bool";
v$.prototype.ValueBufferType = Array;
v$.prototype.DefaultInterpolation = 2300;
v$.prototype.InterpolantFactoryMethodLinear = void 0;
v$.prototype.InterpolantFactoryMethodSmooth = void 0;
class e4 extends ZD {}
e4.prototype.ValueTypeName = "color";
class v4 extends ZD {}
v4.prototype.ValueTypeName = "number";
class l4 extends f0 {
    constructor(U, d, D, $) {
        super(U, d, D, $)
    }
    interpolate_(U, d, D, $) {
        let H = this.resultBuffer,
            P = this.sampleValues,
            T = this.valueSize,
            R = (D - d) / ($ - d),
            J = U * T;
        for (let Q = J + T; J !== Q; J += 4) UD.slerpFlat(H, 0, P, J - T, P, J, R);
        return H
    }
}
class ET extends ZD {
    InterpolantFactoryMethodLinear(U) {
        return new l4(this.times, this.values, this.getValueSize(), U)
    }
}
ET.prototype.ValueTypeName = "quaternion";
ET.prototype.InterpolantFactoryMethodSmooth = void 0;
class l$ extends ZD {
    constructor(U, d, D) {
        super(U, d, D)
    }
}
l$.prototype.ValueTypeName = "string";
l$.prototype.ValueBufferType = Array;
l$.prototype.DefaultInterpolation = 2300;
l$.prototype.InterpolantFactoryMethodLinear = void 0;
l$.prototype.InterpolantFactoryMethodSmooth = void 0;
class y4 extends ZD {}
y4.prototype.ValueTypeName = "vector";
class o4 {
    constructor(U, d, D) {
        let $ = this,
            H = !1,
            P = 0,
            T = 0,
            R = void 0,
            J = [];
        this.onStart = void 0, this.onLoad = U, this.onProgress = d, this.onError = D, this.itemStart = function(Q) {
            if (T++, H === !1) {
                if ($.onStart !== void 0) $.onStart(Q, P, T)
            }
            H = !0
        }, this.itemEnd = function(Q) {
            if (P++, $.onProgress !== void 0) $.onProgress(Q, P, T);
            if (P === T) {
                if (H = !1, $.onLoad !== void 0) $.onLoad()
            }
        }, this.itemError = function(Q) {
            if ($.onError !== void 0) $.onError(Q)
        }, this.resolveURL = function(Q) {
            if (R) return R(Q);
            return Q
        }, this.setURLModifier = function(Q) {
            return R = Q, this
        }, this.addHandler = function(Q, M) {
            return J.push(Q, M), this
        }, this.removeHandler = function(Q) {
            let M = J.indexOf(Q);
            if (M !== -1) J.splice(M, 2);
            return this
        }, this.getHandler = function(Q) {
            for (let M = 0, S = J.length; M < S; M += 2) {
                let B = J[M],
                    L = J[M + 1];
                if (B.global) B.lastIndex = 0;
                if (B.test(Q)) return L
            }
            return null
        }
    }
}
var ME = new o4;
class n4 {
    constructor(U) {
        this.manager = U !== void 0 ? U : ME, this.crossOrigin = "anonymous", this.withCredentials = !1, this.path = "", this.resourcePath = "", this.requestHeader = {}
    }
    load() {}
    loadAsync(U, d) {
        let D = this;
        return new Promise(function($, H) {
            D.load(U, $, d, H)
        })
    }
    parse() {}
    setCrossOrigin(U) {
        return this.crossOrigin = U, this
    }
    setWithCredentials(U) {
        return this.withCredentials = U, this
    }
    setPath(U) {
        return this.path = U, this
    }
    setResourcePath(U) {
        return this.resourcePath = U, this
    }
    setRequestHeader(U) {
        return this.requestHeader = U, this
    }
}
n4.DEFAULT_MATERIAL_NAME = "__DEFAULT";
class IT extends Xd {
    constructor(U, d = 1) {
        super();
        this.isLight = !0, this.type = "Light", this.color = new KU(U), this.intensity = d
    }
    dispose() {}
    copy(U, d) {
        return super.copy(U, d), this.color.copy(U.color), this.intensity = U.intensity, this
    }
    toJSON(U) {
        let d = super.toJSON(U);
        if (d.object.color = this.color.getHex(), d.object.intensity = this.intensity, this.groundColor !== void 0) d.object.groundColor = this.groundColor.getHex();
        if (this.distance !== void 0) d.object.distance = this.distance;
        if (this.angle !== void 0) d.object.angle = this.angle;
        if (this.decay !== void 0) d.object.decay = this.decay;
        if (this.penumbra !== void 0) d.object.penumbra = this.penumbra;
        if (this.shadow !== void 0) d.object.shadow = this.shadow.toJSON();
        if (this.target !== void 0) d.object.target = this.target.uuid;
        return d
    }
}
class kT extends IT {
    constructor(U, d, D) {
        super(U, D);
        this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(Xd.DEFAULT_UP), this.updateMatrix(), this.groundColor = new KU(d)
    }
    copy(U, d) {
        return super.copy(U, d), this.groundColor.copy(U.groundColor), this
    }
}
var cP = new Dd,
    tQ = new i,
    U4 = new i;
class s4 {
    constructor(U) {
        this.camera = U, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new dU(512, 512), this.map = null, this.mapPass = null, this.matrix = new Dd, this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new hH, this._frameExtents = new dU(1, 1), this._viewportCount = 1, this._viewports = [new ad(0, 0, 1, 1)]
    }
    getViewportCount() {
        return this._viewportCount
    }
    getFrustum() {
        return this._frustum
    }
    updateMatrices(U) {
        let d = this.camera,
            D = this.matrix;
        tQ.setFromMatrixPosition(U.matrixWorld), d.position.copy(tQ), U4.setFromMatrixPosition(U.target.matrixWorld), d.lookAt(U4), d.updateMatrixWorld(), cP.multiplyMatrices(d.projectionMatrix, d.matrixWorldInverse), this._frustum.setFromProjectionMatrix(cP), D.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1), D.multiply(cP)
    }
    getViewport(U) {
        return this._viewports[U]
    }
    getFrameExtents() {
        return this._frameExtents
    }
    dispose() {
        if (this.map) this.map.dispose();
        if (this.mapPass) this.mapPass.dispose()
    }
    copy(U) {
        return this.camera = U.camera.clone(), this.intensity = U.intensity, this.bias = U.bias, this.radius = U.radius, this.mapSize.copy(U.mapSize), this
    }
    clone() {
        return new this.constructor().copy(this)
    }
    toJSON() {
        let U = {};
        if (this.intensity !== 1) U.intensity = this.intensity;
        if (this.bias !== 0) U.bias = this.bias;
        if (this.normalBias !== 0) U.normalBias = this.normalBias;
        if (this.radius !== 1) U.radius = this.radius;
        if (this.mapSize.x !== 512 || this.mapSize.y !== 512) U.mapSize = this.mapSize.toArray();
        return U.camera = this.camera.toJSON(!1).object, delete U.camera.matrix, U
    }
}
class x4 extends s4 {
    constructor() {
        super(new F0(-5, 5, 5, -5, 0.5, 500));
        this.isDirectionalLightShadow = !0
    }
}
class ZT extends IT {
    constructor(U, d) {
        super(U, d);
        this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(Xd.DEFAULT_UP), this.updateMatrix(), this.target = new Xd, this.shadow = new x4
    }
    dispose() {
        this.shadow.dispose()
    }
    copy(U) {
        return super.copy(U), this.target = U.target.clone(), this.shadow = U.shadow.clone(), this
    }
}
var aT = "\\[\\]\\.:\\/",
    BE = new RegExp("[" + aT + "]", "g"),
    YT = "[^" + aT + "]",
    LE = "[^" + aT.replace("\\.", "") + "]",
    AE = /((?:WC+[\/:])*)/.source.replace("WC", YT),
    jE = /(WCOD+)?/.source.replace("WCOD", LE),
    EE = /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", YT),
    IE = /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", YT),
    kE = new RegExp("^" + AE + jE + EE + IE + "$"),
    ZE = ["material", "materials", "bones", "map"];
class r4 {
    constructor(U, d, D) {
        let $ = D || Sd.parseTrackName(d);
        this._targetGroup = U, this._bindings = U.subscribe_(d, $)
    }
    getValue(U, d) {
        this.bind();
        let D = this._targetGroup.nCachedObjects_,
            $ = this._bindings[D];
        if ($ !== void 0) $.getValue(U, d)
    }
    setValue(U, d) {
        let D = this._bindings;
        for (let $ = this._targetGroup.nCachedObjects_, H = D.length; $ !== H; ++$) D[$].setValue(U, d)
    }
    bind() {
        let U = this._bindings;
        for (let d = this._targetGroup.nCachedObjects_, D = U.length; d !== D; ++d) U[d].bind()
    }
    unbind() {
        let U = this._bindings;
        for (let d = this._targetGroup.nCachedObjects_, D = U.length; d !== D; ++d) U[d].unbind()
    }
}
class Sd {
    constructor(U, d, D) {
        this.path = d, this.parsedPath = D || Sd.parseTrackName(d), this.node = Sd.findNode(U, this.parsedPath.nodeName), this.rootNode = U, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound
    }
    static create(U, d, D) {
        if (!(U && U.isAnimationObjectGroup)) return new Sd(U, d, D);
        else return new Sd.Composite(U, d, D)
    }
    static sanitizeNodeName(U) {
        return U.replace(/\s/g, "_").replace(BE, "")
    }
    static parseTrackName(U) {
        let d = kE.exec(U);
        if (d === null) throw Error("PropertyBinding: Cannot parse trackName: " + U);
        let D = {
                nodeName: d[2],
                objectName: d[3],
                objectIndex: d[4],
                propertyName: d[5],
                propertyIndex: d[6]
            },
            $ = D.nodeName && D.nodeName.lastIndexOf(".");
        if ($ !== void 0 && $ !== -1) {
            let H = D.nodeName.substring($ + 1);
            if (ZE.indexOf(H) !== -1) D.nodeName = D.nodeName.substring(0, $), D.objectName = H
        }
        if (D.propertyName === null || D.propertyName.length === 0) throw Error("PropertyBinding: can not parse propertyName from trackName: " + U);
        return D
    }
    static findNode(U, d) {
        if (d === void 0 || d === "" || d === "." || d === -1 || d === U.name || d === U.uuid) return U;
        if (U.skeleton) {
            let D = U.skeleton.getBoneByName(d);
            if (D !== void 0) return D
        }
        if (U.children) {
            let D = function(H) {
                    for (let P = 0; P < H.length; P++) {
                        let T = H[P];
                        if (T.name === d || T.uuid === d) return T;
                        let R = D(T.children);
                        if (R) return R
                    }
                    return null
                },
                $ = D(U.children);
            if ($) return $
        }
        return null
    }
    _getValue_unavailable() {}
    _setValue_unavailable() {}
    _getValue_direct(U, d) {
        U[d] = this.targetObject[this.propertyName]
    }
    _getValue_array(U, d) {
        let D = this.resolvedProperty;
        for (let $ = 0, H = D.length; $ !== H; ++$) U[d++] = D[$]
    }
    _getValue_arrayElement(U, d) {
        U[d] = this.resolvedProperty[this.propertyIndex]
    }
    _getValue_toArray(U, d) {
        this.resolvedProperty.toArray(U, d)
    }
    _setValue_direct(U, d) {
        this.targetObject[this.propertyName] = U[d]
    }
    _setValue_direct_setNeedsUpdate(U, d) {
        this.targetObject[this.propertyName] = U[d], this.targetObject.needsUpdate = !0
    }
    _setValue_direct_setMatrixWorldNeedsUpdate(U, d) {
        this.targetObject[this.propertyName] = U[d], this.targetObject.matrixWorldNeedsUpdate = !0
    }
    _setValue_array(U, d) {
        let D = this.resolvedProperty;
        for (let $ = 0, H = D.length; $ !== H; ++$) D[$] = U[d++]
    }
    _setValue_array_setNeedsUpdate(U, d) {
        let D = this.resolvedProperty;
        for (let $ = 0, H = D.length; $ !== H; ++$) D[$] = U[d++];
        this.targetObject.needsUpdate = !0
    }
    _setValue_array_setMatrixWorldNeedsUpdate(U, d) {
        let D = this.resolvedProperty;
        for (let $ = 0, H = D.length; $ !== H; ++$) D[$] = U[d++];
        this.targetObject.matrixWorldNeedsUpdate = !0
    }
    _setValue_arrayElement(U, d) {
        this.resolvedProperty[this.propertyIndex] = U[d]
    }
    _setValue_arrayElement_setNeedsUpdate(U, d) {
        this.resolvedProperty[this.propertyIndex] = U[d], this.targetObject.needsUpdate = !0
    }
    _setValue_arrayElement_setMatrixWorldNeedsUpdate(U, d) {
        this.resolvedProperty[this.propertyIndex] = U[d], this.targetObject.matrixWorldNeedsUpdate = !0
    }
    _setValue_fromArray(U, d) {
        this.resolvedProperty.fromArray(U, d)
    }
    _setValue_fromArray_setNeedsUpdate(U, d) {
        this.resolvedProperty.fromArray(U, d), this.targetObject.needsUpdate = !0
    }
    _setValue_fromArray_setMatrixWorldNeedsUpdate(U, d) {
        this.resolvedProperty.fromArray(U, d), this.targetObject.matrixWorldNeedsUpdate = !0
    }
    _getValue_unbound(U, d) {
        this.bind(), this.getValue(U, d)
    }
    _setValue_unbound(U, d) {
        this.bind(), this.setValue(U, d)
    }
    bind() {
        let U = this.node,
            d = this.parsedPath,
            D = d.objectName,
            $ = d.propertyName,
            H = d.propertyIndex;
        if (!U) U = Sd.findNode(this.rootNode, d.nodeName), this.node = U;
        if (this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !U) {
            console.warn("THREE.PropertyBinding: No target node found for track: " + this.path + ".");
            return
        }
        if (D) {
            let J = d.objectIndex;
            switch (D) {
                case "materials":
                    if (!U.material) {
                        console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
                        return
                    }
                    if (!U.material.materials) {
                        console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
                        return
                    }
                    U = U.material.materials;
                    break;
                case "bones":
                    if (!U.skeleton) {
                        console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
                        return
                    }
                    U = U.skeleton.bones;
                    for (let Q = 0; Q < U.length; Q++)
                        if (U[Q].name === J) {
                            J = Q;
                            break
                        } break;
                case "map":
                    if ("map" in U) {
                        U = U.map;
                        break
                    }
                    if (!U.material) {
                        console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
                        return
                    }
                    if (!U.material.map) {
                        console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
                        return
                    }
                    U = U.material.map;
                    break;
                default:
                    if (U[D] === void 0) {
                        console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.", this);
                        return
                    }
                    U = U[D]
            }
            if (J !== void 0) {
                if (U[J] === void 0) {
                    console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, U);
                    return
                }
                U = U[J]
            }
        }
        let P = U[$];
        if (P === void 0) {
            let J = d.nodeName;
            console.error("THREE.PropertyBinding: Trying to update property for track: " + J + "." + $ + " but it wasn't found.", U);
            return
        }
        let T = this.Versioning.None;
        if (this.targetObject = U, U.needsUpdate !== void 0) T = this.Versioning.NeedsUpdate;
        else if (U.matrixWorldNeedsUpdate !== void 0) T = this.Versioning.MatrixWorldNeedsUpdate;
        let R = this.BindingType.Direct;
        if (H !== void 0) {
            if ($ === "morphTargetInfluences") {
                if (!U.geometry) {
                    console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
                    return
                }
                if (!U.geometry.morphAttributes) {
                    console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
                    return
                }
                if (U.morphTargetDictionary[H] !== void 0) H = U.morphTargetDictionary[H]
            }
            R = this.BindingType.ArrayElement, this.resolvedProperty = P, this.propertyIndex = H
        } else if (P.fromArray !== void 0 && P.toArray !== void 0) R = this.BindingType.HasFromToArray, this.resolvedProperty = P;
        else if (Array.isArray(P)) R = this.BindingType.EntireArray, this.resolvedProperty = P;
        else this.propertyName = $;
        this.getValue = this.GetterByBindingType[R], this.setValue = this.SetterByBindingTypeAndVersioning[R][T]
    }
    unbind() {
        this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound
    }
}
Sd.Composite = r4;
Sd.prototype.BindingType = {
    Direct: 0,
    EntireArray: 1,
    ArrayElement: 2,
    HasFromToArray: 3
};
Sd.prototype.Versioning = {
    None: 0,
    NeedsUpdate: 1,
    MatrixWorldNeedsUpdate: 2
};
Sd.prototype.GetterByBindingType = [Sd.prototype._getValue_direct, Sd.prototype._getValue_array, Sd.prototype._getValue_arrayElement, Sd.prototype._getValue_toArray];
Sd.prototype.SetterByBindingTypeAndVersioning = [
    [Sd.prototype._setValue_direct, Sd.prototype._setValue_direct_setNeedsUpdate, Sd.prototype._setValue_direct_setMatrixWorldNeedsUpdate],
    [Sd.prototype._setValue_array, Sd.prototype._setValue_array_setNeedsUpdate, Sd.prototype._setValue_array_setMatrixWorldNeedsUpdate],
    [Sd.prototype._setValue_arrayElement, Sd.prototype._setValue_arrayElement_setNeedsUpdate, Sd.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],
    [Sd.prototype._setValue_fromArray, Sd.prototype._setValue_fromArray_setNeedsUpdate, Sd.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]
];
var a2 = new Float32Array(1);
var d4 = new Dd;
class XT {
    constructor(U, d, D = 0, $ = 1 / 0) {
        this.ray = new q$(U, d), this.near = D, this.far = $, this.camera = null, this.layers = new fH, this.params = {
            Mesh: {},
            Line: {
                threshold: 1
            },
            LOD: {},
            Points: {
                threshold: 1
            },
            Sprite: {}
        }
    }
    set(U, d) {
        this.ray.set(U, d)
    }
    setFromCamera(U, d) {
        if (d.isPerspectiveCamera) this.ray.origin.setFromMatrixPosition(d.matrixWorld), this.ray.direction.set(U.x, U.y, 0.5).unproject(d).sub(this.ray.origin).normalize(), this.camera = d;
        else if (d.isOrthographicCamera) this.ray.origin.set(U.x, U.y, (d.near + d.far) / (d.near - d.far)).unproject(d), this.ray.direction.set(0, 0, -1).transformDirection(d.matrixWorld), this.camera = d;
        else console.error("THREE.Raycaster: Unsupported camera type: " + d.type)
    }
    setFromXRController(U) {
        return d4.identity().extractRotation(U.matrixWorld), this.ray.origin.setFromMatrixPosition(U.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(d4), this
    }
    intersectObject(U, d = !0, D = []) {
        return rP(U, this, D, d), D.sort(D4), D
    }
    intersectObjects(U, d = !0, D = []) {
        for (let $ = 0, H = U.length; $ < H; $++) rP(U[$], this, D, d);
        return D.sort(D4), D
    }
}

function D4(U, d) {
    return U.distance - d.distance
}

function rP(U, d, D, $) {
    let H = !0;
    if (U.layers.test(d.layers)) {
        if (U.raycast(d, D) === !1) H = !1
    }
    if (H === !0 && $ === !0) {
        let P = U.children;
        for (let T = 0, R = P.length; T < R; T++) rP(P[T], d, D, !0)
    }
}
class wH {
    constructor(U = 1, d = 0, D = 0) {
        return this.radius = U, this.phi = d, this.theta = D, this
    }
    set(U, d, D) {
        return this.radius = U, this.phi = d, this.theta = D, this
    }
    copy(U) {
        return this.radius = U.radius, this.phi = U.phi, this.theta = U.theta, this
    }
    makeSafe() {
        return this.phi = Math.max(0.000001, Math.min(Math.PI - 0.000001, this.phi)), this
    }
    setFromVector3(U) {
        return this.setFromCartesianCoords(U.x, U.y, U.z)
    }
    setFromCartesianCoords(U, d, D) {
        if (this.radius = Math.sqrt(U * U + d * d + D * D), this.radius === 0) this.theta = 0, this.phi = 0;
        else this.theta = Math.atan2(U, D), this.phi = Math.acos(bd(d / this.radius, -1, 1));
        return this
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
class VT extends nD {
    constructor(U, d = null) {
        super();
        this.object = U, this.domElement = d, this.enabled = !0, this.state = -1, this.keys = {}, this.mouseButtons = {
            LEFT: null,
            MIDDLE: null,
            RIGHT: null
        }, this.touches = {
            ONE: null,
            TWO: null
        }
    }
    connect() {}
    disconnect() {}
    dispose() {}
    update() {}
}
if (typeof __THREE_DEVTOOLS__ < "u") __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", {
    detail: {
        revision: "170"
    }
}));
if (typeof window < "u")
    if (window.__THREE__) console.warn("WARNING: Multiple instances of Three.js being imported.");
    else window.__THREE__ = "170";
var t4 = {
        type: "change"
    },
    CT = {
        type: "start"
    },
    dS = {
        type: "end"
    },
    cH = new q$,
    US = new ED,
    aE = Math.cos(70 * P4.DEG2RAD),
    fd = new i,
    ed = 2 * Math.PI,
    Jd = {
        NONE: -1,
        ROTATE: 0,
        DOLLY: 1,
        PAN: 2,
        TOUCH_ROTATE: 3,
        TOUCH_PAN: 4,
        TOUCH_DOLLY_PAN: 5,
        TOUCH_DOLLY_ROTATE: 6
    },
    FT = 0.000001;
class KT extends VT {
    constructor(U, d = null) {
        super(U, d);
        if (this.state = Jd.NONE, this.enabled = !0, this.target = new i, this.cursor = new i, this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = {
                LEFT: "ArrowLeft",
                UP: "ArrowUp",
                RIGHT: "ArrowRight",
                BOTTOM: "ArrowDown"
            }, this.mouseButtons = {
                LEFT: SD.ROTATE,
                MIDDLE: SD.DOLLY,
                RIGHT: SD.PAN
            }, this.touches = {
                ONE: JD.ROTATE,
                TWO: JD.DOLLY_PAN
            }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new i, this._lastQuaternion = new UD, this._lastTargetPosition = new i, this._quat = new UD().setFromUnitVectors(U.up, new i(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new wH, this._sphericalDelta = new wH, this._scale = 1, this._panOffset = new i, this._rotateStart = new dU, this._rotateEnd = new dU, this._rotateDelta = new dU, this._panStart = new dU, this._panEnd = new dU, this._panDelta = new dU, this._dollyStart = new dU, this._dollyEnd = new dU, this._dollyDelta = new dU, this._dollyDirection = new i, this._mouse = new dU, this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = XE.bind(this), this._onPointerDown = YE.bind(this), this._onPointerUp = VE.bind(this), this._onContextMenu = iE.bind(this), this._onMouseWheel = KE.bind(this), this._onKeyDown = fE.bind(this), this._onTouchStart = hE.bind(this), this._onTouchMove = bE.bind(this), this._onMouseDown = FE.bind(this), this._onMouseMove = CE.bind(this), this._interceptControlDown = OE.bind(this), this._interceptControlUp = WE.bind(this), this.domElement !== null) this.connect();
        this.update()
    }
    connect() {
        this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointercancel", this._onPointerUp), this.domElement.addEventListener("contextmenu", this._onContextMenu), this.domElement.addEventListener("wheel", this._onMouseWheel, {
            passive: !1
        }), this.domElement.getRootNode().addEventListener("keydown", this._interceptControlDown, {
            passive: !0,
            capture: !0
        }), this.domElement.style.touchAction = "none"
    }
    disconnect() {
        this.domElement.removeEventListener("pointerdown", this._onPointerDown), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.domElement.removeEventListener("pointercancel", this._onPointerUp), this.domElement.removeEventListener("wheel", this._onMouseWheel), this.domElement.removeEventListener("contextmenu", this._onContextMenu), this.stopListenToKeyEvents(), this.domElement.getRootNode().removeEventListener("keydown", this._interceptControlDown, {
            capture: !0
        }), this.domElement.style.touchAction = "auto"
    }
    dispose() {
        this.disconnect()
    }
    getPolarAngle() {
        return this._spherical.phi
    }
    getAzimuthalAngle() {
        return this._spherical.theta
    }
    getDistance() {
        return this.object.position.distanceTo(this.target)
    }
    listenToKeyEvents(U) {
        U.addEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = U
    }
    stopListenToKeyEvents() {
        if (this._domElementKeyEvents !== null) this._domElementKeyEvents.removeEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = null
    }
    saveState() {
        this.target0.copy(this.target), this.position0.copy(this.object.position), this.zoom0 = this.object.zoom
    }
    reset() {
        this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(t4), this.update(), this.state = Jd.NONE
    }
    update(U = null) {
        let d = this.object.position;
        if (fd.copy(d).sub(this.target), fd.applyQuaternion(this._quat), this._spherical.setFromVector3(fd), this.autoRotate && this.state === Jd.NONE) this._rotateLeft(this._getAutoRotationAngle(U));
        if (this.enableDamping) this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor;
        else this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi;
        let D = this.minAzimuthAngle,
            $ = this.maxAzimuthAngle;
        if (isFinite(D) && isFinite($)) {
            if (D < -Math.PI) D += ed;
            else if (D > Math.PI) D -= ed;
            if ($ < -Math.PI) $ += ed;
            else if ($ > Math.PI) $ -= ed;
            if (D <= $) this._spherical.theta = Math.max(D, Math.min($, this._spherical.theta));
            else this._spherical.theta = this._spherical.theta > (D + $) / 2 ? Math.max(D, this._spherical.theta) : Math.min($, this._spherical.theta)
        }
        if (this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0) this.target.addScaledVector(this._panOffset, this.dampingFactor);
        else this.target.add(this._panOffset);
        this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
        let H = !1;
        if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) this._spherical.radius = this._clampDistance(this._spherical.radius);
        else {
            let P = this._spherical.radius;
            this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), H = P != this._spherical.radius
        }
        if (fd.setFromSpherical(this._spherical), fd.applyQuaternion(this._quatInverse), d.copy(this.target).add(fd), this.object.lookAt(this.target), this.enableDamping === !0) this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor);
        else this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0);
        if (this.zoomToCursor && this._performCursorZoom) {
            let P = null;
            if (this.object.isPerspectiveCamera) {
                let T = fd.length();
                P = this._clampDistance(T * this._scale);
                let R = T - P;
                this.object.position.addScaledVector(this._dollyDirection, R), this.object.updateMatrixWorld(), H = !!R
            } else if (this.object.isOrthographicCamera) {
                let T = new i(this._mouse.x, this._mouse.y, 0);
                T.unproject(this.object);
                let R = this.object.zoom;
                this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), H = R !== this.object.zoom;
                let J = new i(this._mouse.x, this._mouse.y, 0);
                J.unproject(this.object), this.object.position.sub(J).add(T), this.object.updateMatrixWorld(), P = fd.length()
            } else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
            if (P !== null)
                if (this.screenSpacePanning) this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(P).add(this.object.position);
                else if (cH.origin.copy(this.object.position), cH.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(cH.direction)) < aE) this.object.lookAt(this.target);
            else US.setFromNormalAndCoplanarPoint(this.object.up, this.target), cH.intersectPlane(US, this.target)
        } else if (this.object.isOrthographicCamera) {
            let P = this.object.zoom;
            if (this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), P !== this.object.zoom) this.object.updateProjectionMatrix(), H = !0
        }
        if (this._scale = 1, this._performCursorZoom = !1, H || this._lastPosition.distanceToSquared(this.object.position) > FT || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > FT || this._lastTargetPosition.distanceToSquared(this.target) > FT) return this.dispatchEvent(t4), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0;
        return !1
    }
    _getAutoRotationAngle(U) {
        if (U !== null) return ed / 60 * this.autoRotateSpeed * U;
        else return ed / 60 / 60 * this.autoRotateSpeed
    }
    _getZoomScale(U) {
        let d = Math.abs(U * 0.01);
        return Math.pow(0.95, this.zoomSpeed * d)
    }
    _rotateLeft(U) {
        this._sphericalDelta.theta -= U
    }
    _rotateUp(U) {
        this._sphericalDelta.phi -= U
    }
    _panLeft(U, d) {
        fd.setFromMatrixColumn(d, 0), fd.multiplyScalar(-U), this._panOffset.add(fd)
    }
    _panUp(U, d) {
        if (this.screenSpacePanning === !0) fd.setFromMatrixColumn(d, 1);
        else fd.setFromMatrixColumn(d, 0), fd.crossVectors(this.object.up, fd);
        fd.multiplyScalar(U), this._panOffset.add(fd)
    }
    _pan(U, d) {
        let D = this.domElement;
        if (this.object.isPerspectiveCamera) {
            let $ = this.object.position;
            fd.copy($).sub(this.target);
            let H = fd.length();
            H *= Math.tan(this.object.fov / 2 * Math.PI / 180), this._panLeft(2 * U * H / D.clientHeight, this.object.matrix), this._panUp(2 * d * H / D.clientHeight, this.object.matrix)
        } else if (this.object.isOrthographicCamera) this._panLeft(U * (this.object.right - this.object.left) / this.object.zoom / D.clientWidth, this.object.matrix), this._panUp(d * (this.object.top - this.object.bottom) / this.object.zoom / D.clientHeight, this.object.matrix);
        else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), this.enablePan = !1
    }
    _dollyOut(U) {
        if (this.object.isPerspectiveCamera || this.object.isOrthographicCamera) this._scale /= U;
        else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1
    }
    _dollyIn(U) {
        if (this.object.isPerspectiveCamera || this.object.isOrthographicCamera) this._scale *= U;
        else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1
    }
    _updateZoomParameters(U, d) {
        if (!this.zoomToCursor) return;
        this._performCursorZoom = !0;
        let D = this.domElement.getBoundingClientRect(),
            $ = U - D.left,
            H = d - D.top,
            P = D.width,
            T = D.height;
        this._mouse.x = $ / P * 2 - 1, this._mouse.y = -(H / T) * 2 + 1, this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize()
    }
    _clampDistance(U) {
        return Math.max(this.minDistance, Math.min(this.maxDistance, U))
    }
    _handleMouseDownRotate(U) {
        this._rotateStart.set(U.clientX, U.clientY)
    }
    _handleMouseDownDolly(U) {
        this._updateZoomParameters(U.clientX, U.clientX), this._dollyStart.set(U.clientX, U.clientY)
    }
    _handleMouseDownPan(U) {
        this._panStart.set(U.clientX, U.clientY)
    }
    _handleMouseMoveRotate(U) {
        this._rotateEnd.set(U.clientX, U.clientY), this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
        let d = this.domElement;
        this._rotateLeft(ed * this._rotateDelta.x / d.clientHeight), this._rotateUp(ed * this._rotateDelta.y / d.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update()
    }
    _handleMouseMoveDolly(U) {
        if (this._dollyEnd.set(U.clientX, U.clientY), this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart), this._dollyDelta.y > 0) this._dollyOut(this._getZoomScale(this._dollyDelta.y));
        else if (this._dollyDelta.y < 0) this._dollyIn(this._getZoomScale(this._dollyDelta.y));
        this._dollyStart.copy(this._dollyEnd), this.update()
    }
    _handleMouseMovePan(U) {
        this._panEnd.set(U.clientX, U.clientY), this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd), this.update()
    }
    _handleMouseWheel(U) {
        if (this._updateZoomParameters(U.clientX, U.clientY), U.deltaY < 0) this._dollyIn(this._getZoomScale(U.deltaY));
        else if (U.deltaY > 0) this._dollyOut(this._getZoomScale(U.deltaY));
        this.update()
    }
    _handleKeyDown(U) {
        let d = !1;
        switch (U.code) {
            case this.keys.UP:
                if (U.ctrlKey || U.metaKey || U.shiftKey) this._rotateUp(ed * this.rotateSpeed / this.domElement.clientHeight);
                else this._pan(0, this.keyPanSpeed);
                d = !0;
                break;
            case this.keys.BOTTOM:
                if (U.ctrlKey || U.metaKey || U.shiftKey) this._rotateUp(-ed * this.rotateSpeed / this.domElement.clientHeight);
                else this._pan(0, -this.keyPanSpeed);
                d = !0;
                break;
            case this.keys.LEFT:
                if (U.ctrlKey || U.metaKey || U.shiftKey) this._rotateLeft(ed * this.rotateSpeed / this.domElement.clientHeight);
                else this._pan(this.keyPanSpeed, 0);
                d = !0;
                break;
            case this.keys.RIGHT:
                if (U.ctrlKey || U.metaKey || U.shiftKey) this._rotateLeft(-ed * this.rotateSpeed / this.domElement.clientHeight);
                else this._pan(-this.keyPanSpeed, 0);
                d = !0;
                break
        }
        if (d) U.preventDefault(), this.update()
    }
    _handleTouchStartRotate(U) {
        if (this._pointers.length === 1) this._rotateStart.set(U.pageX, U.pageY);
        else {
            let d = this._getSecondPointerPosition(U),
                D = 0.5 * (U.pageX + d.x),
                $ = 0.5 * (U.pageY + d.y);
            this._rotateStart.set(D, $)
        }
    }
    _handleTouchStartPan(U) {
        if (this._pointers.length === 1) this._panStart.set(U.pageX, U.pageY);
        else {
            let d = this._getSecondPointerPosition(U),
                D = 0.5 * (U.pageX + d.x),
                $ = 0.5 * (U.pageY + d.y);
            this._panStart.set(D, $)
        }
    }
    _handleTouchStartDolly(U) {
        let d = this._getSecondPointerPosition(U),
            D = U.pageX - d.x,
            $ = U.pageY - d.y,
            H = Math.sqrt(D * D + $ * $);
        this._dollyStart.set(0, H)
    }
    _handleTouchStartDollyPan(U) {
        if (this.enableZoom) this._handleTouchStartDolly(U);
        if (this.enablePan) this._handleTouchStartPan(U)
    }
    _handleTouchStartDollyRotate(U) {
        if (this.enableZoom) this._handleTouchStartDolly(U);
        if (this.enableRotate) this._handleTouchStartRotate(U)
    }
    _handleTouchMoveRotate(U) {
        if (this._pointers.length == 1) this._rotateEnd.set(U.pageX, U.pageY);
        else {
            let D = this._getSecondPointerPosition(U),
                $ = 0.5 * (U.pageX + D.x),
                H = 0.5 * (U.pageY + D.y);
            this._rotateEnd.set($, H)
        }
        this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
        let d = this.domElement;
        this._rotateLeft(ed * this._rotateDelta.x / d.clientHeight), this._rotateUp(ed * this._rotateDelta.y / d.clientHeight), this._rotateStart.copy(this._rotateEnd)
    }
    _handleTouchMovePan(U) {
        if (this._pointers.length === 1) this._panEnd.set(U.pageX, U.pageY);
        else {
            let d = this._getSecondPointerPosition(U),
                D = 0.5 * (U.pageX + d.x),
                $ = 0.5 * (U.pageY + d.y);
            this._panEnd.set(D, $)
        }
        this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd)
    }
    _handleTouchMoveDolly(U) {
        let d = this._getSecondPointerPosition(U),
            D = U.pageX - d.x,
            $ = U.pageY - d.y,
            H = Math.sqrt(D * D + $ * $);
        this._dollyEnd.set(0, H), this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed)), this._dollyOut(this._dollyDelta.y), this._dollyStart.copy(this._dollyEnd);
        let P = (U.pageX + d.x) * 0.5,
            T = (U.pageY + d.y) * 0.5;
        this._updateZoomParameters(P, T)
    }
    _handleTouchMoveDollyPan(U) {
        if (this.enableZoom) this._handleTouchMoveDolly(U);
        if (this.enablePan) this._handleTouchMovePan(U)
    }
    _handleTouchMoveDollyRotate(U) {
        if (this.enableZoom) this._handleTouchMoveDolly(U);
        if (this.enableRotate) this._handleTouchMoveRotate(U)
    }
    _addPointer(U) {
        this._pointers.push(U.pointerId)
    }
    _removePointer(U) {
        delete this._pointerPositions[U.pointerId];
        for (let d = 0; d < this._pointers.length; d++)
            if (this._pointers[d] == U.pointerId) {
                this._pointers.splice(d, 1);
                return
            }
    }
    _isTrackingPointer(U) {
        for (let d = 0; d < this._pointers.length; d++)
            if (this._pointers[d] == U.pointerId) return !0;
        return !1
    }
    _trackPointer(U) {
        let d = this._pointerPositions[U.pointerId];
        if (d === void 0) d = new dU, this._pointerPositions[U.pointerId] = d;
        d.set(U.pageX, U.pageY)
    }
    _getSecondPointerPosition(U) {
        let d = U.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
        return this._pointerPositions[d]
    }
    _customWheelEvent(U) {
        let d = U.deltaMode,
            D = {
                clientX: U.clientX,
                clientY: U.clientY,
                deltaY: U.deltaY
            };
        switch (d) {
            case 1:
                D.deltaY *= 16;
                break;
            case 2:
                D.deltaY *= 100;
                break
        }
        if (U.ctrlKey && !this._controlActive) D.deltaY *= 10;
        return D
    }
}

function YE(U) {
    if (this.enabled === !1) return;
    if (this._pointers.length === 0) this.domElement.setPointerCapture(U.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp);
    if (this._isTrackingPointer(U)) return;
    if (this._addPointer(U), U.pointerType === "touch") this._onTouchStart(U);
    else this._onMouseDown(U)
}

function XE(U) {
    if (this.enabled === !1) return;
    if (U.pointerType === "touch") this._onTouchMove(U);
    else this._onMouseMove(U)
}

function VE(U) {
    switch (this._removePointer(U), this._pointers.length) {
        case 0:
            this.domElement.releasePointerCapture(U.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(dS), this.state = Jd.NONE;
            break;
        case 1:
            let d = this._pointers[0],
                D = this._pointerPositions[d];
            this._onTouchStart({
                pointerId: d,
                pageX: D.x,
                pageY: D.y
            });
            break
    }
}

function FE(U) {
    let d;
    switch (U.button) {
        case 0:
            d = this.mouseButtons.LEFT;
            break;
        case 1:
            d = this.mouseButtons.MIDDLE;
            break;
        case 2:
            d = this.mouseButtons.RIGHT;
            break;
        default:
            d = -1
    }
    switch (d) {
        case SD.DOLLY:
            if (this.enableZoom === !1) return;
            this._handleMouseDownDolly(U), this.state = Jd.DOLLY;
            break;
        case SD.ROTATE:
            if (U.ctrlKey || U.metaKey || U.shiftKey) {
                if (this.enablePan === !1) return;
                this._handleMouseDownPan(U), this.state = Jd.PAN
            } else {
                if (this.enableRotate === !1) return;
                this._handleMouseDownRotate(U), this.state = Jd.ROTATE
            }
            break;
        case SD.PAN:
            if (U.ctrlKey || U.metaKey || U.shiftKey) {
                if (this.enableRotate === !1) return;
                this._handleMouseDownRotate(U), this.state = Jd.ROTATE
            } else {
                if (this.enablePan === !1) return;
                this._handleMouseDownPan(U), this.state = Jd.PAN
            }
            break;
        default:
            this.state = Jd.NONE
    }
    if (this.state !== Jd.NONE) this.dispatchEvent(CT)
}

function CE(U) {
    switch (this.state) {
        case Jd.ROTATE:
            if (this.enableRotate === !1) return;
            this._handleMouseMoveRotate(U);
            break;
        case Jd.DOLLY:
            if (this.enableZoom === !1) return;
            this._handleMouseMoveDolly(U);
            break;
        case Jd.PAN:
            if (this.enablePan === !1) return;
            this._handleMouseMovePan(U);
            break
    }
}

function KE(U) {
    if (this.enabled === !1 || this.enableZoom === !1 || this.state !== Jd.NONE) return;
    U.preventDefault(), this.dispatchEvent(CT), this._handleMouseWheel(this._customWheelEvent(U)), this.dispatchEvent(dS)
}

function fE(U) {
    if (this.enabled === !1 || this.enablePan === !1) return;
    this._handleKeyDown(U)
}

function hE(U) {
    switch (this._trackPointer(U), this._pointers.length) {
        case 1:
            switch (this.touches.ONE) {
                case JD.ROTATE:
                    if (this.enableRotate === !1) return;
                    this._handleTouchStartRotate(U), this.state = Jd.TOUCH_ROTATE;
                    break;
                case JD.PAN:
                    if (this.enablePan === !1) return;
                    this._handleTouchStartPan(U), this.state = Jd.TOUCH_PAN;
                    break;
                default:
                    this.state = Jd.NONE
            }
            break;
        case 2:
            switch (this.touches.TWO) {
                case JD.DOLLY_PAN:
                    if (this.enableZoom === !1 && this.enablePan === !1) return;
                    this._handleTouchStartDollyPan(U), this.state = Jd.TOUCH_DOLLY_PAN;
                    break;
                case JD.DOLLY_ROTATE:
                    if (this.enableZoom === !1 && this.enableRotate === !1) return;
                    this._handleTouchStartDollyRotate(U), this.state = Jd.TOUCH_DOLLY_ROTATE;
                    break;
                default:
                    this.state = Jd.NONE
            }
            break;
        default:
            this.state = Jd.NONE
    }
    if (this.state !== Jd.NONE) this.dispatchEvent(CT)
}

function bE(U) {
    switch (this._trackPointer(U), this.state) {
        case Jd.TOUCH_ROTATE:
            if (this.enableRotate === !1) return;
            this._handleTouchMoveRotate(U), this.update();
            break;
        case Jd.TOUCH_PAN:
            if (this.enablePan === !1) return;
            this._handleTouchMovePan(U), this.update();
            break;
        case Jd.TOUCH_DOLLY_PAN:
            if (this.enableZoom === !1 && this.enablePan === !1) return;
            this._handleTouchMoveDollyPan(U), this.update();
            break;
        case Jd.TOUCH_DOLLY_ROTATE:
            if (this.enableZoom === !1 && this.enableRotate === !1) return;
            this._handleTouchMoveDollyRotate(U), this.update();
            break;
        default:
            this.state = Jd.NONE
    }
}

function iE(U) {
    if (this.enabled === !1) return;
    U.preventDefault()
}

function OE(U) {
    if (U.key === "Control") this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, {
        passive: !0,
        capture: !0
    })
}

function WE(U) {
    if (U.key === "Control") this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, {
        passive: !0,
        capture: !0
    })
}
var b0 = new i;

function dD(U, d, D, $, H, P) {
    let T = 2 * Math.PI * H / 4,
        R = Math.max(P - 2 * H, 0),
        J = Math.PI / 4;
    b0.copy(d), b0[$] = 0, b0.normalize();
    let Q = 0.5 * T / (T + R),
        M = 1 - b0.angleTo(U) / J;
    if (Math.sign(b0[D]) === 1) return M * Q;
    else return R / (T + R) + Q + Q * (1 - M)
}
class aD extends oU {
    constructor(U = 1, d = 1, D = 1, $ = 2, H = 0.1) {
        $ = $ * 2 + 1, H = Math.min(U / 2, d / 2, D / 2, H);
        super(1, 1, 1, $, $, $);
        if ($ === 1) return;
        let P = this.toNonIndexed();
        this.index = null, this.attributes.position = P.attributes.position, this.attributes.normal = P.attributes.normal, this.attributes.uv = P.attributes.uv;
        let T = new i,
            R = new i,
            J = new i(U, d, D).divideScalar(2).subScalar(H),
            Q = this.attributes.position.array,
            M = this.attributes.normal.array,
            S = this.attributes.uv.array,
            B = Q.length / 6,
            L = new i,
            E = 0.5 / $;
        for (let k = 0, A = 0; k < Q.length; k += 3, A += 2) switch (T.fromArray(Q, k), R.copy(T), R.x -= Math.sign(R.x) * E, R.y -= Math.sign(R.y) * E, R.z -= Math.sign(R.z) * E, R.normalize(), Q[k + 0] = J.x * Math.sign(T.x) + R.x * H, Q[k + 1] = J.y * Math.sign(T.y) + R.y * H, Q[k + 2] = J.z * Math.sign(T.z) + R.z * H, M[k + 0] = R.x, M[k + 1] = R.y, M[k + 2] = R.z, Math.floor(k / B)) {
            case 0:
                L.set(1, 0, 0), S[A + 0] = dD(L, R, "z", "y", H, D), S[A + 1] = 1 - dD(L, R, "y", "z", H, d);
                break;
            case 1:
                L.set(-1, 0, 0), S[A + 0] = 1 - dD(L, R, "z", "y", H, D), S[A + 1] = 1 - dD(L, R, "y", "z", H, d);
                break;
            case 2:
                L.set(0, 1, 0), S[A + 0] = 1 - dD(L, R, "x", "z", H, U), S[A + 1] = dD(L, R, "z", "x", H, D);
                break;
            case 3:
                L.set(0, -1, 0), S[A + 0] = 1 - dD(L, R, "x", "z", H, U), S[A + 1] = 1 - dD(L, R, "z", "x", H, D);
                break;
            case 4:
                L.set(0, 0, 1), S[A + 0] = 1 - dD(L, R, "x", "y", H, U), S[A + 1] = 1 - dD(L, R, "y", "x", H, d);
                break;
            case 5:
                L.set(0, 0, -1), S[A + 0] = dD(L, R, "x", "y", H, U), S[A + 1] = 1 - dD(L, R, "y", "x", H, d);
                break
        }
    }
}
var DS = new Map,
    GE = new oU(1, 1, 1);

function rU(U, d = 0.85, D = 0) {
    let $ = `${U}:${d}:${D}`,
        H = DS.get($);
    if (!H) H = new zD({
        color: U,
        roughness: d,
        metalness: D
    }), DS.set($, H);
    return H
}

function Md(U, d, D, $) {
    let H = new _U(d, D);
    return H.position.set(...$), H.castShadow = !0, H.receiveShadow = !0, U.add(H), H
}

function qU(U, d, D, $) {
    let H = Md(U, GE, d, $);
    return H.scale.set(...D), H
}

function id(U, d, D = 0) {
    let $ = Math.sin(U * 127.1 + d * 311.7 + D * 74.7) * 43758.5453;
    return $ - Math.floor($)
}

function $S(U, d, D) {
    let $ = new uH;
    $.moveTo(-U / 2, 0), $.lineTo(U / 2, 0), $.lineTo(0, D), $.closePath();
    let H = new zH($, {
        depth: d,
        bevelEnabled: !1,
        steps: 1
    });
    return H.translate(0, 0, -d / 2), H
}

function eH(U) {
    let d = new Map;
    U.updateMatrixWorld(!0), U.traverse((H) => {
        if (!(H instanceof _U) || H instanceof xD || Array.isArray(H.material)) return;
        let P = `${H.geometry.uuid}:${H.material.uuid}:${H.castShadow}:${H.receiveShadow}`,
            T = d.get(P) ?? [];
        T.push(H), d.set(P, T)
    });
    let D = U.matrixWorld.clone().invert(),
        $ = new Dd;
    for (let H of d.values()) {
        if (H.length < 2) continue;
        let P = H[0],
            T = new xD(P.geometry, P.material, H.length);
        T.castShadow = P.castShadow, T.receiveShadow = P.receiveShadow, H.forEach((R, J) => {
            $.multiplyMatrices(D, R.matrixWorld), T.setMatrixAt(J, $), R.removeFromParent()
        }), T.instanceMatrix.needsUpdate = !0, T.computeBoundingSphere(), U.add(T)
    }
}
var RS = new K0(1, 1),
    O0 = new K0(1, 0),
    HS = new cd(0.085, 0.13, 1.2, 7),
    B$ = new cd(1, 1, 1, 28),
    PS = new oU(1, 1, 1),
    mE = new M$(1, 1, 5),
    rD = rU(13156776),
    i0 = rU(14273449),
    lH = rU(11041360),
    nd = rU(15656142),
    TS = rU(3755336, 0.65, 0.3),
    fT = rU(6600881, 0.2, 0.15),
    W0 = [
        [6128733, 8430443, 10138489],
        [4157794, 6001008, 8039296],
        [8753743, 10660709, 12040825],
        [7179888, 9547142, 11321749]
    ].map((U) => U.map((d) => rU(d))),
    _E = W0.flat().map((U) => U.color.clone());

function QS(U, d) {
    W0.flat().forEach((D, $) => D.color.copy(_E[$]).lerp(U, d))
}

function o$(U, d, D, $) {
    if (!$.length) return;
    let H = new xD(d, D, $.length),
        P = new Xd;
    $.forEach((T, R) => {
        if (P.position.set(T.x, T.y, T.z), P.scale.set(T.sx, T.sy, T.sz), P.rotation.set(0, T.rotation ?? 0, 0), P.updateMatrix(), H.setMatrixAt(R, P.matrix), T.color !== void 0) H.setColorAt(R, new KU(T.color))
    }), H.castShadow = !0, H.receiveShadow = !0, U.add(H)
}

function n$(U, d, D = 0) {
    let $ = new Ld,
        H = W0[Math.floor(id(U, d, D + 5) * W0.length)];
    Md($, HS, rU(8020038), [0, 0.67, 0]);
    let P = Md($, HS, rU(8020038), [0.17, 1.05, 0]);
    return P.scale.set(0.58, 0.48, 0.58), P.rotation.z = -0.65, [
        [0, 1.98, 0, 0.67, 0.86, 0.64],
        [-0.4, 1.62, 0.08, 0.59, 0.62, 0.57],
        [0.38, 1.72, -0.02, 0.6, 0.67, 0.58]
    ].forEach(([R, J, Q, M, S, B], L) => {
        let E = Md($, RS, H[L], [R, J, Q]);
        E.scale.set(M, S, B), E.rotation.set(id(U, d, L) * 0.5, id(U, d, L + 2) * 2, 0.12)
    }), $.scale.setScalar(0.84 + id(U, d, D + 8) * 0.2), $.rotation.y = id(U, d, D + 9) * Math.PI * 2, $.position.set(U, 0, d), $
}

function vH(U, d, D, $ = 0) {
    let H = new Ld;
    for (let P of [-0.38, 0.38]) qU(H, TS, [0.075, 0.43, 0.35], [P, 0.36, 0]), qU(H, TS, [0.06, 0.43, 0.06], [P, 0.62, -0.15]);
    for (let P of [-0.1, 0.03, 0.16]) qU(H, lH, [1.05, 0.065, 0.11], [0, 0.58, P]);
    for (let P of [0.76, 0.91]) qU(H, lH, [1.05, 0.11, 0.06], [0, P, -0.16]);
    H.position.set(d, 0, D), H.rotation.y = $, U.add(H)
}

function y$(U, d, D, $, H, P) {
    qU(U, rD, [$, 0.2, H], [d, 0.24, D]), qU(U, rU(6772802), [$ - 0.1, 0.04, H - 0.1], [d, 0.36, D]);
    let T = [],
        R = [];
    for (let J = 0; J < 18; J++) {
        let Q = d + (id(P, J, 1) - 0.5) * ($ - 0.2),
            M = D + (id(P, J, 2) - 0.5) * (H - 0.16);
        T.push({
            x: Q,
            y: 0.44,
            z: M,
            sx: 0.11,
            sy: 0.12,
            sz: 0.1
        }), R.push({
            x: Q,
            y: 0.53 + id(P, J, 3) * 0.1,
            z: M,
            sx: 0.07,
            sy: 0.07,
            sz: 0.07,
            color: [15118447, 14254455, 15851195, 12817842][J % 4]
        })
    }
    o$(U, O0, rU(5536079), T), o$(U, O0, rU(16777215), R)
}

function SS(U) {
    let d = new Ld,
        {
            w: D,
            d: $
        } = U;
    if (d.position.set(U.x + D / 2 - 0.5, 0, U.z + $ / 2 - 0.5), qU(d, rD, [D, 0.18, $], [0, 0.09, 0]), qU(d, rU(U.kind === "farm" ? 8228682 : 5937732), [D - 0.12, 0.04, $ - 0.12], [0, 0.2, 0]), U.kind === "farm") {
        let H = U.name === "Orchard";
        qU(d, i0, [0.65, 0.035, $ - 0.25], [H ? -0.8 : 0.35, 0.24, 0]);
        let P = [],
            T = [];
        if (H) {
            for (let A of [-D * 0.31, 0, D * 0.31])
                for (let j of [-$ * 0.28, 0.1]) {
                    let C = n$(A, j, 18);
                    C.scale.multiplyScalar(0.88), d.add(C);
                    for (let I = 0; I < 5; I++) {
                        let Z = I / 5 * Math.PI * 2;
                        T.push({
                            x: A + Math.cos(Z) * 0.48,
                            y: 1.56 + Math.sin(Z * 2) * 0.16,
                            z: j + Math.sin(Z) * 0.48,
                            sx: 0.09,
                            sy: 0.105,
                            sz: 0.09
                        })
                    }
                }
            o$(d, O0, rU(13133128), T)
        } else {
            for (let A = 0; A < 6; A++) {
                let j = -D / 2 + 0.47 + A * 0.68,
                    C = A > 3 ? 2.7 : $ - 0.85,
                    I = -$ / 2 + 0.45 + C / 2;
                qU(d, rU(A % 2 ? 9269840 : 8020552), [0.48, 0.08, C], [j, 0.26, I]);
                for (let Z = 0; Z < Math.floor(C / 0.27); Z++) P.push({
                    x: j,
                    y: 0.48,
                    z: -$ / 2 + 0.5 + Z * 0.27,
                    sx: 0.19,
                    sy: 0.29 + id(A, Z) * 0.13,
                    sz: 0.16,
                    rotation: id(A, Z, 2) * 3,
                    color: [12106354, 8495195, 13678701][A % 3]
                })
            }
            o$(d, mE, rU(16777215), P)
        }
        let R = D / 2 - 1.17,
            J = $ / 2 - 1.1,
            Q = new Ld,
            M = rU(12151378);
        qU(Q, rD, [1.85, 0.12, 1.7], [0, 0.25, 0]), qU(Q, M, [1.7, 1.25, 1.52], [0, 0.92, 0]), Md(Q, $S(1.7, 1.52, 0.62), M, [0, 1.545, 0]);
        let S = Math.atan2(0.62, 0.85);
        for (let A of [-1, 1]) {
            let j = qU(Q, rU(5399401), [1.15, 0.085, 1.82], [A * 0.46, 1.84, 0]);
            j.rotation.z = -A * S, qU(Q, nd, [0.08, 1.25, 1.58], [A * 0.82, 0.92, 0])
        }
        qU(Q, rU(7950406), [0.83, 0.93, 0.035], [0, 0.77, 0.775]);
        for (let A of [-1, 1]) {
            qU(Q, nd, [0.06, 1.02, 0.045], [A * 0.45, 0.79, 0.81]);
            let j = qU(Q, nd, [0.055, 1.13, 0.045], [0, 0.77, 0.81]);
            j.rotation.z = A * 0.66
        }
        qU(Q, nd, [0.95, 0.07, 0.05], [0, 1.31, 0.81]), qU(Q, nd, [1.75, 0.075, 0.06], [0, 1.53, 0.79]);
        let B = Md(Q, B$, nd, [0, 1.77, 0.77]);
        B.scale.set(0.11, 0.04, 0.11), B.rotation.x = Math.PI / 2, Q.position.set(R, 0, J), d.add(Q);
        for (let A = 0; A < 3; A++) qU(d, rU(12954212), [0.38, 0.32, 0.45], [R - 1.22, 0.4 + (A === 2 ? 0.31 : 0), J - 0.2 + A % 2 * 0.47]);
        let L = [],
            E = D / 2 - 0.14,
            k = $ / 2 - 0.14;
        for (let A = -E; A <= E + 0.01; A += E / 3)
            if (L.push({
                    x: A,
                    y: 0.54,
                    z: -k,
                    sx: 0.1,
                    sy: 0.7,
                    sz: 0.1
                }), Math.abs(A) > 0.6) L.push({
                x: A,
                y: 0.54,
                z: k,
                sx: 0.1,
                sy: 0.7,
                sz: 0.1
            });
        for (let A = -k + k / 3; A < k; A += k / 3)
            for (let j of [-E, E]) L.push({
                x: j,
                y: 0.54,
                z: A,
                sx: 0.1,
                sy: 0.7,
                sz: 0.1
            });
        o$(d, PS, nd, L);
        for (let A of [0.44, 0.72]) {
            qU(d, nd, [D - 0.25, 0.07, 0.06], [0, A, -k]);
            for (let j of [-E, E]) qU(d, nd, [0.06, 0.07, $ - 0.25], [j, A, 0]);
            for (let j of [-1, 1]) qU(d, nd, [E - 0.55, 0.07, 0.06], [j * (E + 0.55) / 2, A, k])
        }
    } else if (U.name === "Plaza") {
        qU(d, i0, [D - 0.12, 0.055, $ - 0.12], [0, 0.245, 0]);
        for (let H of [-0.8, 0.8]) qU(d, rD, [0.035, 0.02, $ - 0.2], [H, 0.282, 0]);
        for (let H of [-1.4, 0, 1.4]) qU(d, rD, [D - 0.2, 0.02, 0.035], [0, 0.282, H]);
        for (let [H, P, T, R] of [
                [1.02, 0.12, 0.32, rD],
                [0.89, 0.18, 0.46, nd],
                [0.75, 0.025, 0.56, fT],
                [0.17, 0.65, 0.8, rD],
                [0.48, 0.13, 1.12, nd],
                [0.39, 0.025, 1.19, fT]
            ]) Md(d, B$, R, [0, T, -0.2]).scale.set(H, P, H);
        Md(d, O0, rU(10652248, 0.4, 0.45), [0, 1.42, -0.2]).scale.set(0.12, 0.22, 0.12);
        for (let H of [-1, 1]) {
            let P = n$(H * 1.24, -1.6, 9);
            P.scale.multiplyScalar(0.63), d.add(P), y$(d, H * 1.3, 1.74, 0.85, 0.6, H + 10), vH(d, H * 1.42, 0.25, -H * Math.PI / 2)
        }
    } else if (U.name === "Riverside") {
        Md(d, B$, rD, [-0.65, 0.25, -0.3]).scale.set(2.07, 0.1, 1.37), Md(d, B$, fT, [-0.65, 0.31, -0.3]).scale.set(1.91, 0.03, 1.23);
        let H = [];
        for (let P = 0; P < 23; P++) H.push({
            x: -D / 2 + 0.31 + P * 0.29,
            y: 0.38,
            z: 1.08,
            sx: 0.26,
            sy: 0.12,
            sz: 0.9,
            color: P % 3 ? 11966061 : 12952960
        });
        o$(d, PS, rU(16777215), H);
        for (let P of [-2.5, -0.5, 1.5, 3]) qU(d, lH, [0.09, 0.62, 0.09], [P, 0.55, 1.48]);
        qU(d, lH, [5.6, 0.065, 0.065], [0.25, 0.84, 1.48]), vH(d, 1.8, -0.3, Math.PI / 2);
        for (let [P, T] of [
                [-2.45, -1.35],
                [2.42, -1.25]
            ]) {
            let R = n$(P, T, 3);
            R.scale.multiplyScalar(0.88), d.add(R)
        }
        for (let P = 0; P < 5; P++) {
            let T = -1.65 + id(P, 5) * 1.4,
                R = -0.85 + id(P, 7) * 0.65;
            Md(d, B$, rU(7378539), [T, 0.333, R]).scale.set(0.17, 0.018, 0.13), Md(d, O0, rU(15320761), [T, 0.38, R]).scale.setScalar(0.07)
        }
        y$(d, -2.65, 1.95, 1.25, 0.45, 15), y$(d, 2.6, 1.95, 1.25, 0.45, 16)
    } else {
        qU(d, i0, [0.85, 0.045, $ - 0.12], [0, 0.25, 0]), qU(d, i0, [D - 0.12, 0.045, 0.8], [0, 0.252, 0]), Md(d, B$, i0, [0, 0.25, 0]).scale.set(1.12, 0.06, 1.12);
        for (let P of [-D * 0.32, D * 0.32])
            for (let T of [-$ * 0.3, $ * 0.3]) d.add(n$(P, T, 2));
        y$(d, -1.85, -0.82, 1.75, 0.6, 1), y$(d, 1.85, 0.82, 1.75, 0.6, 2), y$(d, 0, -1.82, 0.58, 0.65, 3), vH(d, -1.8, 0.87, Math.PI), vH(d, 1.8, -0.87), Md(d, B$, nd, [0, 0.38, 0]).scale.set(0.48, 0.23, 0.48), Md(d, RS, W0[0][1], [0, 0.73, 0]).scale.set(0.51, 0.42, 0.51)
    }
    return d
}

function JS() {
    let U = new Ld,
        d = Ud / 2 - 0.25,
        D = Ud + 8,
        $ = Md(U, new aD(D, 0.6, D, 3, 0.28), new zD({
            color: 16777215,
            roughness: 1
        }), [d, -0.3, d]);
    $.geometry.setAttribute("color", new Rd(new Float32Array($.geometry.attributes.position.count * 3).fill(1), 3));
    let H = new KU(5212732),
        P = $.geometry.attributes.position,
        T = $.geometry.attributes.color;
    for (let L = 0; L < P.count; L++) {
        let E = H.clone().multiplyScalar(0.93 + id(Math.round(P.getX(L)), Math.round(P.getZ(L))) * 0.12);
        T.setXYZ(L, E.r, E.g, E.b)
    }
    $.material.vertexColors = !0, $.castShadow = !1, Md(U, new aD(D - 0.15, 1.1, D - 0.15, 3, 0.3), rU(8481109), [d, -1.1, d]), Md(U, new aD(D + 0.16, 0.22, D + 0.16, 3, 0.1), rU(13416856), [d, -1.72, d]), Md(U, new aD(D + 0.55, 0.48, D + 0.55, 3, 0.2), rU(2505528, 0.6), [d, -2.03, d]);
    let R = new Ld,
        J = new _H(0.24, 0);
    for (let L = 0; L < 11; L++) {
        let E = -1.8 + L * 4.15;
        for (let [k, A] of [
                [E, -2.35],
                [-2.35, E],
                [Ud + 1.6, E],
                [E, Ud + 1.6]
            ]) {
            if (id(k, A, 4) < 0.23) continue;
            let j = n$(k, A);
            j.scale.multiplyScalar(0.75 + id(k, A, 5) * 0.35), R.add(j);
            let C = Md(R, J, rU(11184535), [k + 0.7, 0.12, A - 0.4]);
            C.scale.set(1.3, 0.7, 1), C.rotation.y = id(k, A) * Math.PI
        }
    }
    eH(R), U.add(R);
    let Q = new Ld;
    qU(Q, rU(13085552, 0.4, 0.4), [4.4, 0.57, 0.055], [0, 0, 0]);
    let M = document.createElement("canvas");
    M.width = 768, M.height = 96;
    let S = M.getContext("2d");
    S.fillStyle = "#c7ab70", S.fillRect(0, 0, M.width, M.height), S.font = "500 44px Georgia, serif", S.fillStyle = "#263b38", S.textAlign = "center", S.textBaseline = "middle", S.fillText("K P   T O W N", 384, 50);
    let B = new e$(M);
    return B.colorSpace = V0, Md(Q, new p$(4.25, 0.53), new zD({
        map: B,
        roughness: 0.65
    }), [0, 0, 0.03]), Q.position.set(d, -1.08, d + D / 2 - 0.04), U.add(Q), {
        group: U,
        ground: $
    }
}
var uE = new aD(1.04, 0.27, 0.49, 2, 0.065),
    NE = new aD(0.53, 0.25, 0.44, 2, 0.055),
    zE = new aD(0.72, 0.29, 0.44, 2, 0.045),
    BS = new cd(0.115, 0.115, 0.085, 12),
    LS = new cd(0.064, 0.064, 0.09, 12);
BS.rotateX(Math.PI / 2);
LS.rotateX(Math.PI / 2);
var hT = rU(2699058),
    G0 = rU(13226445, 0.28, 0.55),
    qE = rU(3627112, 0.18, 0.3),
    pE = new zD({
        color: 16773052,
        emissive: 16764791,
        emissiveIntensity: 0.6
    }),
    gE = new zD({
        color: 12867910,
        emissive: 10757398,
        emissiveIntensity: 0.3
    }),
    MS = [12870989, 7576473, 14995102, 5466234, 14528082, 6849139, 10913938, 15001049];

function AS(U) {
    let d = new Ld,
        D = rU(MS[U % MS.length], 0.33, 0.18),
        $ = U % 3 === 0;
    Md(d, uE, D, [0, 0.3, 0]), Md(d, $ ? zE : NE, qE, [-0.07, 0.52, 0]), qU(d, D, [$ ? 0.63 : 0.44, 0.045, 0.43], [-0.08, $ ? 0.67 : 0.645, 0]);
    for (let H of [-0.229, 0.229]) qU(d, D, [0.037, 0.24, 0.023], [-0.1, 0.52, H]), qU(d, G0, [0.74, 0.023, 0.021], [-0.06, 0.39, H]), qU(d, G0, [0.08, 0.018, 0.025], [-0.17, 0.36, H * 1.09]), qU(d, D, [0.08, 0.05, 0.065], [0.22, 0.45, H * 1.13]);
    for (let H of [-0.32, 0.32])
        for (let P of [-0.26, 0.26]) Md(d, BS, hT, [H, 0.235, P]), Md(d, LS, G0, [H, 0.235, P]);
    for (let H of [-0.515, 0.515]) {
        qU(d, G0, [0.035, 0.048, 0.39], [H, 0.25, 0]);
        for (let P of [-0.16, 0.16]) qU(d, H > 0 ? pE : gE, [0.025, 0.075, 0.1], [H, 0.335, P])
    }
    if (qU(d, hT, [0.02, 0.06, 0.16], [0.526, 0.32, 0]), $) {
        for (let H of [-0.16, 0.16]) qU(d, G0, [0.58, 0.025, 0.025], [-0.08, 0.71, H]);
        qU(d, rU(12026197), [0.29, 0.13, 0.3], [-0.15, 0.75, 0]);
        for (let H of [-0.23, -0.08]) qU(d, hT, [0.02, 0.135, 0.305], [H, 0.753, 0])
    }
    return eH(d), d
}
var wE = {
        spring: {
            sky: 10405375,
            ground: 16777215,
            sun: 1,
            snow: 0,
            leaf: 9425290,
            leafAmount: 0.25
        },
        summer: {
            sky: 8830463,
            ground: 16774088,
            sun: 1.15,
            snow: 0,
            leaf: 6262602,
            leafAmount: 0.2
        },
        autumn: {
            sky: 12175318,
            ground: 15780234,
            sun: 0.9,
            snow: 0,
            leaf: 14254635,
            leafAmount: 0.75
        },
        winter: {
            sky: 14082282,
            ground: 15659765,
            sun: 0.8,
            snow: 0.45,
            leaf: 7043686,
            leafAmount: 0.6
        }
    },
    jS = {
        calm: {
            sky: 10405375,
            ground: 16777215,
            sun: 1,
            fog: [150, 300],
            cloud: 16777215,
            cover: 1,
            rain: 0,
            snow: 0,
            ufo: 0,
            embers: 0,
            ash: 0,
            robots: 0,
            lights: 1,
            speed: 1
        },
        heatwave: {
            sky: 16763274,
            ground: 14467706,
            sun: 1.35,
            fog: [110, 240],
            cloud: 16774112,
            cover: 0.15,
            rain: 0,
            snow: 0,
            ufo: 0,
            embers: 0,
            ash: 0,
            robots: 0,
            lights: 1,
            speed: 0.5
        },
        blackout: {
            sky: 9084866,
            ground: 12895428,
            sun: 0.8,
            fog: [150, 300],
            cloud: 15067115,
            cover: 1,
            rain: 0,
            snow: 0,
            ufo: 0,
            embers: 0,
            ash: 0,
            robots: 0,
            lights: 0,
            speed: 1
        },
        flu: {
            sky: 12175795,
            ground: 13685948,
            sun: 0.85,
            fog: [80, 200],
            cloud: 14278098,
            cover: 1,
            rain: 0,
            snow: 0,
            ufo: 0,
            embers: 0,
            ash: 0,
            robots: 0,
            lights: 1,
            speed: 0.7
        },
        festival: {
            sky: 11196671,
            ground: 16777215,
            sun: 1.15,
            fog: [160, 320],
            cloud: 16777215,
            cover: 0.6,
            rain: 0,
            snow: 0,
            ufo: 0,
            embers: 0,
            ash: 0,
            robots: 0,
            lights: 1,
            speed: 1
        },
        shortage: {
            sky: 14272936,
            ground: 13351306,
            sun: 0.95,
            fog: [130, 280],
            cloud: 15195334,
            cover: 0.8,
            rain: 0,
            snow: 0,
            ufo: 0,
            embers: 0,
            ash: 0,
            robots: 0,
            lights: 1,
            speed: 0.8
        },
        storm: {
            sky: 6055541,
            ground: 10134440,
            sun: 0.35,
            fog: [50, 150],
            cloud: 7041664,
            cover: 1,
            rain: 1,
            snow: 0,
            ufo: 0,
            embers: 0,
            ash: 0,
            robots: 0,
            lights: 1,
            speed: 3.5
        },
        winter: {
            sky: 14410990,
            ground: 15922936,
            sun: 0.85,
            fog: [90, 220],
            cloud: 15067115,
            cover: 1,
            rain: 0,
            snow: 1,
            ufo: 0,
            embers: 0,
            ash: 0,
            robots: 0,
            lights: 1,
            speed: 0.5
        },
        aliens: {
            sky: 5975438,
            ground: 12175283,
            sun: 0.5,
            fog: [80, 200],
            cloud: 3874667,
            cover: 0.7,
            rain: 0,
            snow: 0,
            ufo: 1,
            embers: 0,
            ash: 0,
            robots: 0,
            lights: 1,
            speed: 1.6
        },
        zombies: {
            sky: 7307102,
            ground: 11054476,
            sun: 0.55,
            fog: [40, 140],
            cloud: 4936512,
            cover: 1,
            rain: 0,
            snow: 0,
            ufo: 0,
            embers: 0,
            ash: 0,
            robots: 0,
            lights: 0.4,
            speed: 0.4
        },
        goldrush: {
            sky: 16766346,
            ground: 15126410,
            sun: 1.25,
            fog: [140, 300],
            cloud: 16774358,
            cover: 0.5,
            rain: 0,
            snow: 0,
            ufo: 0,
            embers: 0,
            ash: 0,
            robots: 0,
            lights: 1,
            speed: 1
        },
        meteors: {
            sky: 2825533,
            ground: 11049618,
            sun: 0.4,
            fog: [100, 240],
            cloud: 4139594,
            cover: 0.3,
            rain: 0,
            snow: 0,
            ufo: 0,
            embers: 1,
            ash: 0,
            robots: 0,
            lights: 1,
            speed: 2
        },
        lottery: {
            sky: 12574975,
            ground: 16777215,
            sun: 1.2,
            fog: [160, 320],
            cloud: 16777215,
            cover: 0.5,
            rain: 0,
            snow: 0,
            ufo: 0,
            embers: 0,
            ash: 0,
            robots: 0,
            lights: 1,
            speed: 1
        },
        robots: {
            sky: 10466248,
            ground: 13225939,
            sun: 0.9,
            fog: [120, 260],
            cloud: 13751771,
            cover: 0.9,
            rain: 0,
            snow: 0,
            ufo: 0,
            embers: 0,
            ash: 0,
            robots: 1,
            lights: 1,
            speed: 1.2
        },
        volcano: {
            sky: 7023134,
            ground: 10260358,
            sun: 0.3,
            fog: [40, 130],
            cloud: 4008742,
            cover: 1,
            rain: 0,
            snow: 0,
            ufo: 0,
            embers: 0,
            ash: 1,
            robots: 0,
            lights: 1,
            speed: 1.4
        }
    },
    bT = 7,
    cE = new i(0, 1, 0);

function tU(U, d, D = 0) {
    let $ = Math.sin(U * 127.1 + d * 311.7 + D * 74.7) * 43758.5453;
    return $ - Math.floor($)
}
class iT {
    canvas;
    onPick;
    scene = new JT;
    renderer;
    camera;
    perspective;
    ortho;
    controls;
    view = "3d";
    lamps = [];
    glows = [];
    cars = [];
    traffic = AD.map(() => ({
        count: 0,
        pace: 1
    }));
    glowTexture;
    ground;
    robots = [];
    guards = [];
    season = "spring";
    fallen = !1;
    marker = new Ld;
    graves = 0;
    event = "calm";
    daylight = 1;
    puff;
    rain;
    snow;
    embers;
    ash;
    ufos = [];
    bunting = new Ld;
    lanterns = [];
    climate = {
        sky: new KU(10405375),
        ground: new KU(16777215),
        sun: 1,
        fogNear: 150,
        fogFar: 300,
        cloud: new KU(16777215),
        cover: 1,
        rain: 0,
        snow: 0,
        ufo: 0,
        embers: 0,
        ash: 0,
        robots: 0,
        lights: 1,
        speed: 1
    };
    wanted = {
        ...jS.calm
    };
    sun;
    ambient;
    figures = new Map;
    raycaster = new XT;
    placeMeshes = new Map;
    hourStart = performance.now();
    hourLength = 1200;
    dayStart = performance.now();
    dayLength = 90000;
    selected;
    following = !1;
    untouched = !0;
    materials = new Map;
    windowMat = new zd({
        color: 16773560,
        emissive: 16769162,
        emissiveIntensity: 0
    });
    clouds = [];
    width = 1;
    height = 1;
    input = {
        right: 0,
        forward: 0,
        turn: 0,
        zoom: 0
    };
    velocity = {
        right: 0,
        forward: 0,
        turn: 0,
        zoom: 0
    };
    lastFrame = performance.now();
    flight;
    constructor(U, d) {
        this.canvas = U;
        this.onPick = d;
        this.renderer = new ST({
            canvas: U,
            antialias: !0
        }), this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = $4, this.renderer.toneMapping = H4, this.renderer.toneMappingExposure = 1.05, this.perspective = new wd(45, 1, 0.1, 500), this.ortho = new F0(-1, 1, 1, -1, 0.1, 500), this.camera = this.perspective, this.controls = this.makeControls(), this.scene.fog = new iH(10405375, 150, 300), U.addEventListener("pointerdown", () => U.style.cursor = "grabbing", {
            capture: !0
        });
        for (let P of ["pointerup", "pointercancel"]) U.addEventListener(P, () => U.style.cursor = "grab");
        U.style.cursor = "grab";
        let D = 0;
        U.addEventListener("gesturestart", (P) => {
            P.preventDefault(), D = P.rotation
        }), U.addEventListener("gesturechange", (P) => {
            P.preventDefault();
            let T = P.rotation;
            this.rotate((T - D) * Math.PI / 180), D = T
        }), U.addEventListener("gestureend", (P) => P.preventDefault()), this.ambient = new kT(12571903, 3813926, 0.7), this.scene.add(this.ambient), this.sun = new ZT(16777215, 1.6), this.sun.castShadow = !0, this.sun.shadow.mapSize.set(4096, 4096), this.sun.shadow.bias = -0.0004, this.sun.shadow.normalBias = 0.03;
        let $ = this.sun.shadow.camera;
        $.left = -Ud, $.right = Ud, $.top = Ud, $.bottom = -Ud, $.far = 220, this.scene.add(this.sun, this.sun.target), this.sun.target.position.set(Ud / 2, 0, Ud / 2), new ResizeObserver(() => this.resize()).observe(U.parentElement), this.resize(), this.home(0);
        let H = {
            x: 0,
            y: 0
        };
        U.addEventListener("pointerdown", (P) => H = {
            x: P.clientX,
            y: P.clientY
        }), U.addEventListener("pointerup", (P) => {
            if (Math.hypot(P.clientX - H.x, P.clientY - H.y) > 4) return;
            let T = U.getBoundingClientRect(),
                R = new dU((P.clientX - T.left) / T.width * 2 - 1, -((P.clientY - T.top) / T.height) * 2 + 1);
            this.raycaster.setFromCamera(R, this.camera);
            let Q = this.raycaster.intersectObjects([...this.figures.values()].map((M) => M.group), !0)[0]?.object.parent?.userData.id;
            let hit=this.raycaster.intersectObjects([...this.placeMeshes.values()],true)[0]?.object;
            while(hit&&!hit.userData.place)hit=hit.parent;
            this.onPick(Q || (hit?.userData.place ? `business:${hit.userData.place}` : undefined))
        })
    }
    makeControls() {
        let U = new KT(this.camera, this.canvas);
        return U.enableDamping = !0, U.dampingFactor = 0.14, U.panSpeed = 1.6, U.rotateSpeed = 0.8, U.zoomSpeed = 1.4, U.maxPolarAngle = Math.PI * 0.47, U.minDistance = 2.2, U.maxDistance = 170, U.minZoom = 0.5, U.maxZoom = 6, U.screenSpacePanning = !1, U.enableRotate = this.view === "3d", U.mouseButtons = {
            LEFT: SD.PAN,
            MIDDLE: SD.DOLLY,
            RIGHT: SD.ROTATE
        }, U.touches = {
            ONE: JD.PAN,
            TWO: this.view === "3d" ? JD.DOLLY_ROTATE : JD.DOLLY_PAN
        }, U.addEventListener("start", () => {
            this.flight = void 0, this.following = !1, this.untouched = !1
        }), U
    }
    setView(U) {
        if (U === this.view) return;
        let d = this.controls.target.clone();
        if (this.controls.dispose(), this.view = U, this.camera = U === "3d" ? this.perspective : this.ortho, this.controls = this.makeControls(), this.controls.target.copy(d), U === "top") this.ortho.position.set(d.x, 90, d.z + 0.001), this.ortho.up.set(0, 0, -1), this.ortho.lookAt(d), this.ortho.zoom = 1, this.ortho.updateProjectionMatrix();
        else this.perspective.position.copy(d).add(this.homeOffset());
        this.controls.update()
    }
    homeOffset() {
        let U = Ud * 0.85,
            d = this.perspective.fov * Math.PI / 180,
            D = 2 * Math.atan(Math.tan(d / 2) * this.perspective.aspect),
            $ = U / Math.sin(Math.min(d, D) / 2) * 1.04;
        return new i(14, 22, 26).setLength(Math.min(this.controls.maxDistance, $))
    }
    mat(U) {
        let d = this.materials.get(U);
        if (!d) d = new zd({
            color: U
        }), this.materials.set(U, d);
        return d
    }
    instanced(U, d, D, $ = !0) {
        let H = new xD(U, d, D.length),
            P = new Dd,
            T = new UD,
            R = new i,
            J = new i;
        return D.forEach((Q, M) => {
            if (T.setFromAxisAngle(cE, Q.ry ?? 0), R.set(Q.x, Q.y, Q.z), J.setScalar(Q.s ?? 1), P.compose(R, T, J), H.setMatrixAt(M, P), Q.color) H.setColorAt(M, Q.color)
        }), H.castShadow = $, H.receiveShadow = !0, H
    }
    build(U) {
        let d = JS();
        this.ground = d.ground, this.scene.add(d.group);
        let D = this.mat(3487034),
            $ = new ND({
                color: 15262384
            }),
            H = AD,
            P = [],
            T = new KU(10132114),
            R = new KU(9211012);
        for (let [a, Y, f, G] of H) {
            let X = new _U(new oU(f, 0.12, G), D);
            X.position.set(a + f / 2 - 0.5, 0.06, Y + G / 2 - 0.5), X.receiveShadow = !0, this.scene.add(X);
            let F = f > G,
                O = F ? f : G;
            for (let N = 0; N < O; N += 0.5) {
                let z = Math.floor(N * 2) % 2 ? T : R;
                if (F) P.push({
                    x: a + N - 0.25,
                    y: 0.08,
                    z: Y - 0.65,
                    color: z
                }, {
                    x: a + N - 0.25,
                    y: 0.08,
                    z: Y + G - 0.35,
                    color: z
                });
                else P.push({
                    x: a - 0.65,
                    y: 0.08,
                    z: Y + N - 0.25,
                    ry: Math.PI / 2,
                    color: z
                }, {
                    x: a + f - 0.35,
                    y: 0.08,
                    z: Y + N - 0.25,
                    ry: Math.PI / 2,
                    color: z
                })
            }
            for (let N = 0.5; N < O; N += 1.5) {
                let z = new _U(new oU(F ? 0.7 : 0.08, 0.02, F ? 0.08 : 0.7), $);
                z.position.set(F ? a + N : a + f / 2 - 0.5, 0.13, F ? Y + G / 2 - 0.5 : Y + N), this.scene.add(z)
            }
        }
        this.scene.add(this.instanced(new oU(0.48, 0.16, 0.3), new zd({
            color: 16777215
        }), P, !1));
        let J = [],
            Q = new KU(15921126);
        for (let [a, Y, f, G] of H.filter((X) => X[2] > X[3]))
            for (let [X, F, , O] of H.filter((N) => N[3] > N[2])) {
                if (X < a || X >= a + f || Y < F || Y >= F + O) continue;
                for (let N of [-1.5, 1.5])
                    for (let z = 0; z < 4; z++) J.push({
                        x: X + N + (z - 1.5) * 0.2,
                        y: 0.13,
                        z: Y + G / 2 - 0.5,
                        color: Q
                    }), J.push({
                        x: X,
                        y: 0.13,
                        z: Y + N + (z - 1.5) * 0.2,
                        ry: Math.PI / 2,
                        color: Q
                    })
            }
        this.scene.add(this.instanced(new oU(0.1, 0.02, 0.8), new ND({
            color: 16777215
        }), J, !1));
        for (let [a, Y, f, G] of H) {
            let X = f > G,
                F = X ? f : G;
            for (let O = 1.5; O < F; O += 5)
                if (X) this.scene.add(this.lamp(a + O, Y - 0.95, 1), this.lamp(a + O + 2.5, Y + G + 0.15, -1));
                else this.scene.add(this.lamp(a - 0.95, Y + O, 1, !0), this.lamp(a + f + 0.15, Y + O + 2.5, -1, !0))
        }
        H.forEach((a, Y) => {
            for (let f = 0; f < bT; f++) {
                let G = AS(Y * bT + f);
                G.visible = f < this.traffic[Y].count, this.scene.add(G), this.cars.push({
                    group: G,
                    road: Y,
                    slot: f,
                    t: tU(Y, f) * (a[2] > a[3] ? a[2] : a[3]),
                    speed: 2.2 + tU(Y, f + 5) * 2,
                    dir: f % 2 ? -1 : 1
                })
            }
        });
        for (let a of U.places) this.scene.add(this.buildPlace(a));
        for (let a of U.residents) this.addFigure(a, U);
        let M = new zd({
            color: 16777215,
            transparent: !0,
            opacity: 0.92
        });
        this.puff = M;
        for (let a = 0; a < 7; a++) {
            let Y = new Ld,
                f = 3 + Math.floor(tU(a, 1) * 3);
            for (let G = 0; G < f; G++) {
                let X = 1.2 + tU(a, G + 2) * 2.2,
                    F = new _U(new oU(X, 0.6 + tU(a, G + 9) * 0.5, 1 + tU(a, G + 5) * 1.4), M);
                F.position.set(G * 1.1 - f * 0.5, tU(a, G + 7) * 0.3, (tU(a, G + 3) - 0.5) * 1.2), F.castShadow = !0, Y.add(F)
            }
            Y.position.set(tU(a, 11) * (Ud + 30) - 15, 17 + tU(a, 13) * 5, tU(a, 17) * (Ud + 20) - 10), this.scene.add(Y), this.clouds.push({
                group: Y,
                speed: 0.25 + tU(a, 19) * 0.3
            })
        }
        let S = 5000,
            B = new Float32Array(S * 3);
        for (let a = 0; a < S; a++) B[a * 3] = tU(a, 1) * (Ud + 20) - 10, B[a * 3 + 1] = tU(a, 2) * 30, B[a * 3 + 2] = tU(a, 3) * (Ud + 20) - 10;
        let L = new Fd;
        L.setAttribute("position", new Wd(B, 3)), this.rain = new C0(L, new c$({
            color: 13624319,
            size: 0.09,
            transparent: !0,
            opacity: 0,
            depthWrite: !1
        })), this.rain.visible = !1, this.scene.add(this.rain);
        let E = 3000,
            k = new Float32Array(E * 3);
        for (let a = 0; a < E; a++) k[a * 3] = tU(a, 4) * (Ud + 20) - 10, k[a * 3 + 1] = tU(a, 5) * 30, k[a * 3 + 2] = tU(a, 6) * (Ud + 20) - 10;
        let A = new Fd;
        A.setAttribute("position", new Wd(k, 3)), this.snow = new C0(A, new c$({
            color: 16777215,
            size: 0.22,
            transparent: !0,
            opacity: 0,
            depthWrite: !1
        })), this.snow.visible = !1, this.scene.add(this.snow), this.embers = this.particles(600, 16751164, 0.35, 7), AD.forEach((a, Y) => {
            for (let f = 0; f < 2; f++) {
                let G = this.robot();
                G.group.visible = !1, this.scene.add(G.group), this.robots.push({
                    ...G,
                    road: Y,
                    t: tU(Y, f + 20) * (a[2] > a[3] ? a[2] : a[3]),
                    dir: f ? -1 : 1,
                    side: f ? -1 : 1,
                    phase: tU(Y, f + 30) * 6
                })
            }
        });
        for (let a of U.places.filter((Y) => Y.kind === "office" || Y.kind === "factory" || Y.kind === "school")) {
            let Y = this.robot(),
                f = this.placeDoor(U, a.id);
            Y.group.position.copy(f).add(new i(0.9, 0, 0.3)), Y.group.rotation.y = Math.PI, Y.armL.rotation.x = -1.2, Y.armR.rotation.x = -1.2, Y.group.visible = !1, this.scene.add(Y.group), this.guards.push(Y.group)
        }
        this.ash = this.particles(2500, 10132122, 0.16, 8);
        for (let a = 0; a < 3; a++) {
            let Y = new Ld,
                f = new _U(new cd(1.8, 2.4, 0.5, 24), this.mat(2830138)),
                G = new _U(new gH(2.1, 0.12, 8, 32), new zd({
                    color: 8843180,
                    emissive: 4906624,
                    emissiveIntensity: 1.2
                }));
            G.rotation.x = Math.PI / 2;
            let X = new _U(new pH(0.9, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), new zd({
                color: 11006928,
                emissive: 3462041,
                emissiveIntensity: 0.9,
                transparent: !0,
                opacity: 0.85
            }));
            X.position.y = 0.25;
            let F = new _U(new cd(0.4, 2.2, 14, 20, 1, !0), new ND({
                color: 8843180,
                transparent: !0,
                opacity: 0.18,
                side: tP,
                depthWrite: !1,
                blending: X0
            }));
            F.position.y = -7.2, f.castShadow = !0, Y.add(f, G, X, F), Y.visible = !1, this.scene.add(Y), this.ufos.push({
                group: Y,
                radius: 8 + a * 6,
                phase: a / 3 * Math.PI * 2,
                speed: 0.25 + a * 0.08
            })
        }
        let j = [15680580, 16436245, 3900150, 2278750, 16020150, 16347926];
        for (let a of U.places.filter((Y) => Y.kind === "park")) {
            for (let Y of [0.25, 0.75]) {
                let f = a.z + a.d * Y - 0.5;
                for (let X = 0; X < a.w * 2; X++) {
                    let F = new _U(new oU(0.28, 0.32, 0.02), this.mat(j[X % j.length]));
                    F.position.set(a.x + X * 0.5 - 0.25, 2.3 - Math.sin(X / (a.w * 2) * Math.PI) * 0.35, f), this.bunting.add(F)
                }
                let G = new _U(new oU(a.w, 0.03, 0.03), this.mat(4144966));
                G.position.set(a.x + a.w / 2 - 0.5, 2.45, f), this.bunting.add(G);
                for (let X of [-0.6, a.w - 0.4]) {
                    let F = this.block(a.x + X, f, 0.08, 0.08, 2.5, 9136963);
                    this.bunting.add(F)
                }
            }
            for (let Y = 0; Y < 4; Y++) {
                let f = new zd({
                        color: 16769162,
                        emissive: 16758861,
                        emissiveIntensity: 0
                    }),
                    G = new _U(new oU(0.3, 0.4, 0.3), f);
                G.position.set(a.x + 0.5 + tU(Y, a.x) * (a.w - 2), 1.7, a.z + 0.5 + tU(Y, a.z) * (a.d - 2)), this.lanterns.push(f), this.bunting.add(G)
            }
        }
        this.bunting.visible = !1, this.scene.add(this.bunting), this.buildCemetery();
        let C = new zd({
                color: 6333946,
                emissive: 2450411,
                emissiveIntensity: 0.6
            }),
            I = new _U(new M$(0.28, 0.5, 4), C);
        I.rotation.x = Math.PI, I.position.y = 0.25;
        let Z = new _U(new oU(0.16, 0.4, 0.16), C);
        Z.position.y = 0.7, this.marker.add(I, Z), this.marker.visible = !1, this.scene.add(this.marker)
    }
    setTraffic(U) {
        U.forEach((d, D) => {
            let $ = Math.round(Math.max(0, Math.min(4, d)) / 4 * bT);
            this.traffic[D] = {
                count: $,
                pace: d >= 4 ? 0.35 : d >= 3 ? 0.65 : 1
            };
            for (let H of this.cars)
                if (H.road === D && H.slot < $) H.group.visible = !0
        })
    }
    particles(U, d, D, $) {
        let H = new Float32Array(U * 3);
        for (let R = 0; R < U; R++) H[R * 3] = tU(R, $) * (Ud + 20) - 10, H[R * 3 + 1] = tU(R, $ + 1) * 30, H[R * 3 + 2] = tU(R, $ + 2) * (Ud + 20) - 10;
        let P = new Fd;
        P.setAttribute("position", new Wd(H, 3));
        let T = new C0(P, new c$({
            color: d,
            size: D,
            transparent: !0,
            opacity: 0,
            depthWrite: !1,
            blending: X0
        }));
        return T.visible = !1, this.scene.add(T), T
    }
    fall(U, d, D, $, H) {
        if (!U) return;
        if (U.visible = d > 0.02, U.material.opacity = 0.9 * d, !U.visible) return;
        let P = U.geometry.getAttribute("position"),
            T = P.array;
        for (let R = 0; R < T.length; R += 3)
            if (T[R + 1] -= D * H, T[R] += $ * H, T[R + 1] < 0) T[R + 1] += 30, T[R] = tU(R, 3) * (Ud + 20) - 10;
        P.needsUpdate = !0
    }
    collapse() {
        this.fallen = !0, this.following = !1, this.selected = void 0, this.home(2500), this.controls.autoRotate = !0, this.controls.autoRotateSpeed = 0.35;
        for (let U of this.cars) U.group.visible = !1
    }
    setEvent(U) {
        this.event = U, this.bunting.visible = U === "festival", this.retarget()
    }
    setSeason(U) {
        this.season = U, this.retarget()
    }
    retarget() {
        let U = jS[this.event],
            d = wE[this.season];
        if (this.event === "calm") this.wanted = {
            ...U,
            sky: d.sky,
            ground: d.ground,
            sun: d.sun,
            snow: d.snow
        };
        else {
            let D = new KU(U.ground).lerp(new KU(d.ground), 0.4).getHex();
            this.wanted = {
                ...U,
                ground: D,
                snow: Math.max(U.snow, d.snow * 0.5)
            }
        }
        QS(new KU(d.leaf), d.leafAmount)
    }
    robot() {
        let U = new Ld,
            d = this.mat(10265519),
            D = this.mat(4937059),
            $ = new zd({
                color: 16698058,
                emissive: 15680580,
                emissiveIntensity: 1.4
            }),
            H = (L, E, k, A, j, C, I) => {
                let Z = new _U(new oU(L, E, k), A);
                return Z.position.set(j, C, I), Z.castShadow = !0, Z
            },
            P = new oU(0.14, 0.44, 0.16);
        P.translate(0, -0.22, 0);
        let T = new _U(P, D);
        T.position.set(-0.11, 0.46, 0), T.add(H(0.16, 0.08, 0.24, d, 0, -0.42, 0.03));
        let R = T.clone();
        R.position.x = 0.11;
        let J = H(0.48, 0.5, 0.3, d, 0, 0.72, 0);
        J.add(H(0.2, 0.14, 0.02, $, 0, 0.06, 0.16));
        for (let L of [-0.14, 0, 0.14]) J.add(H(0.06, 0.04, 0.02, D, L, -0.14, 0.16));
        let Q = H(0.32, 0.26, 0.3, d, 0, 1.12, 0);
        for (let L of [-0.08, 0.08]) Q.add(H(0.08, 0.06, 0.02, $, L, 0.02, 0.16));
        Q.add(H(0.2, 0.03, 0.02, D, 0, -0.08, 0.16)), Q.add(H(0.03, 0.2, 0.03, D, 0, 0.22, 0)), Q.add(H(0.07, 0.07, 0.07, $, 0, 0.34, 0));
        let M = new oU(0.12, 0.44, 0.14);
        M.translate(0, -0.2, 0);
        let S = new _U(M, D);
        S.position.set(-0.31, 0.92, 0), S.add(H(0.14, 0.12, 0.14, d, 0, -0.44, 0));
        let B = S.clone();
        return B.position.x = 0.31, U.add(T, R, J, Q, S, B), {
            group: U,
            legL: T,
            legR: R,
            armL: S,
            armR: B
        }
    }
    weather(U) {
        let d = this.wanted,
            D = this.climate,
            $ = 1 - Math.exp(-U / 1.5);
        if (D.sky.lerp(new KU(d.sky), $), D.ground.lerp(new KU(d.ground), $), D.cloud.lerp(new KU(d.cloud), $), D.sun += (d.sun - D.sun) * $, D.fogNear += (d.fog[0] - D.fogNear) * $, D.fogFar += (d.fog[1] - D.fogFar) * $, D.cover += (d.cover - D.cover) * $, D.rain += (d.rain - D.rain) * $, D.snow += (d.snow - D.snow) * $, D.ufo += (d.ufo - D.ufo) * $, D.embers += (d.embers - D.embers) * $, D.ash += (d.ash - D.ash) * $, D.robots += (d.robots - D.robots) * $, D.lights += (d.lights - D.lights) * $, D.speed += (d.speed - D.speed) * $, this.ground) this.ground.material.color.copy(D.ground);
        if (this.puff) this.puff.color.copy(D.cloud), this.puff.opacity = 0.92 * D.cover * (this.view === "top" ? 0.3 : 1);
        let H = this.scene.fog;
        if (H.near = D.fogNear, H.far = D.fogFar, this.rain) {
            if (this.rain.visible = D.rain > 0.02, this.rain.material.opacity = 0.7 * D.rain, this.rain.visible) {
                let R = this.rain.geometry.getAttribute("position"),
                    J = R.array;
                for (let Q = 1; Q < J.length; Q += 3)
                    if (J[Q] -= 24 * U, J[Q] < 0) J[Q] += 30;
                R.needsUpdate = !0
            }
        }
        if (this.snow) {
            if (this.snow.visible = D.snow > 0.02, this.snow.material.opacity = 0.9 * D.snow, this.snow.visible) {
                let R = this.snow.geometry.getAttribute("position"),
                    J = R.array,
                    Q = performance.now() / 1000;
                for (let M = 0; M < J.length; M += 3)
                    if (J[M + 1] -= 2.2 * U, J[M] += Math.sin(Q + M) * 0.4 * U, J[M + 1] < 0) J[M + 1] += 30;
                R.needsUpdate = !0
            }
        }
        this.fall(this.embers, D.embers, 30, -9, U);
        let P = D.robots > 0.02;
        for (let R of this.guards) R.visible = P;
        for (let R of this.robots) {
            if (R.group.visible = P, !P) continue;
            let [J, Q, M, S] = AD[R.road], B = M > S, L = B ? M : S;
            R.t = (R.t + 1.1 * R.dir * U + L) % L;
            let E = R.side > 0 ? -0.95 : (B ? S : M) + 0.15;
            if (B) R.group.position.set(J + R.t - 0.5, 0, Q + E), R.group.rotation.y = R.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
            else R.group.position.set(J + E, 0, Q + R.t - 0.5), R.group.rotation.y = R.dir > 0 ? 0 : Math.PI;
            let k = performance.now() / 1000,
                A = Math.sin(k * 6 + R.phase) * 0.5;
            R.legL.rotation.x = A, R.legR.rotation.x = -A, R.armL.rotation.x = -A, R.armR.rotation.x = A
        }
        this.fall(this.ash, D.ash, 1.6, 0.6, U);
        let T = performance.now() / 1000;
        this.ufos.forEach((R, J) => {
            if (R.group.visible = D.ufo > 0.02, !R.group.visible) return;
            let Q = T * R.speed + R.phase,
                M = 14 + Math.sin(T * 0.7 + J) * 1.2,
                S = (1 - D.ufo) * 40;
            R.group.position.set(Ud / 2 + Math.cos(Q) * R.radius, M + S, Ud / 2 + Math.sin(Q * 0.8) * R.radius), R.group.rotation.y = T * 1.5, R.group.rotation.z = Math.sin(T * 0.9 + J) * 0.08
        })
    }
    glow() {
        if (this.glowTexture) return this.glowTexture;
        let U = document.createElement("canvas");
        U.width = U.height = 128;
        let d = U.getContext("2d"),
            D = d.createRadialGradient(64, 64, 0, 64, 64, 64);
        return D.addColorStop(0, "rgba(255, 220, 130, 1)"), D.addColorStop(0.4, "rgba(255, 200, 100, 0.45)"), D.addColorStop(1, "rgba(255, 190, 80, 0)"), d.fillStyle = D, d.fillRect(0, 0, 128, 128), this.glowTexture = new e$(U), this.glowTexture.colorSpace = V0, this.glowTexture
    }
    lamp(U, d, D, $ = !1) {
        let H = new Ld,
            P = this.block(0, 0, 0.32, 0.32, 0.1, 2829099),
            T = this.block(0, 0, 0.1, 0.1, 2.4, 2829099),
            R = new _U(new oU(0.08, 0.08, 0.6), this.mat(2829099));
        R.position.set(0, 2.38, D * 0.25);
        let J = new zd({
                color: 16774338,
                emissive: 16765802,
                emissiveIntensity: 0
            }),
            Q = new _U(new oU(0.28, 0.14, 0.34), J);
        Q.position.set(0, 2.32, D * 0.5), this.lamps.push(J);
        let M = new OH(new w$({
            map: this.glow(),
            color: 16765802,
            transparent: !0,
            opacity: 0,
            depthWrite: !1,
            blending: X0
        }));
        M.scale.setScalar(1.8), M.position.set(0, 2.3, D * 0.5);
        let S = new _U(new GH(1.7, 24), new ND({
            map: this.glow(),
            color: 16762978,
            transparent: !0,
            opacity: 0,
            depthWrite: !1,
            blending: X0
        }));
        if (S.rotation.x = -Math.PI / 2, S.position.set(0, 0.18, D * 0.8), this.glows.push(M.material, S.material), H.add(P, T, R, Q, M, S), $) H.rotation.y = Math.PI / 2;
        return H.position.set(U, 0, d), H
    }
    label(U, d, D, $) {
        let H = document.createElement("canvas"),
            P = H.getContext("2d");
        P.font = "500 28px Geist, system-ui, sans-serif";
        let T = Math.ceil(P.measureText(U).width) + 28;
        H.width = T, H.height = 44, P.font = "500 28px Geist, system-ui, sans-serif", P.clearRect(0,0,T,44), P.fillStyle = "#ffffff", P.textBaseline = "middle", P.fillText(U, 14, 23);
        let R = new e$(H);
        R.colorSpace = V0;
        let J = new OH(new w$({
            map: R,
            depthTest: !1,
            transparent: !0
        }));
        return J.scale.set(T / 44 * 0.9, 0.9, 1), J.position.set(d, D, $), J.renderOrder = 10, J
    }
    buildPlace(U) {
        let d = new Ld,
            D = new KU(U.color),
            $ = U.x + U.w / 2 - 0.5,
            H = U.z + U.d / 2 - 0.5;
        if(U.id === "neighborhood-lake") d.add(SS({...U,name:"Riverside"})); else if (U.kind === "park" || U.kind === "farm") d.add(SS(U));
        else {
            let P = U.floors * 1.1,
                T = U.w * 0.92,
                R = U.d * 0.92,
                J = this.block($, H, T, R, P, D.getHex());
            d.add(J);
            let Q = this.block($, H, T + 0.1, R + 0.1, 0.12, 9079424);
            d.add(Q);
            let M = D.clone().multiplyScalar(0.78).getHex();
            for (let I = 1; I < U.floors; I++) {
                let Z = this.block($, H, T + 0.08, R + 0.08, 0.06, M);
                Z.position.y = I * 1.1, d.add(Z)
            }
            let S = [],
                B = [],
                L = Math.max(1, Math.floor(T / 0.9)),
                E = Math.max(1, Math.floor(R / 0.9));
            for (let I = 0; I < U.floors; I++) {
                let Z = 0.6 + I * 1.1;
                for (let a = 0; a < L; a++) {
                    let Y = $ - T / 2 + (a + 0.5) * T / L;
                    if (!(I === 0 && a === Math.floor(L / 2))) S.push({
                        x: Y,
                        y: Z,
                        z: H + R / 2 + 0.02
                    }), B.push({
                        x: Y,
                        y: Z,
                        z: H + R / 2 + 0.01
                    });
                    S.push({
                        x: Y,
                        y: Z,
                        z: H - R / 2 - 0.02
                    }), B.push({
                        x: Y,
                        y: Z,
                        z: H - R / 2 - 0.01
                    })
                }
                for (let a = 0; a < E; a++) {
                    let Y = H - R / 2 + (a + 0.5) * R / E;
                    for (let f of [-1, 1]) S.push({
                        x: $ + f * (T / 2 + 0.02),
                        y: Z,
                        z: Y,
                        ry: Math.PI / 2
                    }), B.push({
                        x: $ + f * (T / 2 + 0.01),
                        y: Z,
                        z: Y,
                        ry: Math.PI / 2
                    })
                }
            }
            d.add(this.instanced(new oU(0.34, 0.42, 0.05), this.windowMat, S, !1)), d.add(this.instanced(new oU(0.44, 0.52, 0.05), this.mat(2763306), B, !1));
            let k = [3877404, 1981023, 8330525, 1332013, 2042167, 16119284, 11817737],
                A = tU(U.x, U.z),
                j = this.block($, H + R / 2 + 0.03, 0.5, 0.06, 0.85, U.kind === "home" ? k[Math.floor(A * k.length)] : 3877404),
                C = this.block($, H + R / 2 + 0.25, 0.8, 0.35, 0.1, 9079424);
            if (d.add(j, C), U.kind === "home") {
                let I = [
                        [4937059, 3621201],
                        [11819580, 9389360],
                        [7027498, 5188126],
                        [3093559, 2040870],
                        [4151868, 3097648]
                    ],
                    [Z, a] = I[Math.floor(tU(U.x, U.z, 1) * I.length)],
                    Y = this.block($, H, T + 0.4, R + 0.4, 0.1, a);
                Y.position.y = P + 0.05;
                let f = tU(U.x, U.z, 2) < 0.6,
                    G = f ? new _U(new M$(Math.max(T, R) * 0.86, 1, 4), this.mat(Z)) : new _U(new cd(0, Math.max(T, R) * 0.8, 1, 4, 1), this.mat(Z));
                G.position.set($, P + 0.58, H), G.rotation.y = Math.PI / 4, G.scale.z = f ? 1 : 0.7, G.castShadow = !0;
                let X = this.block($ + T / 4, H - R / 4, 0.3, 0.3, 0.8, 6048318);
                X.position.y = P + 0.6, d.add(Y, G, X);
                let F = new _U(new oU(U.w, 0.08, 0.7), this.mat(tU(U.x, U.z, 3) < 0.5 ? 10728830 : 10335356));
                F.position.set($, 0.04, H + R / 2 + 0.45), F.receiveShadow = !0;
                let O = new _U(new oU(U.w * 0.42, 0.35, 0.22), this.mat(4160058));
                if (O.position.set($ - U.w * 0.28, 0.2, H + R / 2 + 0.7), O.castShadow = !0, d.add(F, O), tU(U.x, U.z, 4) < 0.5) {
                    let N = [],
                        z = [15680580, 16436245, 16382715, 16020150].map((w) => new KU(w));
                    for (let w = 0; w < 5; w++) N.push({
                        x: $ + U.w * 0.1 + tU(w, U.x) * U.w * 0.35,
                        y: 0.14,
                        z: H + R / 2 + 0.3 + tU(w, U.z) * 0.3,
                        color: z[w % z.length]
                    });
                    d.add(this.instanced(new oU(0.1, 0.12, 0.1), new zd({
                        color: 16777215
                    }), N, !1))
                }
            } else {
                for (let [Z, a, Y, f] of [
                        [$, H - R / 2, T, 0.12],
                        [$, H + R / 2, T, 0.12],
                        [$ - T / 2, H, 0.12, R],
                        [$ + T / 2, H, 0.12, R]
                    ]) {
                    let G = this.block(Z, a, Y, f, 0.25, M);
                    G.position.y = P + 0.12, d.add(G)
                }
                let I = this.block($ - T / 4, H - R / 4, 0.6, 0.5, 0.4, 8224118);
                I.position.y = P + 0.2, d.add(I)
            }
            if (U.kind === "market") {
                let I = [15262384, 12730636];
                for (let Z = 0; Z < Math.floor(T / 0.5); Z++) {
                    let a = this.block($ - T / 2 + 0.25 + Z * 0.5, H + R / 2 + 0.35, 0.5, 0.7, 0.05, I[Z % 2]);
                    a.position.y = 1.02, d.add(a)
                }
            }
            if (U.kind === "tavern")
                for (let I of [-0.5, 0.5]) {
                    let Z = new _U(new cd(0.18, 0.18, 0.4, 10), this.mat(8014370));
                    Z.position.set($ + I * 1.4, 0.2, H + R / 2 + 0.35), Z.castShadow = !0, d.add(Z)
                }
            if (U.kind === "clinic") {
                let I = new _U(new oU(0.6, 0.15, 0.15), this.mat(15680580));
                I.position.set($, P + 0.4, H);
                let Z = I.clone();
                Z.rotation.y = Math.PI / 2, d.add(I, Z)
            }
            if (U.kind === "school") {
                let I = this.block($ + T / 2 - 0.4, H + R / 2 - 0.4, 0.06, 0.06, 2.2, 13948120);
                I.position.y = P + 1.1;
                let Z = new _U(new oU(0.02, 0.35, 0.6), this.mat(15680580));
                Z.position.set($ + T / 2 - 0.4, P + 2, H + R / 2 - 0.1), d.add(I, Z)
            }
            if (U.kind === "factory") {
                let I = this.block(U.x + U.w - 1.2, U.z + 0.6, 0.5, 0.5, P + 1.4, 5588540);
                d.add(I);
                let Z = new zd({
                    color: 13948120,
                    transparent: !0,
                    opacity: 0.55
                });
                for (let a = 0; a < 3; a++) {
                    let Y = new _U(new oU(0.4 + a * 0.25, 0.35 + a * 0.2, 0.4 + a * 0.25), Z);
                    Y.position.set(U.x + U.w - 1.2 + a * 0.25, P + 1.8 + a * 0.5, U.z + 0.6 - a * 0.15), d.add(Y)
                }
            }
        }
        if (U.kind !== "home") d.add(this.label(U.name, $, U.floors * 1.1 + 1.6, H));
        return d.userData.place = U.id, this.placeMeshes.set(U.id, d), d
    }
    block(U, d, D, $, H, P) {
        let T = new _U(new oU(D, H, $), this.mat(P));
        return T.position.set(U, H / 2, d), T.castShadow = !0, T.receiveShadow = !0, T
    }
    placeDoor(U, d) {
        let D = U.places.find(($) => $.id === d);
        return new i(D.x + D.w / 2 - 0.5, 0, D.z + D.d - 0.2)
    }
    addFigure(U, d) {
        let D = Number(U.id.slice(1)) + 1,
            $ = (y, W) => y[Math.floor(tU(D, W) * y.length)],
            H = $([16176053, 15251604, 13209187, 10839871, 8014378, 5123868], 1),
            P = $([1776411, 3877404, 7031339, 12159562, 14271136, 9121583, 10132122], 2),
            T = {
                clerk: {
                    shirt: 15068406,
                    jacket: 2042167,
                    pants: 2042167
                },
                builder: {
                    shirt: 7041664,
                    jacket: 16096779,
                    pants: 3621201
                },
                farmer: {
                    shirt: 12730636,
                    jacket: 1981066,
                    pants: 1981066
                },
                doctor: {
                    shirt: 6220500,
                    jacket: 16317180,
                    pants: 9741240
                },
                trader: {
                    shirt: 15235577,
                    jacket: 8138002,
                    pants: 4144966
                },
                musician: {
                    shirt: 1120295,
                    jacket: 2038574,
                    pants: 1120295
                },
                teacher: {
                    shirt: 15857145,
                    jacket: 3003583,
                    pants: 4937059
                }
            } [U.job] ?? {
                shirt: 13421772,
                jacket: 10066329,
                pants: 3355443
            },
            R = this.mat(H),
            J = new zd({
                color: T.shirt
            }),
            Q = new Ld,
            M = (y, W, UU, PU, iU, wU, o, $U = !0) => {
                let FU = new _U(new oU(y, W, UU), PU);
                return FU.position.set(iU, wU, o), FU.castShadow = $U, FU
            },
            S = new oU(0.15, 0.42, 0.17);
        S.translate(0, -0.21, 0);
        let B = new _U(S, this.mat(T.pants));
        B.position.set(-0.09, 0.42, 0);
        let L = M(0.16, 0.08, 0.24, this.mat($([2039583, 3877404, 8330525, 16119284], 3)), 0, -0.4, 0.03);
        B.add(L);
        let E = B.clone();
        E.position.x = 0.09;
        let k = M(0.4, 0.5, 0.24, J, 0, 0.67, 0),
            A = M(0.41, 0.05, 0.25, this.mat(2826520), 0, 0.45, 0),
            j = M(0.12, 0.08, 0.12, R, 0, 0.95, 0, !1);
        if (Q.add(B, E, k, A, j), U.job === "clerk" || U.job === "teacher" || U.job === "musician") {
            for (let y of [-1, 1]) Q.add(M(0.14, 0.48, 0.27, this.mat(T.jacket), y * 0.14, 0.67, 0));
            Q.add(M(0.4, 0.14, 0.27, this.mat(T.jacket), 0, 0.85, 0))
        }
        if (U.job === "clerk") Q.add(M(0.06, 0.26, 0.02, this.mat(2450411), 0, 0.76, 0.13, !1));
        if (U.job === "doctor") Q.add(M(0.44, 0.52, 0.28, this.mat(T.jacket), 0, 0.66, 0)), Q.add(M(0.14, 0.44, 0.02, J, 0, 0.7, 0.15, !1)), Q.add(M(0.1, 0.06, 0.02, this.mat(15680580), 0.14, 0.82, 0.155, !1));
        if (U.job === "builder") Q.add(M(0.44, 0.34, 0.27, this.mat(T.jacket), 0, 0.72, 0)), Q.add(M(0.45, 0.05, 0.28, this.mat(15067115), 0, 0.66, 0, !1));
        if (U.job === "farmer") {
            Q.add(M(0.24, 0.3, 0.26, this.mat(T.jacket), 0, 0.76, 0));
            for (let y of [-0.09, 0.09]) Q.add(M(0.05, 0.3, 0.27, this.mat(T.jacket), y, 0.85, 0, !1))
        }
        if (U.job === "trader") Q.add(M(0.3, 0.46, 0.02, this.mat(T.jacket), 0, 0.62, 0.13, !1));
        if (U.job === "musician") Q.add(M(0.44, 0.08, 0.28, this.mat(16478597), 0, 0.9, 0.02, !1));
        let C = M(0.34, 0.34, 0.34, R, 0, 1.16, 0),
            I = this.mat(16317180),
            Z = this.mat($([2042167, 3877404, 1981023, 3560212], 4));
        for (let y of [-0.08, 0.08]) {
            let W = M(0.07, 0.06, 0.02, I, y, 0.02, 0.17, !1);
            W.add(M(0.035, 0.04, 0.015, Z, 0, -0.005, 0.008, !1)), C.add(W), C.add(M(0.09, 0.02, 0.02, this.mat(P), y, 0.075, 0.17, !1))
        }
        C.add(M(0.04, 0.05, 0.03, this.mat(H), 0, -0.02, 0.18, !1)), C.add(M(0.1, 0.02, 0.015, this.mat(10440511), 0, -0.1, 0.172, !1));
        let a = this.mat(P),
            Y = $(["short", "short", "long", "bun", "curly", "bald"], 5);
        if (Y !== "bald") C.add(M(0.36, 0.1, 0.36, a, 0, 0.17, 0, !1));
        if (Y === "short" || Y === "curly") C.add(M(0.36, 0.14, 0.12, a, 0, 0.1, -0.13, !1));
        if (Y === "curly") C.add(M(0.4, 0.14, 0.4, a, 0, 0.2, 0, !1));
        if (Y === "long") C.add(M(0.36, 0.34, 0.1, a, 0, -0.02, -0.15, !1));
        if (Y === "bun") C.add(M(0.14, 0.14, 0.14, a, 0, 0.14, -0.2, !1));
        if (U.job === "teacher")
            for (let y of [-0.08, 0.08]) C.add(M(0.1, 0.09, 0.01, this.mat(1118481), y, 0.02, 0.18, !1));
        if (Q.add(C), U.job === "builder") Q.add(M(0.38, 0.14, 0.38, this.mat(16436245), 0, 1.38, 0)), Q.add(M(0.42, 0.03, 0.42, this.mat(16436245), 0, 1.32, 0.02, !1));
        if (U.job === "farmer") Q.add(M(0.3, 0.12, 0.3, this.mat(14070635), 0, 1.38, 0)), Q.add(M(0.6, 0.03, 0.6, this.mat(14070635), 0, 1.33, 0, !1));
        if (U.job === "musician") Q.add(M(0.36, 0.08, 0.36, this.mat(10033947), 0.04, 1.36, -0.02));
        if (U.job === "trader") Q.add(M(0.36, 0.08, 0.36, this.mat(8138002), 0, 1.36, 0)), Q.add(M(0.3, 0.02, 0.14, this.mat(8138002), 0, 1.33, 0.22, !1));
        let f = new oU(0.12, 0.42, 0.14);
        f.translate(0, -0.18, 0);
        let G = U.job === "doctor" || U.job === "clerk" || U.job === "teacher" || U.job === "musician" ? this.mat(T.jacket) : J,
            X = new _U(f, G);
        X.position.set(-0.27, 0.88, 0), X.castShadow = !0;
        let F = M(0.11, 0.1, 0.13, R, 0, -0.42, 0, !1);
        X.add(F);
        let O = X.clone();
        O.position.x = 0.27;
        let N = {
            doctor: M(0.2, 0.15, 0.1, this.mat(8330525), 0.06, -0.55, 0.02),
            builder: M(0.24, 0.14, 0.11, this.mat(14427686), 0.06, -0.55, 0.02),
            farmer: M(0.22, 0.14, 0.16, this.mat(11569754), 0.06, -0.55, 0.02),
            clerk: M(0.22, 0.16, 0.05, this.mat(1118481), 0.06, -0.55, 0.02),
            teacher: M(0.16, 0.2, 0.05, this.mat(1920728), 0.06, -0.52, 0.06),
            trader: M(0.22, 0.16, 0.16, this.mat(9132587), 0.06, -0.55, 0.02),
            musician: (() => {
                let y = new Ld;
                return y.add(M(0.14, 0.32, 0.05, this.mat(9132587), 0, 0, 0), M(0.04, 0.34, 0.03, this.mat(3877404), 0, 0.3, 0)), y.position.set(0.1, -0.5, 0.1), y.rotation.z = -0.4, y
            })()
        } [U.job];
        if (N) O.add(N);
        let z = new _U(new qH(0.35, 0.48, 24), new ND({
            color: 16777215,
            side: tP,
            transparent: !0,
            opacity: 0
        }));
        z.rotation.x = -Math.PI / 2, z.position.y = 0.02, Q.add(X, O, z), Q.scale.setScalar(0.92 + tU(D, 6) * 0.16), Q.userData.id = U.id;
        let w = this.placeDoor(d, U.target),
            l = () => (Math.random() - 0.5) * 1.2,
            c = w.clone().add(new i(l(), 0, l()));
        Q.position.copy(c), this.scene.add(Q), this.figures.set(U.id, {
            group: Q,
            body: k,
            head: C,
            legL: B,
            legR: E,
            armL: X,
            armR: O,
            from: c.clone(),
            to: c.clone(),
            phase: Math.random() * 6,
            ring: z
        })
    }
    moveAll(U, d) {
        this.travelQueue ||= [];
        if(this.hasJourney && performance.now()<this.hourStart+this.hourLength){this.travelQueue.push({town:structuredClone(U),duration:d});return;}
        this.hasJourney=true;d*=2;
        this.hourLength = d, this.hourStart = performance.now();
        for (let D of U.residents) {
            if (D.buried || D.left) {
                if (D.left) this.remove(D.id);
                else this.bury(D.id);
                continue
            }
            let $ = this.figures.get(D.id);
            if (!$) {
                if (!D.alive) continue;
                this.addFigure(D, U), $ = this.figures.get(D.id)
            }
            if ($.from.copy($.group.position), !D.alive) {
                $.to.copy($.from), $.group.rotation.z = Math.PI / 2, $.from.y = $.to.y = 0.25, $.body.material.color.set(5592405);
                continue
            }
            let H = this.placeDoor(U, D.target);
            $.to.copy(H).add(new i((Math.random() - 0.5) * 1.4, 0, (Math.random() - 0.5) * 0.8)), $.ring.material.opacity = D.distress > 0.6 ? 0.9 : 0, $.ring.material.color.set(D.distress > 0.6 ? 16498468 : 16777215)
        }
    }
    remove(U) {
        let d = this.figures.get(U);
        if (!d) return;
        if (this.scene.remove(d.group), this.figures.delete(U), this.selected === U) this.following = !1
    }
    bury(U) {
        let d = this.figures.get(U);
        if (!d) return;
        if (this.scene.remove(d.group), this.figures.delete(U), this.selected === U) this.following = !1;
        let [D, $] = this.gravePosition(this.graves++), H = this.block(D, $, 0.36, 0.12, 0.55, 10132114);
        H.position.y = 0.3;
        let P = this.block(D, $ + 0.3, 0.4, 0.45, 0.12, 7031603);
        this.scene.add(H, P)
    }
    gravePosition(U) { const blocks=[[-2.5,14],[11.4,12],[23.8,9],[33.4,7],[41.4,12]];let col=U%54;for(const [x,count]of blocks){if(col<count)return [x+col*.78,48.6+Math.floor(U/54)*.58];col-=count;}return [1,49]; }
    buildCemetery() {
        let U = this.mat(12104356),
            d = this.mat(9079424);
        for (let [D, $, H, P] of [
                [3.1,50,12,3], [16.3,50,10.5,3], [27.3,50,7.5,3], [36,50,6,3], [46.1,50,10,3]
            ]) {
            let T = new _U(new oU(H, 0.06, P), U);
            T.position.set(D, 0.03, $), T.receiveShadow = !0, this.scene.add(T);
            for (let [R, J, Q, M] of [
                    [D, $ - P / 2, H, 0.16],
                    [D, $ + P / 2, H, 0.16],
                    [D - H / 2, $, 0.16, P],
                    [D + H / 2, $, 0.16, P]
                ]) {
                let S = this.block(R, J, Q, M, 0.4, 9079424);
                S.material = d, this.scene.add(S)
            }
        }
        this.scene.add(this.label("Cemetery", 23.1, 1.9, 50))
    }
    home(U = 450) {
        let d = new i(Ud / 2 - 0.5, 0, Ud / 2 - 0.5);
        if (this.view === "top") this.ortho.zoom = 1, this.ortho.updateProjectionMatrix(), this.flyTo(d, new i(Ud / 2 - 0.5, 90, Ud / 2 - 0.499), U);
        else this.flyTo(d, d.clone().add(this.homeOffset()), U)
    }
    flyTo(U, d, D) {
        if (D <= 0 || matchMedia("(prefers-reduced-motion: reduce)").matches) {
            this.controls.target.copy(U), this.camera.position.copy(d), this.controls.update();
            return
        }
        this.flight = {
            from: this.controls.target.clone(),
            to: U,
            camFrom: this.camera.position.clone(),
            camTo: d,
            start: performance.now(),
            length: D
        }
    }
    drive(U) {
        if (Object.assign(this.input, U), Object.values(this.input).some((d) => d !== 0)) this.following = !1, this.untouched = !1
    }
    step(U) {
        let d = 1 - Math.exp(-U / 0.08);
        for (let H of ["right", "forward", "turn", "zoom"]) this.velocity[H] += (this.input[H] - this.velocity[H]) * d;
        let D = this.velocity,
            $ = this.view === "top" ? 40 / this.ortho.zoom : this.camera.position.distanceTo(this.controls.target);
        if (Math.abs(D.right) > 0.001 || Math.abs(D.forward) > 0.001) this.pan(D.right * $ * 0.9 * U, D.forward * $ * 0.9 * U);
        if (Math.abs(D.turn) > 0.001) this.rotate(D.turn * 1.8 * U);
        if (Math.abs(D.zoom) > 0.001) this.zoom(Math.exp(-D.zoom * 1.6 * U))
    }
    pan(U, d) {
        let D = new i().subVectors(this.controls.target, this.camera.position);
        D.y = 0, D.normalize();
        let $ = new i(-D.z, 0, D.x),
            H = D.multiplyScalar(d).add($.multiplyScalar(-U)),
            P = Ud + 6,
            T = this.controls.target.clone().add(H);
        T.x = Math.max(-6, Math.min(P, T.x)), T.z = Math.max(-6, Math.min(P, T.z)), H.subVectors(T, this.controls.target), this.controls.target.copy(T), this.camera.position.add(H)
    }
    rotate(U) {
        if (this.view === "top") return;
        let d = new i().subVectors(this.camera.position, this.controls.target);
        d.applyAxisAngle(new i(0, 1, 0), U), this.camera.position.copy(this.controls.target).add(d)
    }
    zoom(U) {
        if (this.view === "top") {
            this.ortho.zoom = Math.max(this.controls.minZoom, Math.min(this.controls.maxZoom, this.ortho.zoom / U)), this.ortho.updateProjectionMatrix();
            return
        }
        let d = new i().subVectors(this.camera.position, this.controls.target),
            D = Math.max(this.controls.minDistance, Math.min(this.controls.maxDistance, d.length() * U));
        d.setLength(D), this.camera.position.copy(this.controls.target).add(d)
    }
    focusOn(U) {
        let d = this.figures.get(U);
        if (!d) return;
        let D = d.group.position.clone().add(new i(0, 1.05 * d.group.scale.y, 0));
        if (this.view === "top") {
            let $ = new i().subVectors(d.group.position, this.controls.target);
            $.y = 0, this.flyTo(this.controls.target.clone().add($), this.camera.position.clone().add($), 400)
        } else {
            let $ = new i(0, 0, 1).applyQuaternion(d.group.quaternion);
            $.y = 0, $.normalize();
            let H = D.clone().addScaledVector($, 11).add(new i(0, 5, 0));
            this.flyTo(D, H, 650)
        }
        this.following = !0
    }
    select(U) {
        if (this.selected = U, this.untouched = !1, U) this.focusOn(U);
        else this.following = !1
    }
    groundTarget() {
        let U = this.controls.target;
        if (this.following) return;
        if (this.view === "3d" && Math.abs(U.y) > 0.001) {
            let H = new i().subVectors(U, this.camera.position).normalize();
            if (H.y < -0.05) U.copy(this.camera.position).addScaledVector(H, -this.camera.position.y / H.y);
            else U.y = 0
        }
        let d = Ud + 6,
            D = Math.max(-6, Math.min(d, U.x)),
            $ = Math.max(-6, Math.min(d, U.z));
        if (D !== U.x || $ !== U.z) this.camera.position.x += D - U.x, this.camera.position.z += $ - U.z, U.x = D, U.z = $
    }
    track(U) {
        let d = this.selected ? this.figures.get(this.selected) : void 0;
        if (!d) return;
        let D = d.group.position.clone().add(new i(0, this.view === "top" ? 0 : 1.05 * d.group.scale.y, 0)),
            $ = new i().subVectors(D, this.controls.target);
        if (this.view === "top") $.y = 0;
        $.multiplyScalar(1 - Math.exp(-U / 0.15)), this.controls.target.add($), this.camera.position.add($)
    }
    render() {
        let U = performance.now(),
            d = Math.min(0.05, (U - this.lastFrame) / 1000);
        if (this.lastFrame = U, this.flight) {
            let L = Math.min(1, (U - this.flight.start) / this.flight.length),
                E = 1 - Math.pow(1 - L, 3);
            if (this.controls.target.lerpVectors(this.flight.from, this.flight.to, E), this.camera.position.lerpVectors(this.flight.camFrom, this.flight.camTo, E), L >= 1) this.flight = void 0
        } else if (this.step(d), this.following) this.track(d);
        let D = Math.min(1, (performance.now() - this.hourStart) / this.hourLength),
            $ = D * D * (3 - 2 * D),
            H = performance.now() / 1000;
        this.marker.visible = !1;
        for (let [L, E] of this.figures) {
            let k = E.from.distanceToSquared(E.to) > 0.01 && D < 1;
            if (E.group.position.lerpVectors(E.from, E.to, $), k) {
                E.group.lookAt(E.to.x, E.group.position.y, E.to.z);
                let j = Math.sin(H * 5 + E.phase) * 0.6;
                E.legL.rotation.x = j, E.legR.rotation.x = -j, E.armL.rotation.x = -j * 0.8, E.armR.rotation.x = j * 0.8, E.group.position.y += Math.abs(Math.sin(H * 5 + E.phase)) * 0.05, E.head.rotation.z = Math.sin(H * 2.5 + E.phase) * 0.04
            } else E.legL.rotation.x = E.legR.rotation.x = E.armL.rotation.x = E.armR.rotation.x = 0, E.head.rotation.z = 0, E.head.rotation.y = Math.sin(H * 0.6 + E.phase) * 0.35;
            let A = L === this.selected;
            if (E.head.scale.setScalar(A ? 1.1 : 1), A) this.marker.visible = !0, this.marker.position.copy(E.group.position).add(new i(0, 1.75 * E.group.scale.y + Math.sin(H * 3) * 0.12, 0)), this.marker.rotation.y = H * 1.2;
            if (A) E.ring.material.opacity = 0.9, E.ring.material.color.set(6333946)
        }
        if(D>=1 && this.travelQueue?.length){const next=this.travelQueue.shift();this.hasJourney=false;this.moveAll(next.town,next.duration);}
        this.weather(d);
        let P = this.climate,
            R = (((performance.now() - this.dayStart) / this.dayLength * 24 + 8) % 24 - 6) / 24 * Math.PI * 2,
            J = Math.sin(R);
        this.sun.position.set(Ud / 2 + Math.cos(R) * 60, 10 + J * 60, Ud / 2 + 16);
        let Q = Math.max(0, Math.min(1, (J + 0.15) / 0.5));
        this.daylight = Q, this.sun.intensity = (0.15 + Q * 1.5) * P.sun, this.ambient.intensity = (0.25 + Q * 0.6) * (0.6 + P.sun * 0.4);
        let M = new KU(725024).lerp(P.sky, Q),
            S = 1 - Math.abs(Q - 0.5) * 2;
        M.lerp(new KU(16752736), Math.max(0, S) * 0.35 * Math.min(1, P.sun)), this.scene.background = M, this.scene.fog.color.copy(M);
        let B = (1 - Q) * P.lights * (this.fallen ? 0 : 1);
        for (let L of this.lamps) L.emissiveIntensity = B * 1.6;
        for (let L of this.glows) L.opacity = B * (L instanceof w$ ? 0.85 : 0.5);
        for (let L of this.lanterns) L.emissiveIntensity = 0.4 + (1 - Q) * 1.4;
        for (let L of this.cars) {
            if (!L.group.visible) continue;
            let [E, k, A, j] = AD[L.road], C = A > j, I = C ? A : j, Z = this.traffic[L.road], a = L.t + L.speed * Z.pace * L.dir * d;
            if ((a >= I || a < 0) && L.slot >= Z.count) {
                L.group.visible = !1;
                continue
            }
            if (L.t = (a + I) % I, C) L.group.position.set(E + L.t - 0.5, 0, k + j / 2 - 0.5 + L.dir * 0.24), L.group.rotation.y = L.dir > 0 ? 0 : Math.PI;
            else L.group.position.set(E + A / 2 - 0.5 - L.dir * 0.24, 0, k + L.t - 0.5), L.group.rotation.y = L.dir > 0 ? -Math.PI / 2 : Math.PI / 2
        }
        this.windowMat.emissiveIntensity = B * 1.2;
        for (let L of this.clouds)
            if (L.group.position.x += L.speed * P.speed * d, L.group.position.x > Ud + 18) L.group.position.x = -18;
        this.controls.update(), this.groundTarget(), this.renderer.render(this.scene, this.camera)
    }
    resize() {
        let U = this.canvas.parentElement;
        this.width = U.clientWidth || 1, this.height = U.clientHeight || 1, this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)), this.renderer.setSize(this.width, this.height, !1), this.perspective.aspect = this.width / this.height, this.perspective.updateProjectionMatrix();
        let d = (Ud + 6) / 2,
            D = this.width / this.height;
        if (this.ortho.left = -d * Math.max(1, D), this.ortho.right = d * Math.max(1, D), this.ortho.top = d / Math.min(1, D), this.ortho.bottom = -d / Math.min(1, D), this.ortho.updateProjectionMatrix(), this.untouched) this.home(0)
    }
}
var eE = 1400,
    vE = 2500,
    pd = (U) => document.querySelector(U),
    lE = pd("#world"),
    yE = pd("#clock"),
    oE = pd("#stats"),
    N0 = pd("#event-select"),
    GT = pd("#chaos-select"),
    nH = pd("#next"),
    z0 = pd("#auto"),
    ES = pd("#status"),
    nE = pd("#inspector"),
    OT = pd("#toasts"),
    WT = pd("#sound"),
    m0 = pd("#ending"),
    ZS = !1,
    qd = new BP,
    e = addEconomy(addInvestors(extendTown(sT()))),
    DD, _0 = !1,
    L$ = !1,
    qD = {
        calls: 0,
        inputTokens: 0,
        outputTokens: 0,
        millis: 0
    },
    YD = (U) => `$${Math.round(U).toLocaleString()}`,
    q0 = {
        town: "headlines",
        life: "timeline"
    };

function aS(U, d) {
    let D = LU("div", "toggle");
    D.setAttribute("role", "tablist");
    for (let [$, H] of d) {
        let P = LU("button", void 0, H);
        P.type = "button", P.setAttribute("role", "tab"), P.setAttribute("aria-selected", String(q0[U] === $)), P.addEventListener("click", () => {
            q0[U] = $, FD()
        }), D.append(P)
    }
    return D
}

function YS(U) {
    let d = LU("div", "prose");
    for (let D of U) d.append(LU("p", void 0, D));
    return d
}
var Yd = new iT(lE, (U) => {
        if (localUi?.select(U), DD = U, Yd.select(U), U) qd.blip();
        FD()
    }),
    mT = () => {
        qd.start(), qd.setEvent(e.event)
    };
addEventListener("pointerdown", mT, {
    once: !0
});
addEventListener("keydown", mT, {
    once: !0
});
WT.textContent=String.fromCodePoint(0x1F50A);WT.setAttribute('aria-label','Mute sound effects');WT.title='Mute sound effects';WT.setAttribute('aria-pressed','false');
WT.addEventListener("click", () => {
    if (!qd.running) mT();
    qd.setMuted(!qd.muted), WT.setAttribute("aria-pressed", String(qd.muted)), WT.textContent=String.fromCodePoint(qd.muted?0x1F507:0x1F50A), WT.title=qd.muted?'Unmute sound effects':'Mute sound effects', WT.setAttribute('aria-label',WT.title)
});
Yd.build(e);
for (const investor of e.investors) Yd.addFigure({id:investor.id,job:"clerk",target:investor.location},e);
Yd.setTraffic(e.traffic.map((U) => U.level || 1));
N0.replaceChildren(...Object.entries(Id).map(([U, d]) => new Option(d.name, U)));
GT.replaceChildren(...Object.entries(l0).map(([U, d]) => new Option(d.label, U, !1, U === e.chaos)));
GT.addEventListener("change", () => {
    e.chaos = GT.value;
    let U = l0[e.chaos];
    VD("Council", U.chance === 0 ? "The gods have been appeased. No more disasters." : `Disaster odds set to ${U.label.toLowerCase()}: ${Math.round(U.chance*100)}% an hour.`, U.chance >= 0.6 ? "warn" : "")
});
var LU = (U, d, D) => {
    let $ = document.createElement(U);
    if (d) $.className = d;
    if (D !== void 0) $.textContent = D;
    return $
};

function u0(U) {
    ES.textContent = U, ES.hidden = !U
}

function XS() {
    let U = e.residents.filter((D) => D.alive),
        d = (D) => U.reduce(($, H) => $ + H[D], 0) / Math.max(1, U.length);
    return {
        alive: U,
        mood: Math.round(d("mood")),
        health: Math.round(d("health")),
        energy: Math.round(d("energy")),
        fed: Math.round(100 - d("hunger")),
        money: d("money"),
        outlook: d("outlook"),
        distressed: U.filter((D) => D.distress > 0.6).length,
        atRisk: U.filter((D) => D.risk > 0.7).length,
        total: U.reduce((D, $) => D + $.money, 0)
    }
}

function p0() {
    let U = XS();
    oE.replaceChildren(...[
        ["alive", `${U.alive.length}/${e.residents.length}`],
        ["mood", String(U.mood)],
        ["health", String(U.health)],
        ["fed", String(U.fed)],
        ["in distress", String(U.distressed)],
        ["economy", YD(U.total)],
        ["Laya decisions", e.decisions.toLocaleString()],
        ["calls", String(e.calls)]
    ].map(([d, D]) => {
        let $ = LU("span");
        return $.append(`${d} `, Object.assign(LU("b"), {
            textContent: D
        })), $
    })), yE.textContent = `${jD(e.hour)} · ${e.season} · ${Id[e.event].name}${e.surprise?` (${e.surprise.until-e.hour}h left)`:""}`
}

function FD() {
    if (localUi?.renderDetail(DD)) return;
    let U = DD ? e.residents.find((d) => d.id === DD) : void 0;
    nE.replaceChildren(...U ? rE(U) : sE());
    localUi?.enhance(DD)
}

function oH(U) {
    let d = LU("dl", "metrics");
    for (let [D, $] of U) {
        let H = LU("div");
        H.append(LU("dt", void 0, D), LU("dd", void 0, $)), d.append(H)
    }
    return d
}

function yH(U, d) {
    let D = LU("div", "bars");
    for (let [$, H, P] of U) {
        let T = LU("div", "bar"),
            R = LU("div", "bar-track"),
            J = LU("div", "bar-fill");
        if (J.style.width = `${Math.min(100,H/Math.max(1,d)*100)}%`, P) J.style.background = P;
        R.append(J), T.append(LU("span", "bar-label", $), R, LU("span", "bar-value", String(H))), D.append(T)
    }
    return D
}

function sd(U, ...d) {
    let D = LU("section", "section");
    return D.append(LU("h3", void 0, U), ...d), D
}

function sE() {
    let U = XS(),
        d = e.tally,
        D = LU("header");
    D.append(LU("h2", void 0, "KP Town"), LU("p", "lede", `${e.residents.filter(r=>r.alive).length} residents. Every hour, Laya makes seven decisions for each of them, sets the traffic on every road and advises the council. Change the conditions and watch the city adapt.`));
    let $ = LU("div", "council"),
        H = e.council.emergency > 0.6;
    $.append(Object.assign(LU("span", `pill ${H?"bad":"ok"}`), {
        textContent: H ? `Emergency · ${Math.round(e.council.emergency*100)}%` : `No emergency · ${Math.round((1-e.council.emergency)*100)}%`
    }), Object.assign(LU("p", "council-text"), {
        textContent: `Priority: ${$P[e.council.priority]??e.council.priority}${e.council.confidence?` (${Math.round(e.council.confidence*100)}% sure)`:""}.`
    }));
    let P = oH([
            ["Population", `${U.alive.length} / ${e.residents.length}`],
            ["Deaths", String(d.deaths)],
            ["Moved away", String(d.left)],
            ["Moved in", String(d.arrived)],
            ["Overcrowded homes", String(HP(e).length)],
            ["In distress", String(U.distressed)],
            ["Mood", String(U.mood)],
            ["Health", String(U.health)],
            ["Energy", String(U.energy)],
            ["Fed", String(U.fed)],
            ["At risk of illness", String(U.atRisk)],
            ["Outlook", ["despairing", "worried", "coping", "content", "thriving"][Math.round(U.outlook * 4)]]
        ]),
        T = [...U.alive].sort((a, Y) => Y.money - a.money),
        R = U.alive.filter((a) => a.activity === "work" && a.lastWage === 0).length,
        J = oH([
            ["Council treasury", YD(e.treasury)],
            ["Income tax", `${Math.round(e.tax*100)}%`],
            ["Meal prices", `${Math.round(JP(e)*100)}%`],
            ["Money in the city", YD(U.total)],
            ["Average savings", YD(U.money)],
            ["Inequality", JR(e).toFixed(2)],
            ["Richest", T[0] ? `${T[0].name.split(" ")[0]} ${YD(T[0].money)}` : "–"],
            ["Poorest", T.at(-1) ? `${T.at(-1).name.split(" ")[0]} ${YD(T.at(-1).money)}` : "–"],
            ["Behind on rent", `${U.alive.filter((a)=>a.arrears>0).length} (rent ${YD(E$(e))}/day)`],
            ["Unpaid this hour", String(R)],
            ["Earned so far", YD(d.earned)],
            ["Spent so far", YD(d.spent)],
            ["Meals served", String(d.meals)],
            ["Clinic visits", String(d.clinicVisits)],
            ["Neighbour visits", String(d.helps)]
        ]),
        Q = Object.entries(e.businesses).map(([a, Y]) => [`${e.places.find((f)=>f.id===a)?.name??a} · ${Math.round(Y.price*100)}%`, Math.round(Y.till), Y.shortfalls ? "#f43f5e" : void 0]).sort((a, Y) => Y[1] - a[1]),
        M = yH(Q, Math.max(1, ...Q.map((a) => a[1]))),
        S = Object.keys(hD).map((a) => [hD[a].label, U.alive.filter((Y) => Y.activity === a).length]),
        B = yH(S, U.alive.length),
        L = Object.keys(U0).map((a) => [a, U.alive.filter((Y) => Y.job === a).length, U0[a]]),
        E = yH(L, Math.max(...L.map((a) => a[1]))),
        k = yH(fD.map((a, Y) => [`${a} · ${UP[Math.round(e.traffic[Y].level)]}`, Math.round(e.traffic[Y].level), "#f59e0b"]), 4),
        A = oH([
            ["Decisions", e.decisions.toLocaleString()],
            ["Calls", String(e.calls)],
            ["Avg latency", qD.calls ? `${Math.round(qD.millis/qD.calls)} ms` : "–"],
            ["Input tokens", qD.inputTokens.toLocaleString()],
            ["Decisions per call", e.calls ? String(Math.round(e.decisions / e.calls)) : "–"]
        ]),
        j = LU("div", "roster"),
        C = [...e.residents].sort((a, Y) => Number(Y.alive) - Number(a.alive) || Y.distress - a.distress || a.health - Y.health);
    for (let a of C) {
        let Y = LU("button", `row${a.alive?"":" dead"}`);
        Y.type = "button";
        let f = LU("i");
        f.style.background = U0[a.job] ?? "#fff";
        let G = LU("span");
        G.append(a.name, " ", LU("span", "job", a.job)), Y.append(f, G, LU("span", "act", a.alive ? hD[a.activity].label : a.left ? "left town" : "died"), LU("span", "flag", a.alive && a.distress > 0.6 ? "distress" : a.alive && a.risk > 0.7 ? "at risk" : "")), Y.addEventListener("click", () => {
            DD = a.id, Yd.select(a.id), FD()
        }), j.append(Y)
    }
    let I = LU("ol", "news");
    for (let a of [...e.news].reverse().slice(0, 30)) {
        let Y = LU("li", a.lead ? "lead" : "");
        Y.append(LU("span", "when", jD(a.hour)), a.text, ...a.lead && a.confidence ? [LU("span", "sure", `${Math.round(a.confidence*100)}%`)] : []), I.append(Y)
    }
    let Z = q0.town === "story" ? YS(MP(e)) : I;
    return [D, sd("Laya", A), sd("Right now", B), sd("KP Town Gazette", aS("town", [
        ["headlines", "Headlines"],
        ["story", "Story"]
    ]), Z), sd("Council", $), sd("People", P), sd("Economy", J), sd("Businesses", M), sd("Traffic", k), sd("Workforce", E), sd("Residents", j)]
}

function xH(U) {
    localUi?.select(U); DD = U, Yd.select(U), FD()
}

function xE() {
    return [...e.residents].sort((U, d) => Number(d.alive) - Number(U.alive) || d.distress - U.distress || U.health - d.health)
}

function sH(U) {
    let d = xE(),
        D = d.findIndex(($) => $.id === DD);
    xH(d[(D + U + d.length) % d.length].id)
}

function IS(U) {
    let d = LU("button", `chip${U.alive?"":" dead"}`);
    d.type = "button";
    let D = LU("i");
    return D.style.background = U0[U.job] ?? "#fff", d.append(D, U.name.split(" ")[0]), d.title = `${U.name}, ${U.job}`, d.addEventListener("click", () => xH(U.id)), d
}

function rE(U) {
    let d = LU("header"),
        D = LU("div", "nav"),
        $ = LU("button", "btn small");
    $.type = "button", $.append("← All residents"), $.addEventListener("click", () => xH(void 0));
    let H = LU("button", "btn small", "‹");
    H.type = "button", H.title = "Previous resident ([)", H.addEventListener("click", () => sH(-1));
    let P = LU("button", "btn small", "›");
    P.type = "button", P.title = "Next resident (])", P.addEventListener("click", () => sH(1));
    let T = LU("div", "pager");
    T.append(H, P), D.append($, T);
    let R = LU("h2", void 0, U.name),
        J = e.places.find((I) => I.id === U.target)?.name ?? "the street",
        Q = LU("p", "lede");
    Q.append(`${U.job}, ${U.age} · ${U.alive?`${hD[U.activity].label} at ${J}`:U.left?"left town":"died"} `, ...U.alive && U.sick ? [Object.assign(LU("span", "pill bad"), {
        textContent: `ill, ${U.sick}h to go`
    })] : [], ...U.alive && U.distress > 0.6 ? [Object.assign(LU("span", "pill warn"), {
        textContent: `in distress ${Math.round(U.distress*100)}%`
    })] : [], ...U.alive && U.risk > 0.7 ? [Object.assign(LU("span", "pill"), {
        textContent: `illness risk ${Math.round(U.risk*100)}%`
    })] : []), d.append(D, R, Q);
    let M = e.residents.filter((I) => I.home === U.home && I.id !== U.id),
        S = e.residents.filter((I) => I.work === U.work && I.id !== U.id).slice(0, 12),
        B = LU("div", "people");
    if (M.length) {
        let I = LU("div", "chips");
        I.append(LU("span", "chips-label", "Lives with"), ...M.map(IS)), B.append(I)
    }
    if (S.length) {
        let I = LU("div", "chips");
        I.append(LU("span", "chips-label", `Works with at ${e.places.find((Z)=>Z.id===U.work)?.name??"work"}`), ...S.map(IS)), B.append(I)
    }
    let L = LU("div", "needs");
    for (let [I, Z] of [
            ["Energy", U.energy],
            ["Fed", 100 - U.hunger],
            ["Health", U.health],
            ["Mood", U.mood]
        ]) {
        let a = LU("div", "need"),
            Y = LU("div", "need-track"),
            f = LU("div", `need-fill${Z<30?" low":""}`);
        f.style.width = `${Z}%`, Y.append(f), a.append(LU("span", void 0, I), Y, LU("span", void 0, String(Z))), L.append(a)
    }
    let E = ["despairing", "worried", "coping", "content", "thriving"][Math.round(U.outlook * 4)],
        k = oH([
            ["Money", YD(U.money)],
            ["Age", `${U.age}${U.sick?` · ill (${U.sick}h)`:""}`],
            ["Laya's confidence", `${Math.round(U.confidence*100)}%`],
            ["Home", e.places.find((I) => I.id === U.home)?.name ?? ""],
            ["Works at", e.places.find((I) => I.id === U.work)?.name ?? ""],
            ["Work effort", U.effort],
            ["Meal budget", U.spend],
            ["Outlook", E],
            ["Illness risk", `${Math.round(U.risk*100)}%`],
            ["Checking on", U.helping ? e.residents.find((I) => I.id === U.helping)?.name ?? "–" : "–"]
        ]),
        A = sd("Right now", L, Object.assign(LU("div"), {
            style: "height:12px"
        }), k),
        j = LU("ol", "life");
    for (let I of [...U.log].reverse()) {
        let Z = LU("li", I.kind);
        Z.append(LU("span", "when", jD(I.hour)), I.text), j.append(Z)
    }
    let C = q0.life === "story" ? YS(IR(U, e)) : j;
    return [d, A, sd("People", B), sd("Life so far", aS("life", [
        ["timeline", "Timeline"],
        ["story", "Story"]
    ]), C)]
}
function VD(U, d, D = "") {
    let $ = LU("div", `toast ${D}`.trim());
    $.append(LU("span", "kicker", U), LU("span", void 0, d)), OT.prepend($), qd.chime(D === "bad");
    while (OT.children.length > 2) OT.lastElementChild?.remove();
    requestAnimationFrame(() => $.classList.add("in")), setTimeout(() => {
        $.classList.remove("in"), setTimeout(() => $.remove(), 400)
    }, 9000)
}

function $I() {
    let U = [...e.news].reverse().find((D) => D.lead && D.hour === e.hour - 1),
        d = !!U && /dies|gone|mourns|taken|bitten|jammed|gridlock|standstill|emergency|injure|hurt|dry|payroll/i.test(U.text);
    if (U) VD(GU(d ? ["Breaking", "Alert", "Just in"] : ["Gazette", "Just in", "Front page"], e.hour), U.text, d ? "bad" : "");
    if (e.council.emergency > 0.6 && !kS) VD("Council", GU([`Emergency declared. Priority: ${e.council.priority}.`, `Town hall calls an emergency and puts ${e.council.priority} first.`, `Emergency footing: ${e.council.priority} comes first now.`], e.hour), "warn");
    kS = e.council.emergency > 0.6
}
var kS = !1;

function HI() {
    ZS = !0, L$ = !1, z0.setAttribute("aria-pressed", "false"), nH.disabled = !0, z0.disabled = !0, Yd.collapse(), qd.fall();
    let U = e.tally.deaths,
        d = e.tally.left,
        D = Math.floor(e.hour / 24) + 1;
    m0.replaceChildren(LU("p", "ending-kicker", "The end of KP Town"), LU("h2", void 0, GU(["KP Town has fallen", "Nobody is left in KP Town", "The last light goes out in KP Town"], e.hour)), LU("p", "ending-lede", `${D} days. ${U} dead, ${d} gone, ${e.decisions.toLocaleString()} decisions by Laya.`), ...MP(e).slice(-3).map((T) => LU("p", "ending-story", T)));
    let $ = LU("button", "btn primary", "Start again");
    $.type = "button", $.addEventListener("click", () => location.reload());
    let H = LU("button", "btn", "Read the whole story");
    H.type = "button", H.addEventListener("click", () => {
        q0.town = "story", DD = void 0, FD(), m0.classList.remove("show")
    });
    let P = LU("div", "ending-actions");
    P.append($, H), m0.append(P), m0.hidden = !1, requestAnimationFrame(() => m0.classList.add("show")), u0(""), p0(), FD()
}
async function _T(mode=false) {
    const marketOnly=mode===true||!!(mode&&typeof mode==='object');
    if (_0 || ZS) return;
    if(!marketOnly&&e.finance.playerActive&&e.finance.offers.some(o=>o.status==='queued')){u0('A pitch is waiting. Choose Take pitch or Pass for each pitching business.');localUi.pitchWaiting();return;}
    _0 = true;
    localUi.renderDetail();
    nH.disabled = N0.disabled = GT.disabled = true;
    qd.hour();
    const before = structuredClone(e);
    u0(`Laya is deciding locally for ${e.residents.filter(r=>r.alive).length} residents…`);
    try {
        if(mode?.lotId){const lot=e.finance.offers.find(o=>o.id===mode.lotId);if(!lot||lot.status!=='queued'||lot.playerPitchDecision)throw new Error('This pitch has already been decided.');lot.playerPitchDecision={action:mode.action,hour:e.hour};lot.playerDeclined=mode.action==='pass';}
        if(!marketOnly) await decideTown(e, core, judge);
        await planBusinesses(e,judge);
        u0('Businesses and investors are considering funding…');
        const funded = await financeTurn(e, judge,{queueOnly:e.finance.playerActive&&!marketOnly,maxLots:e.finance.playerActive?1:3,lotId:mode?.lotId,onUpdate:()=>localUi.marketUpdate(),humanTurn:(lot,investor)=>{u0('Your turn at Investor Plaza. Bid or pass to continue.');return localUi.humanTurn(lot,investor);}});
        spendPlans(e);
        if(!marketOnly){
        const opening = operatingBalances(e);
        processReturns(e);
        await chooseShops(e,core,judge);
        await discretionaryVisits(e,judge);
        UR(e);
        afterOperations(e,opening);
        finishOperations(e, opening);
        const changes = SR(e);
        u0('The Gazette is choosing its headline…');
        await decideNews(e, core, judge);
        assertFinance(e);
        // Commit visuals only after all decisions, transfers, and accounting validate.
        Yd.setTraffic(e.traffic.map(r=>r.level));
        Yd.moveAll(e, eE);
        if (changes.season) Yd.setSeason(e.season);
        Yd.setEvent(e.event); qd.setEvent(e.event); N0.value=e.event;
        if(changes.newcomers) VD('Gazette', `${changes.newcomers} newcomers arrive in KP Town.`);
        if(changes.left) VD('Gazette', `${changes.left} residents leave KP Town.`);
        if(changes.struck) VD('Breaking', `${Id[e.event].name} strikes the town.`, 'bad');
        }
        for(const offer of funded)localUi.playerWin(offer);
        for(const offer of funded) VD('Investment', `${e.places.find(p=>p.id===offer.businessId).name} raises $${offer.amount} from ${e.investors.find(i=>i.id===offer.investorId).name}.`);
        $I(); u0('');
        if (!e.residents.some(r=>r.alive)) {
            p0(); FD(); _0=false; N0.disabled=GT.disabled=false; HI(); return;
        }
    } catch(error) {
        const actualCalls=e.calls;
        e=before; e.calls=actualCalls;
        u0(`Local Laya did not complete this hour: ${error.message}. The hour was rolled back.`);
        L$=false; z0.setAttribute('aria-pressed','false');
    }
    _0=false; p0(); FD(); nH.disabled=N0.disabled=GT.disabled=false;
    if(e.finance.playerActive&&e.finance.offers.some(o=>o.status==='queued')){u0('A pitch is waiting. Choose which pitch to take or pass. Auto waits for you.');localUi.pitchWaiting();}
    else if(L$) setTimeout(()=>{if(L$)_T();},vE);
}

var XD = {
    right: 0,
    forward: 0,
    turn: 0,
    zoom: 0
};

function uT(U, d, D) {
    let $ = () => {
        XD[d] = 0, Yd.drive(XD), U.classList.remove("held")
    };
    U.addEventListener("pointerdown", (H) => {
        H.preventDefault(), U.setPointerCapture(H.pointerId), U.classList.add("held"), XD[d] = D, Yd.drive(XD)
    });
    for (let H of ["pointerup", "pointercancel", "pointerleave"]) U.addEventListener(H, $)
}
for (let U of document.querySelectorAll("[data-pan]")) {
    let [d, D] = U.dataset.pan.split(",").map(Number);
    uT(U, d ? "right" : "forward", d || D)
}
for (let U of document.querySelectorAll("[data-rotate]")) uT(U, "turn", Number(U.dataset.rotate));
for (let U of document.querySelectorAll("[data-zoom]")) uT(U, "zoom", Number(U.dataset.zoom));
pd("#center").addEventListener("click", () => DD ? Yd.focusOn(DD) : Yd.home());
var VS = {
        w: ["forward", 1],
        arrowup: ["forward", 1],
        s: ["forward", -1],
        arrowdown: ["forward", -1],
        a: ["right", -1],
        arrowleft: ["right", -1],
        d: ["right", 1],
        arrowright: ["right", 1],
        q: ["turn", 1],
        e: ["turn", -1],
        "=": ["zoom", 1],
        "+": ["zoom", 1],
        "-": ["zoom", -1]
    },
    rH = new Set;

function NT() {
    XD.right = XD.forward = XD.turn = XD.zoom = 0;
    for (let U of rH) {
        let [d, D] = VS[U] ?? [];
        if (d) XD[d] = D
    }
    Yd.drive(XD)
}
addEventListener("keydown", (U) => {
    if (U.target instanceof HTMLInputElement || U.target instanceof HTMLSelectElement) return;
    let d = U.key.toLowerCase();
    if (d === "c") return Yd.home();
    if (d === "escape" && DD) return xH(void 0);
    if (d === "[" && DD) return sH(-1);
    if (d === "]" && DD) return sH(1);
    if (!(d in VS)) return;
    U.preventDefault(), rH.add(d), NT()
});
addEventListener("keyup", (U) => {
    if (rH.delete(U.key.toLowerCase())) NT()
});
addEventListener("blur", () => {
    rH.clear(), NT()
});
var PI = pd(".segmented");
for (let U of document.querySelectorAll("[data-view]")) U.addEventListener("click", () => {
    let d = U.dataset.view;
    Yd.setView(d), document.querySelectorAll("[data-view]").forEach((D, $) => {
        let H = D === U;
        if (D.setAttribute("aria-selected", String(H)), D.tabIndex = H ? 0 : -1, H) PI.dataset.active = String($)
    })
});
nH.addEventListener("click", _T);
z0.addEventListener("click", () => {
    if (L$ = !L$, z0.setAttribute("aria-pressed", String(L$)), L$ && !_0) _T()
});
N0.addEventListener("change", () => {
    e.event = N0.value, e.surprise = void 0, Yd.setEvent(e.event), qd.setEvent(e.event);
    let U = PR(e.event);
    e.news.push({
        hour: e.hour,
        text: U,
        lead: !0
    });
    let d = SP(e, e.event);
    if (d.length) Yd.moveAll(e, 600), VD("Alert", d.length === 1 ? `${d[0].name} ${d[0].log.at(-1).text.toLowerCase().replace(/\.$/,"")}.` : `${d.length} dead on impact: ${d.map(($)=>$.name.split(" ")[0]).join(", ")}.`, "bad");
    VD("Breaking", U, e.event === "calm" || e.event === "festival" || e.event === "lottery" ? "" : "bad");
    let D = `Conditions changed: ${Id[e.event].name}.`;
    for (let $ of e.residents)
        if ($.alive) $.log.push({
            hour: e.hour,
            text: D,
            kind: "event"
        });
    p0(), FD()
});

function FS() {
    Yd.render(), qd.setDay(Yd.daylight), requestAnimationFrame(FS)
}
requestAnimationFrame(FS);
p0();
FD();
setTimeout(() => pd("#hint").classList.remove("show"), 8000);
const core = {
  createTown:sT,actions:hD,effort:dP,spending:DP,priorities:$P,events:Id,
  roads:fD,trafficLevels:UP,priceChoices:OS,taxChoices:WS,time:jD,isOpen:j$,
  roadPlaces:wS,applyResidents:tT,applyTraffic:HR,applyEconomy:BR,
  newsCandidates:QP,newsQuestions:RR,applyNews:QR,applyConsequences:UR,advanceWorld:SR,
  random:mS
};
const judge=makeJudge(usage=>{
  qD.calls+=usage.calls; qD.inputTokens+=usage.inputTokens; qD.millis+=usage.millis;
  e.calls+=usage.calls;
});
localUi=installUI({onQueueUpdate:t=>{const lots=t.finance.offers.filter(o=>['queued','open'].includes(o.status)),plaza=t.places.find(p=>p.id==='park13');for(const [n,id]of Object.keys(t.businesses).entries()){const key=`q${n}`,index=lots.findIndex(o=>o.businessId===id);let figure=Yd.figures.get(key);if(index>=0&&!figure){Yd.addFigure({id:key,job:'trader',target:plaza.id},t);figure=Yd.figures.get(key);figure.group.userData.id=`business:${id}`;}if(figure){figure.group.visible=index>=0;if(index>=0){figure.from.set(plaza.x+.7+(index%6)*.8,0,plaza.z+.8+Math.floor(index/6)*.55);figure.to.copy(figure.from);figure.group.position.copy(figure.from);}}}},getTown:()=>e,select:xH,inspector:nE,onWin:()=>qd.cashRegister(),isBusy:()=>_0,runPlaza:(lotId,action)=>_T({lotId,action}),refresh:()=>{p0();FD();},onJoin:i=>{qd.ding();Yd.addFigure({id:i.id,job:'trader',target:i.location},e);},focusPlaza:()=>{const p=e.places.find(p=>p.id==='park13'),v=new i(p.x+p.w/2,0,p.z+p.d/2);Yd.following=false;Yd.flyTo(v,v.clone().add(new i(13,17,19)),750);},focusBusiness:id=>{const p=e.places.find(p=>p.id===id);if(!p)return;Yd.following=false;Yd.selected=undefined;const target=new i(p.x+p.w/2,0,p.z+p.d/2);Yd.flyTo(target,target.clone().add(new i(13,17,19)),750);}});
FD();
