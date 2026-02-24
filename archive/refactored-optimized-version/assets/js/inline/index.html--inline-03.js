
                    //this is where we apply opacity to the arrow
                    $(window).scroll(function() {
                        //get scroll position
                        var topWindow = $(window).scrollTop();
                        //multiply by 1.5 so the arrow will become transparent half-way up the page
                        var topWindow = topWindow * 1.5;

                        //get height of window
                        var windowHeight = $(window).height();
                        //set position as percentage of how far the user has scrolled
                        var position = topWindow / windowHeight;
                        //invert the percentage
                        position = 1 - position;
                        //define arrow opacity as based on how far up the page the user has scrolled
                        //no scrolling = 1, half-way up the page = 0
                        $('.left').css('opacity', position);
                    });
                    