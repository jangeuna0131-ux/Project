$(function(){

    $(".tab li").click(function(){

        let num = $(this).index();

        console.log(num);
        $(".tab li").removeClass("on")
        $(this).addClass("on")
    });

});