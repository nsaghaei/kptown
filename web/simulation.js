import {productionRevenue,creditBusiness,recordLostSale} from './economy.js';
var Ud = 40,
    oT = 120;
var nT = 0.042,
    AD = [
        [0, 7.5, 40, 1],
        [0, 15.5, 40, 1],
        [0, 23.5, 40, 1],
        [0, 31.5, 40, 1],
        [10, 0, 1, 40],
        [22.5, 0, 1, 40],
        [32, 0, 1, 40]
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
    fD = ["North Road", "Market Street", "Mill Road", "South Road", "West Avenue", "Central Avenue", "East Avenue"],
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
            C = [T.distress > 0.6 ? GU([" In real distress.", " Struggling badly.", " Needs someone."], B) : "", T.risk > 0.7 ? GU([" Looks like they're coming down with something.", " At risk of falling ill.", " Not well at all."], B + 1) : "", j < 60 ? GU([` Jev was only ${j}% sure.`, ` A close call for Jev (${j}%).`, ` (${j}% sure)`], B + 2) : ""].join("");
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
    let d = new Set(["KP Town", "Jev", "Council", "Gazette"]);
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
            B = T === 0 ? ld([`This is KP Town, a town of ${U.residents.length} in the ${M}. `, `KP Town, ${M}: ${U.residents.length} residents, seven roads, and a council that lets Jev decide. `], J) : ld([`Day ${T+1} began in ${M}, ${S}. `, `The ${M} sun rose on day ${T+1} to ${S}. `, `Day ${T+1}. ${S[0].toUpperCase()}${S.slice(1)}, and the town went about its business. `], J),
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

const core = {
  createTown:sT,actions:hD,effort:dP,spending:DP,priorities:$P,events:Id,
  roads:fD,trafficLevels:UP,priceChoices:OS,taxChoices:WS,time:jD,isOpen:j$,
  roadPlaces:wS,applyResidents:tT,applyTraffic:HR,applyEconomy:BR,
  newsCandidates:QP,newsQuestions:RR,applyNews:QR,applyConsequences:UR,advanceWorld:SR,
  random:mS
};
export default core;
