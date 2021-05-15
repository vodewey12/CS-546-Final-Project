(function($) {

   
    let likeForm = $('.like-form');
  
    likeForm.submit(function(event){

        event.preventDefault(); 
        let eventForm = event.target;
        let button =  $(event.target).children().children();
        
        let prevColor = button.css("color");

        if(prevColor !== 'rgb(255, 255, 255)'){ // blue
            button.css("color" , "white");
        } else{
            button.css("color" , "blue");
        }

        // items for db query
        let userId = document.querySelector('input[name="user_id"]').value;
        let postId = eventForm.querySelector('input[name="post_id"]').value;

        // send ajax request
        $.post("/user/like" , 
        {   userId: userId,
            postId: postId
        });
    });

  var $createCard = $("#create-card");
  var $posts = $("#post");
  var $mainPosts = $("#main-posts");
  var $search = $("#search");
  $search.submit(function (e) {
    e.preventDefault();
    var inputVal = $("input[name=searchTerm]").val();
    if (inputVal === undefined || inputVal === "" || inputVal === null) {
      throw "No value provided";
    }
    if (inputVal) {
      $mainPosts.hide();
      $posts.empty();
      $.ajax({
        method: "GET",
        url: "http://localhost:3000/posts/search/" + inputVal,
      }).then((res) => {
        $posts.hide();
        if (res.length == 0) {
          $posts.append($("<h2>No posts were found</h2>"));
        } else {
          res.forEach((data) => {
            var list = $("<li>");
            var a = $("<a id=" + data._id + " href=/posts/" + data._id + " >");
            if (data.resolvedStatus) {
              a.text(
                "[Resolved] " +
                  data.title +
                  " posted by " +
                  data.userName +
                  " on " +
                  moment(data.postTime).format("MM/DD/YYYY")
              );
            } else {
              a.text(
                "[Unresolved] " +
                  data.title +
                  " posted by " +
                  data.userName +
                  " on " +
                  moment(data.postTime).format("MM/DD/YYYY")
              );
            }
            list.append(a);
            $posts.append(list);
          });
        }
        $createCard.hide();
        $posts.show();
      });
    }
  });
})(window.jQuery);
