// Display planet information in the info panel
function displayPlanetInfo(planetName) {
    const infoPanel = document.getElementById('info-panel');
    const planetInfo = getPlanetInfo(planetName);

    document.getElementById('planet-name').innerText = planetName;

    // Show shortened version of the description
    const shortDescription = planetInfo.length > 100 ? planetInfo.substring(0, 100) + '...' : planetInfo;
    document.getElementById('short-description').innerText = shortDescription;

    // Full description (hidden initially)
    document.getElementById('full-description').innerText = planetInfo;

    // Show 'Read more' link if the text is truncated
    if (planetInfo.length > 100) {
        document.getElementById('read-more').style.display = 'inline';
    } else {
        document.getElementById('read-more').style.display = 'none';
    }

    infoPanel.style.display = 'block';
    setTimeout(() => infoPanel.classList.add('show'), 10); // Delay for fade-in effect
}

// Expand description when "Read more" is clicked
function expandDescription() {
    document.getElementById('short-description').style.display = 'none';
    document.getElementById('full-description').style.display = 'inline';
    document.getElementById('read-more').style.display = 'none'; // Hide the 'Read more' link
}

// Hide the info panel with fade-out effect
function hidePlanetInfo() {
    const infoPanel = document.getElementById('info-panel');
    infoPanel.classList.remove('show');
    setTimeout(() => infoPanel.style.display = 'none', 500); // Delay for fade-out effect
}

// Fetch planet information
function getPlanetInfo(planetName) {
    const planetDetails = {
        Sun: "The Sun is a massive, glowing ball of hydrogen and helium at the center of our solar system, providing the energy needed to sustain life on Earth. Its core, where nuclear fusion occurs, generates enormous energy by fusing hydrogen atoms into helium, releasing heat and light that radiates into space. The Sun's surface, called the photosphere, reaches about 5,500 degrees Celsius (9,932 degrees Fahrenheit), while temperatures in its core soar to over 15 million degrees Celsius. This energy drives Earth's climate and weather systems, influencing everything from photosynthesis in plants to the formation of weather patterns. As a star, the Sun is about halfway through its life cycle, estimated to last roughly 10 billion years, and it has already been shining for about 4.6 billion years.",
        Mercury: "Mercury is the closest planet to the Sun.",
        Venus: "Venus has a thick atmosphere and is the second planet from the Sun.",
        Earth: "Earth is the only planet known to support life.",
        Mars: "Mars is known as the Red Planet.",
        Jupiter: "Jupiter is the largest planet in our Solar System.",
        Saturn: "Saturn has prominent ring systems.",
        Uranus: "Uranus rotates on its side and has faint rings.",
        Neptune: "Neptune is the farthest planet from the Sun."
    };
    return planetDetails[planetName] || "Unknown planet";
}
