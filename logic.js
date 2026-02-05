
window.onload = start;


let json = fetch("./data.json")
.then(response => response.json())
.then(json => data_loaded(json));


let players = [
    "Eivind", //0
    "Jens", //1
    "Ludvig", //2
    "Adrian", //3
    "Erik", //4
    "Leah", //5
    "Abdalla", //6
    "Pete", //7
    "Angus", //8
    "Bendik" //9
];

let player_objects = [];
let matchups = [];

const K = 32;




//HTML
let playerDiv
let playerCheckboxes = [];



function start() {
    
    
}

function data_loaded(data) {
    for (let i = 0; i < players.length; i++) {
        player_objects.push(new Player(i));
    }

    

    for (let tourney of data) {
        for (let match of tourney) {
            let winner = match[0];
            let loser = match[1];

            CalculateRatingChange(winner, loser);            
        }
    }



    //HTML
    playerDiv = document.getElementById("players");

    for (const key of [...players].sort() ) {
        let player_label = document.createElement("label");
        player_label.htmlFor = key;
        player_label.textContent = key;
        let player_checkbox = document.createElement("input");
        player_checkbox.type = "checkbox";
        player_checkbox.id = key;
        player_checkbox.name = key;
        player_checkbox.checked = true;

        playerDiv.appendChild(player_label);
        playerDiv.appendChild(player_checkbox);
        playerDiv.appendChild(document.createElement("br"));

        playerCheckboxes.push(player_checkbox);
    }

    document.getElementById("toggle_button").onclick = toggle_on_click;
    document.getElementById("seed_button").onclick = seed_on_click;
}

class Player {
    constructor(name) {
        this.id = name;
        this.name = players[name];
        this.elo = 0;
    }
}

function CalculateRatingChange(winner, loser)
{
    let Elo1 = player_objects[winner].elo;
    let Elo2 = player_objects[loser].elo;
    let EloDifference = Elo2 - Elo1;
    let percentage = 1 / ( 1 + Math.pow( 10, EloDifference / 400 ) );
    let win = Math.round( K * ( 1 - percentage ) );


    player_objects[winner].elo += win;
}


//HTML
function toggle_on_click() {
    let all_checked = true;
    playerCheckboxes.forEach(element => {
        if (!element.checked) {
            all_checked = false;
        }
    });

    playerCheckboxes.forEach(element => {
        element.checked = !all_checked;
    });
}

function seed_on_click() {
    let included_players = [];

    playerCheckboxes.forEach(element => {
        let player_id = players.indexOf(element.id);

        element.checked ? included_players.push(player_objects[player_id]) : null;
    });


    let seedDiv = document.getElementById("seed");
    let scoreDiv = document.getElementById("score");

    included_players = included_players.sort((a, b) => a.name.localeCompare(b.name));
    let seeding = included_players.sort((a, b) => b.elo - a.elo);
    console.log(seeding);
    

    let seedOutput = "Seeding order:<br>";
    let scoreOutput = "Player Scores:<br>";
    for (let i = 0; i < seeding.length; i++) {
        seedOutput += (i + 1) + ". " + seeding[i].name + "<br>";

        let score_str = seeding[i].elo.toString();
        scoreOutput += "Score " + score_str + "<br>";
    }
    seedDiv.innerHTML = seedOutput;
    scoreDiv.innerHTML = scoreOutput;
}
