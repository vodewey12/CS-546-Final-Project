(function($) {

    let loginForm = $('#login-form');
    let inputEmail = $('#email');
    let inputPass = $('#password');
    let errorDiv = $('#error-container');
    errorDiv.hide();
    

    loginForm.submit(function(event){

        // input and email can't be empty bc of required attribute
        let email = inputEmail.val();
        let emailformat = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
        if (!email.match(emailformat)){
            event.preventDefault();
            errorDiv.empty();
            errorDiv.append('<p>Invalid email format.</p>');
            errorDiv.show();
        }
    });


})(window.jQuery);