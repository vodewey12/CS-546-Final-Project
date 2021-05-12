(function($) {

    let registerForm = $('#register-form');
    
    
    registerForm.submit(function(event){

        let userName = $('#userName');
        let email = $('#email');
        let password = $('#password');
        let nickName = $('#nickName');
        let major = $('#major');
        let gradYear = $('#gradYear');
        let errorDiv = $('#error-container');
        errorDiv.hide();
        let errors = false;
        let errorList = [];

        email = email.val();
    
        let emailformat = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
        if (!email.match(emailformat)){
            errors = true;
            errorList.push('Invalid email format.');
        }
        gradYear = parseInt(gradYear.val());
        
        let currYear = new Date().getFullYear();
        if(gradYear < currYear || gradYear > currYear+5){
            errors = true;
            errorList.push('Invalid gradYear format.');
        } 

        if(errors){
            event.preventDefault();
            errorDiv.empty();
            for(let error of errorList){
                errorDiv.append(`<p>${error}</p>`);
            }
            errorDiv.show()

        }
    });


})(window.jQuery);