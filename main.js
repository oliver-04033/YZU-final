let twurl = "https://tw2.api.riotgames.com";
let seaurl = "https://sea.api.riotgames.com";
let key = "RGAPI-cdaa82ce-9f90-41bc-9b64-c588150b307a";
let puid = "";
let inputname = "";
let summonerid = "";
$(function(){
    $("button").on("click", loadpuuid);
})
function loadpuuid(){
    inputname = $('#summonername').val();
    var way = `/lol/summoner/v4/summoners/by-name/${inputname}?api_key=${key}`;
    $.getJSON(twurl + way)
    .done(function(data){
        puid = data["puuid"];
        summonerid = data["id"];
        $("#top3").text("前三隻專精:");
        $("#search").text("");
        $("#res").text(inputname)
        mastery();
        rift_id();
    })
    .fail(function(){
        console.log("fail");
        $("#search").text("");
        $("#res").text("輸入錯誤ID")
    })
}
function mastery(){
    var way = `/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerid}?api_key=${key}`;
    $.getJSON(twurl + way)
    .done(function(data) {
        for (var i = 0; i < 3; ++i) {
            var ch_name = "";
            var tmp = data[i];
            var chid = tmp["championId"];
            var point = tmp["championPoints"];
            console.log(chid);
            getchampion(chid, point, i);
        }
    });
}
function getchampion(chid, point, index){
    $.getJSON("champion.json")
    .done(function(data){
            allch = data["data"];
            for (var chkey in allch) {
                var onech = allch[chkey];
                if (onech["key"] == chid) {
                    ch_name = onech["id"];
                    if(index == 0){
                        $("#mastery1").text(ch_name + " mastery points:" + point);
                        $("#picmastery1").attr("src", "img/" + ch_name +".jpg");
                    }
                    else if(index == 1 ){
                        $("#mastery2").text(ch_name + " mastery points:" + point);
                        $("#picmastery2").attr("src", "img/" + ch_name +".jpg");
                    }
                    else if(index == 2){
                        $("#mastery3").text(ch_name + " mastery points:" + point);
                        $("#picmastery3").attr("src", "img/" + ch_name +".jpg");
                    }
                    break;
                }
            }
        });
}
function rift_id(){
    var way = `/lol/match/v5/matches/by-puuid/${puid}/ids?start=0&count=10&api_key=${key}`;
    var match_id = [];
    $.getJSON(seaurl + way)
    .done(function(data){
        for(var i = 0; i < 10 ;++i){
            rift_detail(data[i]);
        }
    })

}
function rift_detail(id){
    var way = `/lol/match/v5/matches/${id}?api_key=${key}`;
    $.getJSON(seaurl + way)
    .done(function(data){
        info = data["info"];
        game_mode = info["gameMode"];
        meta = data["metadata"];
        participants = info["participants"];
        time = info["gameDuration"];
        player = meta["participants"];
        var pos = 0;
        for(var i = 0; i < 10; ++i){
            if(player[i] == puid){
                pos = i;
                break;
            }
        }
        part = participants[pos];
        chname = part["championName"];
        results = part["win"];
        A = part["assists"];
        D = part["deaths"];
        K = part["kills"];
        var KDA = String(K) +'/' + String(D) + '/' + String(A);
        var text2 = "";
        if(results == 1)
            text2 = "win";
        else
            text2 = "lose";
        create_table(chname,KDA, game_mode, text2, time);
    })
}
function create_table(chname,KDA, mode, res, time){
    var table = $("<table>");
    console.log("==========")
    console.log($("#tableContainer tr").length);
    if($("#tableContainer tr").length >= 11){
        $("#tableContainer tr:not(:first)").remove();
    }
    var row = $("<tr>"); 

    var namecell = $("<td>");
    namecell.text(chname);
    //row.append(namecell);

    var imageCell = $("<td>");
    var image = $("<img>").attr("src", `img/${chname}.jpg`);
    image.css({
        "width": "150px",
        "height": "100px",
        "display": "block",
        "margin": "auto"
    });
    imageCell.append(image).append(chname);
    row.append(imageCell);

    var kdacell = $("<td>")
    kdacell.text(KDA);
    row.append(kdacell)

    var cell = $("<td>"); 
    cell.text(mode);
    row.append(cell);
    
    var rescell = $("<td>");
    rescell.text(res);
    row.append(rescell);

    var num1 = Math.floor(parseInt(time)/60);
    var num2 = parseInt(time)%60;
    var tmp = String(num1) + ":" + String(num2);
    if(num2<10)
        tmp = String(num1) + ":0" + String(num2);
    var timecell = $("<td>");
    timecell.text(tmp)
    row.append(timecell);
    if(res == "win")
        row.css("background-color", "#A6FFFF");
    else
        row.css("background-color", "#FF9797");
    table.append(row);

    $("#tableContainer").append(table);
}