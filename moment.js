// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBHRZRTUs_hnmrapEtLeHh5DV8FDZGVJRA",
    authDomain: "katiestrainscheduler.firebaseapp.com",
    databaseURL: "https://katiestrainscheduler.firebaseio.com",
    projectId: "katiestrainscheduler",
    storageBucket: "katiestrainscheduler.appspot.com",
    messagingSenderId: "567474549876",
    appId: "1:567474549876:web:a17bebb0dea74a6b814d21"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

console.log(firebase);

// Variable to reference the database
var trainData = firebase.database();

// Initial values
var trainInfo = {

    trainName: "",
    destination: "",
    trainTime: "",
    frequency: 0,
    nextArrival: 0,
    minutesAway: 0,

}

// Set minute interval counter
var minuteTimer = setInterval(minuteCountdown, 60000);

// Current date & time
$("#currentDate").text(moment().format("MMMM Do YYYY, HH:mm"));

// Decrement the minutes to train arrival for each train entry
function minuteCountdown() {
   
    $(".mins").each(function(){

        var currMinsArrival = $(this); 
        var min = parseInt($(this).text());
        min--;

        if (min == 0){
            var currentDataKey = MinsArrival.attr("data-key")
            var trainRef=trainData.ref(currentDataKey);
            trainRef.once("value", function(data){
                var time = moment(data.val().trainTime,"HH:mm");
                var frequency = data.val().frequency;
                var minToA = updateTrainTime(time,frequency); 

                // Update minutes to arrival
                currMinsArrival.text(minToA); 

                // Update next train arrival time
                $(".arrTime[data-key="+currentDataKey+"]").text(moment().add(minToA,"minutes").format("HH:mm")) 
            })
        }

        else {
            currMinsArrival.text(min);
        }

        // Update current date/time display
        $("#currentDate").text(moment().format("MMMM Do YYYY, HH:mm")); 
    })
}

// On-Click function for Submit Button
$("#submit").on("click", function(event) {
    event.preventDefault();
    trainInfo.trainName = $("#trainName").val().trim();
    trainInfo.destination = $("#destination").val().trim();
    trainInfo.trainTime= $("#trainTime").val().trim();
    trainInfo.frequency = $("#frequency").val().trim();
    
    trainData.ref().push({
        trainName: trainInfo.trainName,
        destination: trainInfo.destination,
        trainTime: trainInfo.trainTime,
        frequency: trainInfo.frequency
    })
});

// Add entry to database
trainData.ref().on("child_added", function(snapshot){       
    scheduleDisplay(snapshot);
});

function scheduleDisplay (snapshot) {

        // Train time in HH:mm format
        var time = moment(snapshot.val().trainTime,"HH:mm")
        var frequency = snapshot.val().frequency
        var minToA = updateTrainTime(time,frequency);
    
        // Display train data entered 
        $("#schedule > tbody").append("<tr id="+snapshot.key+">" 
            // Train icon
        + "<th scope='row'><i class='fas fa-train' style='color:black'></i></th>"
            //Train Name
        + "<td>" + snapshot.val().trainName + "</td>" 
            // Destination
        + "<td>" + snapshot.val().destination + "</td>" 
            // Frequency
        + "<td>" + parseInt(snapshot.val().frequency) + "</td>" 
            // Next Arrival
        + "<td class='arrTime' data-key="+snapshot.key+">" + moment().add(minToA,"minutes").format("HH:mm") + "</td>"
            // Minutes Away
        + "<td class='mins' data-key="+snapshot.key+">" + minToA +  "</td>"
            // Trash can icon
        + "<td><i class='far fa-trash-alt trash' data-key="+snapshot.key+"></i></tr>")
}

// Delete line of train data when trash button is clicked
$(document).on("click",".trash", function(event) {
    var currentDataKey = $(this).attr("data-key");
    var trainRef=trainData.ref(currentDataKey);
    trainRef.remove();
    $("#"+currentDataKey).remove();
});

// Display next train time
function updateTrainTime (startTime,frequency) {

    // Calculate the difference between current time and the train arrival time
    var difference = moment().diff(startTime,"minutes");

    // Negative difference: remainder will show minutes UNTIL next arrival
    // Positive difference: remainder will show minutes SINCE last train
    var remainder = difference % frequency;

    var minsToArrival;
    if (difference < 0) {
        minsToArrival = Math.abs(remainder)+1;
    }
    else {
        minsToArrival = frequency - remainder;
    }
    return(minsToArrival);
    
}