(function ($) {
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
        res.forEach((data) => {
          var list = $("<li>");
          var a = $("<a id=" + data._id + " href=/posts/" + data._id + " >");
          a.text(data.title);
          list.append(a);
          $posts.append(list);
        });
        $createCard.hide();
        $posts.show();
      });
    }
  });
})(window.jQuery);
