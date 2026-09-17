javascript:(()=>{

/* ============================================================
   GRANICA GALOWIE ↔ HOPE
   ============================================================ */

/* 🟡 ŻÓŁTA GRANICA — HOPE */
const GRANICA_HOPE = [
    [500,400],
    [502,470],
    [514,475],
    [519,498]
];

/* 🔵 NIEBIESKA GRANICA — GALOWIE */
const GRANICA_GALOW = [
    [512,400],
    [510,458],
    [523,474],
    [522,499]
];

/* ============================================================
   KOLORY
   ============================================================ */

const KOLOR_HOPE = "#FFD400";
const KOLOR_GALOW = "#168CFF";
const KOLOR_WSPOLNY = "#4CFF5B";

/* ============================================================
   USUNIĘCIE POPRZEDNIEJ WERSJI
   ============================================================ */

document.getElementById("galowie-hope-granica")?.remove();
document.getElementById("galowie-hope-panel")?.remove();

/* ============================================================
   ZNALEZIENIE MAPY
   ============================================================ */

const mapa =
    document.querySelector("#map") ||
    document.querySelector(".map") ||
    document.querySelector("#map_container") ||
    document.querySelector(".map_container");

if (!mapa) {
    alert(
        "Nie znaleziono mapy.\n\n" +
        "Uruchom skrypt na stronie MAPY Plemion."
    );
    return;
}

/* ============================================================
   ZNALEZIENIE WIOSEK
   ============================================================ */

function znajdzWioski() {

    const wynik = [];

    const elementy = mapa.querySelectorAll(
        "[data-x][data-y], .map_village, .village"
    );

    elementy.forEach(el => {

        let x = el.dataset?.x;
        let y = el.dataset?.y;

        if (x === undefined || y === undefined) {

            const tekst =
                el.getAttribute("data-coords") ||
                el.getAttribute("data-coordinate");

            if (tekst) {

                const m =
                    tekst.match(/(\d+)\|(\d+)/);

                if (m) {
                    x = m[1];
                    y = m[2];
                }
            }
        }

        if (
            x !== undefined &&
            y !== undefined
        ) {

            x = parseInt(x);
            y = parseInt(y);

            if (
                Number.isFinite(x) &&
                Number.isFinite(y)
            ) {

                wynik.push({
                    x:x,
                    y:y,
                    el:el
                });

            }
        }

    });

    return wynik;
}

const wioski = znajdzWioski();

/* ============================================================
   USTALENIE SKALI MAPY
   ============================================================ */

function znajdzSkale() {

    if (wioski.length < 2) {
        return null;
    }

    let a = null;
    let b = null;

    for (
        let i=0;
        i<wioski.length && !a;
        i++
    ) {

        for (
            let j=i+1;
            j<wioski.length;
            j++
        ) {

            if (
                wioski[i].x !== wioski[j].x ||
                wioski[i].y !== wioski[j].y
            ) {

                a = wioski[i];
                b = wioski[j];

                break;
            }
        }
    }

    if (!a || !b) {
        return null;
    }

    const ra =
        a.el.getBoundingClientRect();

    const rb =
        b.el.getBoundingClientRect();

    const rm =
        mapa.getBoundingClientRect();

    const ax =
        ra.left +
        ra.width/2 -
        rm.left;

    const ay =
        ra.top +
        ra.height/2 -
        rm.top;

    const bx =
        rb.left +
        rb.width/2 -
        rm.left;

    const by =
        rb.top +
        rb.height/2 -
        rm.top;

    const dx =
        b.x-a.x;

    const dy =
        b.y-a.y;

    let pxX = null;
    let pxY = null;

    if (dx !== 0) {
        pxX =
            (bx-ax)/dx;
    }

    if (dy !== 0) {
        pxY =
            (by-ay)/dy;
    }

    if (pxX === null) {
        pxX = pxY;
    }

    if (pxY === null) {
        pxY = pxX;
    }

    return {

        x0:a.x,
        y0:a.y,

        px0:ax,
        py0:ay,

        pxX:pxX,
        pxY:pxY
    };
}

const skala =
    znajdzSkale();

if (!skala) {

    alert(
        "Nie udało się ustalić skali mapy.\n\n" +
        "Przejdź na stronę mapy i uruchom skrypt ponownie."
    );

    return;
}

/* ============================================================
   WSPÓŁRZĘDNE → PIXELE
   ============================================================ */

function mapaNaPixel(x,y) {

    return {

        x:
            skala.px0 +
            (x-skala.x0) *
            skala.pxX,

        y:
            skala.py0 +
            (y-skala.y0) *
            skala.pxY

    };
}

/* ============================================================
   WARSTWA SVG
   ============================================================ */

const warstwa =
    document.createElement("div");

warstwa.id =
    "galowie-hope-granica";

warstwa.style.position =
    "absolute";

warstwa.style.left =
    "0";

warstwa.style.top =
    "0";

warstwa.style.width =
    "100%";

warstwa.style.height =
    "100%";

warstwa.style.zIndex =
    "999";

warstwa.style.pointerEvents =
    "none";

const svg =
    document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );

svg.setAttribute(
    "width",
    "100%"
);

svg.setAttribute(
    "height",
    "100%"
);

svg.style.position =
    "absolute";

svg.style.left =
    "0";

svg.style.top =
    "0";

svg.style.overflow =
    "visible";

warstwa.appendChild(svg);

mapa.style.position =
    "relative";

mapa.appendChild(warstwa);

/* ============================================================
   RYSOWANIE GRANICY
   ============================================================ */

function punktySVG(tablica) {

    return tablica.map(p => {

        const px =
            mapaNaPixel(
                p[0],
                p[1]
            );

        return (
            px.x +
            "," +
            px.y
        );

    }).join(" ");
}

function narysujGranice(
    tablica,
    kolor
) {

    const linia =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polyline"
        );

    linia.setAttribute(
        "points",
        punktySVG(tablica)
    );

    linia.setAttribute(
        "fill",
        "none"
    );

    linia.setAttribute(
        "stroke",
        kolor
    );

    linia.setAttribute(
        "stroke-width",
        "4"
    );

    linia.setAttribute(
        "stroke-linejoin",
        "round"
    );

    linia.setAttribute(
        "stroke-linecap",
        "round"
    );

    linia.style.filter =
        "drop-shadow(0 0 3px rgba(0,0,0,.9))";

    svg.appendChild(linia);

    /* Punkty kontrolne */

    tablica.forEach(p => {

        const px =
            mapaNaPixel(
                p[0],
                p[1]
            );

        const punkt =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

        punkt.setAttribute(
            "cx",
            px.x
        );

        punkt.setAttribute(
            "cy",
            px.y
        );

        punkt.setAttribute(
            "r",
            "4"
        );

        punkt.setAttribute(
            "fill",
            kolor
        );

        punkt.setAttribute(
            "stroke",
            "#000"
        );

        punkt.setAttribute(
            "stroke-width",
            "1"
        );

        svg.appendChild(punkt);

    });
}

/* 🟡 Hope */
narysujGranice(
    GRANICA_HOPE,
    KOLOR_HOPE
);

/* 🔵 Galowie */
narysujGranice(
    GRANICA_GALOW,
    KOLOR_GALOW
);

/* ============================================================
   INTERPOLACJA GRANICY
   ============================================================ */

function interpolujX(
    punkty,
    y
) {

    for (
        let i=0;
        i<punkty.length-1;
        i++
    ) {

        const a =
            punkty[i];

        const b =
            punkty[i+1];

        const y1 =
            a[1];

        const y2 =
            b[1];

        if (
            y >= Math.min(y1,y2) &&
            y <= Math.max(y1,y2)
        ) {

            if (y1 === y2) {

                return (
                    a[0]+b[0]
                )/2;
            }

            const t =
                (y-y1)/
                (y2-y1);

            return (
                a[0] +
                t*(b[0]-a[0])
            );
        }
    }

    return null;
}

/* ============================================================
   SPRAWDZENIE STREFY
   ============================================================ */

function sprawdzStrefe(
    x,
    y
) {

    const hopeX =
        interpolujX(
            GRANICA_HOPE,
            y
        );

    const galX =
        interpolujX(
            GRANICA_GALOW,
            y
        );

    if (
        hopeX === null ||
        galX === null
    ) {

        return {

            typ:"POZA",

            nazwa:
                "POZA WYZNACZONĄ GRANICĄ",

            galowie:false,

            hope:false
        };
    }

    /*
       ŻÓŁTA = HOPE
       NIEBIESKA = GALOWIE

       Lewa strona = Galowie
       Środek = wspólny
       Prawa strona = Hope
    */

    const lewa =
        Math.min(
            hopeX,
            galX
        );

    const prawa =
        Math.max(
            hopeX,
            galX
        );

    if (x < lewa) {

        return {

            typ:"GALOWIE",

            nazwa:
                "STREFA GALÓW",

            galowie:true,

            hope:false
        };
    }

    if (x > prawa) {

        return {

            typ:"HOPE",

            nazwa:
                "STREFA HOPE",

            galowie:false,

            hope:true
        };
    }

    return {

        typ:"WSPOLNY",

        nazwa:
            "TEREN WSPÓLNY",

        galowie:true,

        hope:true
    };
}

/* ============================================================
   PANEL
   ============================================================ */

const panel =
    document.createElement("div");

panel.id =
    "galowie-hope-panel";

panel.style.position =
    "fixed";

panel.style.right =
    "15px";

panel.style.top =
    "100px";

panel.style.width =
    "270px";

panel.style.background =
    "rgba(20,20,20,.96)";

panel.style.color =
    "#fff";

panel.style.padding =
    "14px";

panel.style.borderRadius =
    "8px";

panel.style.boxShadow =
    "0 3px 15px rgba(0,0,0,.5)";

panel.style.zIndex =
    "100000";

panel.style.fontFamily =
    "Arial,sans-serif";

panel.style.fontSize =
    "13px";

panel.innerHTML = `

<div style="
font-size:17px;
font-weight:bold;
margin-bottom:10px;
">
🛡️ GRANICA GALOWIE ↔ HOPE
</div>

<div>
Kliknij wioskę na mapie,
aby sprawdzić jej strefę.
</div>

<hr style="
border:0;
border-top:1px solid #555;
margin:10px 0;
">

<div style="color:#168CFF;">
🔵 Granica Galów
</div>

<div style="color:#FFD400;">
🟡 Granica Hope
</div>

<div style="color:#4CFF5B;">
🟢 Teren wspólny
</div>

`;

document.body.appendChild(
    panel
);

/* ============================================================
   WYŚWIETLENIE WYNIKU
   ============================================================ */

function pokazWynik(
    x,
    y
) {

    const wynik =
        sprawdzStrefe(
            x,
            y
        );

    let kolor =
        "#fff";

    if (
        wynik.typ ===
        "GALOWIE"
    ) {
        kolor =
            "#168CFF";
    }

    if (
        wynik.typ ===
        "HOPE"
    ) {
        kolor =
            "#FFD400";
    }

    if (
        wynik.typ ===
        "WSPOLNY"
    ) {
        kolor =
            "#4CFF5B";
    }

    panel.innerHTML = `

<div style="
font-size:17px;
font-weight:bold;
margin-bottom:10px;
">
🛡️ GRANICA GALOWIE ↔ HOPE
</div>

<div>
<b>Wioska:</b> ${x}|${y}
</div>

<div style="
font-size:16px;
font-weight:bold;
color:${kolor};
margin:10px 0;
">
${wynik.nazwa}
</div>

<hr style="
border:0;
border-top:1px solid #555;
">

<div style="margin:7px 0;">
Galowie:
<span style="
font-weight:bold;
color:${wynik.galowie ? "#4CFF5B" : "#FF4C4C"};
">
${wynik.galowie ? "✓ DOZWOLONE" : "✕ ZAKAZ"}
</span>
</div>

<div>
Hope:
<span style="
font-weight:bold;
color:${wynik.hope ? "#4CFF5B" : "#FF4C4C"};
">
${wynik.hope ? "✓ DOZWOLONE" : "✕ ZAKAZ"}
</span>
</div>

<hr style="
border:0;
border-top:1px solid #555;
margin:10px 0;
">

<div style="
font-size:11px;
opacity:.75;
">
Żółta linia = Hope<br>
Niebieska linia = Galowie
</div>

`;

}

/* ============================================================
   KLIKANIE WIOSKI
   ============================================================ */

wioski.forEach(
    w => {

        w.el.addEventListener(
            "click",
            function() {

                pokazWynik(
                    w.x,
                    w.y
                );

            },
            true
        );

    }
);

/* ============================================================
   INFORMACJA W KONSOLI
   ============================================================ */

console.log(
    "✓ Granica Galowie ↔ Hope została uruchomiona."
);

console.log(
    "🟡 Żółta = Hope"
);

console.log(
    "🔵 Niebieska = Galowie"
);

console.log(
    "🟢 Pomiędzy = teren wspólny"
);

})();
