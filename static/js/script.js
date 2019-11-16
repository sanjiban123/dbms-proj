
var quiz;
var name = "Name";
var currentQuestion = -1;
var quizLength = 0;
var numAns = 0;
var userAnswers = [];
var userJSON;
var score = 0;
var titles;
var selectedQuiz = 0;
var ids;
var notificationFadeTime = 3000;

// Initial setup
$(document).ready(function() {
  $.getJSON('titlesandids')
  .done(function (data) {
    // console.log(data);
    titles = data.slice(0,data.length/2);
    ids = data.slice(data.length/2);
    if (titles === undefined) {
      $('#ajaxloading').text("Sorry, we cannot load the quizzes. Please reload the page to try again.");
      $('#ajaxloading').show();
      $('#reload').show();
    }
  })
  .fail(function() {
    $('#ajaxloading').text("Sorry, we cannot load the quizzes. Please reload the page to try again.");
    $('#ajaxloading').show();
    $('#reload').show();
  });
  $('#title').text("Dynamic Quiz");
  $('#title').hide().fadeIn("slow");
  $('#nameForm').hide().fadeIn("slow");
  $('#description').hide();
  $('#answerChoices').hide();
  $('#previousQuestion').hide();
  $('#nextQuestion').hide();
  $('#answerWarning').hide();
  $('#nameFormWarning').hide();
  $('#scoreTable').hide();
  $('#userTable').hide();
  $('#tenScores').hide();
  $('#home').hide();
  $('#ajaxloading').hide();
  $('#backHome').hide();
  $('#quizSuccess').hide();
  $('#quizWarning').hide();
  $('#placeholderWarning').hide();
  $('#placeholderSuccess').hide();
  $('#reload').hide();
  $('#editQuiz').hide();
  $('#piechart').hide();
  $('#card2').hide();
  $('[data-hide]').on("click", function() {
    $('#nameFormWarning').hide();
    $('#answerWarning').hide();
    $('#quizSuccess').hide();
    $('#quizWarning').hide();
    $('#placeholderWarning').hide();
    $('#placeholderSuccess').hide();
  });

  //start quiz
  document.getElementById("start_quiz").addEventListener("click", function(e) {
    // console.log("start");
    $('#editQuiz').hide();
    e.preventDefault();
    nameForm();
  });

   
  document.getElementById("previousQuestion").addEventListener("click", back);
  document.getElementById("nextQuestion").addEventListener("click", nextQuestion);

  $("#answerChoices").keyup(function(event) {
    if (event.keyCode == 13) {
      $("#nextQuestion").click();
    }
  });

 
// After name is submitted on initial screen
function nameForm(){
  
  name = $('#nameForm').serializeArray()[0]["value"];
  reg = $('#nameForm').serializeArray()[0]["value"];
  if (name.length === 0) {
    $('#firstName').css({ "border": '1px solid #FF0000'});
    $('#nameFormWarning').show();
    $("#nameFormWarning").fadeTo(notificationFadeTime, 500).slideUp(500, function(){
      $("#nameFormWarning").hide();
    });
  }
 
  else {
    $('#firstName').css({ "border": '1px solid #ccc'});
    $('#nameFormWarning').hide();
    $('#nameForm').hide();
    $('#welcome').text("  Welcome " + name + "!");
    $('#welcome').prepend('<a href="/"><img src="static/home.png" width="38" height="38" id="homeImg" alt=""></a>');
    selectedQuiz = ids[titles.indexOf($('#titlesDropdown option:selected').text())];
    $('#titlesDropdown option:selected').css({'color':'white'});
    var selectedTitle = $('#titlesDropdown option:selected').text();
    document.title = selectedTitle;
    loadQuiz(selectedQuiz);
    $('#card').hide();
  }
}
   
  // submit newly created quiz
  $("#editQuizForm").on('click', '#createquizsubmit', function(e) {
    $(':text').not(document.getElementById("firstName")).each(function() {
       if(!($.trim($(this).val()).length > 0)) {
         $(this).css({ "border": '#FF0000 1px solid'});
         textInput = false;
       }
       else {
         $(this).css({ "border": '1px solid #ccc'});
       }
     });
   });
 });

// load titles in allQuizzes
function loadTitles(){
  $.getJSON('titlesandids')
  .done(function (data) {
    $('#ajaxloading').hide();
    $('#backHome').hide();
    $('#reload').hide();
    titles = data.slice(0,data.length/2);
    ids = data.slice(data.length/2);
    if (titles === undefined) {
      $('#ajaxloading').text("Sorry, we cannot load the quizzes. Please reload the page to try again.");
      $('#ajaxloading').show();
      $('#reload').show();
    }
    else {
      $("#titlesDropdown").empty();
      for (var i = 0; i < titles.length; i++) {
        var select = document.getElementById("titlesDropdown");
        var option = document.createElement("option");
        var aTag = document.createElement("a");
        option.appendChild(document.createTextNode(titles[i]));
        select.appendChild(option);
      }
    }
  })
  .fail(function() {
    $('#ajaxloading').text("Sorry, we cannot load the quizzes. Please reload the page to try again.");
    $('#ajaxloading').show();
    $('#reload').show();
  })
  .always(function() {
    $('#reload').on('click', function(e){
      e.preventDefault();
      loadTitles();
    });
  });
}

function resetQuizzes() {
  $.ajax({
  type:"GET",
  url: "reset",
  timeout: 2000,
  beforeSend: function(){
    $("#reset_quiz").attr("disabled", true);
      // console.log ("BEFORE RESET SEND");
    },
    complete: function() {
      // console.log ("COMPLETE RESET LOADING");
      $('#ajaxloading').hide();
      $('#backHome').hide();
      $('#reload').hide();
      $('#placeholderSuccess > p > span').text("Quizzes have been reset!");
      $('#placeholderSuccess > p > span').append('&nbsp;');
      $('#placeholderSuccess').show();
      $("#placeholderSuccess").fadeTo(notificationFadeTime, 500).slideUp(500, function(){
        $("#placeholderSuccess").hide();
      });
      $("#reset_quiz").attr("disabled", false);
      loadTitles();
    },
    success: function(data){
      // console.log("RESET sent");
    },
    fail: function(){
      // console.log ('RESET FAIL');
      $('#ajaxloading').text("Sorry, we cannot reset the quizzes. Please reload the page to try again.");
      $('#ajaxloading').show();
      $('#reload').show();
    },
    always: function() {
      $('#reload').on('click', function(e){
        e.preventDefault();
        resetQuizzes();
      });
    }
  });
}

// load target quiz json
function loadQuiz(target){
  $.getJSON('quiz/' + target)
  .done(function (data) {
    $('#ajaxloading').hide();
    $('#backHome').hide();
    $('#reload').hide();
    quiz = data;
    if (quiz["questions"] === undefined) {
      $('#ajaxloading').text("Sorry, we cannot load the quiz. Please reload the page to try again.");
      $('#ajaxloading').show();
      $('#reload').show();
      $('#backHome').show();
    }
    else {
      quizLength = quiz["questions"].length;
      $('#nextQuestion').show();
      $('#answerChoices').show();
      $('#description').text(quiz["description"]);
      $('#description').show();
      nextQuestion();
    }
  })
  .fail(function() {
    $('#ajaxloading').text("Sorry, we cannot load the quiz. Please reload the page to try again.");
    $('#ajaxloading').show();
    $('#reload').show();
    $('#backHome').show();
  })
  .always(function() {
    $('#reload').on('click', function(e){
      e.preventDefault();
      loadQuiz(target);
    });
  });
}

// Show questions and answers
function generateQA (){
  $('#card2').show();
  $('#questionNumber').text("Question " + (currentQuestion+1)).hide().fadeIn();
  $('#question').text(quiz["questions"][currentQuestion]["text"]).hide().fadeIn();
  numAns = quiz["questions"][currentQuestion]["answers"].length;
  // if answered already
  if (currentQuestion < userAnswers.length) {
    $('input[name="answers"][id="' + userAnswers[currentQuestion][2] + '"]').prop('checked',true);
    for (var i = 0; i < numAns; i++) {
      $('#b' + i).show();
      $('#' + i).fadeIn();
      // answer choices radio button labels
      var aID = "label[for=" + i + "]";
      $(aID).fadeIn();
      $(aID).html(quiz["questions"][currentQuestion]["answers"][i]).hide().fadeIn();
    }
    // hide excess answer choices
    for (var a = numAns; a<7; a++) {
      $('#b' + a).fadeOut();
      $('#' + a).fadeOut();
      var labelID = "label[for=" + a + "]";
      $(labelID).fadeOut();
    }
  }
  // if hasn't been answered before
  else {
    // uncheck answers
    $('input[name="answers"]').prop('checked',false);
    for (var i = 0; i < numAns; i++) {
      $('#b' + i).show();
      $('#' + i).fadeIn();
      // answer choices radio button labels
      var aID = "label[for=" + i + "]";
      $(aID).fadeIn();
      $(aID).html(quiz["questions"][currentQuestion]["answers"][i]).hide().fadeIn();
    }
    // hide excess answer choices
    for (var a = numAns; a<7; a++) {
      $('#b' + a).fadeOut();
      $('#' + a).fadeOut();
      var labelID = "label[for=" + a + "]";
      $(labelID).fadeOut();
    }

  }
  var tempTags = "";
  for (var z = 0; z < quiz["questions"][currentQuestion]["meta_tags"].length; z++) {
    tempTags+=quiz["questions"][currentQuestion]["meta_tags"][z] + ", ";
  }
  $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
  {
    tags: tempTags,
    tagmode: "any",
    format: "json"
  },
  function(data) {
    $.each(data.items, function(i,item){
      $( "#images" ).empty();
      $("<img />").attr("src", item.media.m).appendTo("#images");
      $( "#images" ).hide().fadeIn("slow");
      if ( i == 0 ) return false;
    });
  });
  if (currentQuestion === 0) {
    $('#previousQuestion').hide();
  }
  else {
    $('#previousQuestion').show();
  }
}

function back(){
  if (currentQuestion <= 0) {
    $('#previousQuestion').hide();
  }
  else {
    currentQuestion--;
    if (currentQuestion <= 0) {
      $('#previousQuestion').hide();
    }
    generateQA();
    var pCheckedAnswer = userAnswers[currentQuestion][2];
    $('input[name="answers"][id="' + pCheckedAnswer + '"').prop('checked',true);
  }
}

// Check which radio button is checked and record
function whichChecked() {
  for (var i = 0; i < numAns; i++) {
    if ($("input[name='answers'][id='" + i + "']").is(':checked')) {
      // if already added to userAnswers
      if (currentQuestion < userAnswers.length) {
        if (i === quiz["questions"][currentQuestion]["correct_answer"]) {
          userAnswers[currentQuestion][1] = true;
          userAnswers[currentQuestion][2] = i;
        }
        else {
          userAnswers[currentQuestion][1] = false;
          userAnswers[currentQuestion][2] = i;
        }
      }
      // if new answer
      else {
        if (i === quiz["questions"][currentQuestion]["correct_answer"])
          userAnswers.push([currentQuestion, true, i]);
        else
          userAnswers.push([currentQuestion, false, i]);
      }
    }
  }
}

// top ten users
function topTen(allUsers) {
  allUsers.sort(function(a,b) {
    return ((b["user_correct"]*1.0)/b["user_total"]) - ((a["user_correct"]*1.0)/a["user_total"]);
  });
  for (var i = 0; i < 10; i++) {
    if (i < allUsers.length) {
      $('#userTable > tbody:last-child').append('<tr class="success"><td>' + allUsers[i]["name"] +
        '</td><td>' + Math.round((allUsers[i]["user_correct"]*100)/allUsers[i]["user_total"]) + "%" +
        '</td></tr>');
    }
    else break;
  }
  $('#userTable').fadeIn();
  $('#tenScores').fadeIn();
}

// user info
function userScore() {
  $.getJSON('users')
  .done(function (data) {
    userJSON = data;
    currentUser = userJSON.length;
    for (var i = 0; i < userJSON.length; i++) {
      if (userJSON[i].name === name) {
        currentUser = i;
        break;
      }
    }
    // if new user
    if (currentUser === userJSON.length) {
      var newUser = {
        "name": name,
        "user_correct": 0,
        "user_total": 0
      };
      userJSON[currentUser] = newUser;
    }
    for (var n = 0; n < quizLength; n++){
      if (userAnswers[n][1]) {
        quiz["questions"][n]["global_correct"]+=1;
        userJSON[currentUser]["user_correct"]+=1;
      }
      quiz["questions"][n]["global_total"]+=1;
      userJSON[currentUser]["user_total"]+=1;
    }
    topTen(userJSON);

    // User Scores
    $.ajax({
      type:"POST",
      url: "users",
      data: JSON.stringify(userJSON),
      timeout: 2000,
      contentType: "application/json; charset=utf-8",
      beforeSend: function(){
        // console.log ("BEFORE USER SEND");
      },
      complete: function() {
        // console.log ("COMPLETE USER LOADING");
      },
      success: function(data){
        // console.log("users sent");
      },
      fail: function(){
        // console.log("USER FAILED");
      }
    });
    createPieChart(quizLength-score, score, ((quizLength-score)*100)/quizLength, 100*score/quizLength);
  })
  .fail(function() {
    // console.log("Failed to load user JSON");
    for (var i = 0; i < quizLength; i++){
      if (userAnswers[i][1]) {
        quiz["questions"][i]["global_correct"]+=1;
      }
      quiz["questions"][i]["global_total"]+=1;
    }
    createPieChart(quizLength-score, score, ((quizLength-score)*100)/quizLength, 100*score/quizLength);
  });
}

// Calculate Score and add to global + user scores
function calculateScore() {
  for (var i = 0; i < quizLength; i++){
    if (userAnswers[i][1]) {
      quiz["questions"][i]["global_correct"]+=1;
      score++;
    }
    quiz["questions"][i]["global_total"]+=1;
  }
}

// Display score table
function scorePerQuestionTable() {
  for (var r = 0; r < quizLength; r++) {
    $('#scoreTable').fadeIn("slow");
    var scorePercent = Math.round(100*quiz["questions"][r]["global_correct"]/quiz["questions"][r]["global_total"]);
    if (userAnswers[r][1])
      $('#scoreTable > tbody:last-child').append('<tr class="success"><td class="questionNum">' + (r + 1) + '. ' + quiz["questions"][r]["text"] +
        '</td><td>' + quiz["questions"][r]["answers"][userAnswers[r][2]] +
        '<td>' + quiz["questions"][r]["answers"][quiz["questions"][r]["correct_answer"]] +
        '</td><td>' + scorePercent + "%" +
        '</td></tr>');
    else
      $('#scoreTable > tbody:last-child').append('<tr class="danger"><td class="questionNum">' + (r + 1) + '. ' + quiz["questions"][r]["text"] +
        '</td><td>' + quiz["questions"][r]["answers"][userAnswers[r][2]] +
        '<td>' + quiz["questions"][r]["answers"][quiz["questions"][r]["correct_answer"]] +
        '</td><td>' + scorePercent + "%" +
        '</td></tr>');
  }
}

// Create pie chart for score
function createPieChart(wrong,right,percentW,percentR) {
  var red = "#FF0000 ";
  var green = "#006600";

  var chart = document.getElementById('piechart');
  var ctx = chart.getContext('2d');
  ctx.clearRect(0, 0, chart.width, chart.height);

  var cx = chart.width/2;
  var cy = chart.height/2;
  var radius = 100;

  var wrongFraction = Math.PI * 2.0 * (wrong/(right+wrong));
  var rightFraction = Math.PI * 2.0 * (right/(right+wrong));

  // incorrect
  ctx.fillStyle = red;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, wrongFraction, false);
  ctx.lineTo(cx,cy);
  ctx.closePath();
  ctx.fill();

  // correct
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, wrongFraction, Math.PI * 2, false);
  ctx.lineTo(cx,cy);
  ctx.closePath();
  ctx.fill();

  // legend
  ctx.font = "14px Calibri";

  ctx.fillStyle = green;
  ctx.fillRect(cx + radius + 50,cy - 20,20,15);
  ctx.fillText("Correct",cx + radius + 80,cy - 10);

  ctx.fillStyle = red;
  ctx.fillRect(cx + radius + 50,cy + 20,20,15);
  ctx.fillText("Incorrect",cx + radius + 80,cy + 30);
}

// Go to next question in quiz
function nextQuestion() {
  // Before end of quiz
  if (currentQuestion<quizLength-1) {
    // if one of the quiz questions
    if (currentQuestion > -1) {
      // if no answer is checked
      if (!$("input[name='answers']").is(':checked')){
        $('#answerWarning').show();
        $("#answerWarning").fadeTo(notificationFadeTime, 500).slideUp(500, function(){
          $("#answerWarning").hide();
        });
        if (currentQuestion === 0) {
          $('#previousQuestion').hide();
        }
        else {
          $('#previousQuestion').show();
        }
      }
      // if an answer is checked
      else {
        $('#answerWarning').hide();
        if (currentQuestion === 0) {
          $('#previousQuestion').hide();
        }
        else {
          $('#previousQuestion').show();
        }
        whichChecked();
        currentQuestion+=1;
        generateQA();
      }
    }
    // if before first question of quiz
    else {
      $('#previousQuestion').hide();
      currentQuestion+=1;
      generateQA();
    }
  }

  // End of quiz
  else {
    // Check last question of quiz
    // if answer is not checked
    if (!$("input[name='answers']").is(':checked')){
      $('#answerWarning').show();
      $("#answerWarning").fadeTo(notificationFadeTime, 500).slideUp(500, function(){
        $("#answerWarning").hide();
      });
    }
    // if an answer is checked
    else {
      $('#answerWarning').hide();
      whichChecked();// Display end of quiz screen
      $('#welcome').hide();
      $('#questionNumber').hide();
      $('#question').hide();
      $('#previousQuestion').hide();
      $('#nextQuestion').hide();
      $('#answerChoices').hide();
      $('#images').hide();
      $('#piechart').fadeIn("slow");
      $('#home').show();
      calculateScore();
      $('#nameScore').text(name + ", your score on this quiz is: " + score + "/" + quizLength + " questions or " + Math.round(100*score/quizLength) + "%");
      scorePerQuestionTable();
     

      // Global Scores
      $.ajax({
        type:"PUT",
        url: "quiz/" + quiz["id"],
        data: JSON.stringify(quiz),
        timeout: 2000,
        contentType: "application/json; charset=utf-8",
        beforeSend: function(){
          // console.log ("BEFORE SEND");
        },
        complete: function() {
          // console.log ("COMPLETE LOADING");
        },
        success: function(data){
          // console.log("quiz sent");
        },
        fail: function(){
          // console.log("FAILED");
        }
      });
      userScore();
    }
    var obj = { "name": name,"user_correct":score,"user_total" : quizLength};
    var data = JSON.stringify(obj);
    fs.writeFileSync('users.json', data, finished);

              function finished(err)
              {
                  console.log('success');
              }
    
  }

}