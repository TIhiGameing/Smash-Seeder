let json = fetch("./data.json")
.then(response => response.json())
.then(json => data_loaded(json));

let player_rankings = {};
//{
//     "Abdalla" : [
//         7
//     ],
//     "Adrian" : [
//         4,
//         4,      
//         3,
//         3
//     ],
//     "Eivind" : [
//         2,
//         1,
//         1,
//         1
//     ],
//     "Erik" : [
//         5,
//         5
//     ],
//     "Jens" : [
//         1,
//         2,
//         2,
//         2
//     ],
//     "Leah" : [
//         5,
//         6
//     ],
//     "Ludvig" : [
//         3,
//         3,
//         4,
//         4
//     ],
//     "Pete" : [
//         8
//     ]
// }


let base_player_value;


let playerDiv
let playerCheckboxes = [];



window.onload = start;

function start() {
    // data_loaded();
}

function data_loaded(out) {
    player_rankings = out;
    base_player_value = getPlayerValue(player_rankings);
    playerDiv = document.getElementById("players");

    for (const [key, value] of Object.entries(player_rankings)) {
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

    // player_rankings.forEach(player => {
    //     
    // });

    document.getElementById("toggle_button").onclick = toggle_on_click;
    document.getElementById("seed_button").onclick = seed_on_click;
}

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
    let included_players = {};

    playerCheckboxes.forEach(element => {
        element.checked ? included_players[element.name] = player_rankings[element.name] : null;
    });


    let seedDiv = document.getElementById("seed");
    let scoreDiv = document.getElementById("score");
    let valueDiv = document.getElementById("value");

    
    let seeding = getSeeding(included_players);
    

    let seedOutput = "Seeding order:<br>";
    for (let i = 0; i < Object.keys(seeding).length; i++) {
        seedOutput += (i + 1) + ". " + seeding[i]["player"] + "<br>";
    }
    seedDiv.innerHTML = seedOutput;

    let scoreOutput = "Player Scores:<br>";
    let max_score = Math.max(...seeding.map(player => player.score));
    for (let i = 0; i < Object.keys(seeding).length; i++) {
        let score_str = (Math.round(seeding[i]["score"]/max_score * 100 * 10)/10).toString();
        scoreOutput += "Score " + score_str + "<br>";
    }
    scoreDiv.innerHTML = scoreOutput;

    let valueOutput = "Player Values:<br>";
    let max_value = Math.max(...seeding.map(player => player.value));
    for (let i = 0; i < Object.keys(seeding).length; i++) {
        let value_str = (Math.round(seeding[i]["value"]/max_value * 100 * 10)/10).toString();
        valueOutput += "Value " + value_str + "<br>";
    }
    valueDiv.innerHTML = valueOutput;
}



function getSeeding(players) {
    let matchups = getMatchups(players);
    let player_values = getPlayerValue(players);
    
    let scoring = {};
    for (const player of Object.keys(players)) {
        scoring[player] = [0];
    }

    for (const [matchup, winrate] of Object.entries(matchups)) {
        let [player1, player2] = matchup.split(" vs ");
        // if (winrate > 50) {
        //     scoring[player1].push(player_values[player2]);
        // } 
        // else if (winrate < 50) {
        //     scoring[player2].push(player_values[player1]);
        // } 
        // else {
        //     scoring[player1].push(player_values[player2]/2);
        //     scoring[player2].push(player_values[player1]/2);
        // }

        scoring[player1].push(player_values[player2] * (winrate / 100));
        scoring[player2].push(player_values[player1] * ((100 - winrate) / 100));
    }

    if (Object.keys(matchups).length === 0) {
        //Sorts based on average winrate
        let seeding = {};
        console.log(base_player_value)
        for (const [player, rankings] of Object.entries(players)) {
            let totaL = 0;
            for (const [opponent, rank] of Object.entries(rankings)) {
                totaL += base_player_value[opponent];
            }

            if (Object.keys(rankings).length === 0) {
                seeding[player] = 0;
            }
            else {
                seeding[player] = totaL / Object.keys(rankings).length;
            }
        }
        const sortedSeeding = Object.keys(seeding)
        .sort((a, b) => seeding[b] - seeding[a]);

        
        return getSeedOutput(sortedSeeding, seeding, base_player_value);
    }

    let seeding = {};
    console.log(scoring);
    for (const [player, score] of Object.entries(scoring)) {
        seeding[player] = (score.reduce((a, b) => a + b, 0) / score.length);

        if (player == "Adrian") {
            console.log(seeding[player]);
        }

        if (seeding[player] === 0 || score.length === 1) {
            seeding[player] = averageWinrate(players, player)/100; 
        }
        seeding[player] += player_values[player];   
    }
    const sortedSeeding = Object.keys(seeding)
    .sort((a, b) => seeding[b] - seeding[a]);
    
    console.log(seeding);
    //console.log(player_values);

    
    
    return getSeedOutput(sortedSeeding, seeding, player_values);
}

function getSeedOutput(sortedSeeding, seeding, player_values) {
    const outSeeding = [];
    sortedSeeding.forEach((player) => {
        outSeeding.push({
            'player': player,
            'score': Math.round(seeding[player]),
            'value': Math.round(player_values[player])
        })
    })

    return outSeeding
}

function getMatchups(players) {
    let matchups = {};

    for (const [player, opponents] of Object.entries(players)) {
        for (const [opponent, winrate] of Object.entries(opponents)) {
            let matchup_str = [player, opponent].sort().join(" vs ");

            let plys = matchup_str.split(" vs ");
            if (plys[0] in players && plys[1] in players) {
                if (plys[0] === player) {
                    matchups[matchup_str] = winrate;
                }
            }
            
            
        }
    }

    return matchups;
}

function getPlayerValue(players) {
    let player_values = {};

    for (const player of Object.keys(players)) {
        player_values[player] = 0;
    }

    for (let index = 0; index < 5 ; index++) {
        for (const [player, rankings] of Object.entries(players)) {
            if (player in players) {
                let total = 0;
                for (const [opponent, rank] of Object.entries(rankings)) {
                    if (opponent in players) {
                        if (index === 0) {
                            total += rank;
                        }
                        else {
                            total += (player_values[opponent]/100) * rank;
                        }
                    }
                }

                let length = Object.keys(rankings).length

                if (!isNaN(total / length)) {
                    //if (index === 0) {
                        player_values[player] += total / length;
                    // }
                    // else {
                    //     player_values[player] *= total / length;
                    // }
                    
                    if (player === "Eivind") {
                        //console.log(player_values[player]);
                    }
                }
            }
        }
    }
    

    return player_values;
}


function averageWinrate(players, player) {
    let player_data = players[player];

    let total = 0;
    for (const [opponent, rank] of Object.entries(player_data)) {
        total += rank;
    }

    return total / Object.keys(player).length;

}


