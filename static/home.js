
function myWorkoutsClicked() {

    $.ajax({
                url: '/list',
                type: 'GET',
                contentType: 'application/json',
                success: function(response) {
                    if (response == "None") {
                        console.log("none found")
                    } else {
                        res = JSON.parse(response)
                        console.log(res)
                        loadWorkouts(res)
                    }
                },
                error: function(error) {
                    console.log(error);
                }
            });
}

function loadWorkouts(arg) {
    document.getElementById("currentWorkoutsBox").hidden = true
    document.getElementById("deleteConfirmation").hidden = true
    let currentWorkoutList = document.getElementById("currentWorkoutsListTable")
    while (currentWorkoutList.rows.length != 0) {
        currentWorkoutList.deleteRow(0)
    }
    document.getElementById("workoutCreator").hidden = true
    document.getElementById("workoutNamer").hidden = true
    document.getElementById("currentWorkoutsList").hidden = false
    if (Object.keys(arg).length == 0) {
        document.getElementById("noWorkoutsCurrently").hidden = false
        document.getElementById("currentWorkoutsListTable").hidden = true
    } else {
        document.getElementById("noWorkoutsCurrently").hidden = true
        document.getElementById("currentWorkoutsListTable").hidden = false
        for (let key in arg) {
            console.log(key)
            let row = currentWorkoutList.insertRow(0)
            let cell1 = row.insertCell(0)
            let cell2 = row.insertCell(1)
            let button = document.createElement("button")
            let button2 = document.createElement("button")
            button.textContent = "Delete"
            button2.textContent = "Edit"
            cell1.innerHTML = key
            cell2.appendChild(button2)
            cell2.appendChild(button)
            button.onclick = function () {
                //are you sure screen, if yes:
                document.getElementById("deleteConfirmation").hidden = false
                document.getElementById("workoutBeingDeleted").innerHTML = "\"" + key + "\""
                document.getElementById("deleteConfirmButton").onclick = function () {
                    document.getElementById("deleteConfirmation").hidden = true
                    removeWorkout(key)
                    for (let i = 0; i < currentWorkoutList.rows.length; i++) {
                        let row = currentWorkoutList.rows[i]
                        let ex = row.cells[0].innerHTML
                        if (ex === key) {
                            currentWorkoutList.deleteRow(i)
                        }
                    }
                }
            }
        }
    }
}

function removeWorkout(key) {
    $.ajax({
                url: '/removeWo',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(key),
                success: function(response) {
                    console.log(response)
                },
                error: function(error) {
                    console.log(error);
                }
            });
}

function updateList(list) {
    $.ajax({
                url: '/list',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(list),
                success: function(response) {
                    console.log(response)
                },
                error: function(error) {
                    console.log(error);
                }
            });
}


let workoutList = {}
let woName = ""
let exList = []

function unhideWoNamer() {
    let namer = document.getElementById("workoutNamer")
    namer.hidden = false
    document.getElementById("currentWorkoutsList").hidden = true
    document.getElementById("currentWorkoutsBox").hidden = true
}


function setWoName() {
    woName = document.getElementById("woName").value
    if (woName.length > 0) {
        document.getElementById("woNameLabel").innerHTML = woName
        document.getElementById("notEnoughCharinWoNameWarning").hidden = true
        document.getElementById("workoutNamer").hidden = true
        document.getElementById("workoutCreator").hidden = false
    } else {
        document.getElementById("notEnoughCharinWoNameWarning").hidden = false
    }
}

function addEx() {
    document.getElementById("noExercises").hidden = true
    let woTable = document.getElementById("woTable")
    let exercise = document.getElementById("exName").value
    let sets = document.getElementById("setsNum").value
    if (exList.includes(exercise)) {
        while(exList.includes(exercise)) {
            exercise = exercise + "*"
        }
    }
    let row = woTable.insertRow(exList.length + 1)
    let cell1 = row.insertCell(0)
    let cell2 = row.insertCell(1)
    cell1.innerHTML = exercise
    cell2.innerHTML = sets
    let val = []
    val.push(sets)
    for (let i = 0; i < sets*2; i++) {
        val.push(0)
    }
    workoutList[exercise] = val
    exList.unshift(exercise)
}

function undoAddEx() {
    let woTable = document.getElementById("woTable")
    if (exList.length != 0) {
        woTable.deleteRow(exList.length)
    } else {
        console.log("Must have at least 1 exercise")
    }
    delete workoutList[exList[0]]
    exList.shift()
}

function completeWoCreation() {
    if (Object.keys(workoutList).length === 0) {
        document.getElementById("noExercises").hidden = false
    } else {
        document.getElementById("noExercises").hidden = true
        data = {}
        data[woName] = workoutList
        updateList(data)
        workoutList = {}
        exList = []
        woName = ""
    }
    document.getElementById("workoutCreator").hidden = true
    document.getElementById("currentWorkoutsListTable").hidden = true
    let currentWorkoutList = document.getElementById("woTable")
    while (currentWorkoutList.rows.length != 1) {
        currentWorkoutList.deleteRow(1)
    }
}

function pageLoaded() {

    $.ajax({
                url: '/list',
                type: 'GET',
                contentType: 'application/json',
                success: function(response) {
                    if (response == "None") {
                        console.log("none found")
                    } else {
                        res = JSON.parse(response)
                        loadCurrentWorkouts(res)
                    }
                },
                error: function(error) {
                    console.log(error);
                }
            });
}

function loadCurrentWorkouts(arg) {
    document.getElementById("currentWorkoutsBox").hidden = false
    document.getElementById("workoutNamer").hidden = true
    document.getElementById("workoutCreator").hidden = true
    document.getElementById("currentWorkoutsList").hidden = true


    let box = document.getElementById("currentWorkouts")
    box.innerHTML = ""
    for (let key in arg) {
        let div = document.createElement("div")
        let name = document.createElement("h3")
        name.innerHTML = key
        div.appendChild(name)
        let listOfEx = document.createElement("p")
        for (let ex of Object.keys(arg[key])) {
            listOfEx.innerHTML += ex + " (x" + arg[key][ex][0] + ")" + ", "
        }
        listOfEx.innerHTML = listOfEx.innerHTML.substring(0, listOfEx.innerHTML.length - 2)
        listOfEx.style.fontStyle = "italic"
        listOfEx.className = "listOfEx"
        div.appendChild(listOfEx)
        let button = document.createElement("button")
        button.innerHTML = "Start"
        button.onclick = function() {
            $.ajax({
                url: '/workoutSelected',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(key),
                success: function(response) {
                    console.log(response)
                    window.location.href = '/workout'
                },
                error: function(error) {
                    console.log(error);
                }
            });
        }
        div.appendChild(button)
        box.appendChild(div)
        let line = document.createElement("hr")
        line.style.width = "200px"
        box.appendChild(line)
    }
}


