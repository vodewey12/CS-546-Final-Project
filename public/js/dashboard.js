function stringCheck(string) {
    return typeof string === 'string' && string.trim().length !== 0;
}

(function ($) {
    let postForm = $('#postForm');
    let postTitle = $('#postTitle');
    let postContent = $('#postContent');
    let postTags = $('#postTags');

    postForm.submit(function (event) {
        event.preventDefault();
        var post_title = stringCheck
        var requestConfig = {
            method: 'POST',
            url: 'http://localhost:3000/posts',
            data: {}
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            
        });
    });
})(window.jQuery);
