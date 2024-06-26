
function loadPage() {
    console.log("loadPage called");
    $.ajax({
        url: '/workoutSelected',
        type: 'GET',
        contentType: 'application/json',
        success: function(response) {
            console.log("AJAX success:", response);
            if (response == "None") {
                console.log("No Workout Selected");
            } else {
                try {
                    let res = JSON.parse(response);
                    console.log("Parsed response:", res);
                    loadWorkout(res);
                } catch (e) {
                    console.error("Failed to parse JSON response:", e);
                }
            }
        },
        error: function(error) {
            console.log("AJAX error:", error);
        }
    });
}


let updatedWorkout = {}

function loadWorkout(wo) {
    let ogWo = structuredClone(wo)
    updatedWorkout = wo
    let label = document.getElementById("workoutLabel")
    let workout = Object.keys(wo)[0]
    label.innerHTML = workout
    let workoutData = wo[workout]
    for (let key of Object.keys(workoutData)) {
        let exerciseDiv = document.createElement("div")
        let exercise = document.createElement("h2")
        exercise.innerHTML = key
        let exerciseData = workoutData[key]
        let sets = document.createElement("p")
        sets.innerHTML = "(" + exerciseData[0] + " sets)"
        let table = document.createElement("table")
        let header = table.createTHead()
        let row = header.insertRow(0)
        row.insertCell(0).innerHTML = "Prev. Weight"
        row.insertCell(1).innerHTML = "Prev. Sets"
        row.insertCell(2).innerHTML = "Weight"
        row.insertCell(3).innerHTML = "Reps"

        for (let i = (parseInt(exerciseData[0])*2)-1; i > 0; i-=2) {
            let row = table.insertRow(1)
            row.insertCell(0).innerHTML = exerciseData[i] + " lb"
            row.insertCell(1).innerHTML = "x" + exerciseData[i+1]
            let weightInput = document.createElement("input")
            weightInput.type = "number"
            weightInput.className = "weightInput"
            let repsInput = document.createElement("input")
            repsInput.type = "number"
            repsInput.className = "repsInput"
            if (exerciseData[i] == 0) {
                weightInput.value = ""
            } else {
                weightInput.value = exerciseData[i]
            }
            if (exerciseData[i+1] == 0) {
                repsInput.value = ""
            } else {
                repsInput.value = exerciseData[i+1]
            }
            row.insertCell(2).appendChild(weightInput)
            row.insertCell(3).appendChild(repsInput)
            let submitButton = document.createElement("button")
            submitButton.innerHTML = "Finish Set"
            submitButton.onclick = function () {
                if (row.style.background == "green") {
                    updatedWorkout[workout][exercise.innerHTML][i] = ogWo[workout][exercise.innerHTML][i]
                    updatedWorkout[workout][exercise.innerHTML][i+1] = ogWo[workout][exercise.innerHTML][i+1]
                    row.style.background = "none"
                    submitButton.innerHTML = "Finish Set"
                } else {
                    if (weightInput.value == "") {
                        weightInput.value = exerciseData[i]
                    }
                    if (repsInput.value == "") {
                        repsInput.value = exerciseData[i + 1]
                        if (exerciseData[i + 1] == 0) {
                            repsInput.value = 1
                        }
                    }
                    let data = {}
                    data[workout] = workoutData
                    workoutData[exercise.innerHTML][i] = parseInt(weightInput.value)
                    workoutData[exercise.innerHTML][i + 1] = parseInt(repsInput.value)
                    updatedWorkout = data
                    row.style.background = "green"
                    submitButton.innerHTML = "Undo"
                }
            }
            row.insertCell(4).appendChild(submitButton)
        }

        exerciseDiv.appendChild(exercise)
        exerciseDiv.appendChild(sets)
        exerciseDiv.appendChild(table)
        exerciseDiv.className = "exerciseDiv"

        document.getElementById("workoutData").appendChild(exerciseDiv)

    }

}

function completeWorkout() {
    updateList(updatedWorkout)
    window.location.href = '/home'
}

function quitWorkout() {
    window.location.href = '/home'
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


