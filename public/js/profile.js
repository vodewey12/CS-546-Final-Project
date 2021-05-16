(function($) {

    let likeForm = $('.like-form');


  
    likeForm.submit(function(event){

        event.preventDefault(); 
        let eventForm = event.target;
        
        let theSpans = eventForm.querySelectorAll('button > span');
        let curId = theSpans[0].id;
        let curCountsText = theSpans[1].innerText;
        let likeCount = parseInt(curCountsText);


        if(curId === 'like'){
          // decrease case
          theSpans[0].id = 'not-like';
          let plural = likeCount-1 > 1 ? 'Likes' : 'Like';
          theSpans[1].innerText = `${likeCount-1} ${plural}`;
        }else{
          theSpans[0].id = 'like';
          let plural = likeCount+1 > 1 ? 'Likes' : 'Like';
          theSpans[1].innerText = `${likeCount+1} ${plural}`;
        }

        // items for db query
        let userId = document.querySelector('input[name="user_id"]').value;
        let postId = eventForm.querySelector('input[name="post_id"]').value;


        // send ajax request
        $.post("/user/like" , 
        {   userId: userId,
            postId: postId
        });

        $.post("/posts/like",
        {
          userId: userId,
          postId: postId
        });
    });
})(window.jQuery);