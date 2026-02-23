
$(document).ready(function() {
    $(document).on('click', '.nav-item a', function(e) {
        $(this).parent().addClass('active').siblings().removeClass('active');
    });
});
