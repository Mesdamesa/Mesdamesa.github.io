
//jQuery to collapse the navbar on scroll
$(window).scroll(function() {
    if ($(".navbar").offset().top > 50) {
        $(".fixed-top").addClass("top-nav-collapse");
    } else {
        $(".fixed-top").removeClass("top-nav-collapse");
    }
    if ($(".navbar").offset().top > 50) {
        $(".navbar-brand").addClass("smaller");
    } else {
        $(".navbar-brand").removeClass("smaller");
    }
});

//jQuery to collapse the navbar on click
$('.navbar-nav>li>a').on('click', function() {
    $('.navbar-collapse').collapse('hide');
});

//jQuery for page scrolling feature - requires jQuery Easing plugin

$('.page-scroll').click(function() {
    var sectionTo = $(this).attr('href');
    $('html, body').animate({
        scrollTop: $(sectionTo).offset().top
    }, 750);
});
