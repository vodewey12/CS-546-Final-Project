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
})(window.jQuery);