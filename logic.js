
window.onload = start;


let json = fetch("./data.json")
.then(response => response.json())
.then(json => data_loaded(json));


let players = [
    ["Eivind", false], //0
    ["Jens", false], //1
    ["Ludvig", false], //2
    ["Adrian", false], //3
    ["Erik", true], //4
    ["Leah", true], //5
    ["Abdalla", true], //6
    ["Pete", true], //7
    ["Angus", true], //8
    ["Bendik", true] //9
];

let player_objects = [];
let matchups = [];

const K = 32;
const MIN_GAMES = 10;




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
        let tourney_players = [];
        for (let match of tourney) {
            //let result = match[2].split("/").map(x => parseInt(x.trim()));

            let winner = match[0];
            let loser = match[1];

            tourney_players.push(winner);
            tourney_players.push(loser);

            // let wins = result[0];
            // let losses = result[1] - wins;

            // for (let i = 0; i < wins; i++) {
            //     CalculateRatingChange(winner, loser);
            // }
            // for (let i = 0; i < losses; i++) {
            //     CalculateRatingChange(loser, winner);
            // }
            CalculateRatingChange(winner, loser);
        }

        for (let player of tourney_players) {
            player_objects[player].games_played++;
        }
    }



    //HTML
    playerDiv = document.getElementById("players");

    for (const key of [...players].sort((a, b) => a[0] - b[0]) ) {
        let player_label = document.createElement("label");
        player_label.htmlFor = key[0];
        player_label.textContent = key[0];
        let player_checkbox = document.createElement("input");
        player_checkbox.type = "checkbox";
        player_checkbox.id = players.findIndex(x => x[0] === key[0]);
        player_checkbox.name = key[0];
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
    constructor(id) {
        this.id = id;
        this.name = players[id][0];
        this.amateur = players[id][1];
        this.elo = 1500;
        this.games_played = 0;
    }

    get_elo() {
        
        //let play_time_mod = Math.min(this.games_played, MIN_GAMES)/MIN_GAMES;

        if (this.games_played == 0) {
            return 0;
        }
        else if (this.amateur) {
            return Math.round(this.elo * 0.5);
        }
        else {
            return this.elo;
        }
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
    player_objects[loser].elo -= win;
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
        let player_id = element.id;
        console.log(element.id);


        element.checked ? included_players.push(player_objects[player_id]) : null;
    });


    let seedDiv = document.getElementById("seed");
    let scoreDiv = document.getElementById("score");
    let rankDiv = document.getElementById("ranking");
    let actualDiv = document.getElementById("actual");

    included_players = included_players.sort((a, b) => a.name.localeCompare(b.name));
    let seeding = included_players.sort((a, b) => b.get_elo() - a.get_elo());
    

    let seedOutput = "Seeding order:<br>";
    let scoreOutput = "Player Scores:<br>";
    let rankOutput = "Rank Type:<br>";
    let actualOutput = "Actual Score:<br>";
    for (let i = 0; i < seeding.length; i++) {
        seedOutput += (i + 1) + ". " + seeding[i].name + "<br>";

        scoreOutput += "Score " + seeding[i].get_elo().toString() + "<br>";

        rankOutput += (seeding[i].games_played == 0 ? "Unranked" : seeding[i].amateur ? "Half-Ranked" : "Ranked") + "<br>";

        actualOutput += seeding[i].elo.toString() + "<br>";
    }
    seedDiv.innerHTML = seedOutput;
    scoreDiv.innerHTML = scoreOutput;
    rankDiv.innerHTML = rankOutput;
    actualDiv.innerHTML = actualOutput;
}
