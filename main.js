
const width = 960;
const height = 500;
const config = {
    speed: 0.005,
    verticalTilt: -30,
    horizontalTilt: 0
}
let locations = [];
const svg = d3.select('svg')
    .attr('width', width).attr('height', height);
const markerGroup = svg.append('g');
const projection = d3.geoOrthographic();
const initialScale = projection.scale();
const path = d3.geoPath().projection(projection);
const center = [width / 2, height / 2];
const _countrySelect = document.getElementById('country');
_countrySelect.addEventListener('change', handleOnChange)

let [gCurrentLat, gCurrentLng] = projection.invert(center);

console.log(projection.invert(center));

drawGlobe();
drawGraticule();
loadCountries();

function drawGlobe() {
    d3.queue()
        .defer(d3.json, 'https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json')
        .await((error, worldData, locationData) => {
            svg.selectAll(".segment")
                .data(topojson.feature(worldData, worldData.objects.countries).features)
                .enter().append("path")
                .attr("class", "segment")
                .attr("d", path)
                .style("stroke", "#101010")
                .style("stroke-width", "1px")
                .style("fill", (d, i) => '#eee')
                .style("opacity", ".6");
            locations = locationData;
        });
}

function drawGraticule() {
    const graticule = d3.geoGraticule()
        .step([10, 10]);

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)
        .style("fill", "#fff")
        .style("stroke", "#e3e3e3");
}

function showCountry(lat, lng) {

    d3.transition()
        .duration(1000)
        .tween("rotate", function () {
            const r = d3.interpolate([-gCurrentLng, -gCurrentLat], [-lng, -lat]);
            return function (t) {
                projection.rotate(r(t));
                svg.selectAll("path").attr("d", path);
            };
        })
        .on("end", () => {
            drawMarker(lat, lng), // save current coordinates to gCurrentLat and gCurrentLng to use them as starting point for the next interpolation
            gCurrentLat = lat
            gCurrentLng = lng
        })


}

function drawMarker(lat, lng) {
    svg.append("circle")
        .attr('cx', projection([lng, lat])[0])
        .attr('cy', projection([lng, lat])[1])
        .attr('fill', 'red')
        .attr('r', 3);
}


function loadCountries() {
    countries.map(country =>
        _countrySelect.innerHTML += `<option value="${country.name}">${country.name}</option>`
    )
}

function handleOnChange(e) {
    if (!e || !e.target || !e.target.value) {
        return;
    }

    const selectedCountry = countries.find((country) => country.name === e.target.value);

    if (!selectedCountry) {
        alert('Country not found!')
    }

    showCountry(selectedCountry.latitude, selectedCountry.longitude)
}