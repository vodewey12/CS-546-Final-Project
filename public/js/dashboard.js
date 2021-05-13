(function($) {

   
    let likeForm = $('#like-form');
  
    likeForm.submit(function(event){

        event.preventDefault(); // for now

        let button = likeForm.children().children();
        
        let prevColor = button.css("color");

        if(prevColor !== 'rgb(255, 255, 255)'){ // blue
            button.css("color" , "white");
        } else{
            button.css("color" , "blue");
        }
    });
})(window.jQuery);